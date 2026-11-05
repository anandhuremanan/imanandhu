<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import { kerala } from '$lib/kerala.svelte';
	import { ARROW_NE } from '$lib/glyphs';

	/**
	 * Visitor-side view of the now-playing room. The data source and protocol
	 * are unchanged — this is purely the themed presentation of it.
	 *
	 * Read-only by construction: it authenticates as `visitor`, and the server
	 * refuses state updates from that role, so no owner credential exists
	 * anywhere in the portfolio bundle. If the worker is unreachable, or
	 * PUBLIC_NOW_PLAYING_WS is unset, the card never appears. Visitors are
	 * never shown a connection error.
	 *
	 * Two shapes:
	 *   desktop (>=900px) — a pill that widens on hover or focus
	 *   mobile  (<900px)  — a small tap-to-expand FAB that closes on scroll
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

	/** How far you have to scroll before an expanded card gets out of the way. */
	const SCROLL_TO_CLOSE = 40;
	/** How long the card shows itself once, on first appearance. */
	const PEEK_MS = 5000;

	/**
	 * How long to wait before admitting we are still connecting.
	 *
	 * A socket that opens in 150ms would otherwise flash a loader and replace
	 * it immediately, which reads worse than the brief gap it was meant to
	 * fill. Below this, the card simply appears with its content.
	 */
	const WAIT_BEFORE_LOADER_MS = 350;

	/**
	 * When to stop waiting and show nothing at all.
	 *
	 * The card has always failed silently — a visitor is never shown a
	 * connection error — so a loader that spins forever against a dead worker
	 * would break that promise rather than keep it.
	 */
	const GIVE_UP_MS = 6000;

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
	 * The most recent track seen playing during this visit.
	 *
	 * The server now keeps the track when playback stops, so "Last played"
	 * works for someone arriving cold. This stays as a fallback for the gap
	 * where a stopped frame has not arrived yet.
	 */
	let lastTrack = $state<State | null>(null);

	/** Under 900px the card is a FAB; above it, hover drives the expansion. */
	let narrow = $state(false);
	let expanded = $state(false);
	/** Plain locals: changing these must not re-run the effects that set them. */
	let peeked = false;
	let reduced = false;

	/** True once a real state frame has arrived and there is content to show. */
	const ready = $derived(Boolean(WS_URL) && connected && live !== null);

	/** Set after WAIT_BEFORE_LOADER_MS if nothing has arrived; cleared on give-up. */
	let waiting = $state(false);

	/** The card is on screen either because it has content, or while it waits. */
	const visible = $derived(ready || waiting);
	const playing = $derived(live?.playing === true && Boolean(live.title));
	/**
	 * What the card displays. A stopped frame still carries its track, so it
	 * is preferred over the one remembered from earlier in the visit.
	 */
	const shown = $derived(live?.title ? live : lastTrack);
	/** Only a playing track is worth linking to. */
	const linkHref = $derived(playing && shown?.url ? shown.url : null);
	const collapsed = $derived(narrow && !expanded);

	/**
	 * No elapsed time on the last-played state. "Last played · 3d ago" reads
	 * as abandoned, and without a visible age the track never goes stale —
	 * which is also why it needs no expiry on the server.
	 */
	const label = $derived(
		waiting
			? 'one moment'
			: playing
				? `now listening · ${kerala.clock}`
				: shown
					? 'last played'
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

	/** What the expanded card announces. */
	const cardLabel = $derived(
		waiting
			? 'Checking what is playing'
			: shown?.title
				? `Anandhu ${playing ? 'is now listening to' : 'last played'}: ${shown.title}${shown.artist ? ` by ${shown.artist}` : ''}`
				: `Nothing playing. ${joke}`
	);

	/** What the collapsed FAB announces — it is a control, so it says so. */
	const tapLabel = $derived(
		waiting
			? 'Checking what is playing'
			: shown?.title
				? `${playing ? 'Now listening' : 'Last played'}: ${shown.title}. Show details.`
				: 'Nothing playing. Show why.'
	);

	/**
	 * Show the card once when it first appears, then get out of the way.
	 * Without this the FAB is only an album thumbnail, and most visitors would
	 * never discover it does anything.
	 */
	$effect(() => {
		// Keyed on `ready`, not `visible`: peeking at a loader would show an
		// empty card and then collapse just as the track arrived.
		if (!ready || !narrow || peeked) return;
		peeked = true;
		if (reduced) return;
		expanded = true;
		const id = setTimeout(() => (expanded = false), PEEK_MS);
		return () => clearTimeout(id);
	});

	/**
	 * Scrolling means "I've moved on", in either direction — on a short page
	 * there may be nowhere to scroll down to. The threshold stops a stray
	 * nudge from snapping it shut while it is being read.
	 */
	$effect(() => {
		if (!expanded || !narrow) return;
		const from = window.scrollY;
		const onScroll = () => {
			if (Math.abs(window.scrollY - from) > SCROLL_TO_CLOSE) expanded = false;
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	onMount(() => {
		seed = Math.floor(Math.random() * IDLE_LINES.length);

		const narrowQuery = window.matchMedia('(max-width: 899px)');
		const syncNarrow = () => (narrow = narrowQuery.matches);
		syncNarrow();
		narrowQuery.addEventListener('change', syncNarrow);
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		let socket: WebSocket | null = null;
		let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
		let attempts = 0;
		let closed = false;

		// Raise the loader only if the first frame is slow, and retire it if it
		// never comes. Both are cleared in the teardown below.
		const raise = setTimeout(() => {
			if (live === null) waiting = true;
		}, WAIT_BEFORE_LOADER_MS);
		const giveUp = setTimeout(() => {
			if (live === null) waiting = false;
		}, GIVE_UP_MS);

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
				waiting = false;
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
			narrowQuery.removeEventListener('change', syncNarrow);
			document.removeEventListener('visibilitychange', onVisibility);
			if (reconnectTimer !== undefined) clearTimeout(reconnectTimer);
			clearTimeout(raise);
			clearTimeout(giveUp);
			const s = socket;
			socket = null;
			s?.close(1000, 'component destroyed');
		};
	});
</script>

{#if browser && visible}
	<!--
		The outer box is what animates, so it has to survive the expand. The tap
		target is an overlay rather than the card itself: swapping the card
		between <button> and <a> would destroy and rebuild the element, and the
		size transition would never run.
	-->
	<div
		class="np"
		class:idle={!playing}
		class:bare={!shown && !waiting}
		class:waiting
		class:open={expanded}
	>
		<svelte:element
			this={linkHref ? 'a' : 'div'}
			class="inner"
			href={linkHref ?? undefined}
			target={linkHref ? '_blank' : undefined}
			rel={linkHref ? 'noopener noreferrer' : undefined}
			aria-label={linkHref ? cardLabel : undefined}
			inert={collapsed || undefined}
		>
			<span class="art">
				{#if shown?.artwork}
					<img src={shown.artwork} alt="" width="56" height="56" loading="lazy" />
				{/if}
				<!-- Stands in for the artwork when there is no track to show one for.
				     Not while waiting: the equalizer is the indicator there. -->
				{#if !waiting}
					<span class="mark" aria-hidden="true">!</span>
				{/if}
				<span class="eq" aria-hidden="true">
					<i style="--dur: 0.9s; --delay: 0s"></i>
					<i style="--dur: 0.7s; --delay: -0.3s"></i>
					<i style="--dur: 1.1s; --delay: -0.6s"></i>
				</span>
			</span>

			<span class="text">
				<!-- On desktop these two collapse at rest and open on hover or focus,
				     so the resting pill is just artwork plus the track name. -->
				<span class="reveal">
					<span class="label mono">
						<!-- Says whose listening it is without a trailing "by him". The
						     prefix is hidden on narrow screens, leaving just the label. -->
						<span class="long">{playing ? 'Anandhu is ' : shown ? 'Anandhu ' : ''}</span
						>{label}
					</span>
				</span>

				{#if shown?.title}
					<span class="title">{shown.title}</span>
					{#if shown.artist}
						<span class="reveal">
							<span class="artist">{shown.artist}</span>
						</span>
					{/if}
				{:else if waiting}
					<!-- The equalizer is already doing the work; this just gives the
					     card a line of text so it is not an empty box. -->
					<span class="title dim">Checking…</span>
				{:else}
					<span class="title joke">{joke}</span>
				{/if}
			</span>

			{#if linkHref}
				<span class="go" aria-hidden="true">{ARROW_NE}</span>
			{/if}
		</svelte:element>

		{#if collapsed}
			<button
				class="hit"
				type="button"
				aria-expanded="false"
				aria-label={tapLabel}
				onclick={() => (expanded = true)}
			></button>
		{/if}
	</div>
{/if}

<style>
	.np {
		position: fixed;
		z-index: 5;
		right: 12px;
		bottom: 12px;
		left: 12px;
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

	.inner {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 16px 10px 10px;
		color: inherit;
		text-decoration: none;
	}

	/* Fills the collapsed card so the whole 56px square is one tap target. */
	.hit {
		position: absolute;
		z-index: 1;
		inset: 0;
		padding: 0;
		border: 0;
		border-radius: inherit;
		background: none;
		appearance: none;
	}

	/* ============================================================
	   Mobile: a FAB that expands on tap and closes on scroll
	   ============================================================ */
	@media (max-width: 899px) {
		.np {
			/* max-* rather than width/height: both ends are lengths, so the
			   expansion interpolates. `auto` would not animate at all. */
			overflow: hidden;
			max-width: 100%;
			/*
			 * Deliberately close to the tallest this card can actually be
			 * (~97px: label + title + artist, every one of them single-line).
			 * A generous ceiling like 240px is worse, not safer — max-height
			 * would clear the real content height within the first frame or
			 * two, so the box would snap to full height and only the width
			 * would ease. Kept tight, the height eases for most of the run.
			 */
			max-height: 120px;
			margin-left: auto;
			transition:
				max-width 0.32s cubic-bezier(0.22, 1, 0.36, 1),
				max-height 0.32s cubic-bezier(0.22, 1, 0.36, 1),
				background 0.8s ease,
				border-color 0.8s ease,
				color 0.8s ease;
		}

		/*
		 * `margin-left: auto` stays on in BOTH states, and that is load-bearing.
		 * left and right are both pinned, so the auto margin absorbs whatever
		 * max-width does not use and holds the box against the right edge.
		 * Setting it only while collapsed made the card teleport 310px to the
		 * left the instant `.open` landed, and then grow rightward — the exact
		 * opposite of expanding toward the left.
		 */
		.np:not(.open) {
			max-width: 56px;
			max-height: 56px;
		}

		.np:not(.open) .inner {
			padding: 6px;
		}

		.np:not(.open) .text,
		.np:not(.open) .go {
			display: none;
		}

		/* Nothing playing and nothing remembered: there is no artwork, so the
		   mark stands in and the bars step aside. */
		.np.bare:not(.open) .eq {
			display: none;
		}

		.np.bare:not(.open) .mark {
			display: grid;
		}
	}

	/* ============================================================
	   Desktop: a pill that widens on hover or focus
	   ============================================================ */
	@media (min-width: 900px) {
		/*
		 * Bottom-RIGHT: the scrub slider and its label live at the far left of
		 * the home hero, and a card there covered them on load.
		 *
		 * Resting, this is a pill of just artwork + track name. The pinned
		 * edges are the right and the bottom, so expanding grows the card left
		 * and up — away from the screen edges, and *around* the cursor rather
		 * than out from under it, which would flicker on the boundary.
		 */
		.np {
			right: 24px;
			bottom: 24px;
			left: auto;
			width: 220px;
			border-radius: 16px;
			transition:
				width 0.35s cubic-bezier(0.22, 1, 0.36, 1),
				background 0.8s ease,
				border-color 0.8s ease,
				color 0.8s ease;
		}

		.inner {
			/* Spacing lives on the children, not as a flex gap: a gap is still
			   applied either side of the zero-width arrow at rest, which wasted
			   14px inside the pill and pushed the title's ellipsis in early. */
			gap: 0;
			padding: 10px 14px 10px 10px;
		}

		.np:hover,
		.np:focus-within {
			width: 380px;
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

	/* ============================================================
	   Pieces
	   ============================================================ */
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

	/* Hidden unless the mobile FAB is collapsed with nothing to show. */
	.mark {
		display: none;
		place-items: center;
		width: 100%;
		height: 100%;
		font-size: 22px;
		font-weight: 500;
		line-height: 1;
		color: var(--accent);
		transition: color 0.8s ease;
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

	/*
	 * Waiting. Deliberately not the playing bounce: that would claim music is
	 * on before we know. These travel left to right at one steady rate, which
	 * reads as a progress cue rather than a level meter.
	 *
	 * `.np.waiting` outranks `.idle .eq i` above, which would otherwise freeze
	 * them — a waiting card is also a non-playing one.
	 */
	.np.waiting .eq i {
		animation: wait 1.1s ease-in-out var(--wait-delay, 0s) infinite;
		background: var(--muted);
		transform: scaleY(0.3);
	}

	.np.waiting .eq i:nth-child(2) {
		--wait-delay: 0.15s;
	}

	.np.waiting .eq i:nth-child(3) {
		--wait-delay: 0.3s;
	}

	@keyframes wait {
		0%,
		100% {
			transform: scaleY(0.3);
			opacity: 0.5;
		}
		50% {
			transform: scaleY(0.85);
			opacity: 1;
		}
	}

	/* The waiting line is a status, not content. */
	.dim {
		color: var(--muted);
	}

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

	/*
	 * Never wraps, on either breakpoint.
	 *
	 * A wrapping label makes the card's height depend on its width, so both
	 * expansions overshot and snapped back mid-flight — 11px on desktop, 36px
	 * on mobile. Pinned to one line the height change is monotonic; the label
	 * simply stays clipped until there is room for it.
	 */
	.label {
		overflow: hidden;
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		white-space: nowrap;
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

	/* A whole sentence, not a track title, so it may wrap on a phone. */
	.joke {
		white-space: normal;
		font-weight: 400;
		line-height: 1.35;
	}

	@media (max-width: 899px) {
		/*
		 * Exactly two lines, always — the last thing whose height could depend
		 * on the card's width. Left free, the joke wrapped to several lines
		 * while the card was narrow and un-wrapped as it grew, so the box
		 * overshot by 20px near the end of the expansion and dropped back in a
		 * single frame. Every joke fits within two lines at full width.
		 */
		.joke {
			height: 2.7em;
		}
	}

	.go {
		flex-shrink: 0;
		font-size: 16px;
		color: var(--muted);
	}

	/* The global reduce rule already zeroes durations; this makes sure nothing
	   is left half-open when transitions are off. */
	@media (prefers-reduced-motion: reduce) {
		/* Hold the bars at a readable height instead of pulsing them. The card
		   still says "Checking…", so the state is not lost. */
		.np.waiting .eq i {
			animation: none;
			transform: scaleY(0.6);
			opacity: 1;
		}

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
