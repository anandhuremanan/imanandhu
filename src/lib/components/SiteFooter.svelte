<script lang="ts">
	/** The copyright footer used on /case-studies and /contact. */
	let { links }: { links: { label: string; href: string | null }[] } = $props();

	const year = new Date().getFullYear();
</script>

<!-- The wrapper takes the `auto` so a short page still pushes the footer to the
     bottom; the footer's own margin guarantees a gap when the page is long.
     One element cannot do both, since margin-top cannot be auto and a length. -->
<div class="foot-wrap">
	<footer class="foot mono">
		<span>© {year} Anandhu Remanan · Kerala, India</span>
		<span class="links">
			{#each links as link (link.label)}
				{#if link.href}
					<a class="tap" href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
				{:else}
					<!-- No destination yet (Paint). Shown, but not a dead link. -->
					<span class="tap off">{link.label}</span>
				{/if}
			{/each}
		</span>
	</footer>
</div>

<style>
	.foot-wrap {
		margin-top: auto;
	}

	.foot {
		display: flex;
		flex-wrap: wrap;
		gap: 12px 24px;
		align-items: center;
		justify-content: space-between;
		margin-top: 64px;
		padding-top: 24px;
		border-top: 1px solid var(--line);
		font-size: 13px;
		transition: border-color 0.8s ease;
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 24px;
	}

	.tap {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
	}

	@media (min-width: 900px) {
		.foot {
			margin-top: 96px;
		}

		.tap {
			min-height: 0;
		}
	}

	.off {
		color: var(--muted);
	}
</style>
