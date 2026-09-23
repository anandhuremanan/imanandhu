<script lang="ts">
	import { reveal, magnetic, tilt, scramble } from '$lib/actions';
	import { projects, stackIcons, sideProjects } from '$lib/data/projects';

	const schema = {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: 'Anandhu Remanan',
		url: 'https://imanandhu.in',
		image: 'https://imanandhu.in/hero.webp',
		jobTitle: 'Software Engineer',
		sameAs: [
			'https://github.com/anandhuremanan',
			'https://twitter.com/anandhu_or',
			'https://www.linkedin.com/in/anandhu-remanan/'
		],
		description:
			'Software Engineer focused on clean UI, scalable systems, and thoughtful digital experiences.'
	};

	// Split for the per-character hero reveal.
	const line1 = 'ANANDHU'.split('');
	const line2 = 'REMANAN'.split('');

	const ticker = [
		'SOFTWARE ENGINEER',
		'KERALA, INDIA',
		'FULL-STACK',
		'SYSTEMS + INTERFACE',
		'OPEN TO WORK'
	];
</script>

<svelte:head>
	<title>Anandhu Remanan — Software Engineer</title>
	<meta
		name="description"
		content="Portfolio of Anandhu Remanan, a Software Engineer from Kerala, India. Engineering meets creativity."
	/>
	{@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
</svelte:head>

<!-- ============================================================
     01 — HERO
     ============================================================ -->
<section class="hero">
	<div class="hero-top">
		<span class="label label-accent">[ 001 / INDEX ]</span>
		<span class="label">KERALA, IN · UTC+5:30</span>
	</div>

	<!-- aria-label keeps screen readers from spelling out the split glyphs. -->
	<h1 class="display fluid-xl name" aria-label="Anandhu Remanan">
		<span class="line">
			{#each line1 as ch, i (i)}
				<span class="ch" style="--d: {i * 45}ms">{ch}</span>
			{/each}
		</span>
		<span class="line">
			{#each line2 as ch, i (i)}
				<span class="ch" style="--d: {(i + line1.length) * 45}ms">{ch}</span>
			{/each}<span class="reg">®</span>
		</span>
	</h1>

	<div class="hero-bottom">
		<div class="hero-role">
			<span class="label">Role</span>
			<p>Software&nbsp;Engineer</p>
		</div>

		<div class="hero-blurb">
			<div class="hero-rule" use:reveal={{ rule: true, delay: 600 }}></div>
			<p use:reveal={{ delay: 700 }}>
				My work sits between engineering and creativity. Simple, functional, and intentional. No
				unnecessary layers, no bullshit.
			</p>
		</div>

		<div class="hero-stats" use:reveal={{ delay: 800 }}>
			<div class="stat">
				<span class="num">4+</span>
				<span class="label">Years</span>
			</div>
			<div class="stat">
				<span class="num">30+</span>
				<span class="label">Projects</span>
			</div>
		</div>
	</div>

	<a href="#about" class="scroll-cue" aria-label="Scroll to about">
		<span class="label">Scroll</span>
		<span class="cue-line"></span>
	</a>
</section>

<!-- ============================================================
     TICKER
     ============================================================ -->
<div class="ticker" aria-hidden="true">
	<div class="ticker-track">
		{#each [0, 1] as pass (pass)}
			{#each ticker as item (item + pass)}
				<span class="ticker-item mono">{item}</span>
				<span class="ticker-dot">◆</span>
			{/each}
		{/each}
	</div>
</div>

<!-- ============================================================
     02 — ABOUT
     ============================================================ -->
<section id="about" class="section">
	<header class="sec-head">
		<span class="label label-accent">[ 002 / ABOUT ]</span>
		<div class="sec-rule" use:reveal={{ rule: true }}></div>
	</header>

	<div class="about">
		<figure class="portrait" use:reveal use:tilt={{ max: 5 }}>
			<img
				src="/hero.webp"
				alt="Portrait of Anandhu Remanan"
				width="480"
				height="480"
				loading="eager"
				fetchpriority="high"
			/>
			<figcaption class="label">FIG. 01 — OPERATOR</figcaption>
		</figure>

		<div class="about-body">
			<h2 class="display fluid-md" use:reveal={{ delay: 80 }}>
				Hi, I'm Anandhu.<br />
				<span class="muted">I build things that hold up.</span>
			</h2>

			<p use:reveal={{ delay: 160 }}>
				A Software Engineer from Kerala, India. I work across the stack — interfaces that feel
				deliberate, and the systems underneath that keep them honest. Four years in, roughly thirty
				projects shipped.
			</p>

			<dl class="meta" use:reveal={{ delay: 240 }}>
				<div>
					<dt class="label">Based</dt>
					<dd>Kerala, India</dd>
				</div>
				<div>
					<dt class="label">Focus</dt>
					<dd>Interface + Systems</dd>
				</div>
				<div>
					<dt class="label">Status</dt>
					<dd class="accent">Open to work</dd>
				</div>
			</dl>
		</div>
	</div>
</section>

<!-- ============================================================
     03 — SELECTED WORK
     ============================================================ -->
<section class="section">
	<header class="sec-head">
		<span class="label label-accent">[ 003 / SELECTED WORK ]</span>
		<div class="sec-rule" use:reveal={{ rule: true }}></div>
	</header>

	<ul class="work">
		{#each projects as p, i (p.id)}
			<li use:reveal={{ delay: i * 90 }}>
				<a class="work-row" href="/case-studies#{p.id}" style="--accent: {p.accent}">
					<span class="work-n mono">{p.index}</span>
					<span class="work-name display" use:scramble>{p.name}</span>
					<span class="work-sum">{p.summary}</span>
					<span class="work-year mono">{p.year}</span>
					<span class="work-arrow" aria-hidden="true">↗</span>
				</a>
			</li>
		{/each}
	</ul>

	<a class="ghost-btn" href="/case-studies" use:magnetic={{ strength: 0.22 }}>
		Read the case studies
		<span aria-hidden="true">→</span>
	</a>
</section>

<!-- ============================================================
     04 — STACK
     ============================================================ -->
<section class="section">
	<header class="sec-head">
		<span class="label label-accent">[ 004 / STACK ]</span>
		<div class="sec-rule" use:reveal={{ rule: true }}></div>
	</header>

	<ul class="stack">
		{#each stackIcons as tool, i (tool.label)}
			<li class="stack-cell ticks" use:reveal={{ delay: i * 45 }}>
				<img
					src={tool.src}
					alt=""
					class:invert={tool.invert}
					width="48"
					height="48"
					loading="lazy"
				/>
				<span class="label">{tool.label}</span>
			</li>
		{/each}
	</ul>
</section>

<!-- ============================================================
     05 — BESIDE ENGINEERING
     ============================================================ -->
<section class="section">
	<header class="sec-head">
		<span class="label label-accent">[ 005 / BESIDE ENGINEERING ]</span>
		<div class="sec-rule" use:reveal={{ rule: true }}></div>
	</header>

	<div class="beside">
		{#each sideProjects as item, i (item.label)}
			{#if item.href}
				<a
					class="beside-card panel ticks"
					href={item.href}
					rel="noopener noreferrer"
					use:reveal={{ delay: i * 90 }}
					use:tilt={{ max: 8 }}
				>
					<img src={item.img} alt="" width="120" height="120" loading="lazy" />
					<div class="beside-meta">
						<span class="beside-label">{item.label}</span>
						<span class="label">{item.note}</span>
					</div>
					<span class="beside-arrow" aria-hidden="true">↗</span>
				</a>
			{:else}
				<div
					class="beside-card panel ticks quiet"
					use:reveal={{ delay: i * 90 }}
					use:tilt={{ max: 8 }}
				>
					<img src={item.img} alt="" width="120" height="120" loading="lazy" />
					<div class="beside-meta">
						<span class="beside-label">{item.label}</span>
						<span class="label">{item.note}</span>
					</div>
				</div>
			{/if}
		{/each}
	</div>
</section>

<!-- ============================================================
     06 — CTA
     ============================================================ -->
<section class="section cta">
	<span class="label label-accent" use:reveal>[ 006 / CONTACT ]</span>
	<a class="cta-link display fluid-lg" href="/contact" use:reveal={{ delay: 80 }}>
		Let's build<br />something sharp.
	</a>
	<p class="label" use:reveal={{ delay: 160 }}>Open to work · Kerala, India · Remote</p>
</section>

<style>
	/* ---------------------------------------------------------- HERO */
	.hero {
		position: relative;
		min-height: 100svh;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: calc(var(--nav-h) + 2rem) var(--gutter) 2.5rem;
	}

	.hero-top {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.name {
		margin: auto 0;
		padding: 2rem 0;
		text-transform: uppercase;
	}

	.line {
		display: block;
		white-space: nowrap;
	}

	/* Each glyph rises and unblurs on its own beat. */
	.ch {
		display: inline-block;
		animation: chIn 1.1s cubic-bezier(0.16, 1, 0.3, 1) both;
		animation-delay: calc(var(--d) + 1500ms);
	}

	@keyframes chIn {
		from {
			opacity: 0;
			transform: translateY(0.35em) rotateX(-55deg);
			filter: blur(10px);
		}
	}

	.reg {
		display: inline-block;
		font-size: 0.18em;
		vertical-align: super;
		color: #2bf5c0;
		margin-left: 0.15em;
		animation: chIn 1.1s cubic-bezier(0.16, 1, 0.3, 1) both;
		animation-delay: 2.2s;
	}

	.hero-bottom {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		align-items: end;
	}

	@media (min-width: 900px) {
		.hero-bottom {
			grid-template-columns: auto 1fr auto;
			gap: 3rem;
		}
	}

	.hero-role p {
		font-size: 1rem;
		margin: 0.5rem 0 0;
	}

	.hero-blurb {
		max-width: 34rem;
	}

	.hero-rule {
		height: 1px;
		background: rgba(255, 255, 255, 0.18);
		margin-bottom: 1rem;
	}

	.hero-blurb p {
		margin: 0;
		font-size: 0.9375rem;
		line-height: 1.65;
		color: #94949e;
	}

	.hero-stats {
		display: flex;
		gap: 2.5rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.num {
		font-size: 2rem;
		font-weight: 500;
		letter-spacing: -0.03em;
		line-height: 1;
	}

	.scroll-cue {
		position: absolute;
		left: 50%;
		bottom: 1.5rem;
		transform: translateX(-50%);
		display: none;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		text-decoration: none;
	}

	@media (min-width: 1100px) {
		.scroll-cue {
			display: flex;
		}
	}

	.cue-line {
		width: 1px;
		height: 44px;
		background: linear-gradient(to bottom, #2bf5c0, transparent);
		animation: cue 2.2s ease-in-out infinite;
		transform-origin: top;
	}

	@keyframes cue {
		0%,
		100% {
			transform: scaleY(0.35);
			opacity: 0.4;
		}
		50% {
			transform: scaleY(1);
			opacity: 1;
		}
	}

	/* ---------------------------------------------------------- TICKER */
	.ticker {
		position: relative;
		z-index: 10;
		overflow: hidden;
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
		padding: 0.85rem 0;
		background: rgba(5, 5, 6, 0.4);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
	}

	.ticker-track {
		display: flex;
		align-items: center;
		gap: 2rem;
		width: max-content;
		animation: slide 38s linear infinite;
	}

	@keyframes slide {
		to {
			transform: translateX(-50%);
		}
	}

	.ticker-item {
		font-size: 0.6875rem;
		letter-spacing: 0.22em;
		color: #94949e;
		white-space: nowrap;
	}

	.ticker-dot {
		font-size: 0.4rem;
		color: #2bf5c0;
	}

	@media (prefers-reduced-motion: reduce) {
		.ticker-track {
			animation: none;
		}
		.cue-line {
			animation: none;
		}
		.ch,
		.reg {
			animation: none;
			opacity: 1;
		}
	}

	/* ---------------------------------------------------------- SECTIONS */
	.section {
		padding: 7rem var(--gutter);
	}

	@media (min-width: 900px) {
		.section {
			padding: 9rem var(--gutter);
		}
	}

	.sec-head {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		margin-bottom: 3.5rem;
	}

	.sec-rule {
		flex: 1;
		height: 1px;
		background: var(--line);
	}

	/* ---------------------------------------------------------- ABOUT */
	.about {
		display: grid;
		grid-template-columns: 1fr;
		gap: 3rem;
	}

	@media (min-width: 900px) {
		.about {
			grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);
			gap: 4.5rem;
			align-items: start;
		}
	}

	.portrait {
		position: relative;
		margin: 0;
		border: 1px solid var(--line);
		padding: 0.6rem;
		max-width: 22rem;
	}

	.portrait img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 1;
		object-fit: cover;
		filter: grayscale(1) contrast(1.12) brightness(0.88);
		transition: filter 0.7s var(--ease-out-expo);
	}

	.portrait:hover img {
		filter: grayscale(0) contrast(1) brightness(1);
	}

	.portrait figcaption {
		margin-top: 0.75rem;
	}

	.about-body {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.about-body h2 {
		margin: 0;
	}

	.muted {
		color: #55555f;
	}

	.about-body p {
		margin: 0;
		max-width: 40rem;
		font-size: 1rem;
		line-height: 1.7;
		color: #94949e;
	}

	.meta {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
		gap: 1.5rem;
		margin: 0;
		padding-top: 1.75rem;
		border-top: 1px solid var(--line);
	}

	.meta dd {
		margin: 0.5rem 0 0;
		font-size: 0.9375rem;
	}

	.accent {
		color: #2bf5c0;
	}

	/* ---------------------------------------------------------- WORK */
	.work {
		border-top: 1px solid var(--line);
	}

	.work-row {
		position: relative;
		display: grid;
		grid-template-columns: auto 1fr auto;
		grid-template-areas:
			'n name arrow'
			'. sum .'
			'. year .';
		gap: 0.35rem 1.25rem;
		align-items: baseline;
		padding: 1.75rem 0;
		border-bottom: 1px solid var(--line);
		text-decoration: none;
		color: inherit;
		transition: padding-left 0.6s var(--ease-out-expo);
	}

	@media (min-width: 900px) {
		.work-row {
			grid-template-columns: 4rem minmax(0, 15rem) minmax(0, 1fr) 5rem 2rem;
			grid-template-areas: 'n name sum year arrow';
			gap: 2rem;
			align-items: center;
			padding: 2.25rem 0;
		}
	}

	/* A wash of the project's own accent sweeps in on hover. */
	.work-row::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			color-mix(in srgb, var(--accent) 9%, transparent),
			transparent 55%
		);
		opacity: 0;
		transition: opacity 0.5s ease;
		pointer-events: none;
	}

	.work-row:hover::before {
		opacity: 1;
	}

	.work-row:hover {
		padding-left: 1.25rem;
	}

	.work-n {
		grid-area: n;
		font-size: 0.6875rem;
		color: #55555f;
		transition: color 0.4s ease;
	}

	.work-row:hover .work-n {
		color: var(--accent);
	}

	.work-name {
		grid-area: name;
		font-size: clamp(1.5rem, 4vw, 2.25rem);
		transition: color 0.4s ease;
	}

	.work-row:hover .work-name {
		color: var(--accent);
	}

	.work-sum {
		grid-area: sum;
		font-size: 0.875rem;
		line-height: 1.6;
		color: #94949e;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.work-year {
		grid-area: year;
		font-size: 0.6875rem;
		color: #55555f;
	}

	.work-arrow {
		grid-area: arrow;
		font-size: 1.1rem;
		color: #55555f;
		transition:
			transform 0.5s var(--ease-out-expo),
			color 0.4s ease;
	}

	.work-row:hover .work-arrow {
		color: var(--accent);
		transform: translate(4px, -4px);
	}

	.ghost-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 2.75rem;
		padding: 0.9rem 1.5rem;
		border: 1px solid var(--line-2, rgba(255, 255, 255, 0.16));
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

	/* ---------------------------------------------------------- STACK */
	.stack {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
		gap: 1px;
		background: var(--line);
		border: 1px solid var(--line);
	}

	/* Deliberately not .panel: ten backdrop-filter layers stacked over the live
	   WebGL canvas is a real frame-rate cost for no visual gain at this size. */
	.stack-cell {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.9rem;
		padding: 2rem 1rem;
		background: rgba(8, 8, 10, 0.72);
		aspect-ratio: 1;
		transition: background 0.45s ease;
	}

	.stack-cell:hover {
		background: rgba(43, 245, 192, 0.05);
	}

	.stack-cell img {
		width: 2.75rem;
		height: 2.75rem;
		object-fit: contain;
		filter: grayscale(1) opacity(0.65);
		transition:
			filter 0.5s var(--ease-out-expo),
			transform 0.5s var(--ease-out-expo);
	}

	.stack-cell:hover img {
		filter: none;
		transform: translateY(-4px) scale(1.06);
	}

	.stack-cell img.invert {
		filter: grayscale(1) opacity(0.65) invert(1);
	}

	.stack-cell:hover img.invert {
		filter: invert(1);
	}

	/* ---------------------------------------------------------- BESIDE */
	.beside {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: 1.25rem;
	}

	.beside-card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1.5rem;
		padding: 2rem;
		text-decoration: none;
		color: inherit;
		min-height: 15rem;
		justify-content: space-between;
		/* Spotlight tracks the cursor via --mx/--my from the tilt action. */
		background-image: radial-gradient(
			22rem circle at var(--mx, 50%) var(--my, 50%),
			rgba(43, 245, 192, 0.07),
			transparent 60%
		);
	}

	.beside-card img {
		width: 4.5rem;
		height: 4.5rem;
		object-fit: contain;
		transition: transform 0.6s var(--ease-out-expo);
	}

	.beside-card:hover img {
		transform: translateY(-6px) rotate(-6deg) scale(1.08);
	}

	.beside-meta {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.beside-label {
		font-size: 1.125rem;
		font-weight: 500;
		letter-spacing: -0.02em;
	}

	.beside-arrow {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		color: #55555f;
		transition:
			transform 0.5s var(--ease-out-expo),
			color 0.4s ease;
	}

	.beside-card:hover .beside-arrow {
		color: #2bf5c0;
		transform: translate(3px, -3px);
	}

	.quiet {
		opacity: 0.6;
	}

	/* ---------------------------------------------------------- CTA */
	.cta {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		text-align: center;
	}

	.cta-link {
		text-decoration: none;
		color: #f0f0f2;
		transition: color 0.5s ease;
	}

	.cta-link:hover {
		color: #2bf5c0;
	}
</style>
