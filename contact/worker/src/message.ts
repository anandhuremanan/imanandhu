import type { KeralaNow } from './kerala';

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

/* ------------------------------------------------------------------ *
 * Acknowledgement sent back to the visitor
 * ------------------------------------------------------------------ */

/**
 * Email HTML is not web HTML. Tables for layout, every style inline, no CSS
 * variables, no flex, no gap, and Outlook on Windows renders through Word —
 * which drops border-radius and ignores max-width on a div. Hence the nested
 * tables and the belt-and-braces width attributes below.
 */

/** Newlines survive Word's renderer as <br>; `white-space: pre-wrap` does not. */
function toHtmlLines(value: string): string {
	return escapeHtml(value).replace(/\r?\n/g, '<br />');
}

const SANS =
	"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";

export function renderAck(
	value: { name: string; email: string; message: string },
	env: { MAIL_FROM: string; MAIL_TO: string },
	now: KeralaNow
): RenderedMail {
	const { palette: p, clock } = now;
	// Only the first name — "Thanks for writing, Asha" reads like a person
	// wrote it; the full legal name reads like a database did.
	const first = value.name.split(/\s+/)[0] || value.name;

	const text =
		`Got it.\n\n` +
		`Thanks for writing, ${first}. Your message reached me at ${clock} Kerala time. ` +
		`${p.moment}, so I have probably not read it yet — I usually reply within a day or two.\n\n` +
		`This is an automatic note, but a real reply is coming.\n\n` +
		`--- What you sent ---\n${value.message}\n---\n\n` +
		`Anandhu Remanan\nhttps://imanandhu.in\n`;

	const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="${p.scheme}" />
<meta name="supported-color-schemes" content="${p.scheme}" />
<title>Got it.</title>
</head>
<body style="margin:0;padding:0;background:${p.bg};">
<!-- Inbox preview line. Hidden in the body, read by the client's list view. -->
<div style="display:none;font-size:1px;color:${p.bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">Your message reached me at ${clock} Kerala time. A real reply is coming.</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${p.bg};margin:0;padding:0;">
<tr><td align="center" style="padding:32px 16px;">

<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background:${p.card};border:1px solid ${p.line};border-radius:14px;">
<tr><td style="padding:34px 32px 30px 32px;">

<p style="margin:0 0 26px 0;font-family:${MONO};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${p.muted};">Anandhu Remanan</p>

<h1 style="margin:0 0 16px 0;font-family:${SANS};font-size:34px;line-height:1.1;letter-spacing:-0.03em;font-weight:600;color:${p.fg};">Got it.</h1>

<p style="margin:0 0 14px 0;font-family:${SANS};font-size:16px;line-height:1.6;color:${p.fg};">
Thanks for writing, ${escapeHtml(first)}. Your message reached me at <strong style="color:${p.accent};">${clock}</strong> Kerala time. ${p.moment}, so I have probably not read it yet &mdash; I usually reply within a day or two.
</p>
<p style="margin:0 0 28px 0;font-family:${SANS};font-size:14px;line-height:1.6;color:${p.muted};">
This note is automatic. The reply will not be.
</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="border-top:1px solid ${p.line};padding-top:20px;">
<p style="margin:0 0 10px 0;font-family:${MONO};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${p.muted};">What you sent</p>
<div style="font-family:${SANS};font-size:15px;line-height:1.65;color:${p.fg};">${toHtmlLines(value.message)}</div>
</td></tr>
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
<tr><td style="border-top:1px solid ${p.line};padding-top:18px;font-family:${MONO};font-size:12px;color:${p.muted};">
<a href="https://imanandhu.in" style="color:${p.accent};text-decoration:none;">imanandhu.in</a>
&nbsp;&middot;&nbsp;
<a href="https://music.imanandhu.in" style="color:${p.muted};text-decoration:none;">Music</a>
&nbsp;&middot;&nbsp;
<a href="https://stories.imanandhu.in" style="color:${p.muted};text-decoration:none;">Stories</a>
</td></tr>
</table>

</td></tr>
</table>

</td></tr>
</table>
</body></html>`;

	return {
		from: env.MAIL_FROM,
		to: value.email,
		// A reply to this courtesy note should still reach a human.
		reply_to: env.MAIL_TO,
		subject: 'Got your message — Anandhu Remanan',
		text,
		html
	};
}
