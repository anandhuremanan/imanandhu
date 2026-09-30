# Contact form

Browser → Cloudflare Worker → Resend → your inbox. No database, no form
service, no stored submissions.

**Nothing here is deployed.** Every command below is one you run yourself.

---

## Why this replaced Formspree

The old form posted to `https://formspree.io/f/xbddkkjy` with `fetch()`.
Formspree answered every one of those with:

```
403 {"error":"In order to submit via AJAX, you need to set a custom key or
     reCAPTCHA must be disabled in this form's settings page."}
```

reCAPTCHA was on in that form's settings, and Formspree refuses AJAX
submissions while it is. The page fell into its "that didn't send" state every
time. Turning the setting off would have fixed it, but the free tier is 50
messages a month; this is unmetered and the mail arrives from your own domain.

## What the Worker does

| Step | Behaviour |
| --- | --- |
| `OPTIONS` | CORS preflight, 204 |
| Wrong path or method | 404 / 405 |
| Origin not allowed | 403 — allow-list in `vars`, plus any loopback origin |
| Rate limit | 5 posts per minute per IP → 429. Checked *before* parsing |
| Honeypot `company` filled | 200 `{"ok":true}` and silently dropped — a bot learns nothing |
| Invalid field | 400 with a message the page shows verbatim |
| Resend fails | 502 with a generic line; the real error goes to `wrangler tail` only |
| Success | 200 `{"ok":true}` |

CR/LF is stripped from the name and email before they reach the `Subject` and
`Reply-To` headers, and the message is HTML-escaped before it reaches the
HTML part. `reply_to` is the visitor, so hitting reply in your mail client
goes to them while the mail itself is sent from your verified domain.

`limit()` is the Workers rate-limiting binding — a runtime primitive, not a
database. It is best-effort per location: an attacker spread across regions
gets a few more through. That is the right trade here, because the failure
mode in the other direction is blocking a real person.

---

## Deploying it

### 1. A Resend account and a verified domain

1. Sign up at <https://resend.com> (free tier: 3,000 emails/month, 100/day).
2. **Domains → Add Domain →** `imanandhu.in`.
3. Resend shows DNS records (an MX, an SPF `TXT`, and a DKIM `TXT`). Add them
   in the Cloudflare dashboard under **DNS** for `imanandhu.in`.
   Set each one's proxy status to **DNS only** (grey cloud), not proxied.
4. Wait for Resend to show the domain as **Verified**. Usually minutes.

Until the domain verifies, you can test with Resend's sandbox sender by
setting `MAIL_FROM` to `Portfolio <onboarding@resend.dev>`, which only
delivers to the address you signed up with.

### 2. An API key

**API Keys → Create API Key**, permission **Sending access**. Copy it once —
Resend does not show it again.

### 3. Configure and deploy the Worker

```bash
cd contact/worker
npm install
```

Edit `wrangler.jsonc`:

- **`MAIL_TO`** — where messages land. Any address you can read; it has
  nothing to do with Resend or with the domain you verified.
- **`MAIL_FROM`** — the `From:` line the mail arrives with, in the form
  `Display Name <address@domain>`.

The part after the `@` in `MAIL_FROM` **must be the domain you verified in
step 1**. That is the whole point of those DNS records: they prove you control
`imanandhu.in`, so Resend will sign mail as it. Put anything else there —
`anandhu@gmail.com`, say — and Resend rejects the send outright, because you
cannot prove you own Gmail.

The part *before* the `@` is yours to pick and **does not need to exist**. You
are not creating a mailbox. `contact@`, `hello@`, `noreply@` all work on a
verified domain with no extra setup; Resend's docs put it as "send and receive
emails using any email address at your domain without any extra
configuration". The shipped default is:

```jsonc
"MAIL_FROM": "Portfolio <contact@imanandhu.in>"
```

so a message shows up in your inbox from **Portfolio**, and because the Worker
sets `reply_to` to the visitor, hitting reply goes to them and not to
`contact@imanandhu.in`. If someone ignores that and mails `contact@` directly
it will bounce, since no mailbox is behind it — make it a real forwarding
address (Cloudflare Email Routing does this free) if you care about that.

```bash
npx wrangler secret put RESEND_API_KEY   # paste the key; never goes in the repo
npx wrangler deploy
```

Deploy prints the URL, e.g. `https://contact-form.<subdomain>.workers.dev`.

### 4. Point the site at it

Add to Vercel → your project → **Settings → Environment Variables**:

| Name | Value | Type |
| --- | --- | --- |
| `PUBLIC_CONTACT_ENDPOINT` | `https://contact-form.<subdomain>.workers.dev/contact` | Plain text |

It is a **public** variable and belongs in the bundle — it is just a URL, and
the Worker's own origin check and rate limit are what protect it. Redeploy the
site so the new value is baked in.

Leave it unset and the form disables its send button rather than offering
something that cannot work; the channel list beside it stays.

### 5. Check it

```bash
curl -i -X POST https://contact-form.<subdomain>.workers.dev/contact \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://imanandhu.in' \
  -d '{"name":"Test","email":"you@example.com","message":"Hello"}'
```

Expect `200 {"ok":true}` and mail within a few seconds. If it 502s,
`npx wrangler tail` shows what Resend actually said.

---

## Running it locally

```bash
cd contact/worker
echo 'RESEND_API_KEY=re_your_key' > .dev.vars   # gitignored
npx wrangler dev --port 8788
```

and in the site's `.env.local`:

```
PUBLIC_CONTACT_ENDPOINT=http://127.0.0.1:8788/contact
```

Local runs send real email through Resend. To exercise the path without
sending anything, point it at a stub:

```bash
npx wrangler dev --port 8788 --var RESEND_ENDPOINT:http://127.0.0.1:8899/emails
```

`RESEND_ENDPOINT` is a test seam only; leave it unset in production.

## Tests

```bash
cd contact/worker && npm test
```

Covers validation boundaries, header-injection stripping, honeypot handling
and HTML escaping — all without a Worker runtime or a Resend key.

## If spam ever arrives

The honeypot stops naive bots and the rate limit caps the damage. If a
targeted spammer finds it, add [Turnstile](https://developers.cloudflare.com/turnstile/)
— free and unmetered, and unlike reCAPTCHA it does not break AJAX posts.
