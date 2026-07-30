<script lang="ts">
	import { fly } from 'svelte/transition';

	// Case Study 01: BusTrack data
	const bustrackTags = ['Next.js', 'React Native', 'Supabase', 'Tailwind CSS', 'TypeScript'];

	const bustrackFeatures = [
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

	const bustrackStack = [
		{ label: 'Next.js', icon: '/icons/next.webp', invert: true },
		{ label: 'React Native', icon: '/icons/react.webp', invert: false },
		{ label: 'Supabase', icon: null, emoji: '⚡' },
		{ label: 'TypeScript', icon: '/icons/ts.webp', invert: false }
	];

	// Case Study 02: FileDrop data
	const filedropTags = ['Go', 'Next.js', 'Wails', 'Cloudflare R2', 'TypeScript', 'Tailwind CSS'];

	const filedropFeatures = [
		{
			icon: '🔑',
			title: 'No Account Required',
			description:
				'Instant transfers without registration. Simply pair and share using temporary, secure codes.'
		},
		{
			icon: '⚡',
			title: 'Fast Device Pairing',
			description:
				'Connect devices in seconds via short transfer codes, bridging desktop, mobile, and web.'
		},
		{
			icon: '🛡️',
			title: 'Secure File Transfers',
			description:
				'Uses signed Cloudflare R2 URLs for secure, direct upload and download sessions.'
		},
		{
			icon: '🧹',
			title: 'Automatic Cleanup',
			description:
				'Files are stored temporarily and automatically cleaned up from Cloudflare R2 storage post-transfer.'
		}
	];

	const filedropStack = [
		{ label: 'Go', icon: '/icons/go.webp', invert: false },
		{ label: 'Next.js', icon: '/icons/next.webp', invert: true },
		{ label: 'Wails', icon: null, emoji: '🦅' },
		{ label: 'Cloudflare R2', icon: null, emoji: '☁️' }
	];

	// Case Study 03: SysInfo Pro data
	const sysinfoproTags = ['Go', 'Svelte', 'Wails', 'TypeScript', 'Windows'];

	const sysinfoproFeatures = [
		{
			icon: '🧠',
			title: 'RAM Velocity Forecast',
			description:
				'Tracks real-time memory consumption velocity (MB/s) and predicts Out-of-Memory slowdowns before they freeze your system.'
		},
		{
			icon: '⚡',
			title: 'Multi-Stream Speed Test',
			description:
				'4-stream CDN speed engine measuring download/upload (Mbps), ping, jitter, and packet loss with M-Lab precision.'
		},
		{
			icon: '🖼️',
			title: '1-Click Spec Card Exporter',
			description:
				'Generates a high-resolution PNG hardware spec card saved to Downloads — perfect for sharing on GitHub or social media.'
		},
		{
			icon: '🔋',
			title: 'Battery Longevity Analytics',
			description:
				'Detailed laptop battery health: degradation %, design vs. current capacity, cycle estimates, and per-process energy impact scores.'
		}
	];

	const sysinfoproStack = [
		{ label: 'Go', icon: '/icons/go.webp', invert: false },
		{ label: 'Svelte', icon: '/icons/svelte.webp', invert: false },
		{ label: 'Wails', icon: null, emoji: '🦅' },
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
	class="flex w-full flex-col gap-12 p-4 md:p-8 lg:px-12 xl:px-32"
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
						{#each bustrackTags as tag}
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
			{#each bustrackFeatures as feature}
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
						{#each bustrackStack as tech}
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

	<!-- FileDrop Case Study -->
	<div class="flex flex-col gap-4">
		<!-- Project Hero Card -->
		<div
			class="filedrop-hero relative overflow-hidden rounded-2xl bg-white p-8 shadow-2xl dark:border dark:border-zinc-800 dark:bg-black"
		>
			<div class="card-content flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
				<!-- Left: Info -->
				<div class="flex flex-1 flex-col gap-4">
					<div class="flex items-center gap-3">
						<div class="filedrop-icon-wrapper flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-2xl shadow-lg">
							💧
						</div>
						<div>
							<p class="text-xs font-medium tracking-wider text-indigo-600 uppercase">Case Study 02</p>
							<h2 class="text-2xl font-bold text-black dark:text-white">FileDrop</h2>
						</div>
					</div>

					<p class="text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
						A secure, cross-platform file transfer application designed to make sharing files between devices simple, fast, and privacy-focused using temporary transfer sessions.
					</p>

					<!-- Tech Tags -->
					<div class="flex flex-wrap gap-2">
						{#each filedropTags as tag}
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
							href="https://filedrop.imanandhu.in"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg"
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
							<span class="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
							Web + Desktop
						</span>
					</div>
				</div>

				<!-- Right: Minimal visual for FileDrop -->
				<div class="flex shrink-0 flex-col items-center justify-center gap-4 md:w-64">
					<div class="filedrop-visual w-full rounded-xl bg-zinc-50 p-5 dark:bg-zinc-900">
						<p class="mb-3 text-xs font-semibold tracking-widest text-zinc-400 uppercase">Transfer Session</p>
						<div class="flex flex-col gap-4">
							<!-- Pair Code Display -->
							<div class="flex items-center justify-center gap-2 rounded-lg bg-white p-2 text-center font-mono text-sm font-bold tracking-wider text-indigo-600 shadow-sm dark:bg-zinc-800 dark:text-indigo-400">
								<span>742</span>
								<span class="text-zinc-300 dark:text-zinc-600">•</span>
								<span>981</span>
							</div>

							<!-- Device-to-Device transfer connection animation -->
							<div class="flex items-center justify-between gap-2 px-1 py-1">
								<div class="flex flex-col items-center gap-1">
									<span class="text-xl">💻</span>
									<span class="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Desktop</span>
								</div>

								<div class="relative flex flex-1 items-center justify-center">
									<!-- Connecting line with moving dots -->
									<div class="h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative">
										<div class="transfer-pulse absolute top-0 h-full w-12 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
									</div>
								</div>

								<div class="flex flex-col items-center gap-1">
									<span class="text-xl">📱</span>
									<span class="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Mobile</span>
								</div>
							</div>

							<!-- File Transfer Status -->
							<div class="rounded-lg border border-zinc-100 bg-white p-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
								<div class="flex items-center gap-2">
									<span class="text-lg">📄</span>
									<div class="min-w-0 flex-1">
										<p class="truncate text-xs font-semibold text-zinc-700 dark:text-zinc-300">presentation.pdf</p>
										<p class="text-[10px] text-zinc-400">4.2 MB / 6.5 MB (65%)</p>
									</div>
								</div>
								<!-- Progress Bar -->
								<div class="mt-2 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
									<div class="progress-bar-fill h-full rounded-full bg-indigo-600"></div>
								</div>
							</div>
						</div>
					</div>
					<p class="text-center text-xs text-zinc-400">Temporary peer transfer mockup</p>
				</div>
			</div>

			<!-- Decorative blur blobs -->
			<div class="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-indigo-100 opacity-30 blur-3xl dark:bg-indigo-900"></div>
			<div class="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-indigo-50 opacity-40 blur-2xl dark:bg-indigo-950"></div>
		</div>

		<!-- Features Grid -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each filedropFeatures as feature}
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
						{#each filedropStack as tech}
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
							href="https://filedrop.imanandhu.in"
							target="_blank"
							rel="noopener noreferrer"
							class="group flex items-center gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-900 dark:hover:bg-zinc-800"
						>
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-zinc-800">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600">
									<circle cx="12" cy="12" r="10"/>
									<line x1="2" y1="12" x2="22" y2="12"/>
									<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
								</svg>
							</div>
							<div class="flex-1">
								<p class="text-sm font-semibold text-black dark:text-white">Web Client</p>
								<p class="text-xs text-zinc-400">filedrop.imanandhu.in</p>
							</div>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-indigo-500">
								<polyline points="9 18 15 12 9 6"/>
							</svg>
						</a>

						<div class="flex items-center gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-zinc-800">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600">
									<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
									<line x1="8" y1="21" x2="16" y2="21"/>
									<line x1="12" y1="17" x2="12" y2="21"/>
								</svg>
							</div>
							<div class="flex-1">
								<p class="text-sm font-semibold text-black dark:text-white">Desktop Client</p>
								<p class="text-xs text-zinc-400">Wails · Go + Web</p>
							</div>
							<span class="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">Wails</span>
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
						Traditional file sharing options often require setting up accounts, paying for cloud storage, or dealing with complex device-specific configurations (like AirDrop or Nearby Share). This creates friction when sharing files across different platforms.
					</p>
					<div class="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
						<h3 class="caveat-font mb-2 text-xl font-bold text-black dark:text-white">
							The Solution
						</h3>
						<p class="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
							FileDrop provides a frictionless, web-based experience. By using short pairing codes and signed Cloudflare R2 URLs, users can upload files and retrieve them on any platform without an account, with automatic object cleanup post-transfer.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- SysInfo Pro Case Study -->
	<div class="flex flex-col gap-4">
		<!-- Project Hero Card -->
		<div
			class="sysinfopro-hero relative overflow-hidden rounded-2xl bg-white p-8 shadow-2xl dark:border dark:border-zinc-800 dark:bg-black"
		>
			<div class="card-content flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
				<!-- Left: Info -->
				<div class="flex flex-1 flex-col gap-4">
					<div class="flex items-center gap-3">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-2xl shadow-lg">
							🖥️
						</div>
						<div>
							<p class="text-xs font-medium tracking-wider text-emerald-600 uppercase">Case Study 03</p>
							<h2 class="text-2xl font-bold text-black dark:text-white">SysInfo Pro</h2>
						</div>
					</div>

					<p class="text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
						System Telemetry Redefined with Elegance. An ultra-clean, information-dense
						desktop utility for Windows — real-time RAM forecasting, multi-stream speed
						testing, spec card export, and deep battery analytics. Zero install required.
					</p>

					<!-- Tech Tags -->
					<div class="flex flex-wrap gap-2">
						{#each sysinfoproTags as tag}
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
							href="https://sysinfopro.imanandhu.in"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
								<polyline points="15 3 21 3 21 9"/>
								<line x1="10" y1="14" x2="21" y2="3"/>
							</svg>
							Visit Site
						</a>
						<span
							class="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
						>
							<span class="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
							Windows Desktop
						</span>
					</div>
				</div>

				<!-- Right: System metrics mini-UI -->
				<div class="flex shrink-0 flex-col items-center justify-center gap-4 md:w-64">
					<div class="sysinfo-visual w-full rounded-xl bg-zinc-900 p-4">
						<p class="mb-3 text-xs font-semibold tracking-widest text-zinc-500 uppercase">Live Telemetry</p>
						<div class="flex flex-col gap-3">
							<!-- CPU -->
							<div>
								<div class="mb-1 flex items-center justify-between">
									<span class="text-xs font-medium text-zinc-400">CPU</span>
									<span class="cpu-val text-xs font-semibold text-emerald-400">34%</span>
								</div>
								<div class="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
									<div class="cpu-bar h-full rounded-full bg-emerald-500"></div>
								</div>
							</div>
							<!-- RAM -->
							<div>
								<div class="mb-1 flex items-center justify-between">
									<span class="text-xs font-medium text-zinc-400">RAM</span>
									<span class="text-xs font-semibold text-sky-400">9.2 GB</span>
								</div>
								<div class="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
									<div class="ram-bar h-full rounded-full bg-sky-500"></div>
								</div>
							</div>
							<!-- Disk -->
							<div>
								<div class="mb-1 flex items-center justify-between">
									<span class="text-xs font-medium text-zinc-400">Disk</span>
									<span class="text-xs font-semibold text-violet-400">412 GB</span>
								</div>
								<div class="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
									<div class="disk-bar h-full rounded-full bg-violet-500"></div>
								</div>
							</div>
							<!-- Network -->
							<div class="mt-1 flex items-center justify-between rounded-lg bg-zinc-800 px-3 py-2">
								<div class="flex items-center gap-1.5">
									<span class="text-xs text-zinc-500">↓</span>
									<span class="text-xs font-semibold text-emerald-400">112 Mbps</span>
								</div>
								<div class="flex items-center gap-1.5">
									<span class="text-xs text-zinc-500">↑</span>
									<span class="text-xs font-semibold text-orange-400">24 Mbps</span>
								</div>
							</div>
						</div>
					</div>
					<p class="text-center text-xs text-zinc-400">Real-time system telemetry view</p>
				</div>
			</div>

			<!-- Decorative blur blobs -->
			<div class="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-100 opacity-30 blur-3xl dark:bg-emerald-900"></div>
			<div class="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-emerald-50 opacity-40 blur-2xl dark:bg-emerald-950"></div>
		</div>

		<!-- Features Grid -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each sysinfoproFeatures as feature}
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
						{#each sysinfoproStack as tech}
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
							href="https://sysinfopro.imanandhu.in"
							target="_blank"
							rel="noopener noreferrer"
							class="group flex items-center gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-900 dark:hover:bg-zinc-800"
						>
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-zinc-800">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-600">
									<circle cx="12" cy="12" r="10"/>
									<line x1="2" y1="12" x2="22" y2="12"/>
									<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
								</svg>
							</div>
							<div class="flex-1">
								<p class="text-sm font-semibold text-black dark:text-white">Landing Page</p>
								<p class="text-xs text-zinc-400">sysinfopro.imanandhu.in</p>
							</div>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-emerald-500">
								<polyline points="9 18 15 12 9 6"/>
							</svg>
						</a>

						<div class="flex items-center gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-zinc-800">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-600">
									<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
									<line x1="8" y1="21" x2="16" y2="21"/>
									<line x1="12" y1="17" x2="12" y2="21"/>
								</svg>
							</div>
							<div class="flex-1">
								<p class="text-sm font-semibold text-black dark:text-white">Windows Desktop App</p>
								<p class="text-xs text-zinc-400">Wails · Go + Svelte · Single .exe</p>
							</div>
							<span class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">v2.0</span>
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
						Existing system monitors are either too bloated, require installation and background
						services, or surface raw numbers without any predictive insight — leaving developers
						and power users reacting to problems instead of preventing them.
					</p>
					<div class="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
						<h3 class="caveat-font mb-2 text-xl font-bold text-black dark:text-white">
							The Solution
						</h3>
						<p class="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
							SysInfo Pro ships as a single portable .exe — no install, no bloat, no
							background services. Built with Go + Wails for native performance and Svelte
							for a clean UI, it turns raw hardware data into actionable intelligence.
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

	.transfer-pulse {
		animation: pulse-move 2.5s infinite linear;
	}

	@keyframes pulse-move {
		0% {
			left: -40%;
		}
		100% {
			left: 140%;
		}
	}

	.progress-bar-fill {
		animation: fill-progress 5s infinite ease-in-out;
	}

	@keyframes fill-progress {
		0% {
			width: 0%;
		}
		10% {
			width: 15%;
		}
		40% {
			width: 65%;
		}
		75%, 100% {
			width: 100%;
		}
	}

	.filedrop-hero {
		background-image: radial-gradient(
			ellipse at top right,
			rgba(224, 231, 255, 0.3) 0%,
			transparent 60%
		);
	}

	:global(.dark) .filedrop-hero {
		background-image: radial-gradient(
			ellipse at top right,
			rgba(49, 46, 129, 0.15) 0%,
			transparent 60%
		);
	}

	.sysinfopro-hero {
		background-image: radial-gradient(
			ellipse at top right,
			rgba(209, 250, 229, 0.3) 0%,
			transparent 60%
		);
	}

	:global(.dark) .sysinfopro-hero {
		background-image: radial-gradient(
			ellipse at top right,
			rgba(6, 78, 59, 0.15) 0%,
			transparent 60%
		);
	}

	.cpu-bar {
		width: 34%;
		animation: cpu-flicker 3s infinite ease-in-out;
	}

	@keyframes cpu-flicker {
		0%, 100% { width: 34%; }
		30% { width: 52%; }
		60% { width: 28%; }
		80% { width: 61%; }
	}

	.ram-bar {
		width: 58%;
		animation: ram-creep 8s infinite ease-in-out;
	}

	@keyframes ram-creep {
		0% { width: 58%; }
		50% { width: 65%; }
		100% { width: 58%; }
	}

	.disk-bar {
		width: 41%;
	}
</style>
