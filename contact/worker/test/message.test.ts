import { describe, expect, it } from 'vitest';
import { LIMITS, renderAck, renderMail, validate } from '../src/message';
import { keralaNow, THEMES } from '../src/kerala';

const ok = { name: 'Asha', email: 'asha@example.com', message: 'Hello there.' };

describe('validate', () => {
	it('accepts a well-formed message', () => {
		const r = validate(ok);
		expect(r).toEqual({ ok: true, value: ok });
	});

	it('trims, and reports the first missing field', () => {
		expect(validate({ ...ok, name: '   ' })).toEqual({ ok: false, reason: 'Name is required' });
		expect(validate({ ...ok, email: '' })).toEqual({ ok: false, reason: 'Email is required' });
		expect(validate({ ...ok, message: '\n\n' })).toEqual({
			ok: false,
			reason: 'Message is required'
		});
	});

	it('rejects a non-object body', () => {
		for (const bad of [null, 'string', 42, undefined]) {
			expect(validate(bad).ok).toBe(false);
		}
	});

	it('rejects an address with no domain dot, accepts ordinary ones', () => {
		expect(validate({ ...ok, email: 'asha@example' }).ok).toBe(false);
		expect(validate({ ...ok, email: 'a b@example.com' }).ok).toBe(false);
		expect(validate({ ...ok, email: 'asha+tag@sub.example.co.in' }).ok).toBe(true);
	});

	it('enforces length caps at the boundary', () => {
		expect(validate({ ...ok, message: 'x'.repeat(LIMITS.message) }).ok).toBe(true);
		expect(validate({ ...ok, message: 'x'.repeat(LIMITS.message + 1) })).toEqual({
			ok: false,
			reason: 'Message is too long'
		});
		expect(validate({ ...ok, name: 'x'.repeat(LIMITS.name + 1) }).ok).toBe(false);
	});

	it('strips CR/LF from the fields that reach mail headers', () => {
		const r = validate({
			...ok,
			name: 'Asha\r\nBcc: victim@example.com',
			email: 'asha@example.com\nBcc: victim@example.com'
		});
		// The email is now unparseable as an address, so it must not get through.
		expect(r.ok).toBe(false);

		const nameOnly = validate({ ...ok, name: 'Asha\r\nX-Injected: 1' });
		expect(nameOnly.ok).toBe(true);
		if (nameOnly.ok) expect(nameOnly.value.name).not.toMatch(/[\r\n]/);
	});

	it('treats a filled honeypot as a silent discard, not a validation error', () => {
		expect(validate({ ...ok, company: 'Acme' })).toEqual({ ok: false, reason: 'honeypot' });
		expect(validate({ ...ok, company: '' }).ok).toBe(true);
	});
});

describe('renderMail', () => {
	const env = { MAIL_FROM: 'Portfolio <contact@imanandhu.in>', MAIL_TO: 'inbox@example.com' };

	it('replies to the visitor while sending from the verified domain', () => {
		const m = renderMail(ok, env);
		expect(m.from).toBe(env.MAIL_FROM);
		expect(m.to).toBe(env.MAIL_TO);
		expect(m.reply_to).toBe(ok.email);
		expect(m.subject).toContain('Asha');
	});

	it('escapes HTML in attacker-controlled fields', () => {
		const m = renderMail(
			{ ...ok, name: '<img src=x onerror=alert(1)>', message: '<script>alert(2)</script>' },
			env
		);
		expect(m.html).not.toContain('<script>');
		expect(m.html).not.toContain('<img');
		expect(m.html).toContain('&lt;script&gt;');
		// The plain-text part is not markup, so it stays readable as typed.
		expect(m.text).toContain('<script>alert(2)</script>');
	});

	it('keeps newlines in the message body visible', () => {
		const m = renderMail({ ...ok, message: 'one\ntwo' }, env);
		expect(m.text).toContain('one\ntwo');
		expect(m.html).toContain('white-space:pre-wrap');
	});
});

describe('renderAck', () => {
	const env = { MAIL_FROM: 'Portfolio <contact@imanandhu.in>', MAIL_TO: 'mails@imanandhu.in' };
	// 16:30 UTC == 22:00 IST == night.
	const night = keralaNow(new Date('2026-09-30T16:30:00Z'));
	// 06:30 UTC == 12:00 IST == day.
	const day = keralaNow(new Date('2026-09-30T06:30:00Z'));

	it('goes to the visitor, and replies to a human', () => {
		const m = renderAck(ok, env, day);
		expect(m.to).toBe(ok.email);
		expect(m.from).toBe(env.MAIL_FROM);
		expect(m.reply_to).toBe(env.MAIL_TO);
	});

	it('is themed by the hour it was sent', () => {
		expect(renderAck(ok, env, night).html).toContain(THEMES.night.bg);
		expect(renderAck(ok, env, night).html).not.toContain(THEMES.day.bg);
		expect(renderAck(ok, env, day).html).toContain(THEMES.day.bg);
		expect(renderAck(ok, env, night).html).toContain('22:00');
		expect(renderAck(ok, env, day).text).toContain('12:00');
	});

	it('greets by first name only', () => {
		const m = renderAck({ ...ok, name: 'Asha Nair' }, env, day);
		expect(m.text).toContain('Thanks for writing, Asha.');
		expect(m.text).not.toContain('Asha Nair.');
	});

	it('escapes the quoted message and the name', () => {
		const m = renderAck(
			{ ...ok, name: '<b>x</b>', message: '<script>alert(1)</script>' },
			env,
			day
		);
		expect(m.html).not.toContain('<script>');
		expect(m.html).not.toContain('<b>x</b>');
		expect(m.html).toContain('&lt;script&gt;');
	});

	it('turns newlines into <br>, since Word ignores pre-wrap', () => {
		const m = renderAck({ ...ok, message: 'one\ntwo' }, env, day);
		expect(m.html).toContain('one<br />two');
	});

	it('carries a hidden preheader and no external stylesheet', () => {
		const html = renderAck(ok, env, day).html;
		expect(html).toContain('max-height:0');
		expect(html).not.toContain('<link');
		expect(html).not.toMatch(/<style[\s>]/);
		// Layout tables must not be announced as data tables.
		expect(html).not.toMatch(/<table(?![^>]*role="presentation")/);
	});
});
