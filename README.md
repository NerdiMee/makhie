<p align="center">
  <img src="public/assets/logo.png" alt="Makhie" width="140">
</p>

<h1 align="center">Makhie</h1>

<p align="center">
  Free financial and business tools for the kasi economy.<br>
  <a href="https://makhie.vercel.app"><strong>makhie.vercel.app</strong></a>
</p>

---

Makhie is a free, browser-based suite of financial and business tools for entrepreneurs who run real businesses without the software the formal economy takes for granted: the salon, the spaza, the DJ, the handyman, the tattoo artist, the small landlord. It gives them invoicing, cash books, signed agreements, proof of delivery, bookings, loan and property maths, and a pitch stage, so a business that started with nothing can present, account and get paid like one that had everything.

The name comes from *uMakhelwane*, the neighbour who helps without sending an invoice. It is also an acronym: **M**arket **A**ccess, **K**nowledge and **H**elp for **I**ndividual **E**ntrepreneurs.

## Why it exists

Most of South Africa's township economy runs on WhatsApp, cash and memory. Formal tools assume a laptop, a card, a monthly subscription and an accountant. Makhie assumes a phone with limited data, a WhatsApp contact list, and a person who is already good at their trade and short on time.

So every tool is built to the same rules:

- **Free.** No tiers that hide the useful part.
- **Local-first.** Every tool works before you sign in. Records live on the device and sync to an account when one exists, so nothing is lost on a bad connection.
- **WhatsApp-native.** Every PDF and every link can be shared straight into a chat.
- **Light.** The tools are plain HTML and JavaScript with vendored libraries. No frameworks download on a tool page.
- **Plain language.** Tool names say what they do. No jargon, no brand names to learn.
- **Private.** First-party, consent-respecting analytics only. No ad trackers.

## What's inside

More than thirty tools, grouped by what a business needs.

| Group | Tools |
|---|---|
| **Money** | Money In & Money Out (cash book with monthly PDF statements) · Simple Accounting (P&L, categories) · Receipt & Invoice Maker · Money Owed Tracker · Repayment Schedule · Debt Payoff Planner · Loans & Bonds · Rent vs Buy · Property Investment Return · Currency & Crypto Converter (live rates) · Get Paid in Crypto (USDC sessions, mock provider today) |
| **Paperwork & trust** | PDF Signing Link (single-use, QR, verifiable) · WhatsApp Deal Summary (turns a chat into a written agreement) · Delivery Proof · Stock Delivery Check · Business Evidence Pack · Paperwork Checklist · Company Registration Helper (CIPC / BizPortal) |
| **Bookings & quotes** | One booking desk with skins for salons and barbers, tattoo studios, carwashes, house painters, handymen and landscapers · DJ Quotes & Bookings (briefs, quotes, invoices, deposits) |
| **Pitch & grow** | Pitch Script Builder · Investor Pitch Board (public stage with 20-second audio pitches) · Business Dashboard (profile, favourites, usage) · What Do You Have? (career-path ranker that never gatekeeps, with SETA, TVET and learnership pointers) |
| **Documents** | PDF to Audio & Summary · Document Converter · Document Compressor |

Every PDF Makhie produces carries the business's own name and logo when a profile is set, and a small "Created on Makhie" mark in the footer. A floating pocket calculator is available on every tool page.

## How it's built

```
makhie/
├── app/                    Next.js 16 app router: the landing page (React 19, TypeScript)
│   ├── page.tsx            searchable tool catalog + need picker
│   ├── layout.tsx          loads the shared client layer for every page
│   └── landing.css
├── lib/tools.ts            tool catalog: names, tags, descriptions, icons
├── public/
│   ├── apps/*.html         the tools themselves: self-contained pages, plain ES5 JavaScript
│   ├── about.html
│   └── assets/
│       ├── makhie.js       shared client layer (see below)
│       ├── crypto-provider.js
│       ├── site.css
│       └── vendor/         vendored libraries (Supabase client, jsPDF, QR, etc.)
└── supabase/
    ├── migrations/         SQL applied to the database
    └── functions/          edge functions (Deno)
        ├── makhie-ai/              AI helpers for pitch, agreements and evidence packs
        └── makhie-crypto-webhook/  payment-provider webhook (HMAC-verified, idempotent)
```

