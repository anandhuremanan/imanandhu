<script lang="ts">
	import { page } from '$app/state';
	import { RESUME_URL } from '$lib/data/projects';

	/**
	 * On the home page the wordmark is plain text (you are already there) and
	 * the first two links jump to sections on the page. Everywhere else it is a
	 * link home and the nav is the three routes.
	 */
	const home = $derived(page.url.pathname === '/');
	const here = (path: string) => page.url.pathname === path;
</script>

<header class="bar mono">
	{#if home}
		<span class="mark"
			><span class="full">Anandhu Remanan — Software Engineer</span><span class="short"
				>Anandhu Remanan</span
			></span
		>
	{:else}
		<a class="mark" href="/"
			><span class="full">Anandhu Remanan — Software Engineer</span><span class="short"
				>Anandhu Remanan</span
			></a
		>
	{/if}

	<nav>
		{#if home}
			<a class="tap" href="#work">Work</a>
			<a class="tap after" href="#after-hours">After hours</a>
			<a class="tap after" href="/contact">Contact</a>
		{:else}
			<a class="tap" href="/" aria-current={here('/') ? 'page' : undefined}>Index</a>
			<a
				class="tap"
				class:current={here('/case-studies')}
				href="/case-studies"
				aria-current={here('/case-studies') ? 'page' : undefined}>Work</a
			>
			<a
				class="tap"
				class:current={here('/contact')}
				href="/contact"
				aria-current={here('/contact') ? 'page' : undefined}>Contact</a
			>
		{/if}
		<a class="tap" href={RESUME_URL} target="_blank" rel="noopener noreferrer">Résumé</a>
	</nav>
</header>

<style>
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		min-height: 44px;
		font-size: 13px;
	}

	.mark {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* The full title is too long for a phone next to the nav. */
	.full {
		display: none;
	}

	@media (min-width: 900px) {
		.full {
			display: inline;
		}
		.short {
			display: none;
		}
	}

	nav {
		display: flex;
		flex-shrink: 0;
		gap: 4px;
	}

	@media (min-width: 900px) {
		nav {
			gap: 28px;
		}
	}

	/* 44px minimum tap target on mobile, per the brief. */
	.tap {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 10px;
	}

	.tap:last-child {
		padding-right: 0;
	}

	@media (min-width: 900px) {
		.tap {
			padding: 0;
		}
	}

	/* Two of the home links are section jumps that do not fit a phone header. */
	.after {
		display: none;
	}

	@media (min-width: 900px) {
		.after {
			display: inline-flex;
		}
	}

	.current {
		text-decoration: underline;
		text-underline-offset: 6px;
	}
</style>
