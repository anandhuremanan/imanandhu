<script lang="ts">
	import { reveal, magnetic, scramble } from '$lib/actions';
	import { socials } from '$lib/data/projects';

	let sending = $state(false);
</script>

<svelte:head>
	<title>Contact — Anandhu Remanan</title>
	<meta
		name="description"
		content="Get in touch with Anandhu Remanan. Connect via social media or send a message."
	/>
	<meta property="og:title" content="Contact — Anandhu Remanan" />
	<meta
		property="og:description"
		content="Get in touch with Anandhu Remanan. Connect via social media or send a message."
	/>
</svelte:head>

<header class="page-head">
	<span class="label label-accent">[ 003 / CONTACT ]</span>
	<h1 class="display fluid-lg" use:scramble={{ trigger: 'mount' }}>Let's Connect</h1>
	<p>
		I'm always open to discussing new projects, creative ideas, or opportunities to be part of your
		visions. Feel free to reach out!
	</p>
	<div class="head-rule" use:reveal={{ rule: true, delay: 200 }}></div>
</header>

<div class="grid">
	<!-- Left: channels -->
	<aside class="channels">
		<div class="block" use:reveal>
			<span class="label">Status</span>
			<p class="status">
				<i class="pip"></i>
				Open to work
			</p>
			<span class="label">Kerala, India · Remote friendly</span>
		</div>

		<div class="block" use:reveal={{ delay: 80 }}>
			<span class="label">Channels</span>
			<ul class="socials">
				{#each socials as s (s.href)}
					<li>
						<a href={s.href} target="_blank" rel="noopener noreferrer">
							<span>{s.label}</span>
							<span class="handle mono">{s.handle}</span>
							<span class="arrow" aria-hidden="true">↗</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<div class="block" use:reveal={{ delay: 160 }}>
			<span class="label">Response time</span>
			<p class="dim">Usually within a day or two.</p>
		</div>
	</aside>

	<!-- Right: form -->
	<section class="form-wrap" use:reveal={{ delay: 120 }}>
		<div class="form-head">
			<span class="label">Send a message</span>
			<span class="label mono">01 — 03</span>
		</div>

		<form
			action="https://formspree.io/f/xbddkkjy"
			method="POST"
			class="form"
			onsubmit={() => (sending = true)}
		>
			<div class="field">
				<label for="name" class="label">01 — Name</label>
				<input type="text" name="name" id="name" required placeholder="Your name" />
			</div>

			<div class="field">
				<label for="email" class="label">02 — Email</label>
				<input type="email" name="email" id="email" required placeholder="name@example.com" />
			</div>

			<div class="field">
				<label for="message" class="label">03 — Message</label>
				<textarea
					name="message"
					id="message"
					rows="6"
					required
					placeholder="Whatever you want to say..."
				></textarea>
			</div>

			<button type="submit" disabled={sending} use:magnetic={{ strength: 0.18 }}>
				{sending ? 'Sending…' : 'Transmit'}
				<span aria-hidden="true">→</span>
			</button>

			<p class="label foot">Powered by Formspree · No email revealed</p>
		</form>
	</section>
</div>

<style>
	.page-head {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding: calc(var(--nav-h) + 6rem) var(--gutter) 3rem;
	}

	.page-head h1 {
		margin: 0;
	}

	.page-head p {
		max-width: 34rem;
		margin: 0;
		font-size: 1rem;
		line-height: 1.7;
		color: #94949e;
	}

	.head-rule {
		height: 1px;
		background: var(--line);
		margin-top: 1.5rem;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 3.5rem;
		padding: 2rem var(--gutter) 7rem;
	}

	@media (min-width: 900px) {
		.grid {
			grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);
			gap: 4.5rem;
			align-items: start;
		}
	}

	/* ---------------------------------------------------------- CHANNELS */
	.channels {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	@media (min-width: 900px) {
		.channels {
			position: sticky;
			top: calc(var(--nav-h) + 3rem);
		}
	}

	.block {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.status {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin: 0;
		font-size: 1.125rem;
		color: #2bf5c0;
	}

	.pip {
		width: 6px;
		height: 6px;
		border-radius: 999px;
		background: #2bf5c0;
		box-shadow: 0 0 0 0 rgba(43, 245, 192, 0.55);
		animation: ping 2.4s ease-out infinite;
	}

	@keyframes ping {
		0% {
			box-shadow: 0 0 0 0 rgba(43, 245, 192, 0.55);
		}
		70%,
		100% {
			box-shadow: 0 0 0 8px rgba(43, 245, 192, 0);
		}
	}

	.dim {
		margin: 0;
		font-size: 0.9375rem;
		color: #94949e;
	}

	.socials {
		border-top: 1px solid var(--line);
	}

	.socials a {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.2rem 0.75rem;
		padding: 0.85rem 0;
		border-bottom: 1px solid var(--line);
		text-decoration: none;
		color: #f0f0f2;
		font-size: 0.9375rem;
		transition:
			color 0.35s ease,
			padding-left 0.45s var(--ease-out-expo);
	}

	.socials a:hover {
		color: #2bf5c0;
		padding-left: 0.5rem;
	}

	.handle {
		grid-column: 1;
		font-size: 0.625rem;
		color: #83838e;
	}

	.arrow {
		grid-row: 1;
		grid-column: 2;
		color: #83838e;
		transition:
			transform 0.45s var(--ease-out-expo),
			color 0.35s ease;
	}

	.socials a:hover .arrow {
		color: #2bf5c0;
		transform: translate(3px, -3px);
	}

	/* ---------------------------------------------------------- FORM */
	/* Opaque on purpose: the particle field sits directly behind this card and
	   backdrop-filter cannot reach it (see the note in layout.css), so contrast
	   has to come from the surface itself. */
	.form-wrap {
		border: 1px solid var(--line-2, rgba(255, 255, 255, 0.16));
		background: rgba(9, 9, 12, 0.94);
		box-shadow: 0 24px 70px -20px rgba(0, 0, 0, 0.9);
	}

	.form-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--line);
		background: rgba(255, 255, 255, 0.025);
	}

	.form-head :global(.label) {
		color: #94949e;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
		padding: 2rem 1.5rem;
	}

	@media (min-width: 640px) {
		.form {
			padding: 2.5rem;
		}
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}

	/* Field labels sit above the dim --color-faint the .label class defaults to,
	   so they stay legible as form copy rather than decorative micro-text. */
	.field :global(.label) {
		color: #94949e;
		font-size: 0.625rem;
	}

	/* Fully boxed rather than underlined: the underline read as plain text over
	   a busy background and gave no affordance that it was an input at all. */
	input,
	textarea {
		width: 100%;
		background: rgba(255, 255, 255, 0.045);
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 2px;
		padding: 0.8rem 0.9rem;
		font-family: inherit;
		font-size: 0.9375rem;
		line-height: 1.5;
		color: #f0f0f2;
		outline: none;
		resize: vertical;
		transition:
			border-color 0.3s ease,
			background 0.3s ease,
			box-shadow 0.3s ease;
	}

	input::placeholder,
	textarea::placeholder {
		color: #6b6b76;
	}

	input:hover,
	textarea:hover {
		border-color: rgba(255, 255, 255, 0.26);
	}

	input:focus,
	textarea:focus {
		border-color: #2bf5c0;
		background: rgba(43, 245, 192, 0.05);
		box-shadow: 0 0 0 3px rgba(43, 245, 192, 0.14);
	}

	/* The ring above already marks focus; suppress the global outline so the
	   two do not stack into a double border. */
	input:focus-visible,
	textarea:focus-visible {
		outline: none;
	}

	/* The label tints while its field is focused. */
	.field:focus-within :global(.label) {
		color: #2bf5c0;
	}

	button {
		align-self: flex-start;
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 0.5rem;
		padding: 0.95rem 1.75rem;
		border: 0;
		background: #2bf5c0;
		color: #050506;
		font-family: 'JetBrains Mono Variable', monospace;
		font-size: 0.6875rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		cursor: pointer;
		transition:
			box-shadow 0.45s ease,
			opacity 0.3s ease;
	}

	button:hover:not(:disabled) {
		box-shadow: 0 0 34px rgba(43, 245, 192, 0.45);
	}

	button:disabled {
		opacity: 0.55;
		cursor: wait;
	}

	.foot {
		margin: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.pip {
			animation: none;
		}
	}
</style>
