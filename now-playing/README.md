# Now Playing

Shows what I am currently listening to on YouTube Music, live, on the portfolio.

```
YouTube Music tab (music.youtube.com)
  │  MAIN-world content script reads navigator.mediaSession + <video>
  ▼
Chrome extension service worker  ──── one WebSocket, authenticated as "owner"
  ▼
Cloudflare Worker  /ws
  ▼
One Durable Object  ("portfolio-now-playing")
  ▼
Portfolio visitors  ──── many WebSockets, authenticated as "visitor" (read-only)
```

No database. No listening history. The Durable Object is the only stateful
component, and it holds exactly one small object.

---

## Layout

```
now-playing/
  worker/                 Cloudflare Worker + Durable Object
    src/protocol.ts       wire types, validation, sanitisation  (pure)
    src/room.ts           all room logic                        (pure, unit-tested)
    src/durable-object.ts Workers runtime adapter (hibernation + alarms)
    src/index.ts          /ws routing, origin check
    test/room.test.ts     26 tests
    wrangler.jsonc
  extension/              Manifest V3 Chrome extension
    src/youtubeMusic.ts   MAIN-world player extractor
    src/content.ts        ISOLATED-world bridge
    src/background.ts     service worker: owns the WebSocket
    src/snapshot.ts       shared, side-effect-free types
    src/options.ts        settings + status UI
    public/               manifest.json, options.html
```

The portfolio side is one component: `src/lib/components/NowPlaying.svelte`,
mounted in `src/routes/+layout.svelte`.

Both sub-projects are **independent npm projects**, deliberately not workspaces —
otherwise Vercel's root `npm install` would pull `wrangler` and `esbuild` into
the portfolio build.

---

## Protocol

Owner → server:

```jsonc
{ "type": "auth", "role": "owner", "token": "…" }
{ "type": "now_playing", "playing": true, "title": "…", "artist": "…",
  "album": "…", "artwork": "…", "url": "…", "timestamp": 123 }
{ "type": "heartbeat", "timestamp": 123 }
```

Visitor → server:

```jsonc
{ "type": "auth", "role": "visitor" }
```

Server → client:

```jsonc
{ "type": "auth_ok", "role": "visitor", "heartbeatIntervalMs": 0 }
{ "type": "state", "playing": true, "title": "…", "artist": "…", "album": "…",
  "artwork": "…", "url": "…", "timestamp": 123 }
{ "type": "state", "playing": false, "title": null, /* … */ "timestamp": 123 }
{ "type": "error", "code": "forbidden", "message": "…" }
```

Error codes: `bad_json`, `too_large`, `bad_message`, `unauthorized`,
`not_authenticated`, `forbidden`, `replaced`.
Close codes: `4001` unauthorized, `4002` replaced.

Constants live in `worker/src/protocol.ts`:

| Constant                | Value | Meaning                                 |
| ----------------------- | ----- | --------------------------------------- |
| `HEARTBEAT_INTERVAL_MS` | 20s   | how often the extension pings           |
| `OWNER_TIMEOUT_MS`      | 60s   | silence after which state goes inactive |
| `MAX_MESSAGE_BYTES`     | 4096  | frames larger than this are dropped     |
| `MAX_TEXT_LEN`          | 300   | title/artist/album truncation           |

---

## Decided behaviours

**Duplicate owners.** Only one authenticated owner at a time. Authenticating a
second owner sends `{"code":"replaced"}` to the first and closes it with 4002.
The newest connection always wins, so a reconnecting laptop is never locked out
by its own half-dead socket. When a _replaced_ socket's close event arrives
later, the room checks for a surviving owner before blanking state.

**Server clock wins.** The broadcast `timestamp` is always server time, even
though the owner sends one. Staleness depends on it, so a wrong clock on the
laptop must not be able to skew it.

**Stale owner.** Every owner message re-arms a Durable Object alarm at
`lastSeen + 60s`. If it fires with no owner, or with a stale one, the room
broadcasts `playing: false`. A visitor connecting during the gap between the
owner vanishing and the alarm firing is _also_ given the idle state, so a stale
track can never be served.

**Paused.** Reported as `playing: false` with all track fields nulled — the
portfolio shows an idle message rather than a greyed-out song.

