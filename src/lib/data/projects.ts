/** After-hours destinations. Also used by the home status sentence. */
export const MUSIC_URL = 'https://music.imanandhu.in';
export const STORIES_URL = 'https://stories.imanandhu.in';

/**
 * Paint has no site yet. Everything that links to it degrades to a plain,
 * non-clickable card — set this to a URL and the links appear on their own.
 */
export const PAINT_URL: string | null = null;

/** The résumé link in every page header. */
export const RESUME_URL = 'https://github.com/anandhuremanan';

export interface ProjectLink {
	label: string;
	href: string;
}

export interface Project {
	/** Anchor target on /case-studies. These URLs are already public — do not rename. */
	id: string;
	name: string;
	year: string;
	/** Short platform line: "React · Headless". */
	platform: string;
	/** One-liner for the home "What I've shipped" list. */
	blurb: string;
	/** Opening paragraph when the case study is expanded. */
	desc: string;
	problem: string;
	solution: string;
	tech: string;
	/** Monospaced mock-up lines shown in the detail panel. */
	detail: string[];
	caption: string;
	links: ProjectLink[];
}

/** Newest first. The case-study list numbers these in reverse (05 … 01). */
export const projects: Project[] = [
	{
		id: 'gramprokit',
		name: 'GramproKit',
		year: '2026',
		platform: 'React · Headless',
		blurb: 'Headless React, 29 primitives',
		desc: 'A headless React component library with no dependencies beyond React. 29 copy-in primitives, full keyboard support, themed entirely through CSS variables.',
		problem:
			'Component libraries force a trade: fight someone else’s design system, or inherit a dependency tree you never asked for. Either way you ship code you don’t control.',
		solution:
			'Version 2.0 drops every dependency. Components are copied into your project so the source is yours; behaviour and accessibility live in the component, appearance in CSS variables. A CLI pulls in single blocks.',
		tech: 'React 19 · TypeScript · CSS Variables · Zero dependencies',
		detail: [
			'0 dependencies',
			'Button  DataGrid  Combobox',
			'Dialog  Toaster  Tabs  +23',
			'--gk-radius  --gk-accent'
		],
		caption: 'Copy-in blocks, themed by CSS variables',
		links: [
			{ label: 'Documentation', href: 'https://gramprokit.vercel.app/' },
			{ label: 'Source', href: 'https://github.com/anandhuremanan/headless-gbs-components' }
		]
	},
	{
		id: 'gbs-se-agent',
		name: 'GBS SE Agent',
		year: '2026',
		platform: 'Local-first · VS Code',
		blurb: 'A coding agent on your own machine',
		desc: 'An autonomous coding agent that runs entirely on your own machine. It explores the codebase, edits files and runs commands, showing every step and asking before anything risky.',
		problem:
			'Coding agents are useful, but sending a proprietary codebase to a third-party endpoint is a non-starter for most companies — exactly the teams who would benefit most.',
		solution:
			'The whole agent loop runs against a local model (Ollama, LM Studio, llama.cpp or vLLM), so code never leaves the machine. Tool calling, subagents, a skills system and approval gates on risky commands.',
		tech: 'TypeScript · VS Code API · Ollama · Local LLMs · esbuild',
		detail: [
			'› refactor auth middleware',
			'✓ read  auth/mw.ts',
			'✓ edit  auth/mw.ts  +18 −6',
			'◆ run   npm test — approve?'
		],
		caption: 'Agent loop, running locally',
		links: [
			{ label: 'Documentation', href: 'https://anandhuremanan.github.io/gb-codex/' },
			{ label: 'Source', href: 'https://github.com/anandhuremanan/gb-codex' }
		]
	},
	{
		id: 'sysinfopro',
		name: 'SysInfo Pro',
		year: '2026',
		platform: 'Windows desktop',
		blurb: 'Zero-install Windows telemetry',
		desc: 'A clean, information-dense Windows utility: real-time RAM forecasting, multi-stream speed tests, spec card export and battery analytics. Zero install.',
		problem:
			'System monitors are either bloated, need installing and background services, or show raw numbers with no predictive insight — so you react to problems instead of preventing them.',
		solution:
			'A single portable .exe. Go and Wails for native speed, Svelte for a calm interface, turning raw hardware data into something you can act on.',
		tech: 'Go · Svelte · Wails · TypeScript',
		detail: ['CPU   34%', 'RAM   9.2 GB', 'DISK  412 GB', '↓ 112 Mbps   ↑ 24 Mbps'],
		caption: 'Real-time system telemetry',
		links: [{ label: 'Visit live', href: 'https://sysinfopro.imanandhu.in' }]
	},
	{
		id: 'filedrop',
		name: 'FileDrop',
		year: '2025',
		platform: 'Web + Desktop',
		blurb: 'Private cross-platform file transfer',
		desc: 'Secure, cross-platform file transfer between devices using temporary sessions. Simple, fast, privacy-first.',
		problem:
			'Sharing a file across platforms usually means accounts, paid cloud storage, or device-specific tools like AirDrop that stop at the ecosystem border.',
		solution:
			'Short pairing codes and signed Cloudflare R2 links. Upload on one device, collect on any other, no account — and files are cleaned up after the transfer.',
		tech: 'Go · Next.js · Wails · Cloudflare R2 · TypeScript',
		detail: [
			'Session  742 · 981',
			'DESKTOP  →  MOBILE',
			'presentation.pdf   65%',
			'4.2 MB / 6.5 MB'
		],
		caption: 'Temporary peer transfer',
		links: [{ label: 'Visit live', href: 'https://filedrop.imanandhu.in' }]
	},
	{
		id: 'bustrack',
		name: 'BusTrack',
		year: '2025',
		platform: 'Android + Web',
		blurb: 'Transit intelligence for Android and web',
		desc: 'Predict route timelines, record transit telemetry and analyse historical arrivals. Full-stack transit intelligence for Android and the web.',
		problem:
			'Commuters had no reliable way to know when their bus would actually arrive. Static schedules ignore delays, traffic and route changes.',
		solution:
			'Live telemetry from buses plus historical arrival patterns produce accurate, changing ETAs — on Android and the web, in real time.',
		tech: 'Next.js · React Native · Supabase · TypeScript · Tailwind CSS',
		detail: ['07:02  ●', '07:14  ●', '       ETA ~3m', '07:31  ○'],
		caption: 'Real-time route timeline',
		links: [{ label: 'Visit live', href: 'https://bustrack.imanandhu.in' }]
	}
];

