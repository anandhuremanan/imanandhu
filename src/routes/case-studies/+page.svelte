<script lang="ts">
	import { fly } from 'svelte/transition';

	const tags = ['Next.js', 'React Native', 'Supabase', 'Tailwind CSS', 'TypeScript'];

	const features = [
		{
			icon: '🗺️',
			title: 'Route Timeline Prediction',
			description:
				'Predicts bus arrival times using historical data and real-time telemetry, giving commuters accurate ETAs before they reach the stop.'
		},
		{
			icon: '📡',
			title: 'Transit Telemetry Logs',
			description:
				'Records live GPS coordinates, speed, and dwell times to build a high-fidelity picture of every trip in real time.'
		},
		{
			icon: '📊',
			title: 'Historical Arrival Analysis',
			description:
				'Aggregates months of trip data to surface patterns, outliers, and performance trends across routes and time windows.'
		},
		{
			icon: '📱',
			title: 'Android & Web App',
			description:
				'Dual-platform delivery — a React Native Android app for commuters on the go and a Next.js web dashboard for deeper analytics.'
		}
	];

	const stack = [
		{ label: 'Next.js', icon: '/icons/next.webp', invert: true },
		{ label: 'React Native', icon: '/icons/react.webp', invert: false },
		{ label: 'Supabase', icon: null, emoji: '⚡' },
		{ label: 'TypeScript', icon: '/icons/ts.webp', invert: false }
	];
</script>

<svelte:head>
	<title>Case Studies | Anandhu Remanan</title>
	<meta
		name="description"
		content="In-depth case studies of projects built by Anandhu Remanan — real problems, real solutions, and the engineering decisions behind them."
	/>
	<meta property="og:title" content="Case Studies | Anandhu Remanan" />
	<meta
		property="og:description"
		content="In-depth case studies of projects built by Anandhu Remanan — real problems, real solutions, and the engineering decisions behind them."
	/>
</svelte:head>

<section
	in:fly={{ y: 20, duration: 600 }}
	class="flex w-full flex-col gap-4 p-4 md:p-8 lg:px-12 xl:px-32"
