<script lang="ts">
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { kerala } from '$lib/kerala.svelte';
	import { socials, MUSIC_URL, STORIES_URL, PAINT_URL } from '$lib/data/projects';
	import { ARROW_NE } from '$lib/glyphs';
	import { env } from '$env/dynamic/public';

	/**
	 * Contact Worker endpoint (contact/worker). Unset in an environment that has
	 * no Worker — the form then degrades to the channel list beside it rather
	 * than offering a send button that cannot work.
	 *
	 * Replaced Formspree, which had reCAPTCHA enabled on the form and so
	 * answered every AJAX submission with
	 *   403 {"error":"In order to submit via AJAX, you need to set a custom key
	 *        or reCAPTCHA must be disabled in this form's settings page."}
	 * Nothing sent for as long as that setting was on.
	 */
	const ENDPOINT = env.PUBLIC_CONTACT_ENDPOINT ?? '';

	let name = $state('');
	let email = $state('');
	let message = $state('');
	let sending = $state(false);
	let sent = $state(false);
	let failed = $state(false);
	/** Honeypot, hidden from humans and left empty by them. See the Worker. */
	let company = $state('');
	/** What the Worker said, when it said something a visitor can act on. */
	let reason = $state('');
	/** Kerala time at the moment it actually sent, so the receipt stays truthful. */
	let sentAt = $state('');

	const ready = $derived(
		ENDPOINT !== '' &&
			name.trim().length > 0 &&
			/.+@.+\..+/.test(email.trim()) &&
			message.trim().length > 0
	);

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!ready || sending) return;

		sending = true;
		failed = false;

		try {
			const res = await fetch(ENDPOINT, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, message, company })
			});
			// The Worker explains a 400 or a 429 in its own words; anything else
			// gets the generic line, since its body is not meant for visitors.
			if (!res.ok) {
				const body = await res.json().catch(() => null);
				throw new Error(typeof body?.error === 'string' ? body.error : '');
			}
			sentAt = kerala.clock;
			sent = true;
		} catch (err) {
			// Never pretend a message was delivered when it was not.
			reason = err instanceof Error && err.message ? err.message : '';
			failed = true;
		} finally {
			sending = false;
		}
	}

	function again() {
		sent = false;
		failed = false;
		reason = '';
		name = '';
		email = '';
		message = '';
	}

	const footerLinks = [
		{ label: 'Music', href: MUSIC_URL },
		{ label: 'Stories', href: STORIES_URL },
		{ label: 'Paint', href: PAINT_URL }
	];
</script>

<svelte:head>
	<title>Contact — Anandhu Remanan</title>
	<meta
		name="description"
		content="Open to work, remote friendly. Send a message and I'll usually reply within a day or two."
	/>
	<meta property="og:title" content="Contact — Anandhu Remanan" />
	<meta
		property="og:description"
		content="Open to work, remote friendly. Send a message and I'll usually reply within a day or two."
	/>
</svelte:head>

