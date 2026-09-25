<script lang="ts">
	import './layout.css';
	import '@fontsource-variable/geist';
	import '@fontsource-variable/geist-mono';

	// Imported as URLs so the preload hints point at the hashed filenames.
	// Without them the fonts are only discovered once the stylesheet parses,
	// which costs a round trip exactly when the 240px clock wants to paint.
	import geistLatin from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url';
	import monoLatin from '@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url';

	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { kerala, startClock } from '$lib/kerala.svelte';
	import { faviconHref } from '$lib/favicon';
	import NowPlaying from '$lib/components/NowPlaying.svelte';

	let { children } = $props();

	onMount(startClock);

	// The server stamped the opening theme onto <html>; from here the clock owns
	// it, including while the home slider previews another hour.
	$effect(() => {
		document.documentElement.dataset.theme = kerala.theme;
	});

	const canonical = $derived(`https://imanandhu.in${page.url.pathname}`);

	// The tab icon tracks Kerala time along with everything else, including
	// while the home slider previews another hour.
	const icon = $derived(faviconHref(kerala.theme));
</script>

<svelte:head>
	<title>Anandhu Remanan — Software Engineer</title>
	<meta
		name="description"
		content="Software Engineer from Kerala, India. Clean interfaces, systems that hold up, and a site that runs on Kerala time."
	/>
	<link rel="canonical" href={canonical} />
	<!-- The .ico is the fallback for anything that will not take an SVG icon;
	     browsers that do take one prefer the type-annotated link below. -->
	<link rel="icon" href="/favicon.ico" sizes="32x32" />
	<link rel="icon" type="image/svg+xml" href={icon} />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />

	<link rel="preload" href={geistLatin} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={monoLatin} as="font" type="font/woff2" crossorigin="anonymous" />

	<meta property="og:type" content="website" />
	<meta property="og:title" content="Anandhu Remanan — Software Engineer" />
	<meta
		property="og:description"
		content="Software Engineer from Kerala, India. Clean interfaces, systems that hold up, and a site that runs on Kerala time."
	/>
	<meta property="og:url" content="https://imanandhu.in" />
	<meta property="og:image" content="https://imanandhu.in/hero.webp" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Anandhu Remanan — Software Engineer" />
	<meta
		name="twitter:description"
		content="Software Engineer from Kerala, India. Clean interfaces, systems that hold up, and a site that runs on Kerala time."
	/>
	<meta name="twitter:image" content="https://imanandhu.in/hero.webp" />
</svelte:head>

{@render children()}

<NowPlaying />
