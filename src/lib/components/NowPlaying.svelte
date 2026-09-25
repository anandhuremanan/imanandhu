<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import { kerala } from '$lib/kerala.svelte';

	/**
	 * Visitor-side view of the now-playing room. The data source and protocol
	 * are unchanged — this is purely the themed presentation of it.
	 *
	 * Read-only by construction: it authenticates as `visitor`, and the server
	 * refuses state updates from that role, so no owner credential exists
	 * anywhere in the portfolio bundle. If the worker is unreachable, or
	 * PUBLIC_NOW_PLAYING_WS is unset, the card never appears. Visitors are
	 * never shown a connection error.
	 */

	interface State {
		playing: boolean;
		title: string | null;
		artist: string | null;
		artwork: string | null;
		url: string | null;
		/** Server time of this state. Used for "last played N ago". */
		timestamp: number;
	}

	const WS_URL = env.PUBLIC_NOW_PLAYING_WS ?? '';

	/**
	 * Shown when the room is idle and we never saw a track this visit — a
	 * visitor arriving during a quiet spell. "Last played" needs a track to
	 * point at, so without one there is nothing factual to say and a flat
	 * "Not listening" reads like the widget is broken.
	 *
	 * These read as a follow-on to the "Nothing playing" label, so none of
	 * them restate the fact or repeat his name.
	 */
	const IDLE_LINES = [
		'Suspicious, frankly.',
		'He has stopped feeding the algorithm.',
		'Apparently he is doing actual work.',
		'The playlist is currently unemployed.',
		'Silence detected.',
		'The headphones are off duty.',
		'Even the shuffle gave up.'
	];

	let live = $state<State | null>(null);
	let connected = $state(false);

	/**
	 * The most recent track we actually saw playing. The server nulls every
	 * field when it goes idle, so without remembering it here there would be
	 * nothing to put behind "Last played".
	 */
	let lastTrack = $state<State | null>(null);

	const visible = $derived(Boolean(WS_URL) && connected && live !== null);
	const playing = $derived(live?.playing === true && Boolean(live.title));
	/** What the card displays: the live track, or the remembered one. */
	const shown = $derived(playing ? live : lastTrack);

	/**
	 * Reads kerala.now so it re-derives on the clock's 15s tick — no second
	 * timer just to keep "12m ago" honest.
	 */
	const since = $derived.by(() => {
		void kerala.now;
		const at = live?.timestamp;
		if (!at) return '';
		const mins = Math.floor((Date.now() - at) / 60000);
		if (mins < 1) return 'just now';
		if (mins < 60) return `${mins}m ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours}h ago`;
		return `${Math.floor(hours / 24)}d ago`;
	});

	const label = $derived(
		playing
			? `now listening · ${kerala.clock}`
			: shown
				? `Last played · ${since}`
				: `He's idle, Nothing playing`
	);

	/**
	 * Where in the list this visit starts. Picked once per page load, because
	 * deriving the joke from the clock alone meant every reload inside the same
	 * five minutes showed the same line.
	 *
	 * Set in onMount so the server and the client never disagree about it.
	 */
	let seed = $state(0);

	/**
	 * Rotates every five minutes off the clock that is already ticking — no
	 * second timer, and nothing changes fast enough to nag someone mid-read.
	 */
	const joke = $derived(IDLE_LINES[(seed + Math.floor(kerala.minutes / 5)) % IDLE_LINES.length]);

	onMount(() => {
		seed = Math.floor(Math.random() * IDLE_LINES.length);
		if (!WS_URL) return;

		let socket: WebSocket | null = null;
		let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
		let attempts = 0;
		let closed = false;

		function scheduleReconnect() {
			if (closed || reconnectTimer !== undefined) return;
			// Nobody is looking at a hidden tab; visibilitychange resumes it.
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
				let msg: { type?: string } & Partial<State>;
				try {
					msg = JSON.parse(String(event.data));
				} catch {
					return;
				}
				// Must match the server's frame type in worker/src/protocol.ts.
				if (msg.type !== 'state') return;

				connected = true;
				const next: State = {
					playing: Boolean(msg.playing),
					title: msg.title ?? null,
					artist: msg.artist ?? null,
					artwork: msg.artwork ?? null,
					url: msg.url ?? null,
					timestamp: typeof msg.timestamp === 'number' ? msg.timestamp : Date.now()
				};
				live = next;
				if (next.playing && next.title) lastTrack = next;
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

		function onVisibility() {
			if (document.visibilityState !== 'visible') return;
			attempts = 0;
			if (!socket) connect();
		}

		document.addEventListener('visibilitychange', onVisibility);
		connect();

		return () => {
			closed = true;
			document.removeEventListener('visibilitychange', onVisibility);
			if (reconnectTimer !== undefined) clearTimeout(reconnectTimer);
			const s = socket;
			socket = null;
			s?.close(1000, 'component destroyed');
		};
	});
</script>

{#if browser && visible}
	<svelte:element
		this={playing && shown?.url ? 'a' : 'div'}
		class="np"
		class:idle={!playing}
		class:bare={!shown}
		href={playing && shown?.url ? shown.url : undefined}
		target={playing && shown?.url ? '_blank' : undefined}
		rel={playing && shown?.url ? 'noopener noreferrer' : undefined}
		aria-label={shown?.title
			? `${playing ? 'Now listening' : 'Last played'}: ${shown.title}${shown.artist ? ` by ${shown.artist}` : ''}`
			: `Nothing playing. ${joke}`}
	>
		<span class="art">
			{#if shown?.artwork}
				<img src={shown.artwork} alt="" width="56" height="56" loading="lazy" />
			{/if}
			<span class="eq" aria-hidden="true">
				<i style="--dur: 0.9s; --delay: 0s"></i>
				<i style="--dur: 0.7s; --delay: -0.3s"></i>
				<i style="--dur: 1.1s; --delay: -0.6s"></i>
			</span>
		</span>

		<span class="text">
			<!-- On desktop these two collapse at rest and open on hover/focus, so
			     the resting pill is just artwork plus the track name. On mobile,
			     where there is no hover, they are always open. -->
			<span class="reveal">
				<span class="label mono">
					<span class="long">{playing ? 'Anandhu is ' : ''}</span>{label}
				</span>
			</span>

			{#if shown?.title}
				<span class="title">{shown.title}</span>
				{#if shown.artist}
					<span class="reveal">
						<span class="artist">{shown.artist}</span>
					</span>
				{/if}
			{:else}
				<span class="title joke">{joke}</span>
			{/if}
		</span>

		{#if playing && shown?.url}
			<span class="go" aria-hidden="true">↗</span>
		{/if}
	</svelte:element>
{/if}

<style>
	.np {
		position: fixed;
		z-index: 5;
		right: 12px;
		bottom: 12px;
		left: 12px;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 16px 10px 10px;
		border: 1px solid var(--line);
		border-radius: 14px;
		background: var(--card);
		color: var(--fg);
		box-shadow: 0 18px 40px -18px rgba(0, 0, 0, 0.45);
		transition:
			background 0.8s ease,
			border-color 0.8s ease,
			color 0.8s ease;
	}

	@media (min-width: 900px) {
		/*
		 * Bottom-RIGHT on desktop: the scrub slider and its label live at the
		 * far left of the home hero, and a card there covered them on load.
		 *
		 * Resting, this is a pill of just artwork + track name. Both edges that
		 * are pinned are the right and the bottom, so expanding grows the card
		 * left and up — away from the screen edges, and *around* the cursor
		 * rather than out from under it, which would flicker on the boundary.
		 */
		.np {
			right: 24px;
			bottom: 24px;
			left: auto;
			width: 220px;
			/* Spacing lives on the children, not as a flex gap: a gap is still
			   applied either side of the zero-width arrow at rest, which wasted
			   14px inside the pill and pushed the title's ellipsis in early. */
			gap: 0;
			padding: 10px 14px 10px 10px;
			border-radius: 16px;
			transition:
				width 0.35s cubic-bezier(0.22, 1, 0.36, 1),
				background 0.8s ease,
				border-color 0.8s ease,
				color 0.8s ease;
		}

		.np:hover,
		.np:focus-within {
			width: 380px;
			opacity: 1;
		}

		/*
		 * Nothing playing and no remembered track: the only content is the
		 * joke, so there is nothing for a hover to reveal except the label.
		 * A fixed 220px pill amputated the longer lines ("Apparently he is
		 * doi…"), so this state sizes to its text instead and never expands.
		 * Width is not transitioned here because `auto` cannot interpolate —
		 * it would half-animate and look broken.
		 */
		.np.bare,
		.np.bare:hover,
		.np.bare:focus-within {
			width: auto;
			max-width: 380px;
			transition:
				background 0.8s ease,
				border-color 0.8s ease,
				color 0.8s ease;
		}

		/* One line, always: it is what gives the card its width. */
		.np.bare .joke,
		.np.bare:hover .joke,
		.np.bare:focus-within .joke {
			white-space: nowrap;
		}

		/*
		 * Animating grid-template-rows gives a real height transition; the older
		 * max-height trick either clips or eases against a guessed value.
		 */
		.reveal {
			display: grid;
			grid-template-rows: 0fr;
			opacity: 0;
			transition:
				grid-template-rows 0.35s cubic-bezier(0.22, 1, 0.36, 1),
				opacity 0.2s ease;
		}

		.reveal > * {
			min-height: 0;
			overflow: hidden;
		}

		/*
		 * The label must never wrap mid-transition.
		 *
		 * "Anandhu is now listening · 13:30" does not fit the narrow resting
		 * pill, so it used to wrap to two lines and un-wrap partway through the
		 * expansion. The card's height therefore depended on its width, and it
		 * overshot by ~11px and snapped back in a single frame. Pinning it to
		 * one line makes the height change monotonic; it simply stays clipped
		 * by .reveal's overflow until there is room for it.
		 */
		.label {
			white-space: nowrap;
		}

		.np:hover .reveal,
		.np:focus-within .reveal {
			grid-template-rows: 1fr;
			opacity: 1;
		}

		.art {
			margin-right: 14px;
		}

		/* The arrow takes no width *and* no margin until the card is open. */
		.go {
			width: 0;
			margin-left: 0;
			opacity: 0;
			overflow: hidden;
			transition:
				width 0.35s cubic-bezier(0.22, 1, 0.36, 1),
				margin-left 0.35s cubic-bezier(0.22, 1, 0.36, 1),
				opacity 0.2s ease;
		}

		.np:hover .go,
		.np:focus-within .go {
			width: 16px;
			margin-left: 14px;
			opacity: 1;
		}
	}

	/* ---- artwork + equaliser ---- */
	.art {
		position: relative;
		flex-shrink: 0;
		width: 44px;
		height: 44px;
		overflow: hidden;
		border-radius: 8px;
		background: var(--line);
		transition: background 0.8s ease;
	}

	@media (min-width: 900px) {
		.art {
			width: 48px;
			height: 48px;
		}
	}

	.art img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.eq {
		position: absolute;
		bottom: 6px;
		left: 6px;
		display: flex;
		height: 14px;
		align-items: flex-end;
		gap: 2px;
	}

	.eq i {
		display: block;
		width: 3px;
		height: 14px;
		background: var(--accent);
		transform-origin: bottom;
		animation: eq var(--dur) ease-in-out var(--delay) infinite alternate;
		transition: background 0.8s ease;
	}

	@keyframes eq {
		from {
			transform: scaleY(0.25);
		}
		to {
			transform: scaleY(1);
		}
	}

	/* Idle: the bars stay, but they stop moving. */
	.idle .eq i {
		animation: none;
		transform: scaleY(0.35);
	}

	/* ---- text ---- */
	.text {
		display: flex;
		min-width: 0;
		flex-grow: 1;
		flex-direction: column;
		gap: 2px;
	}

	@media (min-width: 900px) {
		.text {
			gap: 3px;
		}
	}

	.label {
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
	}

	/* "Anandhu is now listening" is too wide for a phone; "Now listening" is not. */
	.long {
		display: none;
	}

	@media (min-width: 900px) {
		.long {
			display: inline;
		}
	}

	.title,
	.artist {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.title {
		font-size: 15px;
		font-weight: 500;
	}

	.artist {
		font-size: 13px;
		color: var(--muted);
	}

	@media (min-width: 900px) {
		.title {
			font-size: 16px;
		}
		.artist {
			font-size: 14px;
		}
	}

	.idle .title,
	.idle .artist {
		color: var(--muted);
	}

	/* A whole sentence, not a track title. On mobile there is width for it to
	   wrap; in the resting desktop pill there is not, so it ellipsises until
	   the card opens. */
	.joke {
		white-space: normal;
		font-weight: 400;
		line-height: 1.35;
	}

	@media (min-width: 900px) {
		.joke {
			white-space: nowrap;
		}

		.np:hover .joke,
		.np:focus-within .joke {
			white-space: normal;
		}
	}

	.go {
		flex-shrink: 0;
		font-size: 16px;
		color: var(--muted);
	}

	/* The global reduce rule already zeroes durations; this makes sure the
	   collapsed state is never left half-open when transitions are off. */
	@media (prefers-reduced-motion: reduce) {
		.reveal {
			grid-template-rows: 1fr;
			opacity: 1;
		}

		.go {
			width: auto;
			margin-left: 14px;
			opacity: 1;
		}
	}
</style>
