import { ROOM_NAME } from './protocol';
import { NowPlayingRoomDO } from './durable-object';

export { NowPlayingRoomDO };

interface Env {
	NOW_PLAYING_ROOM: DurableObjectNamespace<NowPlayingRoomDO>;
	OWNER_TOKEN?: string;
	/** Comma-separated origin allowlist. Unset means "allow any origin". */
	ALLOWED_ORIGINS?: string;
}

/**
 * Origin check for browser clients.
 *
 * This is defence in depth, not authentication — a non-browser client can send
 * any Origin it likes. It exists so a random website cannot open a socket from
 * a visitor's browser and ride along on the room. The owner extension is
 * allowed through explicitly because extension pages send a chrome-extension://
 * origin.
 */
function originAllowed(origin: string | null, allowed: string | undefined): boolean {
	if (!allowed) return true;
	if (!origin) return true; // non-browser clients (wrangler dev, curl, tests)
	if (origin.startsWith('chrome-extension://')) return true;

	// Any loopback origin, on any port. Pinning dev to one port means a busy
	// 5173 silently pushes Vite to 5174 and the socket starts 403-ing, with no
	// visible error because the visitor UI fails silently by design. The origin
	// check is here to stop a random *public* site riding along, and no public
	// site can claim a loopback origin.
	try {
		const { hostname } = new URL(origin);
		if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
			return true;
		}
	} catch {
		return false; // unparseable Origin header
	}

	return allowed
		.split(',')
		.map((o) => o.trim())
		.filter(Boolean)
		.includes(origin);
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === '/health') {
			return Response.json({ ok: true, room: ROOM_NAME });
		}

		if (url.pathname !== '/ws') {
			return new Response('Not found', { status: 404 });
		}

		if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
			return new Response('Expected WebSocket upgrade', { status: 426 });
		}

		if (!originAllowed(request.headers.get('Origin'), env.ALLOWED_ORIGINS)) {
			return new Response('Forbidden origin', { status: 403 });
		}

		// Always the same object: one room, one name, one instance.
		const id = env.NOW_PLAYING_ROOM.idFromName(ROOM_NAME);
		return env.NOW_PLAYING_ROOM.get(id).fetch(request);
	}
} satisfies ExportedHandler<Env>;