**Owner online with nothing to report.** The extension publishes an explicit
idle state the moment it authenticates, even when no YouTube Music tab has ever
reported a track. This matters because an authenticated owner suppresses the
server's staleness timeout: if it connected and stayed silent, the room would
stay pinned to whatever was published last, and the banner would show a stale
track for as long as the browser was open.

**Content scripts are built as IIFE, never ESM.** Chrome injects content
scripts as classic scripts, so a top-level `export` is a SyntaxError and the
file silently never runs — the extension connects normally and simply never
reports a track, which points nowhere near the build config. `build.mjs` splits
the entry points by format and then compiles each content script with
`new vm.Script` to prove it parses as a classic script before the build passes.

**Visitors are read-only.** Enforced server-side: a `now_playing` frame from a
visitor is answered with `forbidden` and changes nothing.

---

## Local development

Three terminals.

**1. Worker**

```bash
cd now-playing/worker
npm install
cp .dev.vars.example .dev.vars     # then edit OWNER_TOKEN
npm run dev                        # http://127.0.0.1:8787
```

`.dev.vars` is git-ignored. `curl http://127.0.0.1:8787/health` should return
`{"ok":true,...}`.

**2. Extension**

```bash
cd now-playing/extension
npm install
npm run watch                      # or: npm run build
```

Then in Chrome:

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. **Load unpacked** → select `now-playing/extension/dist`
4. Click the extension icon to open settings and set:
   - **Worker WebSocket URL**: `ws://127.0.0.1:8787/ws`
   - **Owner token**: the same value you put in `.dev.vars`
5. Press **Save**. The dot turns green when connected.

After `npm run watch` rebuilds, press the reload arrow on the extension card in
`chrome://extensions` — Chrome does not hot-reload service workers.

**3. Portfolio**

```bash
npm run dev                        # repo root, http://localhost:5173
```

Create `.env.local` in the repo root:

```
PUBLIC_NOW_PLAYING_WS=ws://127.0.0.1:8787/ws
```

Without this variable the component renders nothing at all — that is the
intended fallback, not a bug.

---

## Tests

```bash
cd now-playing/worker
npm test          # 26 unit tests over the pure room logic
npm run typecheck
```

Covered: owner auth success/failure, visitor auth, visitor write refusal,
unauthenticated write refusal, broadcast to visitors, initial state for late
joiners, stale-owner timeout, heartbeat keeping state alive, clean disconnect,
malformed JSON, oversized frames, unknown types, artwork host allowlisting,
`javascript:` URL stripping, title truncation, owner replacement, replaced-socket
close races, owner reconnection, pause.

---

## Going to production

Three systems, in this order: **Cloudflare → extension → Vercel**. The order
matters, because each step produces something the next one needs. Allow about
fifteen minutes and do the checkpoints — most of this is silent when it goes
wrong.

Throughout, `<sub>` means your own Cloudflare workers.dev subdomain. You will
learn it in step 3.

### Before you start

