<script lang="ts">
	const iconStyle =
		'p-1 delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:cursor-pointer hover:transition';
	import { fly } from 'svelte/transition';

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
</script>

<svelte:head>
	<title>Anandhu Remanan | Software Developer</title>
	<meta
		name="description"
		content="Portfolio of Anandhu Remanan, a Software Developer from Kerala, India. Engineering meets creativity."
	/>
	<meta property="og:title" content="Anandhu Remanan | Software Developer" />
	<meta
		property="og:description"
		content="Portfolio of Anandhu Remanan, a Software Developer from Kerala, India. Engineering meets creativity."
	/>
	<meta property="og:image" content="/hero.webp" />
	<meta property="og:type" content="website" />
	{@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
</svelte:head>

<section
	in:fly={{ y: 20, duration: 600, delay: 200 }}
	class="flex w-full flex-col gap-4 p-4 md:flex-row md:p-8 lg:px-12 xl:px-32"
>
	<div class="flex flex-1 flex-col gap-4">
		<!-- Hero Card -->
		<div
			class="relative flex flex-col items-center gap-4 rounded-2xl bg-white p-6 shadow-2xl xl:flex-row dark:border dark:border-zinc-800 dark:bg-black"
		>
			<div class="card-content">
				<img
					src="/hero.webp"
					alt="Portrait of Anandhu Remanan"
					class="h-60 w-60 rounded-4xl"
					width="240"
					height="240"
					loading="eager"
				/>
			</div>
			<div class="card-content flex flex-1 flex-col items-start text-black dark:text-white">
				<h1 class="caveat-font text-xl font-bold">About Me</h1>
				<h2 class="text-bold text-2xl">Hi, I'm Anandhu Remanan!</h2>
				<p class="font-medium text-zinc-400">A Software Developer From Kerala, India</p>
				<p class="mt-2 font-light text-zinc-500">
					My work sits between engineering and creativity. Simple, functional, and intentional. No
					unnecessary layers, no bullshit.
				</p>
			</div>
		</div>

		<!-- Bottom Row Cards -->
		<div class="flex flex-col gap-4 xl:flex-row">
			<div
				class="relative flex-1 rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-zinc-800 dark:bg-black"
			>
				<div class="card-content px-14">
					<div class="description mt-6 flex items-center justify-between">
						<div class="text-center">
							<p class="text-4xl text-black dark:text-white">4+</p>
							<p class="caveat-font">Years Experience</p>
						</div>

						<div class="text-center">
							<p class="text-4xl text-black dark:text-white">30+</p>
							<p class="caveat-font">Projects Completed</p>
						</div>
					</div>

					<div class="mt-6 flex flex-col items-center md:items-start">
						<div class="mb-2 text-xs dark:text-white">Find My Projects At</div>
						<div class="flex items-center gap-4">
							<div class="flex items-center justify-center">
								<a
									href="https://github.com/anandhuremanan"
									target="_blank"
									aria-label="GitHub Profile"
									><img
										src="/icons/github.webp"
										alt="GitHub Logo"
										class="h-8 w-8"
										width="32"
										height="32"
										loading="lazy"
									/></a
								>
							</div>

							<div class="flex items-center justify-center">
								<a href="https://www.npmjs.com/~anandhu_or" target="_blank" aria-label="NPM Profile"
									><img
										src="/icons/npm.webp"
										alt="NPM Logo"
										class="h-8 w-8 rounded"
										width="32"
										height="32"
										loading="lazy"
									/></a
								>
							</div>

							<div class="flex items-center justify-center">
								<a
									href="https://crates.io/users/ananduremanan"
									target="_blank"
									aria-label="Crates.io Profile"
									><img
										src="/icons/cargo.webp"
										alt="Cargo/Rust Logo"
										class="h-8 w-8 rounded"
										width="32"
										height="32"
										loading="lazy"
									/></a
								>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div
				class="relative flex-1 rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-zinc-800 dark:bg-black"
			>
				<div class="card-content">
					<h2 class="title caveat-font dark:text-white">Things I Love Beside Engineering</h2>
					<div class="mt-6 flex items-center justify-center -space-x-2">
						<a href="https://music.imanandhu.in" rel="noopener noreferrer" aria-label="Music">
							<img
								src="/music.webp"
								alt="Headphones"
								class={`${iconStyle} h-20 w-20 rotate-20 sm:h-30 sm:w-30`}
								width="120"
								height="120"
								loading="lazy"
							/>
						</a>
						<a href="https://stories.imanandhu.in" rel="noopener noreferrer" aria-label="Stories">
							<img
								src="/note.webp"
								alt="Notebook"
								class={`${iconStyle} h-14 w-14 -rotate-20 sm:h-20 sm:w-20`}
								width="80"
								height="80"
								loading="lazy"
							/>
						</a>
						<img
							src="/paint.webp"
							alt="Paint Palette"
							class={`${iconStyle} h-20 w-20 -rotate-30 sm:h-30 sm:w-30`}
							width="120"
							height="120"
							loading="lazy"
						/>
					</div>

					<div class="mt-2 text-center text-xs text-zinc-600">Click to explore</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Sidebar Card -->
	<div
		class="relative flex w-full flex-col rounded-2xl bg-white p-6 shadow-2xl md:w-72 dark:border dark:border-zinc-800 dark:bg-black"
	>
		<div class="card-content">
			<h2 class="caveat-font text-xl font-bold text-black dark:text-white">Tools I use Daily</h2>
			<div class="mt-8 grid w-full grid-cols-2 items-center justify-center gap-4">
				<div class="flex items-center justify-center">
					<img
						src="/icons/react.webp"
						alt="React"
						class="h-16 w-16"
						width="64"
						height="64"
						loading="lazy"
					/>
				</div>
				<div class="flex items-center justify-center">
					<img
						src="/icons/svelte.webp"
						alt="Svelte"
						class="h-16 w-16"
						width="64"
						height="64"
						loading="lazy"
					/>
				</div>
				<div class="flex items-center justify-center">
					<img
						src="/icons/go.webp"
						alt="Go"
						class="h-20 w-20"
						width="80"
						height="80"
						loading="lazy"
					/>
				</div>
				<div class="flex items-center justify-center">
					<img
						src="/icons/ts.webp"
						alt="TypeScript"
						class="h-14 w-14"
						width="56"
						height="56"
						loading="lazy"
					/>
				</div>
				<div class="flex items-center justify-center">
					<img
						src="/icons/figma.webp"
						alt="Figma"
						class="h-14 w-14"
						width="56"
						height="56"
						loading="lazy"
					/>
				</div>
				<div class="flex items-center justify-center">
					<img
						src="/icons/github.webp"
						alt="GitHub"
						class="h-16 w-16"
						width="64"
						height="64"
						loading="lazy"
					/>
				</div>
				<div class="flex items-center justify-center">
					<img
						src="/icons/docker.webp"
						alt="Docker"
						class="h-16 w-16"
						width="64"
						height="64"
						loading="lazy"
					/>
				</div>
				<div class="flex items-center justify-center">
					<img
						src="/icons/pg.webp"
						alt="PostgreSQL"
						class="h-16 w-16"
						width="64"
						height="64"
						loading="lazy"
					/>
				</div>
				<div class="flex items-center justify-center">
					<img
						src="/icons/aws.webp"
						alt="AWS"
						class="h-16 w-16"
						width="64"
						height="64"
						loading="lazy"
					/>
				</div>
				<div class="flex items-center justify-center">
					<img
						src="/icons/next.webp"
						alt="Next.js"
						class="h-16 w-16 dark:invert"
						width="64"
						height="64"
						loading="lazy"
					/>
				</div>
			</div>
		</div>
	</div>
</section>