>
	<!-- Page Header -->
	<div
		class="relative flex flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-2xl dark:border dark:border-zinc-800 dark:bg-black"
	>
		<div class="card-content text-center">
			<p class="caveat-font mb-1 text-sm tracking-widest text-blue-600 uppercase">Portfolio</p>
			<h1 class="caveat-font text-4xl font-bold text-black md:text-5xl dark:text-white">
				Case Studies
			</h1>
			<p class="mt-3 max-w-xl text-zinc-500 dark:text-zinc-400">
				A close look at the products I've built — the problem, the process, and the
				decisions that shaped them.
			</p>
		</div>
	</div>

	<!-- BusTrack Case Study -->
	<div class="flex flex-col gap-4">
		<!-- Project Hero Card -->
		<div
			class="case-study-hero relative overflow-hidden rounded-2xl bg-white p-8 shadow-2xl dark:border dark:border-zinc-800 dark:bg-black"
		>
			<div class="card-content flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
				<!-- Left: Info -->
				<div class="flex flex-1 flex-col gap-4">
					<div class="flex items-center gap-3">
						<div class="bus-icon-wrapper flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-2xl shadow-lg">
							🚌
						</div>
						<div>
							<p class="text-xs font-medium tracking-wider text-blue-600 uppercase">Case Study 01</p>
							<h2 class="text-2xl font-bold text-black dark:text-white">BusTrack</h2>
						</div>
					</div>

					<p class="text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
						Predict route timelines, record transit telemetry logs, and analyze historical
						arrivals. A full-stack transit intelligence platform built for Android and the web.
					</p>

					<!-- Tech Tags -->
					<div class="flex flex-wrap gap-2">
						{#each tags as tag}
							<span
								class="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
							>
								{tag}
							</span>
						{/each}
					</div>

					<!-- CTA -->
					<div class="mt-2 flex flex-wrap gap-3">
						<a
							href="https://bustrack.imanandhu.in"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
								<polyline points="15 3 21 3 21 9"/>
								<line x1="10" y1="14" x2="21" y2="3"/>
							</svg>
							Live Project
						</a>
						<span
							class="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
						>
							<span class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
							Android + Web
						</span>
					</div>
				</div>

				<!-- Right: Minimal visual -->
				<div class="flex shrink-0 flex-col items-center justify-center gap-4 md:w-64">
					<div class="route-visual w-full rounded-xl bg-zinc-50 p-5 dark:bg-zinc-900">
						<p class="mb-3 text-xs font-semibold tracking-widest text-zinc-400 uppercase">Live Route</p>
						<div class="flex flex-col gap-3">
							<div class="stop-item flex items-center gap-3">
								<div class="h-3 w-3 rounded-full bg-blue-600 ring-2 ring-blue-200 dark:ring-blue-900"></div>
								<div class="flex-1">
									<div class="h-2 w-24 rounded bg-zinc-200 dark:bg-zinc-700"></div>
								</div>
								<span class="text-xs text-zinc-400">07:02</span>
							</div>
							<div class="ml-1.5 h-5 w-px bg-zinc-200 dark:bg-zinc-700"></div>
							<div class="stop-item flex items-center gap-3">
								<div class="h-3 w-3 rounded-full bg-blue-400 ring-2 ring-blue-100 dark:ring-blue-900"></div>
								<div class="flex-1">
									<div class="h-2 w-20 rounded bg-zinc-200 dark:bg-zinc-700"></div>
								</div>
								<span class="text-xs text-zinc-400">07:14</span>
							</div>
							<div class="ml-1.5 h-5 w-px bg-zinc-200 dark:bg-zinc-700"></div>
							<div class="stop-item flex items-center gap-3">
								<div class="bus-position h-3 w-3 rounded-full bg-green-500 ring-2 ring-green-200 dark:ring-green-900"></div>
								<div class="flex-1">
									<div class="h-2 w-28 rounded bg-zinc-200 dark:bg-zinc-700"></div>
								</div>
								<span class="text-xs font-semibold text-green-500">ETA ~3m</span>
							</div>
							<div class="ml-1.5 h-5 w-px bg-dashed bg-zinc-200 dark:bg-zinc-700"></div>
							<div class="stop-item flex items-center gap-3">
								<div class="h-3 w-3 rounded-full border-2 border-zinc-300 dark:border-zinc-600"></div>
								<div class="flex-1">
									<div class="h-2 w-16 rounded bg-zinc-200 dark:bg-zinc-700"></div>
								</div>
								<span class="text-xs text-zinc-400">07:31</span>
							</div>
						</div>
					</div>
					<p class="text-center text-xs text-zinc-400">Real-time route timeline view</p>
				</div>
			</div>

			<!-- Decorative blur blobs -->
			<div class="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-100 opacity-30 blur-3xl dark:bg-blue-900"></div>
			<div class="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-blue-50 opacity-40 blur-2xl dark:bg-blue-950"></div>
		</div>

		<!-- Features Grid -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each features as feature}
				<div
					class="feature-card relative flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-xl transition-transform duration-200 hover:-translate-y-1 dark:border dark:border-zinc-800 dark:bg-black"
				>
					<div class="card-content">
						<div class="mb-3 text-3xl">{feature.icon}</div>
						<h3 class="caveat-font text-lg font-semibold text-black dark:text-white">
							{feature.title}
						</h3>
						<p class="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
							{feature.description}
						</p>
					</div>
				</div>
			{/each}
		</div>

		<!-- Tech Stack + Platforms Row -->
		<div class="flex flex-col gap-4 md:flex-row">
			<!-- Tech Stack Card -->
			<div
				class="relative flex-1 rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-zinc-800 dark:bg-black"
			>
				<div class="card-content">
					<h3 class="caveat-font mb-5 text-xl font-bold text-black dark:text-white">Tech Stack</h3>
					<div class="grid grid-cols-2 gap-4">
						{#each stack as tech}
							<div class="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
								{#if tech.icon}
									<img
										src={tech.icon}
										alt={tech.label}
										class="h-8 w-8 {tech.invert ? 'dark:invert' : ''}"
										width="32"
										height="32"
										loading="lazy"
									/>
								{:else}
									<span class="text-2xl">{tech.emoji}</span>
								{/if}
								<span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">{tech.label}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Platforms Card -->
			<div
				class="relative flex-1 rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-zinc-800 dark:bg-black"
			>
				<div class="card-content">
					<h3 class="caveat-font mb-5 text-xl font-bold text-black dark:text-white">Platforms</h3>
					<div class="flex flex-col gap-4">
						<a
							href="https://bustrack.imanandhu.in"
							target="_blank"
							rel="noopener noreferrer"
							class="group flex items-center gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900 dark:hover:bg-zinc-800"
						>
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-zinc-800">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600">
									<circle cx="12" cy="12" r="10"/>
									<line x1="2" y1="12" x2="22" y2="12"/>
									<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
								</svg>
							</div>
							<div class="flex-1">
								<p class="text-sm font-semibold text-black dark:text-white">Web Dashboard</p>
								<p class="text-xs text-zinc-400">bustrack.imanandhu.in</p>
							</div>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-blue-500">
								<polyline points="9 18 15 12 9 6"/>
							</svg>
						</a>

						<div class="flex items-center gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-zinc-800">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600">
									<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
									<line x1="12" y1="18" x2="12.01" y2="18"/>
								</svg>
							</div>
							<div class="flex-1">
								<p class="text-sm font-semibold text-black dark:text-white">Android App</p>
								<p class="text-xs text-zinc-400">React Native · Expo</p>
							</div>
							<span class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Live</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Problem / Solution Card -->
			<div
				class="relative flex-1 rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-zinc-800 dark:bg-black"
			>
				<div class="card-content">
					<h3 class="caveat-font mb-5 text-xl font-bold text-black dark:text-white">
						The Problem
					</h3>
					<p class="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
						Commuters had no reliable way to know when their bus would actually arrive.
						Static schedules didn't reflect real-world delays, traffic, or route changes —
						leaving people waiting in uncertainty.
					</p>
					<div class="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
						<h3 class="caveat-font mb-2 text-xl font-bold text-black dark:text-white">
							The Solution
						</h3>
						<p class="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
							BusTrack captures live telemetry from buses and uses historical arrival
							patterns to deliver accurate, dynamic ETAs — accessible from Android and
							the web, in real time.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- More coming soon -->
	<div
		class="relative flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-200 p-8 dark:border-zinc-800"
	>
		<p class="caveat-font text-2xl font-bold text-zinc-300 dark:text-zinc-700">More case studies coming soon</p>
		<p class="text-sm text-zinc-400">Each project tells a different story — stay tuned.</p>
	</div>
</section>

<style>
	.bus-position {
		animation: pulse-glow 2s infinite;
	}

	@keyframes pulse-glow {
		0%, 100% {
			box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
		}
		50% {
			box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
		}
	}

	.case-study-hero {
		background-image: radial-gradient(
			ellipse at top right,
			rgba(219, 234, 254, 0.3) 0%,
			transparent 60%
		);
	}

	:global(.dark) .case-study-hero {
		background-image: radial-gradient(
			ellipse at top right,
			rgba(30, 58, 138, 0.15) 0%,
			transparent 60%
		);
	}
</style>
