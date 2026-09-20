# Ruturaj Blueprint

A 117-day career execution and accountability system.
**Day 1 = 21 Sep 2026 · Day 117 = 15 Jan 2027.**

Static React SPA on Netlify, four serverless functions, no database server.

---

## Stack

| Layer | What |
|---|---|
| Frontend | Vite · React 18 · TypeScript (strict) · Tailwind v4 · Framer Motion · Radix · lucide-react |
| Backend | Netlify Functions (ESM) |
| Storage | Netlify Blobs, mirrored to `localStorage` |
| Mail | Gmail SMTP via nodemailer |
| Deploy | Push `main` → Netlify builds and deploys |

---

## Local development

```bash
cd ruturaj-site
npm install
npm run dev
```

| Script | Does |
|---|---|
| `npm run dev` | Vite dev server on :5173 |
| `npm run build` | Generates the catalog, typechecks, then builds to `dist/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run verify` | Re-runs the 31 day-math boundary checks |
| `npm run gen:catalog` | Regenerates `netlify/functions/_shared/catalog.json` |

---

## Environment variables

Set these in **Netlify → Site settings → Environment variables**. Nothing is
hardcoded; the functions refuse to run without them. See `.env.example`.

| Variable | Purpose |
|---|---|
| `BLUEPRINT_KEY` | Shared passphrase gating the progress store and the on-demand mail endpoint. Enter the same value in the app under Settings → Sync. |
| `SENDER_EMAIL` | Gmail address that sends the daily mail |
| `SENDER_PASS` | Gmail app password for that account |
| `MY_EMAIL` | Where the daily mail is delivered |

---

## Functions

| Function | Trigger | Cron (UTC) | IST |
|---|---|---|---|
| `sync` | HTTP GET/PUT | — | — |
| `send-morning-email` | Scheduled | `30 1 * * *` | 07:00 |
| `send-evening-email` | Scheduled | `30 16 * * *` | 22:00 |
| `send-email` | HTTP POST, key-gated | — | — |

IST is UTC+5:30, so the cron times above are the IST times minus 5h30.

Shared code lives in `netlify/functions/_shared/`:

- `digest.mjs` — reads the state blob and computes everything an email needs
- `templates.mjs` — the two mail layouts
- `voice.mjs` — subject lines, challenges and recovery plans, chosen from data
- `mail.mjs` — transport (one retry) and the HTML shell
- `catalog.json` — **generated**, do not edit by hand

### Why the progress store exists

Scheduled functions run server-side and cannot read `localStorage`. Without the
Blobs copy, the morning mail can only ever send a date-derived counter and a
rotating quote. The store is what lets it say *"yesterday you planned 3 items
and closed 1"*.

---

## Architecture notes

- **All persistence goes through `src/lib/storage.ts`.** Local-first writes,
  debounced push to Blobs, last-write-wins on `updatedAt`. Runtime schema
  guards mean a corrupt blob degrades to defaults instead of throwing into the
  render tree.
- **Day math lives in `src/engine/dates.ts`.** Never parse a bare
  `YYYY-MM-DD` with `new Date()` — it is treated as UTC and lands on the
  previous day in IST.
- **`catalog.json` is generated** from the TypeScript data by
  `scripts/gen-catalog.mjs` during `npm run build`, so the functions and the app
  cannot drift apart.
- **Foundation Gate is earned, not clicked.** The unlock button stays disabled
  until all 41 mandatory milestones are ticked. The override path is recorded
  and displayed.

See `../CLAUDE.md` for coding rules and `../design.md` for the design system.

---

## Testing

```bash
npm run verify                      # day-math boundaries
node scripts/preview-emails.mjs     # renders both mails from a fixture
```

`preview-emails.mjs` writes `scripts/preview-*.html` (gitignored) and prints
the plaintext versions. It sends nothing.
