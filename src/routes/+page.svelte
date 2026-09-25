<script lang="ts">
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import { kerala } from '$lib/kerala.svelte';
	import { crafts, projects } from '$lib/data/projects';

	/** How many projects show before "Show all". */
	const VISIBLE = 5;

	let showAll = $state(false);

	// With five projects and five slots there is nothing to expand, so the
	// button is not rendered at all. Add a sixth project and it returns.
	const expandable = projects.length > VISIBLE;
	const shown = $derived(showAll || !expandable ? projects : projects.slice(0, VISIBLE));

	const schema = {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: 'Anandhu Remanan',
		url: 'https://imanandhu.in',
		jobTitle: 'Software Engineer',
		address: { '@type': 'PostalAddress', addressRegion: 'Kerala', addressCountry: 'IN' },
		sameAs: [
			'https://github.com/anandhuremanan',
			'https://www.linkedin.com/in/anandhuremanan/',
			'https://twitter.com/anandhu_or'
		]
	};
</script>

<svelte:head>
	<title>Anandhu Remanan — Software Engineer</title>
	{@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
</svelte:head>

<div class="page">
	<SiteHeader />

	<!-- Hero: the clock is the whole point of the page. -->
	<section class="hero">
		<p class="lead">It's</p>
		<div class="clock">{kerala.clock}</div>
		<p class="says">
			in Kerala, so I'm probably <span class="accent"
				>{kerala.doing.pre}{#if kerala.doing.link}{#if kerala.doing.href}<a
							class="ul"
							href={kerala.doing.href}
							target="_blank"
							rel="noopener noreferrer">{kerala.doing.link}</a
						>{:else}{kerala.doing.link}{/if}{/if}{kerala.doing.post}</span
			>
		</p>
	</section>

	<!-- Scrub: preview any hour of the day, theme and all. -->
	<div class="scrub meta">
		<label for="scrub">Scrub the day</label>
		<input
			id="scrub"
			type="range"
			min="0"
			max="1439"
			step="15"
			value={kerala.minutes}
			oninput={(e) => (kerala.scrub = Number(e.currentTarget.value))}
		/>
		{#if kerala.scrubbing}
			<button type="button" class="pill pill-quiet back" onclick={() => kerala.reset()}>
				Back to now
			</button>
		{/if}
	</div>

	<!-- Work -->
	<section id="work" class="work">
		<div class="sec-head meta">
			<span>What I've shipped · {projects.length} projects</span>
			<a class="tap" href="/case-studies">Full archive →</a>
		</div>

		{#each shown as p (p.id)}
			<a class="row" href="/case-studies#{p.id}">
				<span class="row-name">{p.name}</span>
				<span class="row-desc">{p.blurb}</span>
				<span class="row-year mono">{p.year}</span>
			</a>
		{/each}

		{#if expandable}
			<div class="more">
				<button
					type="button"
					class="pill"
					aria-expanded={showAll}
					onclick={() => (showAll = !showAll)}
				>
					{showAll ? 'Show latest only' : `Show all ${projects.length}`}
				</button>
			</div>
		{/if}
	</section>

	<!-- After hours -->
	<section id="after-hours" class="after">
		<div class="after-head">
			<h2 class="h2">After hours</h2>
			<span class="meta when">When the laptop closes</span>
		</div>

		<div class="cards">
			{#each crafts as c (c.key)}
				{@const on = c.key === kerala.craft}
				<svelte:element
					this={c.href ? 'a' : 'div'}
					class="card"
					class:on
					href={c.href ?? undefined}
					target={c.href ? '_blank' : undefined}
					rel={c.href ? 'noopener noreferrer' : undefined}
				>
					<span class="card-top mono">
						<span>{c.hours}</span>
						{#if on}<span>● happening now</span>{/if}
					</span>
					<span class="card-name"
						>{c.name}{#if c.href}&nbsp;↗{/if}</span
					>
					<span class="card-line">{c.line}</span>
				</svelte:element>
			{/each}
		</div>
	</section>

	<!-- Wrapper takes the `auto`; the footer's own margin guarantees the gap. -->
	<div class="foot-wrap">
		<footer class="foot">
			<!-- The site deliberately does not publish an email address. -->
			<a class="cta" href="/contact">Send a message →</a>
			<span class="socials mono">
				<a
					class="tap"
					href="https://github.com/anandhuremanan"
					target="_blank"
					rel="noopener noreferrer">GitHub</a
				>
				<a
					class="tap"
					href="https://www.linkedin.com/in/anandhuremanan/"
					target="_blank"
					rel="noopener noreferrer">LinkedIn</a
				>
				<a
					class="tap"
					href="https://twitter.com/anandhu_or"
					target="_blank"
					rel="noopener noreferrer">X</a
				>
			</span>
		</footer>
	</div>
</div>

<style>
	/* ---------------------------------------------------------- hero */
	.hero {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 64px;
	}

	@media (min-width: 900px) {
		.hero {
			gap: 12px;
			margin-top: 120px;
		}
	}

	.lead {
		font-size: 18px;
		color: var(--muted);
	}

	.says {
		max-width: 1000px;
		margin-top: 12px;
		font-size: 28px;
		font-weight: 500;
		line-height: 1.25;
		letter-spacing: -0.02em;
	}

	@media (min-width: 900px) {
		.lead {
			font-size: 26px;
		}
		.says {
			margin-top: 16px;
			font-size: 44px;
			line-height: 1.2;
		}
	}

	.accent {
		color: var(--accent);
	}

	/* ---------------------------------------------------------- scrub */
	.scrub {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 36px;
	}

	@media (min-width: 900px) {
		.scrub {
			flex-direction: row;
			align-items: center;
			gap: 20px;
			margin-top: 56px;
		}
	}

	.scrub input {
		width: 100%;
		height: 44px;
		margin: 0;
		accent-color: var(--fg);
	}

	@media (min-width: 900px) {
		.scrub input {
			width: 420px;
			height: auto;
		}
	}

	.back {
		align-self: flex-start;
	}

	/* ---------------------------------------------------------- work */
	.work {
		display: flex;
		flex-direction: column;
		margin-top: 72px;
	}

	@media (min-width: 900px) {
		.work {
			margin-top: 128px;
		}
	}

	.sec-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		padding-bottom: 12px;
	}

	@media (min-width: 900px) {
		.sec-head {
			padding-bottom: 16px;
		}
	}

	.tap {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
	}

	@media (min-width: 900px) {
		.tap {
			min-height: 0;
		}
	}

	/* Stacked on a phone, three columns from 900px. */
	.row {
		display: grid;
		grid-template-areas:
			'name year'
			'desc desc';
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 4px 12px;
		padding: 16px 0;
		border-top: 1px solid var(--line);
		transition: border-color 0.8s ease;
	}

	@media (min-width: 900px) {
		.row {
			grid-template-areas: 'name desc year';
			grid-template-columns: 300px minmax(0, 1fr) 80px;
			gap: 24px;
			align-items: baseline;
			padding: 20px 0;
		}
	}

	.row-name {
		grid-area: name;
		font-size: 20px;
		font-weight: 500;
	}

	.row-desc {
		grid-area: desc;
		font-size: 15px;
		color: var(--muted);
	}

	.row-year {
		grid-area: year;
		font-size: 12px;
		text-align: right;
	}

	@media (min-width: 900px) {
		.row-name {
			font-size: 24px;
		}
		.row-desc {
			font-size: 16px;
		}
		.row-year {
			font-size: 13px;
		}
	}

	.more {
		padding-top: 16px;
		border-top: 1px solid var(--line);
		transition: border-color 0.8s ease;
	}

	.more .pill {
		width: 100%;
	}

	@media (min-width: 900px) {
		.more {
			padding-top: 20px;
		}
		.more .pill {
			width: auto;
		}
	}

	/* ---------------------------------------------------------- after hours */
	.after {
		display: flex;
		flex-direction: column;
		gap: 14px;
		margin-top: 72px;
	}

	@media (min-width: 900px) {
		.after {
			gap: 24px;
			margin-top: 128px;
		}
	}

	.after-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
	}

	.when {
		display: none;
	}

	@media (min-width: 900px) {
		.when {
			display: inline;
		}
	}

	.cards {
		display: grid;
		gap: 14px;
	}

	@media (min-width: 900px) {
		.cards {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 20px;
		}
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 20px;
		border: 1px solid var(--line);
		border-radius: 14px;
		background: var(--card);
		color: var(--fg);
		transition:
			background 0.8s ease,
			border-color 0.8s ease,
			color 0.8s ease;
	}

	@media (min-width: 900px) {
		.card {
			gap: 14px;
			min-height: 240px;
			padding: 28px;
			border-radius: 16px;
		}
	}

	/* The craft happening right now inverts. */
	.card.on {
		border-color: var(--fg);
		background: var(--fg);
		color: var(--bg);
	}

	.card-top {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		font-size: 12px;
	}

	@media (min-width: 900px) {
		.card-top {
			font-size: 13px;
		}
	}

	.card-name {
		font-size: 28px;
		font-weight: 500;
		letter-spacing: -0.02em;
	}

	@media (min-width: 900px) {
		.card-name {
			margin-top: auto;
			font-size: 40px;
		}
	}

	.card-line {
		font-size: 15px;
		line-height: 1.5;
		opacity: 0.8;
	}

	@media (min-width: 900px) {
		.card-line {
			font-size: 16px;
		}
	}

	/* ---------------------------------------------------------- footer */
	.foot-wrap {
		margin-top: auto;
	}

	.foot {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 64px;
		padding-top: 24px;
		border-top: 1px solid var(--line);
		transition: border-color 0.8s ease;
	}

	@media (min-width: 900px) {
		.foot {
			flex-direction: row;
			align-items: flex-end;
			justify-content: space-between;
			margin-top: 128px;
			padding-top: 0;
			border-top: 0;
		}
	}

	.cta {
		font-size: 26px;
		font-weight: 500;
		letter-spacing: -0.02em;
	}

	@media (min-width: 900px) {
		.cta {
			font-size: 40px;
		}
	}

	.socials {
		display: flex;
		gap: 20px;
		font-size: 13px;
	}

	@media (min-width: 900px) {
		.socials {
			gap: 24px;
		}
	}
</style>
