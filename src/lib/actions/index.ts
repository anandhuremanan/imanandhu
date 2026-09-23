import type { Action } from 'svelte/action';

const reducedMotion = () =>
	typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Flips `data-reveal` / `data-rule` to "in" the first time an element scrolls
 * into view. One shared observer for the whole page keeps this cheap.
 */
let observer: IntersectionObserver | null = null;
const attrFor = new WeakMap<Element, string>();

function ensureObserver() {
	if (observer || typeof window === 'undefined') return observer;
	observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const attr = attrFor.get(entry.target) ?? 'data-reveal';
				entry.target.setAttribute(attr, 'in');
				observer?.unobserve(entry.target);
			}
		},
		{ rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
	);
	return observer;
}

export const reveal: Action<HTMLElement, { delay?: number; rule?: boolean } | undefined> = (
	node,
	params
) => {
	const attr = params?.rule ? 'data-rule' : 'data-reveal';
	node.setAttribute(attr, 'out');
	if (params?.delay) node.style.setProperty('--reveal-delay', `${params.delay}ms`);

	if (reducedMotion()) {
		node.setAttribute(attr, 'in');
		return {};
	}

	attrFor.set(node, attr);
	ensureObserver()?.observe(node);

	return {
		destroy() {
			observer?.unobserve(node);
			attrFor.delete(node);
		}
	};
};

/**
 * Pulls an element toward the cursor while it is hovered. `strength` is the
 * fraction of the distance travelled, so 0.3 feels subtle and 0.6 feels loose.
 */
export const magnetic: Action<HTMLElement, { strength?: number } | undefined> = (node, params) => {
	if (reducedMotion() || window.matchMedia('(pointer: coarse)').matches) return {};

	const strength = params?.strength ?? 0.32;
	let raf = 0;
	let cx = 0;
	let cy = 0;
	let tx = 0;
	let ty = 0;

	function tick() {
		cx += (tx - cx) * 0.16;
		cy += (ty - cy) * 0.16;
		node.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
		if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
			raf = requestAnimationFrame(tick);
		} else {
			raf = 0;
		}
	}
	const start = () => {
		if (!raf) raf = requestAnimationFrame(tick);
	};

	function onMove(e: PointerEvent) {
		const r = node.getBoundingClientRect();
		tx = (e.clientX - (r.left + r.width / 2)) * strength;
		ty = (e.clientY - (r.top + r.height / 2)) * strength;
		start();
	}
	function onLeave() {
		tx = 0;
		ty = 0;
		start();
	}

	node.addEventListener('pointermove', onMove);
	node.addEventListener('pointerleave', onLeave);

	return {
		destroy() {
			cancelAnimationFrame(raf);
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
		}
	};
};

/**
 * Perspective tilt for panels, plus a `--mx`/`--my` pair the element can use to
 * position a spotlight gradient under the cursor.
 */
export const tilt: Action<HTMLElement, { max?: number } | undefined> = (node, params) => {
	if (reducedMotion() || window.matchMedia('(pointer: coarse)').matches) return {};

	const max = params?.max ?? 6;
	let raf = 0;
	let rx = 0;
	let ry = 0;
	let trx = 0;
	let tryy = 0;

	function tick() {
		rx += (trx - rx) * 0.12;
		ry += (tryy - ry) * 0.12;
		node.style.transform = `perspective(1100px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`;
		if (Math.abs(trx - rx) > 0.01 || Math.abs(tryy - ry) > 0.01) {
			raf = requestAnimationFrame(tick);
		} else {
			raf = 0;
		}
	}
	const start = () => {
		if (!raf) raf = requestAnimationFrame(tick);
	};

	function onMove(e: PointerEvent) {
		const r = node.getBoundingClientRect();
		const px = (e.clientX - r.left) / r.width;
		const py = (e.clientY - r.top) / r.height;
		trx = (0.5 - py) * max * 2;
		tryy = (px - 0.5) * max * 2;
		node.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
		node.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
		start();
	}
	function onLeave() {
		trx = 0;
		tryy = 0;
		start();
	}

	node.style.transformStyle = 'preserve-3d';
	node.addEventListener('pointermove', onMove);
	node.addEventListener('pointerleave', onLeave);

	return {
		destroy() {
			cancelAnimationFrame(raf);
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
		}
	};
};

/**
 * Scrambles text to random glyphs then resolves it, character by character.
 * Used on headings and nav labels for the terminal feel.
 */
export const scramble: Action<HTMLElement, { trigger?: 'hover' | 'mount' } | undefined> = (
	node,
	params
) => {
	const original = node.textContent ?? '';
	const chars = '!<>-_\\/[]{}=+*^?#________';
	let raf = 0;

	if (reducedMotion()) return {};

	function run() {
		cancelAnimationFrame(raf);
		const start = performance.now();
		const duration = 420 + original.length * 18;

		function step(now: number) {
			const t = Math.min((now - start) / duration, 1);
			const settled = Math.floor(t * original.length);
			let out = '';
			for (let i = 0; i < original.length; i++) {
				if (i < settled || original[i] === ' ') out += original[i];
				else out += chars[Math.floor(Math.random() * chars.length)];
			}
			node.textContent = out;
			if (t < 1) raf = requestAnimationFrame(step);
			else node.textContent = original;
		}
		raf = requestAnimationFrame(step);
	}

	if (params?.trigger === 'mount') run();
	else node.addEventListener('pointerenter', run);

	return {
		destroy() {
			cancelAnimationFrame(raf);
			node.removeEventListener('pointerenter', run);
			node.textContent = original;
		}
	};
};
