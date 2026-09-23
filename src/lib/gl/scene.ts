import * as THREE from 'three';
import { particleVert, particleFrag, cageVert, cageFrag } from './shaders';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Ease used for the intro bloom: fast out, long settle. */
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export interface SceneHandle {
	dispose(): void;
	setScroll(v: number): void;
}

/**
 * Builds the persistent hero field: a noise-displaced point cloud inside a
 * wobbling wireframe cage. It lives behind every route, so the layout creates
 * it once and never tears it down on navigation.
 */
export function createScene(canvas: HTMLCanvasElement): SceneHandle {
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const renderer = new THREE.WebGLRenderer({
		canvas,
		alpha: true,
		antialias: false,
		powerPreference: 'high-performance'
	});
	renderer.setClearColor(0x000000, 0);
	renderer.outputColorSpace = THREE.SRGBColorSpace;

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
	camera.position.set(0, 0, 7.4);

	const group = new THREE.Group();
	scene.add(group);

	// Particle count scales with the device, not the window.
	const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
	const coarse = window.matchMedia('(pointer: coarse)').matches;
	const COUNT = coarse || mem <= 4 ? 11000 : mem <= 8 ? 22000 : 34000;

	// Fibonacci sphere: even coverage without the pole clustering of naive uv.
	const positions = new Float32Array(COUNT * 3);
	const scales = new Float32Array(COUNT);
	const seeds = new Float32Array(COUNT);
	const golden = Math.PI * (3 - Math.sqrt(5));

	for (let i = 0; i < COUNT; i++) {
		const y = 1 - (i / (COUNT - 1)) * 2;
		const r = Math.sqrt(Math.max(0, 1 - y * y));
		const theta = golden * i;
		// Radial jitter gives the shell thickness instead of a hard skin.
		const rad = 2.35 + (Math.random() - 0.5) * 0.42;
		positions[i * 3] = Math.cos(theta) * r * rad;
		positions[i * 3 + 1] = y * rad;
		positions[i * 3 + 2] = Math.sin(theta) * r * rad;
		scales[i] = 0.45 + Math.random() * 0.95;
		seeds[i] = Math.random();
	}

	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
	geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

	const uniforms = {
		uTime: { value: 0 },
		uScroll: { value: 0 },
		uIntro: { value: reduced ? 1 : 0 },
		uMouse: { value: new THREE.Vector3(999, 999, 999) },
		uSize: { value: coarse ? 2.1 : 2.6 },
		uDpr: { value: 1 },
		uOpacity: { value: 0.9 },
		uColorA: { value: new THREE.Color('#0e7f6b') },
		uColorB: { value: new THREE.Color('#2bf5c0') },
		uColorC: { value: new THREE.Color('#7c5cff') }
	};

	const points = new THREE.Points(
		geo,
		new THREE.ShaderMaterial({
			uniforms,
			vertexShader: particleVert,
			fragmentShader: particleFrag,
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending
		})
	);
	group.add(points);

	// Wireframe cage around the field.
	const cageUniforms = {
		uTime: uniforms.uTime,
		uScroll: uniforms.uScroll,
		uColor: { value: new THREE.Color('#2bf5c0') },
		uOpacity: { value: 0.085 }
	};

	const cageSrc = new THREE.IcosahedronGeometry(2.95, 1);
	const cage = new THREE.LineSegments(
		new THREE.WireframeGeometry(cageSrc),
		new THREE.ShaderMaterial({
			uniforms: cageUniforms,
			vertexShader: cageVert,
			fragmentShader: cageFrag,
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending
		})
	);
	cageSrc.dispose();
	group.add(cage);

	// Interaction state
	const pointer = new THREE.Vector2(0, 0); // normalised device coords
	const target = new THREE.Vector2(0, 0);
	const raycaster = new THREE.Raycaster();
	const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
	const hit = new THREE.Vector3();
	const away = new THREE.Vector3(999, 999, 999);
	let pointerActive = false;
	let scroll = 0;
	let scrollEased = 0;

	function onPointerMove(e: PointerEvent) {
		target.x = (e.clientX / window.innerWidth) * 2 - 1;
		target.y = -(e.clientY / window.innerHeight) * 2 + 1;
		pointerActive = true;
	}
	function onPointerLeave() {
		pointerActive = false;
	}

	function resize() {
		const w = window.innerWidth;
		const h = window.innerHeight;
		const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
		renderer.setPixelRatio(dpr);
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		uniforms.uDpr.value = dpr;
		// Pull the camera back on narrow screens so the sphere still fits.
		camera.position.z = w < 768 ? 9.6 : w < 1280 ? 8.2 : 7.4;
	}

	const clock = new THREE.Clock();
	let raf = 0;
	let running = true;
	let introStart = 0;

	function frame() {
		raf = requestAnimationFrame(frame);
		if (!running) return;

		const dt = Math.min(clock.getDelta(), 0.05);
		if (!reduced) uniforms.uTime.value += dt;

		if (!reduced && uniforms.uIntro.value < 1) {
			if (!introStart) introStart = performance.now();
			uniforms.uIntro.value = easeOutExpo(clamp((performance.now() - introStart) / 2200, 0, 1));
		}

		// Eased scroll so fast flicks do not snap the field.
		scrollEased = lerp(scrollEased, scroll, 0.07);
		uniforms.uScroll.value = scrollEased;

		if (!reduced) {
			pointer.x = lerp(pointer.x, target.x, 0.055);
			pointer.y = lerp(pointer.y, target.y, 0.055);

			// Project the cursor onto z=0 so repulsion happens in world space.
			if (pointerActive) {
				raycaster.setFromCamera(pointer, camera);
				if (raycaster.ray.intersectPlane(plane, hit)) uniforms.uMouse.value.copy(hit);
			} else {
				uniforms.uMouse.value.lerp(away, 0.05);
			}

			// Idle drift plus cursor parallax on the whole group.
			group.rotation.y += dt * 0.055;
			group.rotation.x = lerp(group.rotation.x, pointer.y * 0.22, 0.05);
			group.rotation.z = lerp(group.rotation.z, pointer.x * 0.08, 0.05);
			cage.rotation.y -= dt * 0.11;
			cage.rotation.x += dt * 0.03;

			camera.position.x = lerp(camera.position.x, pointer.x * 0.5, 0.04);
			camera.position.y = lerp(camera.position.y, pointer.y * 0.35, 0.04);
			camera.lookAt(0, 0, 0);
		}

		// The field dims as content takes over the page.
		uniforms.uOpacity.value = 0.9 - scrollEased * 0.45;
		cageUniforms.uOpacity.value = 0.085 * (1 - scrollEased * 0.8);

		renderer.render(scene, camera);
	}

	function onVisibility() {
		running = document.visibilityState === 'visible';
		if (running) clock.getDelta(); // drop the accumulated gap
	}

	resize();
	window.addEventListener('resize', resize, { passive: true });
	window.addEventListener('pointermove', onPointerMove, { passive: true });
	window.addEventListener('pointerleave', onPointerLeave, { passive: true });
	document.addEventListener('visibilitychange', onVisibility);
	frame();

	return {
		setScroll(v: number) {
			scroll = clamp(v, 0, 1);
		},
		dispose() {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', resize);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerleave', onPointerLeave);
			document.removeEventListener('visibilitychange', onVisibility);
			geo.dispose();
			(points.material as THREE.Material).dispose();
			cage.geometry.dispose();
			(cage.material as THREE.Material).dispose();
			renderer.dispose();
		}
	};
}
