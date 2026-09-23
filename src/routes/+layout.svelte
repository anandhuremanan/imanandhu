<script lang="ts">
	import './layout.css';
	import '@fontsource-variable/geist';
	import '@fontsource-variable/jetbrains-mono';

	import { page } from '$app/state';
	import Backdrop from '$lib/components/Backdrop.svelte';
	import Preloader from '$lib/components/Preloader.svelte';
	import Cursor from '$lib/components/Cursor.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>Anandhu Remanan — Software Engineer</title>
	<meta
		name="description"
		content="Software Engineer from Kerala, India. Clean UI, scalable systems, and thoughtful digital experiences."
	/>
	<meta name="theme-color" content="#050506" />
	<link rel="icon" href="/favicon.ico" />

	<meta property="og:type" content="website" />
	<meta property="og:title" content="Anandhu Remanan — Software Engineer" />
	<meta
		property="og:description"
		content="Software Engineer from Kerala, India. Clean UI, scalable systems, and thoughtful digital experiences."
	/>
	<meta property="og:url" content="https://imanandhu.in" />
	<meta property="og:image" content="https://imanandhu.in/hero.webp" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Anandhu Remanan — Software Engineer" />
	<meta
		name="twitter:description"
		content="Software Engineer from Kerala, India. Clean UI, scalable systems, and thoughtful digital experiences."
	/>
	<meta name="twitter:image" content="https://imanandhu.in/hero.webp" />
</svelte:head>

<Preloader />
<Backdrop />
<Cursor />

<div class="grid-overlay"></div>
<div class="vignette"></div>
<div class="grain-overlay"></div>

<Nav />

<!-- Keyed on the route so each page replays its entrance. -->
{#key page.url.pathname}
	<main class="shell">
		{@render children()}
	</main>
{/key}

<Footer />

<style>
	.shell {
		position: relative;
		z-index: 10;
		min-height: 100vh;
		animation: routeIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	@keyframes routeIn {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.shell {
			animation: none;
		}
	}
</style>
