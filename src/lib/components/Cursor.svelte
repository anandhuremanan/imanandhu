<script lang="ts">
	import { onMount } from 'svelte';

	// Rendered unconditionally so the bindings are live before onMount runs;
	// they stay invisible until the loop actually starts.
	let dot: HTMLDivElement;
	let ring: HTMLDivElement;

	onMount(() => {
		// Touch devices and reduced-motion users keep the native cursor.
		if (
			window.matchMedia('(pointer: coarse)').matches ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		) {
			return;
		}

		let x = window.innerWidth / 2;
		let y = window.innerHeight / 2;
		let rx = x;
		let ry = y;
		let raf = 0;
		let hot = false;

		const INTERACTIVE = 'a, button, input, textarea, [data-cursor]';

		function onMove(e: PointerEvent) {
			x = e.clientX;
			y = e.clientY;
			const el = (e.target as Element | null)?.closest?.(INTERACTIVE);
			const next = Boolean(el);
			if (next !== hot) {
				hot = next;
				ring.classList.toggle('hot', hot);
			}
		}

		function tick() {
			// The ring trails the dot: the lag is what reads as weight.
			rx += (x - rx) * 0.16;
			ry += (y - ry) * 0.16;
			dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
			ring.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0) translate(-50%, -50%)`;
			raf = requestAnimationFrame(tick);
		}

		const show = () => document.documentElement.classList.add('has-cursor');
		const hide = () => document.documentElement.classList.remove('has-cursor');

		window.addEventListener('pointermove', onMove, { passive: true });
		window.addEventListener('pointerenter', show);
		window.addEventListener('pointerleave', hide);
		show();
		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerenter', show);
			window.removeEventListener('pointerleave', hide);
			hide();
		};
	});
</script>

<div bind:this={dot} class="dot" aria-hidden="true"></div>
<div bind:this={ring} class="ring" aria-hidden="true"></div>

<style>
	.dot,
	.ring {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 90;
		pointer-events: none;
		border-radius: 999px;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	:global(html.has-cursor) .dot,
	:global(html.has-cursor) .ring {
		opacity: 1;
	}

	.dot {
		width: 5px;
		height: 5px;
		background: #2bf5c0;
	}

	.ring {
		width: 30px;
		height: 30px;
		border: 1px solid rgba(255, 255, 255, 0.35);
		transition:
			opacity 0.3s ease,
			width 0.35s cubic-bezier(0.16, 1, 0.3, 1),
			height 0.35s cubic-bezier(0.16, 1, 0.3, 1),
			border-color 0.35s ease,
			background 0.35s ease;
	}

	.ring:global(.hot) {
		width: 52px;
		height: 52px;
		border-color: rgba(43, 245, 192, 0.7);
		background: rgba(43, 245, 192, 0.07);
	}

	/* Hide the native cursor only once ours is actually running. */
	:global(html.has-cursor),
	:global(html.has-cursor *) {
		cursor: none !important;
	}
</style>
