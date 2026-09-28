/**
 * Typographic glyphs that need care across platforms.
 *
 * U+2197 NORTH EAST ARROW carries Unicode's `Emoji=Yes` property, even though
 * its *default* presentation is text (`Emoji_Presentation=No`). Geist ships no
 * arrow glyphs at all — verified: no subset in @fontsource-variable/geist has
 * U+2197 — so the character always falls through to a system font. On iOS and
 * macOS that fallback lands on Apple Color Emoji, and the arrow renders as a
 * blue-and-white emoji tile instead of a hairline arrow matching the text.
 *
 * U+FE0E VARIATION SELECTOR-15 explicitly requests the text presentation,
 * which steers the fallback to a text font (SF Pro on Apple, Segoe UI Symbol
 * on Windows) and keeps the arrow inheriting colour, size and weight.
 *
 * `→` (U+2192) is unaffected because it is not an emoji character at all,
 * which is why "Send a message →" always looked right.
 */
export const ARROW_NE = '\u2197\uFE0E';