<div class="page">
	<SiteHeader />

	<section class="intro">
		<div class="status mono">
			<span class="dot" aria-hidden="true"></span>Open to work · Remote friendly
		</div>
		<h1 class="h1">Let's talk.</h1>
		<p class="note">
			It's <span class="mono">{kerala.clock}</span> in Kerala.
			<span class="muted">{kerala.note}</span>
		</p>
	</section>

	<section class="grid">
		{#if sent}
			<div class="done" role="status">
				<span class="done-head">Sent at {sentAt} Kerala time.</span>
				<span class="done-sub">I usually reply within a day or two.</span>
				<button type="button" class="pill small" onclick={again}>Send another</button>
			</div>
		{:else}
			<!-- No action/method fallback: the Worker replies with JSON, so a
			     non-JS POST would land the visitor on a bare {"ok":true}. The
			     channel list beside the form is the no-JS path. -->
			<form class="form" onsubmit={submit}>
				<!-- Honeypot. Hidden from sight, from screen readers and from the
				     tab order, so only a bot that fills every input trips it. -->
				<div class="hp" aria-hidden="true">
					<label for="c-company">Company</label>
					<input id="c-company" name="company" type="text" tabindex="-1" autocomplete="off"
						bind:value={company} />
				</div>

				<div class="field">
					<label class="meta" for="c-name">Your name</label>
					<input id="c-name" name="name" type="text" autocomplete="name" required bind:value={name} />
				</div>

				<div class="field">
					<label class="meta" for="c-email">Your email</label>
					<input id="c-email" name="email" type="email" autocomplete="email" required bind:value={email} />
				</div>

				<div class="field">
					<label class="meta" for="c-msg">What are you working on?</label>
					<textarea id="c-msg" name="message" rows="7" required bind:value={message}></textarea>
				</div>

				{#if failed}
					<p class="error" role="alert">
						{reason ||
							"That didn't send — the network or the mail service refused it."} Try again, or reach
						me on one of the channels listed here.
					</p>
				{/if}

				<div class="actions">
					<button type="submit" class="send" class:ready disabled={!ready || sending}>
						{sending ? 'Sending…' : 'Send message →'}
					</button>
					<span class="meta">Goes straight to my inbox — nothing is stored</span>
				</div>
			</form>
		{/if}

		<aside class="channels">
			<div class="block">
				<span class="meta">Or find me on</span>
				<div class="list">
					{#each socials as c (c.href)}
						<a class="channel" href={c.href} target="_blank" rel="noopener noreferrer">
							<span class="channel-label">{c.label}</span>
							<span class="meta">{c.handle} {ARROW_NE}</span>
						</a>
					{/each}
				</div>
			</div>

			<div class="block">
				<span class="meta">Response time</span>
				<span class="reply">Usually within a day or two.</span>
			</div>
		</aside>
	</section>

	<SiteFooter links={footerLinks} />
</div>

<style>
	/* ---------------------------------------------------------- intro */
	.intro {
		display: flex;
		flex-direction: column;
		gap: 14px;
		margin-top: 56px;
	}

	@media (min-width: 900px) {
		.intro {
			gap: 20px;
			margin-top: 112px;
		}
	}

	.status {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 13px;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent);
		transition: background 0.8s ease;
	}

	.note {
		max-width: 900px;
		font-size: 20px;
		line-height: 1.35;
		letter-spacing: -0.01em;
	}

	@media (min-width: 900px) {
		.note {
			font-size: 28px;
		}
	}

	.muted {
		color: var(--muted);
	}

	/* ---------------------------------------------------------- layout */
	.grid {
		display: grid;
		gap: 48px;
		margin-top: 48px;
	}

	@media (min-width: 900px) {
		.grid {
			grid-template-columns: minmax(0, 1fr) 400px;
			gap: 112px;
			align-items: start;
			margin-top: 96px;
		}
	}

	/* ---------------------------------------------------------- form */
	/*
	 * Not `display: none` — some bots skip hidden inputs, and some browsers
	 * skip autofill on them. Taken out of flow and clipped instead.
	 */
	.hp {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 28px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	input,
	textarea {
		width: 100%;
		padding: 0;
		border: 0;
		border-bottom: 1px solid var(--fg);
		background: transparent;
		font-size: 18px;
		outline: none;
		transition: border-color 0.8s ease;
	}

	input {
		min-height: 52px;
	}

	textarea {
		padding: 14px 0;
		line-height: 1.5;
		resize: vertical;
	}

	/*
	 * Chrome paints autofilled fields a fixed pale blue and near-black text,
	 * which on the dusk and night palettes is a white slab in the middle of the
	 * form. `background-color` cannot override it — the UA style wins — but a
	 * large inset box-shadow paints over it, and -webkit-text-fill-color beats
	 * `color` on an autofilled control.
	 *
	 * :hover, :focus and :active are listed because Chrome re-applies its own
	 * colours on each of those states independently.
	 */
	input:-webkit-autofill,
	input:-webkit-autofill:hover,
	input:-webkit-autofill:focus,
	input:-webkit-autofill:active,
	textarea:-webkit-autofill,
	textarea:-webkit-autofill:hover,
	textarea:-webkit-autofill:focus {
		-webkit-text-fill-color: var(--fg);
		caret-color: var(--fg);
		box-shadow: 0 0 0 1000px var(--bg) inset;
		/* The shadow repaints instantly, but Chrome animates its own background
		   in over ~0.2s. Parking that transition keeps the blue from flashing. */
		transition:
			background-color 600000s 0s,
			border-color 0.8s ease;
	}

	input:focus-visible,
	textarea:focus-visible {
		outline: none;
		border-bottom-color: var(--accent);
		border-bottom-width: 2px;
		/* Compensate so the text does not shift when the border thickens. */
		margin-bottom: -1px;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}

	.send {
		min-height: 52px;
		padding: 0 28px;
		border: 1px solid var(--fg);
		border-radius: 999px;
		background: transparent;
		color: var(--muted);
		font-size: 16px;
		font-weight: 500;
		transition:
			background 0.2s ease,
			color 0.2s ease,
			border-color 0.8s ease;
	}

	/* Fills in only once every field is valid — the button itself is the hint. */
	.send.ready:not(:disabled) {
		background: var(--fg);
		color: var(--bg);
	}

	.send:disabled {
		cursor: not-allowed;
	}

	.error {
		font-size: 15px;
		line-height: 1.5;
		color: var(--accent);
	}

	/* ---------------------------------------------------------- sent */
	.done {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 24px;
		border: 1px solid var(--line);
		border-radius: 16px;
		background: var(--card);
		transition:
			background 0.8s ease,
			border-color 0.8s ease;
	}

	@media (min-width: 900px) {
		.done {
			padding: 32px;
		}
	}

	.done-head {
		font-size: 28px;
		font-weight: 500;
		letter-spacing: -0.02em;
	}

	@media (min-width: 900px) {
		.done-head {
			font-size: 36px;
		}
	}

	.done-sub {
		font-size: 17px;
		line-height: 1.55;
		color: var(--muted);
	}

	.small {
		align-self: flex-start;
		padding: 0 18px;
		font-size: 14px;
	}

	/* ---------------------------------------------------------- channels */
	.channels {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	@media (min-width: 900px) {
		.channels {
			gap: 40px;
		}
	}

	.block {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.list {
		display: flex;
		flex-direction: column;
		margin-top: 4px;
	}

	.channel {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		min-height: 60px;
		border-top: 1px solid var(--line);
		transition: border-color 0.8s ease;
	}

	.channel-label {
		font-size: 18px;
		font-weight: 500;
	}

	.reply {
		font-size: 17px;
	}
</style>
