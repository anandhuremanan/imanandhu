<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';

	/**
	 * Visitor-side view of the now-playing room.
	 *
	 * Read-only by construction: it authenticates as `visitor` and the server
	 * refuses state updates from that role, so there is no owner credential
	 * anywhere in the portfolio bundle.
	 *
	 * If the worker is unreachable, or PUBLIC_NOW_PLAYING_WS is unset, the card
	 * simply never appears. Visitors are never shown a connection error.
	 */

	interface State {
		playing: boolean;
		title: string | null;
		artist: string | null;
		album: string | null;
		artwork: string | null;
		url: string | null;
	}

	// These read as a follow-on to the "isn't playing any music" label, so none
	// of them restate the fact or repeat his name.
	const IDLE_LINES = [
		'Suspicious, frankly.',
		'He has stopped feeding the algorithm.',
		'Apparently he is doing actual work.',
		'The playlist is currently unemployed.',
		'Silence detected.',
		'The headphones are off duty.',
		'Even the shuffle gave up.'
	];

	// `$env/dynamic/public` rather than `$env/static/public`: the static form
	// fails the build when the variable is not exported, which would break
	// deploys before the worker exists.
	const WS_URL = env.PUBLIC_NOW_PLAYING_WS ?? '';

	let track = $state<State | null>(null);
	let connected = $state(false);
	let idleLine = $state(IDLE_LINES[0]);

	// Only render once we have actually heard from the server, so the card never
	// flashes in and out while the socket is still negotiating.
	const visible = $derived(Boolean(WS_URL) && connected && track !== null);
	const nowPlaying = $derived(track?.playing === true && Boolean(track.title));

	onMount(() => {
		if (!WS_URL) return;

		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		let socket: WebSocket | null = null;
		let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
		let rotateTimer: ReturnType<typeof setInterval> | undefined;
		let attempts = 0;
		let closed = false;

		function scheduleReconnect() {
			if (closed || reconnectTimer !== undefined) return;
			// Don't burn retries against a worker we can't see while nobody is
			// looking at the tab; visibilitychange resumes immediately.
			if (document.visibilityState === 'hidden') return;

			const delay = Math.min(1000 * 2 ** attempts, 30_000);
			attempts++;
			reconnectTimer = setTimeout(
				() => {
					reconnectTimer = undefined;
					connect();
				},
				delay * (0.5 + Math.random() * 0.5)
			);
		}

		function connect() {
			if (closed || socket) return;

			let ws: WebSocket;
			try {
				ws = new WebSocket(WS_URL);
			} catch {
				return; // malformed URL: give up silently
			}
			socket = ws;

			ws.addEventListener('open', () => {
				if (socket !== ws) return;
				attempts = 0;
				ws.send(JSON.stringify({ type: 'auth', role: 'visitor' }));
			});

			ws.addEventListener('message', (event) => {
				if (socket !== ws) return;
				let message: { type?: string } & Partial<State>;
				try {
					message = JSON.parse(String(event.data));
				} catch {
					return;
				}
				// Must match the server's frame type in worker/src/protocol.ts.
				if (message.type !== 'state') return;

				connected = true;
				const wasPlaying = track?.playing === true;
				track = {
					playing: Boolean(message.playing),
					title: message.title ?? null,
					artist: message.artist ?? null,
					album: message.album ?? null,
					artwork: message.artwork ?? null,
					url: message.url ?? null
				};
				// New idle spell gets a new line; a line does not change under you
				// mid-read just because another state frame arrived.
				if (wasPlaying && !track.playing) pickIdleLine();
			});

			const drop = () => {
				if (socket !== ws) return;
				socket = null;
				connected = false;
				scheduleReconnect();
			};
			ws.addEventListener('close', drop);
			ws.addEventListener('error', drop);
		}

		function pickIdleLine() {
			const next = IDLE_LINES[Math.floor(Math.random() * IDLE_LINES.length)];
			idleLine =
				next === idleLine ? IDLE_LINES[(IDLE_LINES.indexOf(next) + 1) % IDLE_LINES.length] : next;
		}

		function onVisibility() {
			if (document.visibilityState !== 'visible') return;
			attempts = 0;
			if (!socket) connect();
		}

		pickIdleLine();
		document.addEventListener('visibilitychange', onVisibility);
		connect();

		// Slow rotation so the idle card has some life without nagging. Static
		// for anyone who asked for reduced motion.
		if (!reduced) rotateTimer = setInterval(() => !nowPlaying && pickIdleLine(), 30_000);

		return () => {
			closed = true;
			document.removeEventListener('visibilitychange', onVisibility);
			if (reconnectTimer !== undefined) clearTimeout(reconnectTimer);
			if (rotateTimer !== undefined) clearInterval(rotateTimer);
			const s = socket;
			socket = null;
			s?.close(1000, 'component destroyed');
		};
	});
</script>

