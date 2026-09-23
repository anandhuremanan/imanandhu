import {
	CLOSE_REPLACED,
	CLOSE_UNAUTHORIZED,
	HEARTBEAT_INTERVAL_MS,
	IDLE_STATE,
	OWNER_TIMEOUT_MS,
	parseClientMessage,
	stateMessage,
	type ErrorCode,
	type NowPlayingState,
	type Role,
	type ServerMessage
} from './protocol';

/**
 * One connected socket, as the room sees it. The Durable Object supplies the
 * real implementation; tests supply a fake. Role lives behind get/set because
 * under WebSocket hibernation it is stored on the socket's attachment rather
 * than in a map that would not survive eviction.
 */
export interface Conn {
	readonly id: string;
	getRole(): Role | null;
	/** null retires the connection so it stops counting as a live owner. */
	setRole(role: Role | null): void;
	send(data: string): void;
	close(code: number, reason: string): void;
}

export interface RoomEnv {
	/** Current wall clock, injected so tests can advance time. */
	now(): number;
	/** The expected owner token. Empty string disables owner auth entirely. */
	ownerToken: string;
	/** Every live connection, including ones that have not authenticated yet. */
	connections(): Conn[];
	/** Schedule the staleness check. null cancels it. */
	setAlarm(atMs: number | null): void;
	/** Persist state so it survives hibernation. DO storage only. */
	persist(state: NowPlayingState): void;
}

/**
 * The whole business logic of the now-playing room, with no Workers runtime
 * dependency. Responsibilities:
 *
 *  - authenticate connections (one owner, unlimited visitors)
 *  - accept updates from the owner only
 *  - broadcast state to visitors
 *  - blank the state when the owner goes quiet
 *
 * Owner replacement: authenticating a second owner closes the first with
 * CLOSE_REPLACED. The newest connection always wins, so a reconnecting laptop
 * never gets locked out by its own half-dead socket.
 */
export class NowPlayingRoom {
	private state: NowPlayingState;
	private lastOwnerSeen: number;

	constructor(
		private env: RoomEnv,
		initial?: { state?: NowPlayingState; lastOwnerSeen?: number }
	) {
		this.state = initial?.state ? { ...initial.state } : { ...IDLE_STATE };
		this.lastOwnerSeen = initial?.lastOwnerSeen ?? 0;
	}

	getState(): NowPlayingState {
		return { ...this.state };
	}

	getLastOwnerSeen(): number {
		return this.lastOwnerSeen;
	}

	/** A socket opened. Nothing is sent until it says who it is. */
	handleOpen(_conn: Conn): void {
		// Intentionally empty: the client must authenticate first. Sending state
		// before auth would leak it to anything that can open a socket, and the
		// visitor handshake is one cheap round trip.
	}

	handleMessage(conn: Conn, raw: string): void {
		const parsed = parseClientMessage(raw);
		if (!parsed.ok) {
			this.sendError(conn, parsed.code, parsed.message);
			return;
		}

		const message = parsed.message;

		if (message.type === 'auth') {
			if (message.role === 'visitor') {
				conn.setRole('visitor');
				this.send(conn, { type: 'auth_ok', role: 'visitor', heartbeatIntervalMs: 0 });
				this.send(conn, stateMessage(this.effectiveState()));
				return;
			}

			// Owner. Reject before touching any state.
			if (!this.env.ownerToken || !timingSafeEqual(message.token, this.env.ownerToken)) {
				this.sendError(conn, 'unauthorized', 'Invalid owner token');
				conn.close(CLOSE_UNAUTHORIZED, 'unauthorized');
				return;
			}

			this.replaceExistingOwners(conn);
			conn.setRole('owner');
			this.lastOwnerSeen = this.env.now();
			this.send(conn, {
				type: 'auth_ok',
				role: 'owner',
				heartbeatIntervalMs: HEARTBEAT_INTERVAL_MS
			});
			this.armAlarm();
			return;
		}

		// Everything below requires an authenticated role.
		const role = conn.getRole();
		if (!role) {
			this.sendError(conn, 'not_authenticated', 'Authenticate before sending data');
			return;
		}

		// This is the guard that makes visitors read-only.
		if (role !== 'owner') {
			this.sendError(conn, 'forbidden', 'Visitors cannot publish state');
			return;
		}

		if (message.type === 'heartbeat') {
			this.lastOwnerSeen = this.env.now();
			this.armAlarm();
			return;
		}

		if (message.type === 'now_playing') {
			const now = this.env.now();
			this.lastOwnerSeen = now;
			// Server clock, not the client's: the timestamp drives staleness, so
			// a wrong clock on the laptop must not be able to skew it.
			this.state = {
				playing: message.playing,
				title: message.playing ? message.title : null,
				artist: message.playing ? message.artist : null,
				album: message.playing ? message.album : null,
				artwork: message.playing ? message.artwork : null,
				url: message.playing ? message.url : null,
				timestamp: now
			};
			this.env.persist(this.state);
			this.broadcastState();
			this.armAlarm();
		}
	}

