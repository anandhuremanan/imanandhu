<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<title>Anandhu O R | Software Engineer</title>
	<meta
		name="description"
		content="Software Engineer focused on clean UI, scalable systems, and thoughtful digital experiences."
	/>

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Anandhu O R | Software Engineer" />
	<meta
		property="og:description"
		content="Software Engineer focused on clean UI, scalable systems, and thoughtful digital experiences."
	/>
	<meta property="og:url" content="https://imanandhu.in" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Anandhu O R | Software Engineer" />
	<meta
		name="twitter:description"
		content="Software Engineer focused on clean UI, scalable systems, and thoughtful digital experiences."
	/>
</svelte:head>

<nav class="outfit-font mt-4 flex w-full items-center justify-center text-xs md:text-base">
	<ul
		class="flex space-x-8 rounded-full bg-white px-6 py-3 shadow-2xl dark:border dark:border-zinc-800 dark:bg-black dark:text-white"
	>
		<li><a href="/" class="hover:text-blue-700">Home</a></li>
		<li><a href="/" class="hover:text-blue-700">Case Studies</a></li>
		<li><a href="/" class="hover:text-blue-700">Contact</a></li>
		<li>
			<a href="/" class="rounded-2xl border border-blue-700 px-2 py-1 text-blue-700">Resume</a>
		</li>
	</ul>
</nav>

<main
	class="outfit-font flex flex-col items-center bg-radial-[at_50%_45%] from-blue-100 to-transparent to-60% dark:from-blue-900"
>
	{@render children()}
</main>