- A Cloudflare account. The free plan is enough: this Worker uses a
  SQLite-backed Durable Object, which is included on the free tier. (Confirm
  against Cloudflare's current pricing if you want certainty — plans change.)
- Your portfolio already live on Vercel.
- Local development working, so you know the code itself is fine.

---

### Step 1 — Log in to Cloudflare

```bash
cd now-playing/worker
npx wrangler login
```

A browser opens; authorise it.

**Checkpoint:** `npx wrangler whoami` prints your account. If it says you are
not authenticated, repeat this step before going further.

---

### Step 2 — Set your live origin

Open `wrangler.jsonc` and edit `ALLOWED_ORIGINS` so it lists exactly the
origin(s) your portfolio is served from:

```jsonc
"ALLOWED_ORIGINS": "https://imanandhu.in,https://www.imanandhu.in"
```

Rules that trip people up:

- Scheme **and** host, nothing else. No trailing slash, no path.
- `https://imanandhu.in` and `https://www.imanandhu.in` are **different
  origins**. List whichever ones actually serve the site; delete the other.
- You do not need to add localhost. Loopback origins are always allowed.

Get this wrong and visitors' sockets are rejected with a 403, the card never
appears, and nothing on the page says why.

---

### Step 3 — Deploy the Worker

```bash
npx wrangler deploy
```

The last line of the output is your Worker URL:

```
https://now-playing.<sub>.workers.dev
```

**Write it down.** Everything after this needs it.

**Checkpoint:**

```bash
curl https://now-playing.<sub>.workers.dev/health
# {"ok":true,"room":"portfolio-now-playing"}
```

Owner authentication rejects everything at this point, because no token exists
yet. That is expected, and it is the safe direction to fail in.

---

### Step 4 — Create the owner token

Generate one:

```bash
node -e "console.log(crypto.randomUUID())"
```

Save it in your password manager — you need it again in step 5, and it is not
recoverable from Cloudflare afterwards. Then:

```bash
npx wrangler secret put OWNER_TOKEN
```

Paste it at the prompt. Secrets take effect immediately; **no redeploy needed.**

**Checkpoint:** `npx wrangler secret list` shows `OWNER_TOKEN`.

Do not reuse your local `.dev.vars` value. That one has sat in a file in plain
text.

---

### Step 5 — Point the extension at production

Open `chrome://extensions`, find the extension, click **Details → Extension
options** (or just click the extension's icon). Change:

| Field                | Value                                    |
| -------------------- | ---------------------------------------- |
| Worker WebSocket URL | `wss://now-playing.<sub>.workers.dev/ws` |
| Owner token          | the UUID from step 4                     |

Two things to get right:

- **`wss://`**, not `ws://`. A browser on an HTTPS page refuses an insecure
  socket, and `https://` is not a valid WebSocket scheme either.
- **`/ws` on the end.** The bare domain returns 404.

Press **Save**. The dot turns green.

**Checkpoint:** play something on music.youtube.com, then reopen the options
page. It should read `Publishing: <song title>`.

---

### Step 6 — Tell the portfolio where to look

In the Vercel dashboard: **your project → Settings → Environment Variables →
Add New**.

| Field        | Value                                        |
| ------------ | -------------------------------------------- |
| Name         | `PUBLIC_NOW_PLAYING_WS`                      |
| Value        | `wss://now-playing.<sub>.workers.dev/ws`     |
| Environments | tick Production, Preview **and** Development |

Save.

---

### Step 7 — Redeploy the portfolio

**This step is not optional and it is the one people skip.** Environment
variables are read at build time, so your live site will keep behaving as if
the variable does not exist until you build again.

Either: **Deployments → ⋯ on the newest one → Redeploy**, or push a commit.

---

### Step 8 — Verify

1. Play a song on YouTube Music.
2. Open your live site in a normal window.
3. The card appears bottom-left within a second or two.

Then close YouTube Music entirely and watch it switch to the idle message
within about a minute. That proves the whole loop, not just the happy path.

---

### If the card does not appear

The visitor side fails silently on purpose — a stranger on your site should
never see a connection error — so nothing will tell you what is wrong. Work
down this list in order:

| Check                             | How                                                                     |
| --------------------------------- | ----------------------------------------------------------------------- |
| Is the Worker alive?              | `curl https://now-playing.<sub>.workers.dev/health`                     |
| Is the extension connected?       | Extension options — the dot should be green                             |
| Did the portfolio actually build? | View source on the live page, search for `PUBLIC_NOW_PLAYING_WS`        |
| Is the socket opening?            | DevTools → Network → **WS** filter → reload. Look for `/ws`             |
| Is it a 403?                      | Then `ALLOWED_ORIGINS` does not match your live origin exactly (step 2) |
| `ws://` instead of `wss://`?      | The console will complain about mixed content                           |
| Worker-side errors?               | `npx wrangler tail` while you reload the page                           |

A 403 on the WS request and a missing `PUBLIC_NOW_PLAYING_WS` look identical
from the outside: no card, no error. Check both.

---

### Afterwards

```bash
npx wrangler tail            # live logs, very useful while debugging
npx wrangler deploy          # ship worker code changes
npx wrangler secret put OWNER_TOKEN   # rotate the token
```

Rotating the token takes effect immediately, so the extension will show
**Error — owner token rejected** until you paste the new value into its options
page. That is the system working correctly.

### Optional: a custom domain

If you would rather use `wss://nowplaying.imanandhu.in/ws`, add a route in
`wrangler.jsonc`, redeploy, then update both the extension URL and the Vercel
variable. Nothing else changes.

### What it costs

One person listening to music, and however many people read your portfolio,
is a very small amount of traffic — a personal site sits comfortably inside
Cloudflare's free tier. Durable Object billing counts both requests and
connection duration, so if your site ever gets genuinely popular, check the
current pricing rather than assuming.

### Where each secret lives

| Thing                   | Where it lives                 | In git? |
| ----------------------- | ------------------------------ | ------- |
| `OWNER_TOKEN` (prod)    | Cloudflare secret store        | no      |
| `OWNER_TOKEN` (local)   | `now-playing/worker/.dev.vars` | no      |
| Owner token (client)    | `chrome.storage.local`         | no      |
| `ALLOWED_ORIGINS`       | `wrangler.jsonc`               | yes     |
| `PUBLIC_NOW_PLAYING_WS` | Vercel env var, `.env.local`   | no      |

The owner token exists only in Cloudflare's secret store and in your browser's
extension storage. It is never in source control, and never in the portfolio
bundle that visitors download.

---

## Security notes

- **Owner token** compared in constant time; a wrong token closes the socket and
  the extension stops retrying (a bad token will not fix itself).
- **Origin check** on the `/ws` upgrade. Defence in depth only — a non-browser
  client can send any `Origin`. `chrome-extension://` is always allowed.
- **Message size** checked before `JSON.parse`, so oversized frames are never
  parsed.
- **Artwork URLs** must be `https:` and on a known YouTube/Google CDN host.
  Anything else has the field dropped rather than the update rejected, so a
  compromised extension cannot point visitors' browsers at an arbitrary origin.
- **Track URLs** must be `https:` on a YouTube host. `javascript:` and `data:`
  are rejected by the protocol check.
- **Control characters** stripped from all text; every field length-capped.
- **Visitors** are read-only server-side, and the portfolio bundle contains no
  credential of any kind.

---

## Manual test checklist

1. Open YouTube Music, start a song → extension dot goes green.
2. Open the portfolio → card appears with title, artist, artwork.
3. Change song → card updates within about a second.
4. Pause → card switches to an idle message.
5. Resume → track returns.
6. Open the portfolio in a second tab/browser → both show the same track.
7. Open a second YouTube Music tab → still exactly one track, no flicker.
8. Close YouTube Music entirely → idle message appears.
9. Stop the worker (`Ctrl-C`) → card disappears; visitors see no error.
10. Restart the worker → extension and portfolio both reconnect on their own.
11. Turn Wi-Fi off and on → reconnects with backoff.
12. Reload the extension in `chrome://extensions` mid-song → track reappears
    without waiting for the next song change.
13. Set a wrong owner token → status shows `Error`, portfolio goes idle within 60s.
14. Load the portfolio with `PUBLIC_NOW_PLAYING_WS` unset → no card, no console
    errors.

---

## Limitations

**YouTube Music DOM fragility.** The primary source is
`navigator.mediaSession.metadata`, which is an API contract YouTube must keep
working for OS media keys — far more durable than CSS selectors. Playback state
comes from the `<video>` element. The `ytmusic-player-bar` selectors are a third
fallback used only for fields the first two did not supply, and the album name is
the most likely thing to break, since it is parsed out of a `•`-separated byline.
If a YouTube Music update breaks something, `src/youtubeMusic.ts` is the only
file to touch. A failure there degrades to "no album" or "idle", never to a crash.

**MV3 service worker lifetime.** Chrome can terminate the service worker. Since
Chrome 116 WebSocket activity resets the idle timer, so the 20-second heartbeat
keeps it alive; a `chrome.alarms` entry every 30 seconds revives it if Chrome
tears it down anyway. Both are comfortably inside the 60-second owner timeout,
but on an older Chrome the banner may briefly go idle between songs.

**Durable Object hibernation.** The object is evicted from memory when idle, so
state is rehydrated from its own transactional storage on every wake. This is
why the room state is written to `ctx.storage` rather than kept purely in
instance fields — a purely in-memory implementation would silently lose the
current track. Alarms and storage together are also what avoid needing any
external scheduler.

**Cold starts.** The first visitor after a quiet period pays a few hundred
milliseconds while the Durable Object wakes.

**Single room, single owner.** By design. Two laptops fight over the owner slot;
the most recent connection wins.

**Alarm vs. a live owner.** Every owner message re-arms the alarm 60s forward,
so with a heartbeating extension connected the alarm legitimately never fires.
An idle room is reached by the extension publishing `playing: false`, not by the
timeout. The timeout only covers an owner that vanishes without closing cleanly.

**Not end-to-end tested:** the 60-second alarm path. It is covered by unit tests
(`stale owner` block) and by a live disconnect test, but abruptly severing a
socket without a close frame is not reproducible from a test client.
