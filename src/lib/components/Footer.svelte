<script lang="ts">
	import { socials } from '$lib/data/projects';
	import { reveal } from '$lib/actions';

	let clock = $state('--:--:--');

	$effect(() => {
		// Local time in Kerala, regardless of where the visitor is.
		const tick = () => {
			clock = new Intl.DateTimeFormat('en-GB', {
				timeZone: 'Asia/Kolkata',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false
			}).format(new Date());
		};
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	});
</script>

<footer class="footer">
	<div class="rule" use:reveal={{ rule: true }}></div>

	<div class="grid">
		<div class="col wide">
			<span class="label">Elsewhere</span>
			<ul class="socials">
				{#each socials as s (s.href)}
					<li>
						<a href={s.href} target="_blank" rel="noopener noreferrer">
							<span>{s.label}</span>
							<span class="handle mono">{s.handle}</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<div class="col">
			<span class="label">Location</span>
			<p>Kerala, India</p>
			<p class="mono dim">{clock} IST</p>
		</div>

		<div class="col">
			<span class="label">Colophon</span>
			<p class="dim">SvelteKit · Three.js</p>
			<p class="dim">Geist · JetBrains Mono</p>
		</div>
	</div>

	<div class="base">
		<span class="label">© {new Date().getFullYear()} Anandhu Remanan</span>
		<span class="label">No unnecessary layers</span>
	</div>
</footer>

<style>
	.footer {
		position: relative;
		z-index: 10;
		padding: 5rem var(--gutter) 2.5rem;
	}

	.rule {
		height: 1px;
		background: var(--line);
		margin-bottom: 3rem;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2.5rem;
	}

	@media (min-width: 768px) {
		.grid {
			grid-template-columns: 2fr 1fr 1fr;
			gap: 2rem;
		}
	}

	.col {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.col p {
		font-size: 0.875rem;
		margin: 0;
	}

	.dim {
		color: #94949e;
	}

	.socials {
		display: grid;
		gap: 0.1rem;
		max-width: 30rem;
	}

	.socials a {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.6rem 0;
		font-size: 0.9375rem;
		color: #f0f0f2;
		text-decoration: none;
		border-bottom: 1px solid var(--line);
		transition:
			color 0.35s ease,
			padding-left 0.45s var(--ease-out-expo);
	}

	.socials a:hover {
		color: #2bf5c0;
		padding-left: 0.5rem;
	}

	.handle {
		font-size: 0.6875rem;
		color: #55555f;
	}

	.base {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: space-between;
		margin-top: 3.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--line);
	}
</style>
