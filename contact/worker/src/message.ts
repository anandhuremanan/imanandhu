/**
 * Everything about a contact message that does not touch the network.
 *
 * Kept separate from index.ts so the rules that decide whether a submission is
 * acceptable can be unit-tested without a Worker runtime, a rate limiter or a
 * Resend key.
 */

export interface ContactPayload {
	name: string;
	email: string;
	message: string;
	/**
	 * Honeypot. A real form leaves this empty because the field is hidden from
	 * humans; most naive bots fill every input they find. Cheap, invisible, and
	 * it never asks a visitor to identify a traffic light.
	 */
	company?: string;
}

export type Validated =
	| { ok: true; value: { name: string; email: string; message: string } }
	| { ok: false; reason: string };

/** Guards against someone pasting a novel into the inbox. */
export const LIMITS = {
	name: 80,
	email: 160,
	message: 4000
} as const;

/**
 * Deliberately loose. Real address syntax is far wider than any regex people
 * actually write, and the cost of rejecting a valid address is a message that
 * never arrives. Anything shaped like an address passes; bounces are Resend's
 * problem, not this Worker's.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Headers are terminated by CR/LF, so a newline smuggled into a value that
 * later lands in one (here, Reply-To) is a header-injection vector. The name
 * also flows into the Subject. Strip both controls rather than reject, so a
 * stray paste does not cost someone their message.
 */
function oneLine(value: string): string {
	return value.replace(/[\r\n]+/g, ' ').trim();
}

export function validate(input: unknown): Validated {
	if (typeof input !== 'object' || input === null) {
		return { ok: false, reason: 'Expected a JSON object' };
	}
	const body = input as Record<string, unknown>;

	// Honeypot filled: accept and discard. Returning an error would tell a bot
	// exactly which field gave it away.
	if (typeof body.company === 'string' && body.company.trim() !== '') {
		return { ok: false, reason: 'honeypot' };
	}

	const name = typeof body.name === 'string' ? oneLine(body.name) : '';
	const email = typeof body.email === 'string' ? oneLine(body.email) : '';
	const message = typeof body.message === 'string' ? body.message.trim() : '';

	if (!name) return { ok: false, reason: 'Name is required' };
	if (name.length > LIMITS.name) return { ok: false, reason: 'Name is too long' };

	if (!email) return { ok: false, reason: 'Email is required' };
	if (email.length > LIMITS.email) return { ok: false, reason: 'Email is too long' };
	if (!EMAIL.test(email)) return { ok: false, reason: 'That email address looks wrong' };

	if (!message) return { ok: false, reason: 'Message is required' };
	if (message.length > LIMITS.message) return { ok: false, reason: 'Message is too long' };

	return { ok: true, value: { name, email, message } };
}

const ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};

/** The message is attacker-controlled and lands in an HTML email. */
function escapeHtml(value: string): string {
	// The character class and the map key set are the same five characters, but
	// TypeScript indexes a Record<string, string> as possibly-undefined.
	return value.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);
}

export interface RenderedMail {
	from: string;
	to: string;
	reply_to: string;
	subject: string;
	text: string;
	html: string;
}

/**
 * `reply_to` is the whole point: mail arrives from your own verified sender so
 * it authenticates and lands in the inbox, but hitting reply goes straight to
 * the visitor.
 */
export function renderMail(
	value: { name: string; email: string; message: string },
	env: { MAIL_FROM: string; MAIL_TO: string }
): RenderedMail {
	const text = `From: ${value.name} <${value.email}>\n\n${value.message}\n`;

	const html =
		`<p style="margin:0 0 4px"><strong>${escapeHtml(value.name)}</strong></p>` +
		`<p style="margin:0 0 16px"><a href="mailto:${escapeHtml(value.email)}">${escapeHtml(value.email)}</a></p>` +
		`<div style="white-space:pre-wrap">${escapeHtml(value.message)}</div>`;

	return {
		from: env.MAIL_FROM,
		to: env.MAIL_TO,
		reply_to: value.email,
		subject: `Portfolio — ${value.name}`,
		text,
		html
	};
}