**Landing** is a Next.js app: a single searchable catalog with weighted search over each tool's name, tags and description, plus a need picker that seeds the search.

**Tools** are static pages served from `public/apps`. They deliberately have no build step, so any one of them can be opened, read and fixed on its own. They share one client layer, `public/assets/makhie.js`, which provides:

- email and password auth against Supabase, with a Google button wired for when provider credentials are added;
- local-first storage: every record has a `client_id`, is saved to `localStorage` first, then synced to the `makhie_documents` table when signed in, with dedupe on retry and a migration of local records into the account on first sign-in;
- PDF generation in the browser (jsPDF), a signature pad, QR codes, and Web Share to WhatsApp with a `wa.me` fallback;
- a business profile (name and logo) that brands every PDF;
- lightweight telemetry (page ping and heartbeat) into `makhie_events`;
- an AI hook that probes the `makhie-ai` edge function and reveals AI controls only when a provider answers.

**Backend** is Supabase (PostgreSQL, Auth, Storage). Tables are prefixed `makhie_` and every one has row-level security. Anything that must not be trusted to the client goes through a `SECURITY DEFINER` function: marking a signing link as spent, changing a booking's status, banning an account, and creating or expiring crypto payment sessions. Signing requests are not publicly readable; a link resolves through an RPC that returns only what the signer needs. Public-insert tables are rate-limited per IP and size-capped in SQL (`supabase/migrations/0001_public_insert_guards.sql`).

The Supabase anon key in `makhie.js` is the publishable key. It is meant to be public; RLS is the security boundary.

## Running it locally

```bash
git clone https://github.com/NerdiMee/makhie.git
cd makhie
npm install
npm run dev
```

Open http://localhost:3000. The landing is served by Next.js; the tools are available at `/apps/<name>.html` and the about page at `/about.html`.

The tools also run as plain static files. Serve `public/` with any static server (for example `python3 -m http.server` from inside `public/`) if you want to work on a tool without Next.js.

### Pointing at your own Supabase project

1. Create a Supabase project and apply the SQL in `supabase/migrations/`.
2. Set `SUPA_URL` and `SUPA_KEY` (the anon key) at the top of `public/assets/makhie.js`.
3. Optionally deploy the edge functions:

```bash
supabase functions deploy makhie-ai
supabase functions deploy makhie-crypto-webhook
supabase secrets set GEMINI_API_KEY=... SERVICE_ROLE_KEY=... CRYPTO_WEBHOOK_SECRET=... CRYPTO_NETWORK=...
```

`makhie-ai` uses Gemini's free tier. Until it is deployed the AI controls stay hidden and every tool works without them.

## Status

Makhie is live and in active development. Honest notes on what is and isn't finished:

- The AI layer is written but not yet deployed to production.
- Get Paid in Crypto runs on a clearly labelled mock provider; the real-provider path and webhook are scaffolded and waiting on a provider choice.
- Google sign-in needs provider credentials in the Supabase dashboard.
- The database schema was applied directly during development; a complete migration export is on the roadmap.
- Tools are being ported from static pages into React routes one at a time, without changing their URLs.

## Roadmap

- Complete schema export under `supabase/migrations`.
- Deploy `makhie-ai` and the real payment provider.
- Port high-traffic tools (dashboard, cash book) to React.
- Offline install (PWA) so the suite works fully without data.
- isiZulu, isiXhosa, Sesotho and Afrikaans copy for the most-used tools.

## Contributing

Issues and pull requests are welcome, especially from people who run or serve kasi businesses and know what's missing. Keep tools self-contained, keep them light, and keep the language plain.
