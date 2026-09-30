/**
 * Contact form endpoint for imanandhu.in.
 *
 * Browser → this Worker → Resend → inbox. Deliberately separate from the
 * now-playing Worker: that one owns a Durable Object and a socket protocol,
 * and there is no reason for a form post to share its blast radius.
 *
 * No database, no KV, no queue. A submission is validated, rate-limited and
 * handed to Resend within the one request; nothing is stored anywhere.
 */

import { renderAck, renderMail, validate, type RenderedMail } from './message';
import { keralaNow } from './kerala';

export interface Env {
	RESEND_API_KEY: string;
	ALLOWED_ORIGINS?: string;
	MAIL_FROM: string;
	MAIL_TO: string;
	/** Test seam only. Unset in production, where the real API is used. */
	RESEND_ENDPOINT?: string;
	CONTACT_LIMIT: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

/**
 * Same rule as the now-playing Worker: an allow-list, plus any loopback origin
 * on any port so a busy 5173 pushing Vite to 5174 does not silently start
 * 403-ing. No public site can claim a loopback origin.
 */
function originAllowed(origin: string | null, allowed: string | undefined): boolean {
	if (!allowed) return true;
	if (!origin) return true; // curl, tests, wrangler dev

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

/**
 * Echoing the caller's Origin rather than `*` keeps the response usable if a
 * credentialed fetch is ever added. Only reached once the origin has passed.
 */
function cors(origin: string | null): Record<string, string> {
	return {
		'Access-Control-Allow-Origin': origin ?? '*',
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Max-Age': '86400',
		Vary: 'Origin'
	};
}

function json(body: unknown, status: number, origin: string | null): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json', ...cors(origin) }
	});
}

/**
 * One POST to Resend. Returns whether it landed; never throws, so a caller can
 * decide for itself whether a failure is worth failing the request over.
 *
 * Resend's error bodies can name the sending domain and the state of the API
 * key, so they are logged for `wrangler tail` and never returned to a visitor.
 */
async function send(mail: RenderedMail, env: Env, label: string): Promise<boolean> {
	try {
		const res = await fetch(env.RESEND_ENDPOINT || RESEND_ENDPOINT, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.RESEND_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(mail)
		});
		if (!res.ok) {
			console.error(`resend rejected ${label}`, res.status, await res.text().catch(() => ''));
			return false;
		}
		return true;
	} catch (err) {
		console.error(`resend unreachable for ${label}`, err);
		return false;
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const origin = request.headers.get('Origin');
		const { pathname } = new URL(request.url);

		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: cors(origin) });
		}

		// A single endpoint. Anything else is a misconfiguration, not a visitor.
		if (pathname !== '/' && pathname !== '/contact') {
			return new Response('Not found', { status: 404 });
		}

		if (request.method !== 'POST') {
			return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
		}

		if (!originAllowed(origin, env.ALLOWED_ORIGINS)) {
			return new Response('Forbidden origin', { status: 403 });
		}

		// Rate limit before parsing, so a flood costs as little as possible.
		// CF-Connecting-IP is set by Cloudflare itself and cannot be spoofed by
		// the client; the fallback keys everyone together, which is the safe
		// direction to fail.
		const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
		const { success } = await env.CONTACT_LIMIT.limit({ key: ip });
		if (!success) {
			return json({ error: 'Too many messages just now. Try again in a minute.' }, 429, origin);
		}

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return json({ error: 'Expected JSON' }, 400, origin);
		}

		const result = validate(body);
		if (!result.ok) {
			// A bot that tripped the honeypot gets the same 200 a real send does,
			// so it learns nothing and does not retry with the field removed.
			if (result.reason === 'honeypot') return json({ ok: true }, 200, origin);
			return json({ error: result.reason }, 400, origin);
		}

		// The notification is the one that matters: it decides the HTTP status.
		if (!(await send(renderMail(result.value, env), env, 'notification'))) {
			return json({ error: 'Could not send right now. Try again shortly.' }, 502, origin);
		}

		// The acknowledgement is a courtesy. It goes out after the response is
		// already on its way, and a failure is logged rather than surfaced —
		// the visitor's message *did* arrive, so telling them it did not would
		// be a lie, and making them wait on a second API call would be rude.
		ctx.waitUntil(send(renderAck(result.value, env, keralaNow()), env, 'acknowledgement'));

		return json({ ok: true }, 200, origin);
	}
} satisfies ExportedHandler<Env>;