	/** A socket closed or errored. */
	handleClose(conn: Conn): void {
		const wasOwner = conn.getRole() === 'owner';

		// Retire it before counting owners. A closing socket can linger in the
		// runtime's connection list for a moment, and if it still carried the
		// owner role it would look like a second, live owner and wrongly keep
		// the room playing forever.
		conn.setRole(null);

		if (!wasOwner) return;

		// A genuinely newer owner may already have taken over (reconnect races),
		// in which case this close is stale and must not blank a live state.
		const anotherOwner = this.env
			.connections()
			.some((c) => c.id !== conn.id && c.getRole() === 'owner');
		if (anotherOwner) return;

		this.goIdle();
	}

	/** The staleness alarm fired. */
	handleAlarm(): void {
		const hasOwner = this.env.connections().some((c) => c.getRole() === 'owner');
		const elapsed = this.env.now() - this.lastOwnerSeen;

		if (!hasOwner || elapsed >= OWNER_TIMEOUT_MS) {
			this.goIdle();
			return;
		}

		// Owner still alive and recent: check again when its grace period ends.
		this.armAlarm();
	}

	/* -------------------------------------------------------------- */

	/**
	 * The state as a visitor should see it right now. Guards the window where
	 * the owner vanished without a clean close and the alarm has not run yet,
	 * so a newly connected visitor never receives a stale track.
	 */
	private effectiveState(): NowPlayingState {
		if (!this.state.playing) return this.state;
		if (this.env.now() - this.lastOwnerSeen >= OWNER_TIMEOUT_MS) {
			return { ...IDLE_STATE, timestamp: this.env.now() };
		}
		return this.state;
	}

	private goIdle(): void {
		if (!this.state.playing && this.state.title === null) {
			// Already idle; still cancel the alarm so we stop waking up.
			this.env.setAlarm(null);
			return;
		}
		this.state = { ...IDLE_STATE, timestamp: this.env.now() };
		this.env.persist(this.state);
		this.broadcastState();
		this.env.setAlarm(null);
	}

	private replaceExistingOwners(incoming: Conn): void {
		for (const c of this.env.connections()) {
			if (c.id !== incoming.id && c.getRole() === 'owner') {
				this.sendError(c, 'replaced', 'Replaced by a newer owner connection');
				// Retire immediately, not when its close event eventually lands:
				// until then it would still be enumerated as a live owner.
				c.setRole(null);
				c.close(CLOSE_REPLACED, 'replaced');
			}
		}
	}

	private armAlarm(): void {
		this.env.setAlarm(this.lastOwnerSeen + OWNER_TIMEOUT_MS);
	}

	private broadcastState(): void {
		const frame = JSON.stringify(stateMessage(this.state));
		for (const c of this.env.connections()) {
			if (c.getRole() === 'visitor') {
				try {
					c.send(frame);
				} catch {
					// A socket that died between enumeration and send is not our
					// problem; the close handler will clean it up.
				}
			}
		}
	}

	private send(conn: Conn, message: ServerMessage): void {
		try {
			conn.send(JSON.stringify(message));
		} catch {
			/* see broadcastState */
		}
	}

	private sendError(conn: Conn, code: ErrorCode, message: string): void {
		this.send(conn, { type: 'error', code, message });
	}
}

/**
 * Constant-time string compare. The token is short and the endpoint is cheap
 * to hammer, so this removes an easy timing oracle for very little cost.
 */
function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}
