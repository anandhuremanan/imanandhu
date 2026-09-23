import { DurableObject } from 'cloudflare:workers';
import { IDLE_STATE, type NowPlayingState, type Role } from './protocol';
import { NowPlayingRoom, type Conn } from './room';

interface Env {
	NOW_PLAYING_ROOM: DurableObjectNamespace<NowPlayingRoomDO>;
	OWNER_TOKEN?: string;
	ALLOWED_ORIGINS?: string;
}

const STATE_KEY = 'state';
const SEEN_KEY = 'lastOwnerSeen';

/** What we stash on each socket so it survives hibernation. */
interface Attachment {
	id: string;
	role: Role | null;
}

/**
 * Thin adapter between the Workers runtime and the pure room logic.
 *
 * Uses the WebSocket Hibernation API: sockets are handed to the runtime with
 * `acceptWebSocket`, so this object can be evicted from memory while clients
 * stay connected and is only billed while it is actually doing work. Because
 * eviction wipes instance fields, the room state is rehydrated from the DO's
 * own transactional storage on each wake — that storage is the single stateful
 * component in this design (no KV, D1 or R2).
 */
export class NowPlayingRoomDO extends DurableObject<Env> {
	private room?: NowPlayingRoom;

	/**
	 * Rebuilds the room from storage. Called at the start of every entry point
	 * because a hibernated object starts with empty fields.
	 */
	private async getRoom(): Promise<NowPlayingRoom> {
		if (this.room) return this.room;

		const [state, lastOwnerSeen] = await Promise.all([
			this.ctx.storage.get<NowPlayingState>(STATE_KEY),
			this.ctx.storage.get<number>(SEEN_KEY)
		]);

		this.room = new NowPlayingRoom(
			{
				now: () => Date.now(),
				ownerToken: this.env.OWNER_TOKEN ?? '',
				connections: () => this.ctx.getWebSockets().map((ws) => this.wrap(ws)),
				setAlarm: (atMs) => {
					// Fire-and-forget: the runtime keeps the object alive for the
					// duration of the request, and a missed alarm only delays the
					// idle transition until the next event.
					if (atMs === null) void this.ctx.storage.deleteAlarm();
					else void this.ctx.storage.setAlarm(atMs);
				},
				persist: (next) => {
					void this.ctx.storage.put(STATE_KEY, next);
				}
			},
			{ state: state ?? { ...IDLE_STATE }, lastOwnerSeen: lastOwnerSeen ?? 0 }
		);

		return this.room;
	}

	/** Wraps a runtime WebSocket in the Conn shape the room expects. */
	private wrap(ws: WebSocket): Conn {
		const read = (): Attachment => {
			const a = ws.deserializeAttachment() as Attachment | null;
			return a ?? { id: crypto.randomUUID(), role: null };
		};

		return {
			get id() {
				return read().id;
			},
			getRole: () => read().role,
			setRole: (role: Role | null) => {
				ws.serializeAttachment({ ...read(), role } satisfies Attachment);
			},
			send: (data: string) => ws.send(data),
			close: (code: number, reason: string) => ws.close(code, reason)
		};
	}

	async fetch(request: Request): Promise<Response> {
		if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
			return new Response('Expected WebSocket upgrade', { status: 426 });
		}

		// Destructure the named 0/1 properties rather than Object.values, which
		// widens to `WebSocket | undefined` under noUncheckedIndexedAccess.
		const { 0: client, 1: server } = new WebSocketPair();

		// Hibernatable accept. Without this the object would have to stay
		// resident for the life of every connection.
		this.ctx.acceptWebSocket(server);
		server.serializeAttachment({ id: crypto.randomUUID(), role: null } satisfies Attachment);

		const room = await this.getRoom();
		room.handleOpen(this.wrap(server));

		return new Response(null, { status: 101, webSocket: client });
	}

	async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
		// Binary frames are not part of the protocol.
		if (typeof message !== 'string') {
			ws.close(1003, 'text frames only');
			return;
		}
		const room = await this.getRoom();
		room.handleMessage(this.wrap(ws), message);
		await this.ctx.storage.put(SEEN_KEY, room.getLastOwnerSeen());
	}

	async webSocketClose(ws: WebSocket): Promise<void> {
		const room = await this.getRoom();
		// The socket is already gone from getWebSockets() by the time this runs
		// in some cases, so the room re-checks for a surviving owner itself.
		room.handleClose(this.wrap(ws));
	}

	async webSocketError(ws: WebSocket): Promise<void> {
		const room = await this.getRoom();
		room.handleClose(this.wrap(ws));
	}

	async alarm(): Promise<void> {
		const room = await this.getRoom();
		room.handleAlarm();
	}
}
