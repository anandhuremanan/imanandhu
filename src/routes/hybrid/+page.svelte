<script lang="ts">
	import { spring } from 'svelte/motion';
	import { pannable } from '$lib/pannable';
	import { onMount } from 'svelte';

	let imgElement: any;

	const coords = spring(
		{ x: 0, y: 0 },
		{
			stiffness: 0.2,
			damping: 0.4
		}
	);

	function handlePanStart() {
		coords.stiffness = coords.damping = 1;
	}

	function handlePanMove(event: any) {
		coords.update(($coords) => ({
			x: $coords.x + event.detail.dx,
			y: $coords.y + event.detail.dy
		}));
	}

	function handlePanEnd(event: any) {
		coords.stiffness = 0.2;
		coords.damping = 0.4;
		coords.set({ x: 0, y: 0 });
	}

	onMount(() => {
		imgElement.addEventListener('panstart', handlePanStart);
		imgElement.addEventListener('panmove', handlePanMove);
		imgElement.addEventListener('panend', handlePanEnd);
	});
</script>

<main class="">
	<section class="flex justify-center flex-col items-center">
		<img
			bind:this={imgElement}
			src="/images/experiment.webp"
			alt="hybrid hero"
			class="lg:h-60 w-60 cursor-move -z-20 md:z-0"
			use:pannable
			style="transform:
			translate({$coords.x}px,{$coords.y}px)
			rotate({$coords.x * 0.2}deg)"
		/>
		<div class="text-4xl lg:text-6xl">Cross Platform Experiments</div>
		<span class="lg:text-2xl text-center px-6"
			>Check Out Some of My Cross-Platform App Building Experiments Using React Native and Tauri
			(Rust)</span
		>

		<div class="grid grid-cols-2 w-full gap-4 px-4 mt-4 lg:px-96">
			<a href="https://note-app-website.pages.dev/" target="_blank">
				<div class="h-40 border rounded-2xl p-4 flex justify-center items-center flex-col">
					<div class="text-6xl">N</div>
					<div class="-mt-4">Note App</div>
				</div>
			</a>

			<a
				href="https://github.com/ananduremanan/weather-app/releases/tag/v-0.0.1-beta"
				target="_blank"
				><div class="h-40 border rounded-2xl p-4 flex justify-center items-center flex-col">
					<div class="text-6xl">W</div>
					<div class="-mt-4">Weather App</div>
				</div></a
			>
		</div>

		<div class="text-4xl lg:text-6xl mt-14">Svelte Experiments</div>
		<span class="lg:text-2xl text-center px-6">Svelte Experiments and Packages</span>
		<div class="grid grid-cols-2 w-full gap-4 px-4 mt-4 lg:px-96 mb-8">
			<a href="https://create-svelte-docs-theme.vercel.app/" target="_blank">
				<div class="h-40 border rounded-2xl p-4 flex justify-center items-center flex-col">
					<div class="text-6xl">SDG</div>
					<div class="-mt-4">Document Generator</div>
				</div>
			</a>

			<a href="https://gramlib.netlify.app/" target="_blank">
				<div class="h-40 border rounded-2xl p-4 flex justify-center items-center flex-col">
					<div class="text-6xl">SCL</div>
					<div class="-mt-4">Component Library</div>
				</div>
			</a>
		</div>

		<div class="text-4xl lg:text-6xl mt-14">Client Works</div>
		<span class="lg:text-2xl text-center px-6">Client UI/UX Works</span>
		<div class="grid grid-cols-2 w-full gap-4 px-4 mt-4 lg:px-96 mb-8">
			<a href="https://ztooanalytics.com" target="_blank">
				<div class="h-40 border rounded-2xl p-4 flex justify-center items-center flex-col">
					<div class="text-6xl">ZT</div>
					<div class="-mt-4">Ztoo Analytics</div>
				</div>
			</a>

			<a href="https://paullandlandscaping.com" target="_blank">
				<div class="h-40 border rounded-2xl p-4 flex justify-center items-center flex-col">
					<div class="text-6xl">PL</div>
					<div class="-mt-4">Paulland Landscapping</div>
				</div>
			</a>
		</div>

		<div class="text-4xl lg:text-6xl mt-14">UI/UX Experiments</div>
		<span class="lg:text-2xl text-center px-6">My UI/UX Experiments</span>
		<div class="grid grid-cols-2 w-full gap-4 px-4 mt-4 lg:px-96 mb-8">
			<a href="https://aid-aice.vercel.app" target="_blank">
				<div class="h-40 border rounded-2xl p-4 flex justify-center items-center flex-col">
					<div class="text-6xl">AA</div>
					<div class="-mt-4">Aid Aice</div>
				</div>
			</a>

			<a href="https://sysinfopro.netlify.app" target="_blank">
				<div class="h-40 border rounded-2xl p-4 flex justify-center items-center flex-col">
					<div class="text-6xl">SP</div>
					<div class="-mt-4">SysInfo Pro</div>
				</div>
			</a>
		</div>
	</section>
</main>
