<script lang="ts">
	const iconStyle =
		'p-1 delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:cursor-pointer hover:transition';
</script>

<section class="flex w-full flex-col gap-4 p-4 md:flex-row md:p-8 lg:px-46">
	<div class="flex flex-1 flex-col gap-4">
		<!-- Hero Card -->
		<div
			class="relative flex flex-col items-center gap-4 rounded-2xl bg-white p-6 shadow-2xl md:flex-row dark:border dark:border-zinc-800 dark:bg-black"
		>
			<div class="card-content">
				<img src="/hero.png" alt="hero of the story" class="h-60 w-60 rounded-4xl" />
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
		<div class="flex flex-col gap-4 md:flex-row">
			<div
				class="relative flex-1 rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-zinc-800 dark:bg-black"
			>
				<div class="card-content px-14">
					<div class="description mt-6 flex items-center justify-between">
						<div class="text-center">
							<p class="text-4xl dark:text-white text-black">4+</p>
							<p class="caveat-font">Years Experience</p>
						</div>

						<div class="text-center">
							<p class="text-4xl dark:text-white text-black">30+</p>
							<p class="caveat-font">Projects Completed</p>
						</div>
					</div>

					<div class="mt-6 flex flex-col items-center md:items-start">
						<div class="mb-2 text-xs dark:text-white">Find My Projects At</div>
						<div class="flex items-center gap-4">
							<div class="flex items-center justify-center">
								<a href="https://github.com/anandhuremanan" target="_blank"
									><img src="/icons/github.png" alt="vscode" class="h-8 w-8" /></a
								>
							</div>

							<div class="flex items-center justify-center">
								<a href="https://www.npmjs.com/~anandhu_or" target="_blank"
									><img src="/icons/npm.png" alt="vscode" class="h-8 w-8 rounded" /></a
								>
							</div>

							<div class="flex items-center justify-center">
								<a href="https://crates.io/users/ananduremanan" target="_blank"
									><img src="/icons/cargo.png" alt="vscode" class="h-8 w-8 rounded" /></a
								>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div
				class="relative h-60 flex-1 rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-zinc-800 dark:bg-black"
			>
				<div class="card-content">
					<h2 class="title caveat-font dark:text-white">Things I Love Beside Engineering</h2>
					<div class="mt-6 flex items-center justify-center -space-x-2">
						<a href="https://music.imanandhu.in" rel="noopener noreferrer">
							<img src="/music.png" alt="music" class={`${iconStyle} h-30 w-30 rotate-20 `} />
						</a>
						<img src="/note.png" alt="music" class={`${iconStyle} h-20 w-20 -rotate-20 `} />
						<img src="/paint.png" alt="music" class={`${iconStyle} h-30 w-30 -rotate-30 `} />
					</div>
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
					<img src="/icons/react.png" alt="vscode" class="h-16 w-16" />
				</div>
				<div class="flex items-center justify-center">
					<img src="/icons/svelte.png" alt="figma" class="h-16 w-16" />
				</div>
				<div class="flex items-center justify-center">
					<img src="/icons/go.png" alt="figma" class="h-20 w-20" />
				</div>
				<div class="flex items-center justify-center">
					<img src="/icons/ts.png" alt="figma" class="h-14 w-14" />
				</div>
				<div class="flex items-center justify-center">
					<img src="/icons/figma.png" alt="figma" class="h-14 w-14" />
				</div>
				<div class="flex items-center justify-center">
					<img src="/icons/github.png" alt="figma" class="h-16 w-16" />
				</div>
				<div class="flex items-center justify-center">
					<img src="/icons/docker.png" alt="figma" class="h-16 w-16" />
				</div>
				<div class="flex items-center justify-center">
					<img src="/icons/pg.png" alt="figma" class="h-16 w-16" />
				</div>
				<div class="flex items-center justify-center">
					<img src="/icons/aws.png" alt="figma" class="h-16 w-16" />
				</div>
				<div class="flex items-center justify-center">
					<img src="/icons/next.png" alt="figma" class="h-16 w-16" />
				</div>
			</div>
		</div>
	</div>
</section>
