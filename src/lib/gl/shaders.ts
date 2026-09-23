/**
 * GLSL for the hero particle field.
 * Noise is Ashima's simplex 3D (MIT) — it's the cheapest good-looking 3D noise
 * and we sample it twice per vertex, so cost matters here.
 */

const SIMPLEX = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
	const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
	const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

	vec3 i  = floor(v + dot(v, C.yyy));
	vec3 x0 = v - i + dot(i, C.xxx);

	vec3 g = step(x0.yzx, x0.xyz);
	vec3 l = 1.0 - g;
	vec3 i1 = min(g.xyz, l.zxy);
	vec3 i2 = max(g.xyz, l.zxy);

	vec3 x1 = x0 - i1 + C.xxx;
	vec3 x2 = x0 - i2 + C.yyy;
	vec3 x3 = x0 - D.yyy;

	i = mod289(i);
	vec4 p = permute(permute(permute(
		     i.z + vec4(0.0, i1.z, i2.z, 1.0))
		   + i.y + vec4(0.0, i1.y, i2.y, 1.0))
		   + i.x + vec4(0.0, i1.x, i2.x, 1.0));

	float n_ = 0.142857142857;
	vec3 ns = n_ * D.wyz - D.xzx;

	vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

	vec4 x_ = floor(j * ns.z);
	vec4 y_ = floor(j - 7.0 * x_);

	vec4 x = x_ * ns.x + ns.yyyy;
	vec4 y = y_ * ns.x + ns.yyyy;
	vec4 h = 1.0 - abs(x) - abs(y);

	vec4 b0 = vec4(x.xy, y.xy);
	vec4 b1 = vec4(x.zw, y.zw);

	vec4 s0 = floor(b0) * 2.0 + 1.0;
	vec4 s1 = floor(b1) * 2.0 + 1.0;
	vec4 sh = -step(h, vec4(0.0));

	vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
	vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

	vec3 p0 = vec3(a0.xy, h.x);
	vec3 p1 = vec3(a0.zw, h.y);
	vec3 p2 = vec3(a1.xy, h.z);
	vec3 p3 = vec3(a1.zw, h.w);

	vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
	p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

	vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
	m = m * m;
	return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

export const particleVert = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform float uIntro;
uniform vec3  uMouse;
uniform float uSize;
uniform float uDpr;

attribute float aScale;
attribute float aSeed;

varying float vNoise;
varying float vDepth;
varying float vSeed;

${SIMPLEX}

void main() {
	vec3 dir = normalize(position);
	vec3 pos = position;

	float t = uTime * 0.085;

	// Two octaves: a slow swell and a finer surface crawl.
	float n1 = snoise(position * 0.62 + vec3(0.0, 0.0, t));
	float n2 = snoise(position * 2.35 - vec3(t * 1.7, t, 0.0));
	float n  = n1 * 0.72 + n2 * 0.28;

	// Intro: points fly in from a collapsed core.
	float bloom = mix(0.12, 1.0, uIntro);
	pos *= bloom;

	// Surface displacement, amplified as you scroll.
	pos += dir * (n * 0.46) * (1.0 + uScroll * 1.9);

	// Scroll dispersion — the sphere opens up and drifts.
	pos += dir * uScroll * 1.45;
	pos.y -= uScroll * 0.9;

	// Cursor pushes points away in world space.
	vec3 toMouse = pos - uMouse;
	float md = length(toMouse);
	float push = smoothstep(2.6, 0.0, md);
	pos += normalize(toMouse + 1e-5) * push * 1.05;

	vNoise = n;
	vSeed  = aSeed;

	vec4 mv = modelViewMatrix * vec4(pos, 1.0);
	vDepth = -mv.z;
	gl_Position = projectionMatrix * mv;

	// Perspective-correct sizing, with a twinkle so the field never reads static.
	float twinkle = 0.72 + 0.28 * sin(uTime * 1.6 + aSeed * 40.0);
	gl_PointSize = uSize * aScale * uDpr * twinkle * (14.0 / max(vDepth, 0.1));
}
`;

export const particleFrag = /* glsl */ `
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uColorC;
uniform float uOpacity;

varying float vNoise;
varying float vDepth;
varying float vSeed;

void main() {
	vec2 uv = gl_PointCoord - 0.5;
	float d = length(uv);
	if (d > 0.5) discard;

	// Soft round falloff with a hot core.
	float a = smoothstep(0.5, 0.0, d);
	a = pow(a, 2.4);

	// Colour ramps across the noise field; a few points get the violet accent.
	vec3 col = mix(uColorA, uColorB, smoothstep(-0.55, 0.75, vNoise));
	col = mix(col, uColorC, step(0.94, vSeed) * 0.85);

	// Depth fade keeps the back of the sphere from muddying the front.
	float fog = smoothstep(15.0, 3.5, vDepth);

	gl_FragColor = vec4(col, a * uOpacity * fog);
}
`;

export const cageVert = /* glsl */ `
uniform float uTime;
uniform float uScroll;
varying float vY;

${SIMPLEX}

void main() {
	vec3 pos = position;
	float n = snoise(position * 0.5 + vec3(0.0, 0.0, uTime * 0.06));
	pos += normalize(position) * n * (0.3 + uScroll * 0.9);
	vY = pos.y;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const cageFrag = /* glsl */ `
uniform vec3  uColor;
uniform float uOpacity;
varying float vY;

void main() {
	float fade = smoothstep(-3.5, 2.5, vY);
	gl_FragColor = vec4(uColor, uOpacity * mix(0.25, 1.0, fade));
}
`;
