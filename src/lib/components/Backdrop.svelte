<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { SceneHandle } from '$lib/gl/scene';

	let canvas: HTMLCanvasElement;
	let ready = $state(false);
	let failed = $state(false);

	// The hero is built to sit on the full-strength field. The inner routes are
	// dense text over the same canvas, so the field steps back there.
	const quiet = $derived(page.url.pathname !== '/');

	interface NetInfo {
		saveData?: boolean;
		effectiveType?: string;
	}

	/**
	 * three plus the scene is ~110KB brotli and costs real main-thread time to
	 * compile shaders and build the buffers. That is a fair trade on a capable
	 * device and a bad one on a slow link or a weak phone, where it would eat
	 * the bandwidth the actual content needs. In those cases we never fetch it
	 * and the CSS gradient stays as the backdrop.
	 */
	function shouldLoadScene() {
		const net = (navigator as Navigator & { connection?: NetInfo }).connection;
		if (net?.saveData) return false;
		if (net?.effectiveType && /(^|-)2g$|^3g$/.test(net.effectiveType)) return false;

		const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
		if (mem !== undefined && mem <= 2) return false;
		if (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2) {
			return false;
		}
		return true;
	}

	/** Run once the main thread is actually free, with a hard upper bound. */
	function whenIdle(fn: () => void) {
		const ric = (window as Window & { requestIdleCallback?: typeof requestIdleCallback })
			.requestIdleCallback;
		if (ric) ric(() => fn(), { timeout: 2500 });
		else setTimeout(fn, 900);
	}

	onMount(() => {
		let handle: SceneHandle | undefined;
		let onScroll: (() => void) | undefined;
		let cancelled = false;

		if (!shouldLoadScene()) {
			failed = true;
			return;
		}

		// Deliberately after hydration settles: importing during hydration made
		// the two compete for the main thread and pushed interactivity out.
		whenIdle(async () => {
			if (cancelled) return;
			try {
				const { createScene } = await import('$lib/gl/scene');
				if (cancelled) return;
				handle = createScene(canvas);
				ready = true;

				onScroll = () => {
					handle?.setScroll(window.scrollY / Math.max(window.innerHeight, 1));
				};
				onScroll();
				window.addEventListener('scroll', onScroll, { passive: true });
			} catch {
				// No WebGL, or the context was refused: fall back to the gradient.
				failed = true;
			}
		});

		return () => {
			cancelled = true;
			if (onScroll) window.removeEventListener('scroll', onScroll);
			handle?.dispose();
		};
	});
</script>

<div class="backdrop" aria-hidden="true">
	<!-- Always painted: the scene fades in on top of it, and it is the whole
	     backdrop when WebGL is unavailable. -->
	<div class="fallback" class:dim={ready}></div>
	<canvas bind:this={canvas} class="canvas" class:visible={ready && !failed} class:quiet></canvas>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}

	.canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		transition: opacity 1.6s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.canvas.visible {
		opacity: 1;
	}

	.canvas.visible.quiet {
		opacity: 0.32;
	}

	.fallback {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse 60% 55% at 50% 42%, rgba(43, 245, 192, 0.11), transparent 70%),
			radial-gradient(ellipse 45% 40% at 72% 68%, rgba(124, 92, 255, 0.08), transparent 70%);
		transition: opacity 1.6s ease;
	}

	.fallback.dim {
		opacity: 0.55;
	}
</style>
