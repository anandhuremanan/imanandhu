export interface StackItem {
	label: string;
	icon?: string;
	invert?: boolean;
	glyph?: string;
}

export interface Platform {
	name: string;
	detail: string;
	href?: string;
	badge?: string;
}

export interface Project {
	id: string;
	index: string;
	name: string;
	year: string;
	accent: string;
	summary: string;
	tags: string[];
	stack: StackItem[];
	platforms: Platform[];
	problem: string;
	solution: string;
	live: string;
	/** Public source, where there is one. */
	repo?: string;
	status: string;
	/** Which inline telemetry visual to render beside the project. */
	visual: 'route' | 'transfer' | 'metrics' | 'agent' | 'blocks';
}

export const projects: Project[] = [
	{
		id: 'bustrack',
		index: '01',
		name: 'BusTrack',
		year: '2025',
		accent: '#2bf5c0',
		summary:
			'Predict route timelines, record transit telemetry logs, and analyze historical arrivals. A full-stack transit intelligence platform built for Android and the web.',
		tags: ['Next.js', 'React Native', 'Supabase', 'Tailwind CSS', 'TypeScript'],
		stack: [
			{ label: 'Next.js', icon: '/icons/next.webp', invert: true },
			{ label: 'React Native', icon: '/icons/react.webp' },
			{ label: 'Supabase', glyph: '◈' },
			{ label: 'TypeScript', icon: '/icons/ts.webp' }
		],
		platforms: [
			{
				name: 'Web Dashboard',
				detail: 'bustrack.imanandhu.in',
				href: 'https://bustrack.imanandhu.in'
			},
			{ name: 'Android App', detail: 'React Native · Expo', badge: 'Live' }
		],
		problem:
			"Commuters had no reliable way to know when their bus would actually arrive. Static schedules didn't reflect real-world delays, traffic, or route changes — leaving people waiting in uncertainty.",
		solution:
			'BusTrack captures live telemetry from buses and uses historical arrival patterns to deliver accurate, dynamic ETAs — accessible from Android and the web, in real time.',
		live: 'https://bustrack.imanandhu.in',
		status: 'Android + Web',
		visual: 'route'
	},
	{
		id: 'filedrop',
		index: '02',
		name: 'FileDrop',
		year: '2025',
		accent: '#7c5cff',
		summary:
			'A secure, cross-platform file transfer application designed to make sharing files between devices simple, fast, and privacy-focused using temporary transfer sessions.',
		tags: ['Go', 'Next.js', 'Wails', 'Cloudflare R2', 'TypeScript', 'Tailwind CSS'],
		stack: [
			{ label: 'Go', icon: '/icons/go.webp' },
			{ label: 'Next.js', icon: '/icons/next.webp', invert: true },
			{ label: 'Wails', glyph: '◇' },
			{ label: 'Cloudflare R2', glyph: '○' }
		],
		platforms: [
			{
				name: 'Web Client',
				detail: 'filedrop.imanandhu.in',
				href: 'https://filedrop.imanandhu.in'
			},
			{ name: 'Desktop Client', detail: 'Wails · Go + Web', badge: 'Wails' }
		],
		problem:
			'Traditional file sharing options often require setting up accounts, paying for cloud storage, or dealing with complex device-specific configurations (like AirDrop or Nearby Share). This creates friction when sharing files across different platforms.',
		solution:
			'FileDrop provides a frictionless, web-based experience. By using short pairing codes and signed Cloudflare R2 URLs, users can upload files and retrieve them on any platform without an account, with automatic object cleanup post-transfer.',
		live: 'https://filedrop.imanandhu.in',
		status: 'Web + Desktop',
		visual: 'transfer'
	},
	{
		id: 'sysinfopro',
		index: '03',
		name: 'SysInfo Pro',
		year: '2026',
		accent: '#ffb03a',
		summary:
			'System Telemetry Redefined with Elegance. An ultra-clean, information-dense desktop utility for Windows — real-time RAM forecasting, multi-stream speed testing, spec card export, and deep battery analytics. Zero install required.',
		tags: ['Go', 'Svelte', 'Wails', 'TypeScript', 'Windows'],
		stack: [
			{ label: 'Go', icon: '/icons/go.webp' },
			{ label: 'Svelte', icon: '/icons/svelte.webp' },
			{ label: 'Wails', glyph: '◇' },
			{ label: 'TypeScript', icon: '/icons/ts.webp' }
		],
		platforms: [
			{
				name: 'Landing Page',
				detail: 'sysinfopro.imanandhu.in',
				href: 'https://sysinfopro.imanandhu.in'
			},
			{ name: 'Windows Desktop App', detail: 'Wails · Go + Svelte · Single .exe', badge: 'v2.0' }
		],
		problem:
			'Existing system monitors are either too bloated, require installation and background services, or surface raw numbers without any predictive insight — leaving developers and power users reacting to problems instead of preventing them.',
		solution:
			'SysInfo Pro ships as a single portable .exe — no install, no bloat, no background services. Built with Go + Wails for native performance and Svelte for a clean UI, it turns raw hardware data into actionable intelligence.',
		live: 'https://sysinfopro.imanandhu.in',
		status: 'Windows Desktop',
		visual: 'metrics'
	},
	{
		id: 'gbs-se-agent',
		index: '04',
		name: 'GBS SE Agent',
		year: '2026',
		accent: '#38bdf8',
		summary:
			'An autonomous coding agent that runs entirely on your own machine. Describe a task and it explores the codebase, edits files, and runs commands — showing every step, and asking before anything risky.',
		tags: ['TypeScript', 'VS Code API', 'Ollama', 'Local LLMs', 'esbuild'],
		stack: [
			{ label: 'TypeScript', icon: '/icons/ts.webp' },
			{ label: 'VS Code API', glyph: '◧' },
			{ label: 'Ollama', glyph: '◐' },
			{ label: 'Node.js', glyph: '⬡' }
		],
		platforms: [
			{
				name: 'Documentation',
				detail: 'anandhuremanan.github.io/gb-codex',
				href: 'https://anandhuremanan.github.io/gb-codex/'
			},
			{
				name: 'VS Code Extension',
				detail: 'gbs-internal-toolchain.gbs-software-agent',
				badge: 'Marketplace'
			}
		],
		problem:
			"Coding agents are genuinely useful, but shipping a proprietary codebase to a third-party inference endpoint is a non-starter for most companies. The teams who would benefit most from an agent are exactly the ones who can't send their source somewhere else.",
		solution:
			'GBS SE Agent runs the whole agentic loop against a local model — Ollama, LM Studio, llama.cpp, or vLLM — so the code never leaves the machine. It ships as a VS Code extension with tool calling, subagent delegation for broad exploration, a skills system for project conventions, and approval gates on shell commands and sensitive edits. Settings are enforced at user level, so a repository cannot quietly widen its own permissions.',
		live: 'https://anandhuremanan.github.io/gb-codex/',
		repo: 'https://github.com/anandhuremanan/gb-codex',
		status: 'Local-first · VS Code',
		visual: 'agent'
	},
	{
		id: 'gramprokit',
		index: '05',
		name: 'GramproKit',
		year: '2026',
		accent: '#fb7185',
		summary:
			'A headless React component library with no peer dependencies beyond React itself. Copy-in components, full keyboard support, and theming through plain CSS variables — 29 primitives with zero opinions about how they look.',
		tags: ['React 19', 'TypeScript', 'Headless UI', 'Zero Dependencies', 'CSS Variables'],
		stack: [
			{ label: 'React 19', icon: '/icons/react.webp' },
			{ label: 'TypeScript', icon: '/icons/ts.webp' },
			{ label: 'npm', icon: '/icons/npm.webp' },
			{ label: 'CSS Variables', glyph: '◨' }
		],
		platforms: [
			{
				name: 'Documentation',
				detail: 'gramprokit.vercel.app',
				href: 'https://gramprokit.vercel.app/'
			},
			{ name: 'CLI', detail: 'npx gbs-add-block@latest', badge: '29 blocks' }
		],
		problem:
			"Component libraries force a trade. Take the design system and spend your time fighting it, or take the headless primitives and inherit a dependency tree you never asked for. Either way you ship code you don't control and can't easily audit.",
		solution:
			'GramproKit 2.0 was rebuilt from the ground up to drop every dependency. Components are copied into your project rather than installed as a black box, so the source is yours to read and change. Behaviour and accessibility live in the component; appearance is entirely CSS variables. A CLI pulls in individual blocks, and the same pipeline ships agent skills so coding assistants already know the API.',
		live: 'https://gramprokit.vercel.app/',
		repo: 'https://github.com/anandhuremanan/headless-gbs-components',
		status: 'React · Headless',
		visual: 'blocks'
	}
];

