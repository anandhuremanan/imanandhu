<script lang="ts">
	import { reveal, magnetic, scramble } from '$lib/actions';
	import { projects } from '$lib/data/projects';
	import Telemetry from '$lib/components/Telemetry.svelte';
</script>

<svelte:head>
	<title>Case Studies — Anandhu Remanan</title>
	<meta
		name="description"
		content="In-depth case studies of projects built by Anandhu Remanan — real problems, real solutions, and the engineering decisions behind them."
	/>
	<meta property="og:title" content="Case Studies — Anandhu Remanan" />
	<meta
		property="og:description"
		content="In-depth case studies of projects built by Anandhu Remanan — real problems, real solutions, and the engineering decisions behind them."
	/>
</svelte:head>

<!-- Page header -->
<header class="page-head">
	<span class="label label-accent">[ 002 / WORK ]</span>
	<h1 class="display fluid-lg" use:scramble={{ trigger: 'mount' }}>Case Studies</h1>
	<p>
		A close look at the products I've built — the problem, the process, and the decisions that
		shaped them.
	</p>
	<div class="head-rule" use:reveal={{ rule: true, delay: 200 }}></div>
</header>

{#each projects as p (p.id)}
	<article id={p.id} class="study" style="--accent: {p.accent}">
		<!-- Sticky rail: index + name stay pinned while the detail scrolls -->
		<div class="rail">
			<span class="rail-n mono">{p.index}</span>
			<h2 class="rail-name display">{p.name}</h2>
			<span class="label">{p.year}</span>
			<div class="rail-line"></div>
			<span class="label status">
				<i class="pip"></i>
				{p.status}
			</span>
		</div>

		<div class="detail">
			<!-- Summary + tags + CTA -->
			<section class="block" use:reveal>
				<p class="summary">{p.summary}</p>

				<ul class="tags">
					{#each p.tags as tag (tag)}
						<li class="mono">{tag}</li>
					{/each}
				</ul>

				<div class="ctas">
					<a
						class="live"
						href={p.live}
						target="_blank"
						rel="noopener noreferrer"
						use:magnetic={{ strength: 0.2 }}
					>
						Visit live project
						<span aria-hidden="true">↗</span>
					</a>

					{#if p.repo}
						<a
							class="source"
							href={p.repo}
							target="_blank"
							rel="noopener noreferrer"
							use:magnetic={{ strength: 0.2 }}
						>
							Source
							<span aria-hidden="true">↗</span>
						</a>
					{/if}
				</div>
			</section>

			<!-- Problem / Solution + telemetry visual -->
			<section class="split">
				<div class="prose" use:reveal={{ delay: 80 }}>
					<div class="qa">
						<span class="label">The Problem</span>
						<p>{p.problem}</p>
					</div>
					<div class="qa">
						<span class="label label-accent">The Solution</span>
						<p>{p.solution}</p>
					</div>
				</div>

				<div class="visual" use:reveal={{ delay: 160 }}>
					<Telemetry kind={p.visual} accent={p.accent} />
				</div>
			</section>

			<!-- Stack + platforms -->
			<section class="split" use:reveal={{ delay: 80 }}>
				<div class="col">
					<span class="label">Tech Stack</span>
					<ul class="stack">
						{#each p.stack as t (t.label)}
							<li>
								{#if t.icon}
									<img
										src={t.icon}
										alt=""
										class:invert={t.invert}
										width="28"
										height="28"
										loading="lazy"
									/>
								{:else}
									<span class="glyph" aria-hidden="true">{t.glyph}</span>
								{/if}
								<span>{t.label}</span>
							</li>
						{/each}
					</ul>
				</div>

				<div class="col">
					<span class="label">Platforms</span>
					<ul class="platforms">
						{#each p.platforms as pl (pl.name)}
							<li>
								{#if pl.href}
									<a href={pl.href} target="_blank" rel="noopener noreferrer">
										<span class="pl-name">{pl.name}</span>
										<span class="pl-detail mono">{pl.detail}</span>
										<span class="pl-arrow" aria-hidden="true">↗</span>
									</a>
								{:else}
									<div>
										<span class="pl-name">{pl.name}</span>
										<span class="pl-detail mono">{pl.detail}</span>
										{#if pl.badge}<span class="badge mono">{pl.badge}</span>{/if}
									</div>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			</section>
		</div>
	</article>
{/each}

<!-- More coming -->
<section class="more" use:reveal>
	<div class="more-inner">
		<span class="label">Next</span>
		<p class="display fluid-md">More case studies coming soon</p>
		<span class="label">Each project tells a different story — stay tuned.</span>
	</div>
	<a class="ghost-btn" href="/contact" use:magnetic={{ strength: 0.22 }}>
		Start a conversation
		<span aria-hidden="true">→</span>
	</a>
</section>

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

	/* ---------------------------------------------------------- STUDY */
	.study {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2.5rem;
		padding: 4rem var(--gutter);
		border-bottom: 1px solid var(--line);
		scroll-margin-top: var(--nav-h);
	}

	@media (min-width: 1000px) {
		.study {
			grid-template-columns: minmax(0, 16rem) minmax(0, 1fr);
			gap: 4rem;
			padding: 6.5rem var(--gutter);
		}
	}

	.rail {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		align-items: flex-start;
	}

	@media (min-width: 1000px) {
		.rail {
			position: sticky;
			top: calc(var(--nav-h) + 3rem);
			align-self: start;
		}
	}

	.rail-n {
		font-size: 0.6875rem;
		color: var(--accent);
		letter-spacing: 0.18em;
	}

	.rail-name {
		margin: 0;
		font-size: clamp(2rem, 5vw, 3rem);
	}

	.rail-line {
		width: 3rem;
		height: 1px;
		background: var(--accent);
		margin: 0.5rem 0;
	}

	.status {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.pip {
		width: 5px;
		height: 5px;
		border-radius: 999px;
		background: var(--accent);
	}

	/* ---------------------------------------------------------- DETAIL */
	.detail {
		display: flex;
		flex-direction: column;
		gap: 3.5rem;
		min-width: 0;
	}

	.block {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1.75rem;
	}

	.summary {
		margin: 0;
		max-width: 46rem;
		font-size: clamp(1.0625rem, 2vw, 1.25rem);
		line-height: 1.6;
		color: #f0f0f2;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tags li {
		font-size: 0.625rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.35rem 0.7rem;
		border: 1px solid var(--line);
		color: #94949e;
		transition:
			border-color 0.4s ease,
			color 0.4s ease;
	}

	.tags li:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.live {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.85rem 1.4rem;
		font-family: 'JetBrains Mono Variable', monospace;
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		text-decoration: none;
		color: #050506;
		background: var(--accent);
		transition: box-shadow 0.45s ease;
	}

	.live:hover {
		box-shadow: 0 0 30px color-mix(in srgb, var(--accent) 45%, transparent);
	}

	.ctas {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.source {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.85rem 1.4rem;
		border: 1px solid rgba(255, 255, 255, 0.16);
		font-family: 'JetBrains Mono Variable', monospace;
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		text-decoration: none;
		color: #f0f0f2;
		transition:
			border-color 0.4s ease,
			color 0.4s ease;
	}

	.source:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.split {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2.5rem;
	}

	@media (min-width: 720px) {
		.split {
			grid-template-columns: minmax(0, 1fr) minmax(0, 18rem);
			gap: 3rem;
			align-items: start;
		}
	}

	.prose {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.qa {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding-left: 1.25rem;
		border-left: 1px solid var(--line);
	}

	.qa p {
		margin: 0;
		font-size: 0.9375rem;
		line-height: 1.75;
		color: #94949e;
	}

	.col {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		min-width: 0;
	}

	.stack {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: 1px;
		background: var(--line);
		border: 1px solid var(--line);
	}

	.stack li {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.9rem 1rem;
		background: #050506;
		font-size: 0.8125rem;
		transition: background 0.4s ease;
	}

	.stack li:hover {
		background: rgba(255, 255, 255, 0.03);
	}

	.stack img {
		width: 1.35rem;
		height: 1.35rem;
		object-fit: contain;
	}

	.stack img.invert {
		filter: invert(1);
	}

	.glyph {
		display: grid;
		place-items: center;
		width: 1.35rem;
		height: 1.35rem;
		color: var(--accent);
		font-size: 0.8rem;
	}

	.platforms {
		display: flex;
		flex-direction: column;
		gap: 1px;
		background: var(--line);
		border: 1px solid var(--line);
	}

	.platforms li > * {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.2rem 0.75rem;
		padding: 1rem;
		background: #050506;
		text-decoration: none;
		color: inherit;
		transition: background 0.4s ease;
	}

	.platforms a:hover {
		background: rgba(255, 255, 255, 0.03);
	}

	.pl-name {
		font-size: 0.875rem;
	}

	.pl-detail {
		grid-column: 1;
		font-size: 0.625rem;
		color: #55555f;
	}

	.pl-arrow,
	.badge {
		grid-row: 1;
		grid-column: 2;
		align-self: center;
	}

	.pl-arrow {
		color: #55555f;
		transition:
			transform 0.45s var(--ease-out-expo),
			color 0.4s ease;
	}

	.platforms a:hover .pl-arrow {
		color: var(--accent);
		transform: translate(3px, -3px);
	}

	.badge {
		font-size: 0.5625rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.25rem 0.5rem;
		border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
		color: var(--accent);
	}

	/* ---------------------------------------------------------- MORE */
	.more {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2.5rem;
		padding: 7rem var(--gutter);
		text-align: center;
	}

	.more-inner {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}

	.more-inner p {
		margin: 0;
		color: #55555f;
	}

	.ghost-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.9rem 1.5rem;
		border: 1px solid rgba(255, 255, 255, 0.16);
		font-family: 'JetBrains Mono Variable', monospace;
		font-size: 0.6875rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		text-decoration: none;
		color: #f0f0f2;
		transition:
			background 0.45s var(--ease-out-expo),
			color 0.45s var(--ease-out-expo),
			border-color 0.45s ease;
	}

	.ghost-btn:hover {
		background: #2bf5c0;
		border-color: #2bf5c0;
		color: #050506;
	}
</style>
