import { describe, expect, it, beforeEach } from 'vitest';
import { NowPlayingRoom, type Conn } from '../src/room';
import {
	CLOSE_REPLACED,
	CLOSE_UNAUTHORIZED,
	OWNER_TIMEOUT_MS,
	type Role,
	type ServerMessage
} from '../src/protocol';

const TOKEN = 'test-owner-token';

/** A fake socket that records everything the room sends it. */
class FakeConn implements Conn {
	readonly id: string;
	private role: Role | null = null;
	sent: ServerMessage[] = [];
	closed: { code: number; reason: string } | null = null;

	constructor(id: string) {
		this.id = id;
	}
	getRole() {
		return this.role;
	}
	setRole(role: Role | null) {
		this.role = role;
	}
	send(data: string) {
		if (this.closed) throw new Error('send after close');
		this.sent.push(JSON.parse(data) as ServerMessage);
	}
	close(code: number, reason: string) {
		this.closed = { code, reason };
	}

	/** Most recent frame of a given type. */
	last<T extends ServerMessage['type']>(type: T) {
		return [...this.sent].reverse().find((m) => m.type === type) as
			| Extract<ServerMessage, { type: T }>
			| undefined;
	}
}

/** Test harness: a room plus controllable clock and connection registry. */
function makeRoom() {
	let now = 1_700_000_000_000;
	const conns: FakeConn[] = [];
	let alarm: number | null = null;
	const persisted: unknown[] = [];

	const room = new NowPlayingRoom({
		now: () => now,
		ownerToken: TOKEN,
		connections: () => conns,
		setAlarm: (at) => {
			alarm = at;
		},
		persist: (s) => {
			persisted.push(s);
		}
	});

	return {
		room,
		persisted,
		get alarm() {
			return alarm;
		},
		advance(ms: number) {
			now += ms;
		},
		connect(id: string) {
			const c = new FakeConn(id);
			conns.push(c);
			room.handleOpen(c);
			return c;
		},
		disconnect(c: FakeConn) {
			const i = conns.indexOf(c);
			if (i >= 0) conns.splice(i, 1);
			room.handleClose(c);
		},
		/** Remove from the registry without telling the room (ungraceful drop). */
		drop(c: FakeConn) {
			const i = conns.indexOf(c);
			if (i >= 0) conns.splice(i, 1);
		}
	};
}

const authOwner = (token = TOKEN) => JSON.stringify({ type: 'auth', role: 'owner', token });
const authVisitor = () => JSON.stringify({ type: 'auth', role: 'visitor' });
const track = (over: Record<string, unknown> = {}) =>
	JSON.stringify({
		type: 'now_playing',
		playing: true,
		title: 'Redbone',
		artist: 'Childish Gambino',
		album: 'Awaken, My Love!',
		artwork: 'https://lh3.googleusercontent.com/cover.jpg',
		url: 'https://music.youtube.com/watch?v=abc123',
		timestamp: 1,
		...over
	});

describe('owner authentication', () => {
	let h: ReturnType<typeof makeRoom>;
	beforeEach(() => {
		h = makeRoom();
	});

	it('succeeds with the correct token', () => {
		const owner = h.connect('owner');
		h.room.handleMessage(owner, authOwner());

		expect(owner.last('auth_ok')?.role).toBe('owner');
		expect(owner.closed).toBeNull();
		expect(owner.getRole()).toBe('owner');
	});

	it('fails with an incorrect token, and closes the socket', () => {
		const owner = h.connect('owner');
		h.room.handleMessage(owner, authOwner('wrong-token'));

		expect(owner.last('error')?.code).toBe('unauthorized');
		expect(owner.closed?.code).toBe(CLOSE_UNAUTHORIZED);
		expect(owner.getRole()).toBeNull();
	});

	it('fails when the server has no token configured', () => {
		const room = new NowPlayingRoom({
			now: () => 0,
			ownerToken: '',
			connections: () => [],
			setAlarm: () => {},
			persist: () => {}
		});
		const owner = new FakeConn('owner');
		room.handleMessage(owner, authOwner(''));
		expect(owner.last('error')?.code).toBeDefined();
		expect(owner.getRole()).toBeNull();
	});
});

describe('visitor authentication', () => {
	it('succeeds without a token and immediately receives state', () => {
		const h = makeRoom();
		const visitor = h.connect('v1');
		h.room.handleMessage(visitor, authVisitor());

		expect(visitor.last('auth_ok')?.role).toBe('visitor');
		const state = visitor.last('state');
		expect(state).toBeDefined();
		expect(state?.playing).toBe(false);
	});
});

describe('visitor is read-only', () => {
	it('rejects a now_playing message from a visitor', () => {
		const h = makeRoom();
		const visitor = h.connect('v1');
		h.room.handleMessage(visitor, authVisitor());
		h.room.handleMessage(visitor, track({ title: 'Injected' }));

		expect(visitor.last('error')?.code).toBe('forbidden');
		expect(h.room.getState().playing).toBe(false);
		expect(h.room.getState().title).toBeNull();
	});

	it('rejects data from a connection that never authenticated', () => {
		const h = makeRoom();
		const anon = h.connect('anon');
		h.room.handleMessage(anon, track());

		expect(anon.last('error')?.code).toBe('not_authenticated');
		expect(h.room.getState().playing).toBe(false);
	});
});

