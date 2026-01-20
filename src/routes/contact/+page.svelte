<script lang="ts">
	import { fly } from 'svelte/transition';

	const iconStyle =
		'p-1 delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:cursor-pointer hover:transition';
</script>

<svelte:head>
	<title>Contact | Anandhu Remanan</title>
	<meta
		name="description"
		content="Get in touch with Anandhu Remanan. Connect via Social Media or send a message."
	/>
	<meta property="og:title" content="Contact | Anandhu Remanan" />
	<meta
		property="og:description"
		content="Get in touch with Anandhu Remanan. Connect via Social Media or send a message."
	/>
</svelte:head>

<section
	in:fly={{ y: 20, duration: 600 }}
	class="flex w-full flex-col gap-4 p-4 md:p-8 lg:px-12 xl:px-32"
>
	<div class="flex flex-col gap-4">
		<!-- Header Card -->
		<div
			class="relative flex flex-col items-center gap-4 rounded-2xl bg-white p-6 shadow-2xl dark:border dark:border-zinc-800 dark:bg-black"
		>
			<h1 class="caveat-font text-3xl font-bold text-black dark:text-white">Let's Connect</h1>
			<p class="max-w-lg text-center text-zinc-600 dark:text-zinc-400">
				I'm always open to discussing new projects, creative ideas, or opportunities to be part of
				your visions. Feel free to reach out!
			</p>
		</div>

		<div class="flex flex-col gap-4 md:flex-row">
			<!-- Social Links Card -->
			<div
				class="relative flex-1 rounded-2xl bg-white p-8 shadow-xl dark:border dark:border-zinc-800 dark:bg-black"
			>
				<div class="card-content flex flex-col items-center gap-6">
					<h2 class="caveat-font text-2xl font-bold text-black dark:text-white">Socials</h2>
					<div class="grid grid-cols-2 gap-8">
						<a
							href="https://www.linkedin.com/in/anandhuremanan/"
							target="_blank"
							aria-label="LinkedIn Profile"
							class="group flex flex-col items-center gap-2"
						>
							<div
								class="rounded-full bg-blue-50 p-4 transition-colors group-hover:bg-blue-100 dark:bg-zinc-900"
							>
								<!-- LinkedIn Icon (Simple SVG fallback since we rely on external images usually) -->
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="32"
									height="32"
									viewBox="0 0 24 24"
									fill="currentColor"
									class="text-blue-600"
								>
									<path
										d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
									/>
								</svg>
							</div>
							<span class="text-sm font-medium text-zinc-600 dark:text-zinc-400">LinkedIn</span>
						</a>

						<a
							href="https://twitter.com/anandhu_or"
							target="_blank"
							aria-label="Twitter Profile"
							class="group flex flex-col items-center gap-2"
						>
							<div
								class="rounded-full bg-blue-50 p-4 transition-colors group-hover:bg-blue-100 dark:bg-zinc-900"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="32"
									height="32"
									viewBox="0 0 24 24"
									fill="currentColor"
									class="text-black dark:text-white"
								>
									<path
										d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
									/>
								</svg>
							</div>
							<span class="text-sm font-medium text-zinc-600 dark:text-zinc-400">Twitter</span>
						</a>
					</div>
				</div>
			</div>

			<!-- Contact Form Card -->
			<div
				class="relative flex-1 rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-zinc-800 dark:bg-black"
			>
				<div class="card-content">
					<h2 class="caveat-font mb-4 text-center text-2xl font-bold text-black dark:text-white">
						Send a Message
					</h2>

					<!-- Formspree Placeholder Action -->
					<form action="https://formspree.io/f/xbddkkjy" method="POST" class="flex flex-col gap-4">
						<div class="flex flex-col gap-1">
							<label for="name" class="text-sm font-medium text-zinc-600 dark:text-zinc-400"
								>Name</label
							>
							<input
								type="text"
								name="name"
								id="name"
								required
								placeholder="Your name"
								class="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
							/>
						</div>

						<div class="flex flex-col gap-1">
							<label for="email" class="text-sm font-medium text-zinc-600 dark:text-zinc-400"
								>Email</label
							>
							<input
								type="email"
								name="email"
								id="email"
								required
								placeholder="name@example.com"
								class="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
							/>
						</div>

						<div class="flex flex-col gap-1">
							<label for="message" class="text-sm font-medium text-zinc-600 dark:text-zinc-400"
								>Message</label
							>
							<textarea
								name="message"
								id="message"
								rows="4"
								required
								placeholder="Whatever you want to say..."
								class="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
							></textarea>
						</div>

						<button
							type="submit"
							class="mt-2 rounded-lg bg-black px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black"
						>
							Send Message
						</button>
						<p class="mt-2 text-center text-xs text-zinc-400">
							Powered by Formspree. No email revealed.
						</p>
					</form>
				</div>
			</div>
		</div>
	</div>
</section>
