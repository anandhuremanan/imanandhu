<script lang="ts">
	import { page } from '$app/state';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { kerala } from '$lib/kerala.svelte';
	import { projects, MUSIC_URL, STORIES_URL } from '$lib/data/projects';

	/** Index of the open accordion row. -1 means all closed. Newest opens first. */
	let open = $state(0);

	/**
	 * The anchors (/case-studies#filedrop) are public URLs, so arriving at one
	 * must open that study, not just scroll near it.
	 *
	 * Driven by `page.url.hash` rather than onMount: a hash-only navigation is a
	 * same-document navigation, so the component never remounts and an onMount
	 * version silently did nothing for every anchor after the first.
	 */
	$effect(() => {
		const id = page.url.hash.slice(1);
		if (!id) return;

		const i = projects.findIndex((p) => p.id === id);
		if (i < 0) return;
		open = i;

		// Let the row expand before scrolling, or we land at the wrong offset.
		requestAnimationFrame(() =>
			document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'auto' })
		);
	});

	const schema = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'Case Studies — Anandhu Remanan',
		itemListElement: projects.map((p, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			item: {
				'@type': 'SoftwareSourceCode',
				name: p.name,
				description: p.desc,
				url: p.links[0]?.href,
				programmingLanguage: p.tech.split(' · '),
				author: { '@type': 'Person', name: 'Anandhu Remanan', url: 'https://imanandhu.in' },
				dateCreated: p.year
			}
		}))
	};

	const footerLinks = [
		{ label: 'GitHub', href: 'https://github.com/anandhuremanan' },
		{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/anandhuremanan/' },
		{ label: 'X', href: 'https://twitter.com/anandhu_or' },
		{ label: 'Music', href: MUSIC_URL },
		{ label: 'Stories', href: STORIES_URL }
	];
</script>

<svelte:head>
	<title>Case studies — Anandhu Remanan</title>
	<meta
		name="description"
		content="The problem, the process, and the decisions that shaped each thing I've built."
	/>
	<meta property="og:title" content="Case studies — Anandhu Remanan" />
	<meta
		property="og:description"
		content="The problem, the process, and the decisions that shaped each thing I've built."
	/>
	{@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
</svelte:head>

<div class="page">
	<SiteHeader />

	<div class="now meta">
		{kerala.clock} in Kerala · probably <span class="accent">{kerala.doingShort}</span>
	</div>

	<section class="intro">
		<div class="intro-text">
			<h1 class="h1">Case studies</h1>
			<p class="sub">
				The problem, the process, and the decisions that shaped each thing I've built.
			</p>
		</div>
		<span class="meta count">{projects.length} projects · newest first</span>
	</section>

	<section class="list">
		{#each projects as p, i (p.id)}
			{@const on = i === open}
			<div class="item" class:on id={p.id}>
				<button
					type="button"
					class="head"
					aria-expanded={on}
					aria-controls="panel-{p.id}"
					onclick={() => (open = on ? -1 : i)}
				>
					<span class="n mono">{String(projects.length - i).padStart(2, '0')}</span>
					<span class="title-wrap">
						<span class="name">{p.name}</span>
						<span class="sub-meta mono">{p.year} · {p.platform}</span>
					</span>
					<span class="platform">{p.platform}</span>
					<span class="year mono">{p.year}</span>
					<span class="sign" aria-hidden="true">{on ? '−' : '+'}</span>
				</button>

				{#if on}
					<div class="panel" id="panel-{p.id}">
						<div class="body">
							<p class="desc">{p.desc}</p>

							<!-- On a phone the mock-up sits here, between the summary and the
							     problem/solution pair, exactly as in the mobile design. -->
							<div class="detail detail-mobile">
								<div class="detail-box mono">
									{#each p.detail as line (line)}<span>{line}</span>{/each}
								</div>
							</div>

							<div class="qa">
								<div class="qa-col">
									<span class="meta">The problem</span>
									<span class="qa-text">{p.problem}</span>
								</div>
								<div class="qa-col">
									<span class="meta">The solution</span>
									<span class="qa-text">{p.solution}</span>
								</div>
							</div>

							<div class="meta tech">{p.tech}</div>

							<div class="links">
								{#each p.links as link (link.href)}
									<a class="pill" href={link.href} target="_blank" rel="noopener noreferrer"
										>{link.label} ↗</a
									>
								{/each}
							</div>
						</div>

						<div class="detail detail-desktop">
							<div class="detail-box mono">
								{#each p.detail as line (line)}<span>{line}</span>{/each}
							</div>
							<span class="meta">{p.caption}</span>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</section>

	<section class="next">
		<div class="next-text">
			<span class="meta">Next</span>
			<span class="next-line">More case studies are on the way.</span>
		</div>
		<a class="next-cta" href="/contact">Start a conversation →</a>
	</section>

	<SiteFooter links={footerLinks} />
</div>

<style>
	.now {
		margin-top: 8px;
	}

	@media (min-width: 900px) {
		.now {
			margin-top: 20px;
		}
	}

	.accent {
		color: var(--accent);
	}

	/* ---------------------------------------------------------- intro */
	.intro {
		display: flex;
		flex-direction: column;
		gap: 14px;
		margin-top: 56px;
	}

	@media (min-width: 900px) {
		.intro {
			flex-direction: row;
			align-items: flex-end;
			justify-content: space-between;
			gap: 48px;
			margin-top: 112px;
		}
	}

	.intro-text {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	@media (min-width: 900px) {
		.intro-text {
			gap: 20px;
		}
	}

	.sub {
		max-width: 560px;
		font-size: 17px;
		line-height: 1.5;
		color: var(--muted);
	}

	@media (min-width: 900px) {
		.sub {
			font-size: 20px;
		}
	}

	.count {
		flex-shrink: 0;
	}

	/* ---------------------------------------------------------- accordion */
	.list {
		display: flex;
		flex-direction: column;
		margin-top: 40px;
		border-bottom: 1px solid var(--line);
		transition: border-color 0.8s ease;
	}

	@media (min-width: 900px) {
		.list {
			margin-top: 72px;
		}
	}

	.item {
		border-top: 1px solid var(--line);
		transition:
			background 0.3s ease,
			border-color 0.8s ease;
	}

	.item.on {
		background: var(--card);
	}

	/* Bleed the open row's background to the page edges on mobile. */
	@media (max-width: 899px) {
		.item {
			margin: 0 calc(var(--gutter) * -1);
			padding: 0 var(--gutter);
		}
	}

	.head {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 32px;
		gap: 12px;
		align-items: center;
		width: 100%;
		min-height: 76px;
		padding: 16px 0;
		border: 0;
		background: transparent;
		text-align: left;
	}

	@media (min-width: 900px) {
		.head {
			grid-template-columns: 64px minmax(0, 1fr) 240px 80px 40px;
			gap: 16px;
			align-items: baseline;
			min-height: 0;
			padding: 26px 24px;
		}
	}

	.n {
		display: none;
		font-size: 13px;
		color: var(--muted);
	}

	.title-wrap {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 4px;
	}

	.name {
		font-size: 26px;
		font-weight: 500;
		letter-spacing: -0.02em;
	}

	.sub-meta {
		font-size: 12px;
		color: var(--muted);
	}

	.platform,
	.year {
		display: none;
	}

	.sign {
		font-size: 24px;
		text-align: right;
	}

	@media (min-width: 900px) {
		.n,
		.platform,
		.year {
			display: block;
		}
		.sub-meta {
			display: none;
		}
		.name {
			font-size: 36px;
			letter-spacing: -0.025em;
		}
		.platform {
			font-size: 15px;
			color: var(--muted);
		}
		.year {
			font-size: 13px;
		}
		.sign {
			font-size: 26px;
		}
	}

	/* ---------------------------------------------------------- panel */
	.panel {
		display: grid;
		gap: 22px;
		padding: 4px 0 32px;
	}

	@media (min-width: 900px) {
		.panel {
			grid-template-columns: minmax(0, 1fr) 360px;
			gap: 56px;
			padding: 8px 24px 40px 104px;
		}
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: 22px;
	}

	@media (min-width: 900px) {
		.body {
			gap: 28px;
		}
	}

	.desc {
		font-size: 18px;
		line-height: 1.5;
	}

	@media (min-width: 900px) {
		.desc {
			font-size: 22px;
			line-height: 1.45;
			letter-spacing: -0.01em;
		}
	}

	.qa {
		display: grid;
		gap: 22px;
	}

	@media (min-width: 900px) {
		.qa {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 32px;
		}
	}

	.qa-col {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	@media (min-width: 900px) {
		.qa-col {
			gap: 10px;
		}
	}

	.qa-text {
		font-size: 16px;
		line-height: 1.6;
	}

	.tech {
		line-height: 1.7;
	}

	.links {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	@media (min-width: 900px) {
		.links {
			flex-direction: row;
			gap: 12px;
		}
	}

	/* The mono mock-up panel. */
	.detail {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.detail-desktop {
		display: none;
	}

	@media (min-width: 900px) {
		.detail-desktop {
			display: flex;
		}
		.detail-mobile {
			display: none;
		}
	}

	.detail-box {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 18px;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: var(--bg);
		font-size: 13px;
		white-space: pre;
		overflow-x: auto;
		transition:
			background 0.8s ease,
			border-color 0.8s ease;
	}

	@media (min-width: 900px) {
		.detail-box {
			gap: 10px;
			padding: 24px;
			border-radius: 14px;
			font-size: 14px;
		}
	}

	/* ---------------------------------------------------------- next */
	.next {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 56px;
	}

	@media (min-width: 900px) {
		.next {
			flex-direction: row;
			align-items: flex-end;
			justify-content: space-between;
			gap: 32px;
			margin-top: 96px;
		}
	}

	.next-text {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.next-line {
		font-size: 24px;
		font-weight: 500;
		letter-spacing: -0.02em;
	}

	@media (min-width: 900px) {
		.next-line {
			font-size: 32px;
		}
	}

	.next-cta {
		font-size: 18px;
		font-weight: 500;
		color: var(--accent);
	}
</style>
