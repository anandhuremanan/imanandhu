<script lang="ts">
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { kerala } from '$lib/kerala.svelte';
	import { socials, MUSIC_URL, STORIES_URL, PAINT_URL } from '$lib/data/projects';

	/** The existing endpoint. Unchanged — messages keep arriving the same way. */
	const FORMSPREE = 'https://formspree.io/f/xbddkkjy';

	let name = $state('');
	let email = $state('');
	let message = $state('');
	let sending = $state(false);
	let sent = $state(false);
	let failed = $state(false);
	/** Kerala time at the moment it actually sent, so the receipt stays truthful. */
	let sentAt = $state('');

	const ready = $derived(
		name.trim().length > 0 && /.+@.+\..+/.test(email.trim()) && message.trim().length > 0
	);

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!ready || sending) return;

		sending = true;
		failed = false;

		try {
			// Formspree returns JSON instead of redirecting when asked to, which is
			// what lets the designed success state replace the form in place.
			const res = await fetch(FORMSPREE, {
				method: 'POST',
				headers: { Accept: 'application/json' },
				body: new FormData(event.currentTarget as HTMLFormElement)
			});
			if (!res.ok) throw new Error(String(res.status));
			sentAt = kerala.clock;
			sent = true;
		} catch {
			// Never pretend a message was delivered when it was not.
			failed = true;
		} finally {
			sending = false;
		}
	}

	function again() {
		sent = false;
		failed = false;
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
			<!-- action/method are kept so the form still works if the fetch path
			     fails or JavaScript never runs; submit() intercepts otherwise. -->
			<form class="form" action={FORMSPREE} method="POST" onsubmit={submit}>
				<div class="field">
					<label class="meta" for="c-name">Your name</label>
					<input id="c-name" name="name" type="text" required bind:value={name} />
				</div>

				<div class="field">
					<label class="meta" for="c-email">Your email</label>
					<input id="c-email" name="email" type="email" required bind:value={email} />
				</div>

				<div class="field">
					<label class="meta" for="c-msg">What are you working on?</label>
					<textarea id="c-msg" name="message" rows="7" required bind:value={message}></textarea>
				</div>

				{#if failed}
					<p class="error" role="alert">
						That didn't send — the network or the form service refused it. Try again, or reach me on
						one of the channels listed here.
					</p>
				{/if}

				<div class="actions">
					<button type="submit" class="send" class:ready disabled={!ready || sending}>
						{sending ? 'Sending…' : 'Send message →'}
					</button>
					<span class="meta">Sent privately via Formspree</span>
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
							<span class="meta">{c.handle} ↗</span>
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