describe('state propagation', () => {
	it('delivers an owner update to every connected visitor', () => {
		const h = makeRoom();
		const owner = h.connect('owner');
		const v1 = h.connect('v1');
		const v2 = h.connect('v2');
		h.room.handleMessage(owner, authOwner());
		h.room.handleMessage(v1, authVisitor());
		h.room.handleMessage(v2, authVisitor());

		h.room.handleMessage(owner, track());

		for (const v of [v1, v2]) {
			const s = v.last('state');
			expect(s?.playing).toBe(true);
			expect(s?.title).toBe('Redbone');
			expect(s?.artist).toBe('Childish Gambino');
		}
		// The owner is not a visitor and should not be broadcast to.
		expect(owner.last('state')).toBeUndefined();
	});

	it('gives a late-joining visitor the current track', () => {
		const h = makeRoom();
		const owner = h.connect('owner');
		h.room.handleMessage(owner, authOwner());
		h.room.handleMessage(owner, track());

		const late = h.connect('late');
		h.room.handleMessage(late, authVisitor());

		expect(late.last('state')?.title).toBe('Redbone');
		expect(late.last('state')?.playing).toBe(true);
	});

	it('uses server time for the timestamp, not the client value', () => {
		const h = makeRoom();
		const owner = h.connect('owner');
		h.room.handleMessage(owner, authOwner());
		h.room.handleMessage(owner, track({ timestamp: 5 }));

		expect(h.room.getState().timestamp).toBeGreaterThan(1_000_000_000_000);
	});
});

describe('stale owner', () => {
	it('blanks the state when the heartbeat goes stale', () => {
		const h = makeRoom();
		const owner = h.connect('owner');
		const visitor = h.connect('v1');
		h.room.handleMessage(owner, authOwner());
		h.room.handleMessage(visitor, authVisitor());
		h.room.handleMessage(owner, track());
		expect(visitor.last('state')?.playing).toBe(true);

		h.advance(OWNER_TIMEOUT_MS + 1);
		h.room.handleAlarm();

		expect(visitor.last('state')?.playing).toBe(false);
		expect(visitor.last('state')?.title).toBeNull();
		expect(h.room.getState().playing).toBe(false);
	});

	it('keeps playing while heartbeats keep arriving', () => {
		const h = makeRoom();
		const owner = h.connect('owner');
		const visitor = h.connect('v1');
		h.room.handleMessage(owner, authOwner());
		h.room.handleMessage(visitor, authVisitor());
		h.room.handleMessage(owner, track());

		for (let i = 0; i < 5; i++) {
			h.advance(OWNER_TIMEOUT_MS - 1000);
			h.room.handleMessage(owner, JSON.stringify({ type: 'heartbeat', timestamp: 0 }));
			h.room.handleAlarm();
		}

		expect(visitor.last('state')?.playing).toBe(true);
	});

	it('does not hand a stale track to a visitor who connects after the owner vanished', () => {
		const h = makeRoom();
		const owner = h.connect('owner');
		h.room.handleMessage(owner, authOwner());
		h.room.handleMessage(owner, track());

		// Ungraceful drop: no close event, no alarm yet.
		h.drop(owner);
		h.advance(OWNER_TIMEOUT_MS + 1);

		const visitor = h.connect('v1');
		h.room.handleMessage(visitor, authVisitor());

		expect(visitor.last('state')?.playing).toBe(false);
	});

	it('goes idle as soon as the owner disconnects cleanly', () => {
		const h = makeRoom();
		const owner = h.connect('owner');
		const visitor = h.connect('v1');
		h.room.handleMessage(owner, authOwner());
		h.room.handleMessage(visitor, authVisitor());
		h.room.handleMessage(owner, track());

		h.disconnect(owner);

		expect(visitor.last('state')?.playing).toBe(false);
	});
});