export interface Craft {
	key: 'paint' | 'music' | 'stories';
	name: string;
	hours: string;
	href: string | null;
	line: string;
}

export const crafts: Craft[] = [
	{
		key: 'paint',
		name: 'Paint',
		hours: '06:00–09:00',
		href: PAINT_URL,
		line: 'Colour by hand, before the laptop opens.'
	},
	{
		key: 'music',
		name: 'Music',
		hours: '18:00–21:00',
		href: MUSIC_URL,
		line: 'What I cook once the workday ends.'
	},
	{
		key: 'stories',
		name: 'Stories',
		hours: '21:00–00:00',
		href: STORIES_URL,
		line: 'Words, when the code is done.'
	}
];

export const socials = [
	{ label: 'GitHub', handle: 'anandhuremanan', href: 'https://github.com/anandhuremanan' },
	{
		label: 'LinkedIn',
		handle: 'anandhuremanan',
		href: 'https://www.linkedin.com/in/anandhuremanan/'
	},
	{ label: 'X / Twitter', handle: '@anandhu_or', href: 'https://twitter.com/anandhu_or' },
	{ label: 'npm', handle: '~anandhu_or', href: 'https://www.npmjs.com/~anandhu_or' },
	{ label: 'crates.io', handle: 'ananduremanan', href: 'https://crates.io/users/ananduremanan' }
];