{#if browser && visible}
	<aside class="np" class:idle={!nowPlaying} aria-label="What Anandhu is listening to">
		<!-- polite + atomic: a track change is announced once, calmly, and never
		     interrupts whatever the visitor is already reading. -->
		<div class="np-live" aria-live="polite" aria-atomic="true">
			{#if nowPlaying}
				Anandhu is now listening to {track?.title}{track?.artist ? ` by ${track.artist}` : ''}
			{:else}
				Anandhu isn't playing any music. {idleLine}
			{/if}
		</div>

		<div class="np-body" aria-hidden="true">
			{#if nowPlaying}
				<div class="art">
					{#if track?.artwork}
						<img src={track.artwork} alt="" width="48" height="48" loading="lazy" />
					{:else}
						<div class="art-fallback">♪</div>
					{/if}
					<span class="bars"><i></i><i></i><i></i></span>
				</div>

				<div class="meta">
					<span class="label">Anandhu is now listening</span>
					<span class="title">{track?.title}</span>
					{#if track?.artist}<span class="artist">{track.artist}</span>{/if}
				</div>

				{#if track?.url}
					<a
						class="open"
						href={track.url}
						target="_blank"
						rel="noopener noreferrer"
						aria-hidden="false"
						aria-label="Open this track on YouTube Music"
					>
						↗
					</a>
				{/if}
			{:else}
				<div class="art">
					<div class="art-fallback quiet">◌</div>
				</div>
				<div class="meta">
					<span class="label">Anandhu isn't playing any music</span>
					<span class="idle-line">{idleLine}</span>
				</div>
			{/if}
		</div>
	</aside>
{/if}

<style>
	.np {
		position: fixed;
		left: var(--gutter);
		bottom: 1.25rem;
		z-index: 50;
		max-width: min(22rem, calc(100vw - var(--gutter) * 2));
		/* Opaque: the WebGL canvas sits behind this and backdrop-filter cannot
		   reach it through the .shell stacking context. */
		background: rgba(9, 9, 12, 0.94);
		border: 1px solid var(--line);
		border-radius: 2px;
		box-shadow: 0 18px 50px -18px rgba(0, 0, 0, 0.95);
		animation: npIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	@keyframes npIn {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
	}

	/* Screen-reader-only live region. */
	.np-live {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}

	.np-body {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.7rem 0.8rem;
	}

	.art {
		position: relative;
		flex-shrink: 0;
		width: 3rem;
		height: 3rem;
	}

	.art img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 2px;
		display: block;
	}

	.art-fallback {
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		border: 1px solid var(--line);
		border-radius: 2px;
		color: #2bf5c0;
		font-size: 1.1rem;
	}

	.art-fallback.quiet {
		color: #83838e;
	}

	/* Three little equaliser bars over the corner of the artwork. */
	.bars {
		position: absolute;
		right: -3px;
		bottom: -3px;
		display: flex;
		align-items: flex-end;
		gap: 2px;
		height: 12px;
		padding: 2px 3px;
		background: #09090c;
		border-radius: 2px;
	}

	.bars i {
		display: block;
		width: 2px;
		height: 4px;
		background: #2bf5c0;
		animation: bounce 1s ease-in-out infinite;
	}

	.bars i:nth-child(2) {
		animation-delay: 0.18s;
	}
	.bars i:nth-child(3) {
		animation-delay: 0.36s;
	}

	@keyframes bounce {
		0%,
		100% {
			height: 3px;
		}
		50% {
			height: 9px;
		}
	}

	.meta {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.label {
		font-family: 'JetBrains Mono Variable', ui-monospace, monospace;
		font-size: 0.5625rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #83838e;
		/* These labels are long enough to wrap in a narrow card, and the global
		   .label rule sets line-height: 1, which would collide the two lines. */
		line-height: 1.45;
	}

	.title,
	.artist,
	.idle-line {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.title {
		font-size: 0.875rem;
		font-weight: 500;
		letter-spacing: -0.01em;
		color: #f0f0f2;
	}

	.artist {
		font-size: 0.75rem;
		color: #94949e;
	}

	.idle-line {
		font-size: 0.8125rem;
		color: #94949e;
	}

	/* The only control on the card. There is deliberately no dismiss button:
	   it was a single click away from hiding the card for the rest of the
	   session, with nothing on screen to explain where it had gone. */
	.open {
		flex-shrink: 0;
		margin-left: auto;
		padding: 0.25rem;
		font-size: 0.9rem;
		line-height: 1;
		color: #83838e;
		text-decoration: none;
		transition: color 0.3s ease;
	}

	.open:hover {
		color: #2bf5c0;
	}

	/* On phones the card spans the gutter and sits above the safe area. */
	@media (max-width: 640px) {
		.np {
			left: var(--gutter);
			right: var(--gutter);
			bottom: max(0.75rem, env(safe-area-inset-bottom));
			max-width: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.np {
			animation: none;
		}
		.bars i {
			animation: none;
			height: 6px;
		}
	}
</style>
