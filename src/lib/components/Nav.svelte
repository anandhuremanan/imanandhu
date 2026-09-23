<script lang="ts">
	import { page } from '$app/state';
	import { magnetic, scramble } from '$lib/actions';

	const links = [
		{ href: '/', label: 'Index', n: '01' },
		{ href: '/case-studies', label: 'Work', n: '02' },
		{ href: '/contact', label: 'Contact', n: '03' }
	];

	let open = $state(false);
	let scrolled = $state(false);

	const isActive = (href: string) =>
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);

	$effect(() => {
		const onScroll = () => (scrolled = window.scrollY > 24);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	// Close the sheet whenever navigation lands somewhere new.
	$effect(() => {
		page.url.pathname;
		open = false;
	});
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === 'Escape') open = false;
	}}
/>

<header class="nav" class:scrolled>
	<a href="/" class="mark" aria-label="Anandhu Remanan, home">
		<span class="glyph">AR</span>
		<span class="wordmark mono">ANANDHU&nbsp;REMANAN</span>
	</a>

	<nav class="links" aria-label="Primary">
		{#each links as link (link.href)}
			<a href={link.href} class="link" class:active={isActive(link.href)}>
				<span class="n mono">{link.n}</span>
				<span use:scramble>{link.label}</span>
			</a>
		{/each}
	</nav>

	<div class="tail">
		<span class="status mono">
			<i class="pip"></i>
			Open to work
		</span>
		<a
			class="resume"
			href="https://github.com/anandhuremanan"
			target="_blank"
			rel="noopener noreferrer"
			use:magnetic={{ strength: 0.25 }}
		>
			Résumé
		</a>
		<button class="burger" onclick={() => (open = !open)} aria-expanded={open} aria-label="Menu">
			<span class:x={open}></span>
			<span class:x={open}></span>
		</button>
	</div>
</header>

<!-- Mobile sheet -->
<div class="sheet" class:open role="dialog" aria-modal="true" aria-label="Navigation">
	<div class="sheet-inner">
		{#each links as link, i (link.href)}
			<a
				href={link.href}
				class="sheet-link"
				class:active={isActive(link.href)}
				style="--i: {i}"
				onclick={() => (open = false)}
			>
				<span class="n mono">{link.n}</span>
				{link.label}
			</a>
		{/each}
		<span class="label sheet-foot">Kerala, India · UTC+5:30</span>
	</div>
</div>

<style>
	.nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 70;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		height: var(--nav-h);
		padding: 0 var(--gutter);
		transition:
			background 0.6s var(--ease-out-expo),
			border-color 0.6s var(--ease-out-expo),
			backdrop-filter 0.6s ease;
		border-bottom: 1px solid transparent;
	}

	.nav.scrolled {
		background: rgba(5, 5, 6, 0.7);
		backdrop-filter: blur(16px) saturate(150%);
		-webkit-backdrop-filter: blur(16px) saturate(150%);
		border-bottom-color: var(--line);
	}

	/* Wordmark */
	.mark {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		text-decoration: none;
		color: #f0f0f2;
	}

	.glyph {
		display: grid;
		place-items: center;
		width: 1.9rem;
		height: 1.9rem;
		font-family: 'JetBrains Mono Variable', monospace;
		font-size: 0.6875rem;
		letter-spacing: 0.02em;
		border: 1px solid var(--line-2, rgba(255, 255, 255, 0.16));
		color: #2bf5c0;
		transition:
			background 0.4s ease,
			color 0.4s ease;
	}

	.mark:hover .glyph {
		background: #2bf5c0;
		color: #050506;
	}

	.wordmark {
		font-size: 0.6875rem;
		letter-spacing: 0.16em;
		color: #94949e;
	}

	@media (max-width: 560px) {
		.wordmark {
			display: none;
		}
	}

	/* Desktop links */
	.links {
		display: none;
		align-items: center;
		gap: 2rem;
	}

	@media (min-width: 900px) {
		.links {
			display: flex;
		}
	}

	.link {
		position: relative;
		display: inline-flex;
		align-items: baseline;
		gap: 0.45rem;
		font-size: 0.875rem;
		color: #94949e;
		text-decoration: none;
		transition: color 0.35s ease;
	}

	.link .n {
		font-size: 0.5625rem;
		letter-spacing: 0.1em;
		color: #55555f;
		transition: color 0.35s ease;
	}

	.link:hover,
	.link.active {
		color: #f0f0f2;
	}

	.link.active .n {
		color: #2bf5c0;
	}

	.link::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: -0.55rem;
		width: 100%;
		height: 1px;
		background: #2bf5c0;
		transform: scaleX(0);
		transform-origin: right;
		transition: transform 0.55s var(--ease-out-expo);
	}

	.link:hover::after,
	.link.active::after {
		transform: scaleX(1);
		transform-origin: left;
	}

	/* Right cluster */
	.tail {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.status {
		display: none;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.625rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #94949e;
	}

	@media (min-width: 1100px) {
		.status {
			display: inline-flex;
		}
	}

	.pip {
		width: 5px;
		height: 5px;
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
			box-shadow: 0 0 0 7px rgba(43, 245, 192, 0);
		}
	}

	.resume {
		display: none;
		font-family: 'JetBrains Mono Variable', monospace;
		font-size: 0.6875rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		text-decoration: none;
		color: #050506;
		background: #2bf5c0;
		padding: 0.5rem 0.9rem;
		transition: box-shadow 0.4s ease;
	}

	.resume:hover {
		box-shadow: 0 0 26px rgba(43, 245, 192, 0.45);
	}

	@media (min-width: 900px) {
		.resume {
			display: inline-block;
		}
	}

	/* Burger */
	.burger {
		display: grid;
		gap: 5px;
		width: 2.25rem;
		padding: 0.5rem 0;
		background: none;
		border: 0;
		cursor: pointer;
	}

	@media (min-width: 900px) {
		.burger {
			display: none;
		}
	}

	.burger span {
		display: block;
		height: 1px;
		width: 100%;
		background: #f0f0f2;
		transition: transform 0.45s var(--ease-out-expo);
	}

	.burger span.x:first-child {
		transform: translateY(3px) rotate(45deg);
	}

	.burger span.x:last-child {
		transform: translateY(-3px) rotate(-45deg);
	}

	/* Mobile sheet */
	.sheet {
		position: fixed;
		inset: 0;
		z-index: 65;
		background: rgba(5, 5, 6, 0.96);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		display: grid;
		place-items: center;
		clip-path: inset(0 0 100% 0);
		transition: clip-path 0.7s var(--ease-in-out-quint);
		visibility: hidden;
	}

	.sheet.open {
		clip-path: inset(0 0 0 0);
		visibility: visible;
	}

	.sheet-inner {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: var(--gutter);
		width: 100%;
	}

	.sheet-link {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		font-size: clamp(2.25rem, 12vw, 4rem);
		font-weight: 500;
		letter-spacing: -0.04em;
		color: #f0f0f2;
		text-decoration: none;
		padding: 0.4rem 0;
		border-bottom: 1px solid var(--line);
		opacity: 0;
		transform: translateY(18px);
		transition:
			opacity 0.6s var(--ease-out-expo),
			transform 0.6s var(--ease-out-expo),
			color 0.3s ease;
		transition-delay: calc(var(--i) * 70ms + 120ms);
	}

	.sheet.open .sheet-link {
		opacity: 1;
		transform: none;
	}

	.sheet-link .n {
		font-size: 0.6875rem;
		color: #55555f;
	}

	.sheet-link.active {
		color: #2bf5c0;
	}

	.sheet-foot {
		margin-top: 1.75rem;
	}
</style>
