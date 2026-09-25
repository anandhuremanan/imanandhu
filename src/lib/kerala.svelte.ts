import { browser } from '$app/environment';
import {
	activeCraft,
	contactNote,
	doingLong,
	doingShort,
	formatClock,
	istMinutes,
	themeFor,
	type Doing,
	type ThemeKey
} from './kerala';
import { PAINT_URL, MUSIC_URL, STORIES_URL } from './data/projects';

/**
 * The single source of "what time is it in Kerala" for the whole site.
 *
 * Exported as a class instance rather than loose `$state` because a plain
 * exported `let` loses its reactivity across the module boundary — the
 * importing module would bind the value once and never see updates.
 *
 * `scrub` is the home page's slider. While it is set, the entire site
 * (including the theme) previews that hour instead of the real one.
 */
class KeralaClock {
	/** Real IST minutes, refreshed on an interval. */
	now = $state(istMinutes());
	/** Previewed minutes from the home slider, or null for "now". */
	scrub = $state<number | null>(null);

	get minutes(): number {
		return this.scrub ?? this.now;
	}
	get hour(): number {
		return Math.floor(this.minutes / 60);
	}
	get clock(): string {
		return formatClock(this.minutes);
	}
	get theme(): ThemeKey {
		return themeFor(this.hour);
	}
	get scrubbing(): boolean {
		return this.scrub !== null;
	}
	get doing(): Doing {
		return doingLong(this.hour, { paint: PAINT_URL, music: MUSIC_URL, stories: STORIES_URL });
	}
	get doingShort(): string {
		return doingShort(this.hour);
	}
	get note(): string {
		return contactNote(this.hour);
	}
	get craft(): 'paint' | 'music' | 'stories' | null {
		return activeCraft(this.hour);
	}

	reset() {
		this.scrub = null;
	}
}

export const kerala = new KeralaClock();

/**
 * Starts the clock and keeps `<html data-theme>` in step with it.
 *
 * The server already set the correct `data-theme`, so this only ever has to
 * correct it when the minute rolls over or the slider moves. Returns a
 * teardown for the layout's onMount.
 */
export function startClock(): () => void {
	if (!browser) return () => {};

	const tick = () => (kerala.now = istMinutes());
	tick();

	// 15s is fine: the clock only shows minutes, and a whole extra tick of
	// staleness is invisible next to the 0.8s theme transition.
	const id = setInterval(tick, 15_000);

	// Re-sync immediately on return — a backgrounded tab throttles timers, so a
	// laptop reopened hours later would otherwise show a stale hour.
	const onVisible = () => document.visibilityState === 'visible' && tick();
	document.addEventListener('visibilitychange', onVisible);

	return () => {
		clearInterval(id);
		document.removeEventListener('visibilitychange', onVisible);
	};
}