describe('malformed input', () => {
	let h: ReturnType<typeof makeRoom>;
	let owner: FakeConn;
	beforeEach(() => {
		h = makeRoom();
		owner = h.connect('owner');
		h.room.handleMessage(owner, authOwner());
	});

	it('rejects invalid JSON', () => {
		h.room.handleMessage(owner, '{not json');
		expect(owner.last('error')?.code).toBe('bad_json');
	});

	it('rejects oversized messages without parsing them', () => {
		h.room.handleMessage(owner, JSON.stringify({ type: 'now_playing', pad: 'x'.repeat(9000) }));
		expect(owner.last('error')?.code).toBe('too_large');
	});

	it('rejects an unknown message type', () => {
		h.room.handleMessage(owner, JSON.stringify({ type: 'delete_everything' }));
		expect(owner.last('error')?.code).toBe('bad_message');
	});

	it('rejects a playing track with no title', () => {
		h.room.handleMessage(owner, track({ title: null }));
		expect(owner.last('error')?.code).toBe('bad_message');
		expect(h.room.getState().playing).toBe(false);
	});

	it('strips artwork from a host that is not a YouTube CDN', () => {
		const visitor = h.connect('v1');
		h.room.handleMessage(visitor, authVisitor());
		h.room.handleMessage(owner, track({ artwork: 'https://evil.example.com/tracker.gif' }));

		expect(visitor.last('state')?.artwork).toBeNull();
		expect(visitor.last('state')?.title).toBe('Redbone');
	});

	it('strips a javascript: url', () => {
		const visitor = h.connect('v1');
		h.room.handleMessage(visitor, authVisitor());
		// eslint-disable-next-line no-script-url
		h.room.handleMessage(owner, track({ url: 'javascript:alert(1)' }));

		expect(visitor.last('state')?.url).toBeNull();
	});

	it('truncates absurdly long titles rather than rejecting them', () => {
		const visitor = h.connect('v1');
		h.room.handleMessage(visitor, authVisitor());
		h.room.handleMessage(owner, track({ title: 'a'.repeat(2000), artwork: null, url: null }));

		expect(visitor.last('state')?.title?.length).toBe(300);
	});
});

describe('owner reconnection and duplicates', () => {
	it('replaces an existing owner and keeps the newest connection', () => {
		const h = makeRoom();
		const first = h.connect('owner-1');
		h.room.handleMessage(first, authOwner());
		h.room.handleMessage(first, track());

		const second = h.connect('owner-2');
		h.room.handleMessage(second, authOwner());

		expect(first.closed?.code).toBe(CLOSE_REPLACED);
		expect(first.last('error')?.code).toBe('replaced');
		expect(second.last('auth_ok')?.role).toBe('owner');
		expect(second.getRole()).toBe('owner');
	});

	it('does not blank state when the replaced owner socket finally closes', () => {
		const h = makeRoom();
		const visitor = h.connect('v1');
		const first = h.connect('owner-1');
		h.room.handleMessage(visitor, authVisitor());
		h.room.handleMessage(first, authOwner());
		h.room.handleMessage(first, track());

		const second = h.connect('owner-2');
		h.room.handleMessage(second, authOwner());
		// The dead socket's close event lands after the new owner authenticated.
		h.disconnect(first);

		expect(visitor.last('state')?.playing).toBe(true);
		expect(visitor.last('state')?.title).toBe('Redbone');
	});

	/**
	 * Regression: a replaced owner socket stays in the runtime's connection list
	 * until its close event is processed. If it kept the owner role during that
	 * window it looked like a second live owner, and the room never went idle —
	 * the banner stuck on the last track forever. Observed against a real
	 * Durable Object as roles=["owner","owner","visitor"].
	 */
	it('goes idle even while a replaced owner socket is still enumerated', () => {
		const h = makeRoom();
		const visitor = h.connect('v1');
		h.room.handleMessage(visitor, authVisitor());

		const first = h.connect('owner-1');
		h.room.handleMessage(first, authOwner());
		h.room.handleMessage(first, track());

		const second = h.connect('owner-2');
		h.room.handleMessage(second, authOwner());

		// `first` is deliberately left in the connection registry: its close has
		// not been delivered yet. It must no longer count as an owner.
		expect(first.getRole()).toBeNull();

		h.disconnect(second);

		expect(visitor.last('state')?.playing).toBe(false);
		expect(visitor.last('state')?.title).toBeNull();
	});

	it('retires a closed socket so it cannot be counted again', () => {
		const h = makeRoom();
		const owner = h.connect('owner-1');
		h.room.handleMessage(owner, authOwner());
		h.room.handleClose(owner);
		expect(owner.getRole()).toBeNull();
	});

	it('lets a reconnecting owner publish again after a full drop', () => {
		const h = makeRoom();
		const visitor = h.connect('v1');
		h.room.handleMessage(visitor, authVisitor());

		const first = h.connect('owner-1');
		h.room.handleMessage(first, authOwner());
		h.room.handleMessage(first, track());
		h.disconnect(first);
		expect(visitor.last('state')?.playing).toBe(false);

		const again = h.connect('owner-2');
		h.room.handleMessage(again, authOwner());
		h.room.handleMessage(again, track({ title: 'Los Angeles' }));

		expect(visitor.last('state')?.playing).toBe(true);
		expect(visitor.last('state')?.title).toBe('Los Angeles');
	});
});

describe('pause', () => {
	it('clears track details when the owner reports paused', () => {
		const h = makeRoom();
		const owner = h.connect('owner');
		const visitor = h.connect('v1');
		h.room.handleMessage(owner, authOwner());
		h.room.handleMessage(visitor, authVisitor());
		h.room.handleMessage(owner, track());
		h.room.handleMessage(owner, track({ playing: false }));

		expect(visitor.last('state')?.playing).toBe(false);
		expect(visitor.last('state')?.title).toBeNull();
	});
});
