<script lang="ts">
	import { onMount } from 'svelte';

	let progress = $state(0);
	let done = $state(false);
	let gone = $state(false);
	let lineCount = $state(0);

	const boot = [
		'init renderer  ................ ok',
		'compile shaders ............... ok',
		'seed particle field ........... ok',
		'mount interface ............... ok'
	];

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			progress = 100;
			lineCount = boot.length;
			done = true;
			gone = true;
			document.body.style.overflow = '';
			return;
		}

		document.body.style.overflow = 'hidden';

		const start = performance.now();
		const DURATION = 1500;
		let raf = 0;

		const tick = (now: number) => {
			const t = Math.min((now - start) / DURATION, 1);
			// Ease so the counter surges then settles, rather than ticking linearly.
			progress = Math.round((1 - Math.pow(1 - t, 3)) * 100);
			lineCount = Math.min(boot.length, Math.floor(t * (boot.length + 0.6)));
			if (t < 1) {
				raf = requestAnimationFrame(tick);
			} else {
				done = true;
				setTimeout(() => {
					gone = true;
					document.body.style.overflow = '';
				}, 900);
			}
		};
		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			document.body.style.overflow = '';
		};
	});
</script>

{#if !gone}
	<div class="preloader" class:done aria-hidden="true">
		<div class="inner">
			<div class="row">
				<span class="label">ANANDHU REMANAN</span>
				<span class="label count">{String(progress).padStart(3, '0')}</span>
			</div>

			<div class="bar">
				<div class="fill" style="transform: scaleX({progress / 100})"></div>
			</div>

			<ul class="log mono">
				{#each boot.slice(0, lineCount) as line (line)}
					<li>{line}</li>
				{/each}
			</ul>
		</div>

		<!-- Two panels part like shutters once the count lands. -->
		<div class="shutter top"></div>
		<div class="shutter bottom"></div>
	</div>
{/if}

<style>
	.preloader {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: grid;
		place-items: center;
		pointer-events: none;
	}

	.inner {
		position: relative;
		z-index: 2;
		width: min(28rem, 80vw);
		transition:
			opacity 0.45s ease,
			transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.done .inner {
		opacity: 0;
		transform: translateY(-10px);
	}

	.row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 0.9rem;
	}

	.count {
		color: #2bf5c0;
	}

	.bar {
		height: 1px;
		background: rgba(255, 255, 255, 0.12);
		overflow: hidden;
	}

	.fill {
		height: 100%;
		background: #2bf5c0;
		transform-origin: left;
		transform: scaleX(0);
	}

	.log {
		margin-top: 1.1rem;
		font-size: 0.6875rem;
		line-height: 1.7;
		color: #83838e;
		min-height: 4.8rem;
	}

	.log li {
		animation: logIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	@keyframes logIn {
		from {
			opacity: 0;
			transform: translateX(-6px);
		}
	}

	.shutter {
		position: absolute;
		left: 0;
		width: 100%;
		height: 50.2%;
		background: #050506;
		transition: transform 0.95s cubic-bezier(0.83, 0, 0.17, 1);
	}

	/* No accent border on the meeting edges. The two shutters overlap at the
	   midpoint, so a border on each produced one bright line straight across
	   the viewport — through the boot log — for the whole load. */
	.shutter.top {
		top: 0;
	}

	.shutter.bottom {
		bottom: 0;
	}

	.done .shutter.top {
		transform: translateY(-100%);
	}

	.done .shutter.bottom {
		transform: translateY(100%);
	}
</style>