export const stackIcons = [
	{ label: 'React', src: '/icons/react.webp' },
	{ label: 'Svelte', src: '/icons/svelte.webp' },
	{ label: 'Go', src: '/icons/go.webp' },
	{ label: 'TypeScript', src: '/icons/ts.webp' },
	{ label: 'Next.js', src: '/icons/next.webp', invert: true },
	{ label: 'PostgreSQL', src: '/icons/pg.webp' },
	{ label: 'Docker', src: '/icons/docker.webp' },
	{ label: 'AWS', src: '/icons/aws.webp' },
	{ label: 'Figma', src: '/icons/figma.webp' },
	{ label: 'GitHub', src: '/icons/github.webp' }
];

export const socials = [
	{ label: 'GitHub', href: 'https://github.com/anandhuremanan', handle: 'anandhuremanan' },
	{
		label: 'LinkedIn',
		href: 'https://www.linkedin.com/in/anandhuremanan/',
		handle: 'anandhuremanan'
	},
	{ label: 'X / Twitter', href: 'https://twitter.com/anandhu_or', handle: '@anandhu_or' },
	{ label: 'npm', href: 'https://www.npmjs.com/~anandhu_or', handle: '~anandhu_or' },
	{ label: 'crates.io', href: 'https://crates.io/users/ananduremanan', handle: 'ananduremanan' }
];

export const sideProjects = [
	{
		label: 'Music',
		href: 'https://music.imanandhu.in',
		img: '/music.webp',
		note: 'What I Cook'
	},
	{
		label: 'Stories',
		href: 'https://stories.imanandhu.in',
		img: '/note.webp',
		note: 'What I write'
	},
	{ label: 'Paint', href: null, img: '/paint.webp', note: 'What I make' }
];
