"use client";

/* The Makhie landing — first page migrated to React. It renders the exact DOM
   the design system and the shared platform layer (makhie.js) already expect:
   header.site/.nav for the auth widget, .btn/.tcard/.card classes, and the
   background accents mounted from outside the React tree. */

import { useEffect, useMemo, useState } from "react";
import { IC, TOOLS, type Tool } from "@/lib/tools";
import "./landing.css";

declare global {
  interface Window {
    MK?: {
      user: () => { email: string } | null;
      openAuthModal: () => void;
    };
  }
}

/* Need → search seed. Each seed is a word the tool tags already answer, so
   picking a need simply drives the same search everyone can type. */
const NEEDS: [string, string, string][] = [
  ["Getting paid", "Payment requests your clients can scan", "paid"],
  ["Tracking the money", "Money in, money out, what's left", "money"],
  ["Deals in writing", "Turn a WhatsApp deal into a paper", "agreement"],
  ["Signatures & proof", "Sign it, verify it, keep evidence", "sign"],
  ["Bookings & clients", "Your calendar, their phone", "bookings"],
  ["Winning new work", "Pitch yourself and get answers", "pitch"],
];

const CATS = [
  ["all", "All"],
  ["management", "Management"],
  ["paperwork", "Paperwork & documents"],
  ["finance", "Finance"],
  ["education", "Education"],
] as const;

function matchTools(query: string, cat: string): Tool[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const out: { t: Tool; s: number; i: number }[] = [];
  TOOLS.forEach((t, i) => {
    if (cat !== "all" && t.cat !== cat) return;
    let score = 0;
    for (const tok of tokens) {
      if (t.name.toLowerCase().includes(tok)) score += 3;
      else if (t.tags.toLowerCase().includes(tok)) score += 2;
      else if (t.desc.toLowerCase().includes(tok)) score += 1;
      else return;
    }
    out.push({ t, s: score, i });
  });
  out.sort((a, b) => b.s - a.s || a.i - b.i);
  return out.map((m) => m.t);
}

function ToolCard({ t }: { t: Tool }) {
  return (
    <a className="tcard" href={t.href}>
      <div className="thead">
        <span className="ic" dangerouslySetInnerHTML={{ __html: IC[t.ic] ?? "" }} />
        <h3>{t.name}</h3>
      </div>
      <p>{t.desc}</p>
      <span className={"badge " + (t.paid ? "paid" : "free")}>{t.paid ? "Paid" : "Free"}</span>
    </a>
  );
}

function Splash() {
  const [gone, setGone] = useState(true);
  const [out, setOut] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem("mk.splash")) return;
      sessionStorage.setItem("mk.splash", "1");
    } catch {
      return;
    }
    setGone(false);
    const t1 = setTimeout(() => setOut(true), 1550);
    const t2 = setTimeout(() => setGone(true), 2050);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  if (gone) return null;
  return (
    <div id="splash" className={out ? "out" : ""} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/logo.png" alt="" />
      <span className="full">Market Access, Knowledge &amp; Help</span>
    </div>
  );
}

export default function Landing() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [expanded, setExpanded] = useState(false);

  const matches = useMemo(() => matchTools(query, cat), [query, cat]);
  const grouped = !query.trim() && cat === "all";
  const core = grouped
    ? [...matches.filter((t) => t.core)].sort((a, b) => (a.core ?? 0) - (b.core ?? 0))
    : [];
  const rest = grouped ? matches.filter((t) => !t.core) : matches;

  function onSignInCta(e: React.MouseEvent) {
    e.preventDefault();
    if (window.MK?.user()) location.href = "/apps/dashboard.html";
    else window.MK?.openAuthModal();
  }

  return (
    <>
      <Splash />
      <div className="corner-dots tl" aria-hidden="true" />
      <div className="wrap">
        <header className="site">
          <a className="brand" href="/" aria-label="Makhie home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo-small.png" alt="" />
            MAKHIE
          </a>
          <nav className="nav">
            <a className="link" href="#tools">Tools</a>
            <a className="link" href="/about.html">About</a>
            <a className="link" href="#pricing">Pricing</a>
          </nav>
        </header>

        <section className="hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hero-logo" src="/assets/logo.png" alt="Makhie" />
          <p className="hero-full">Market Access, Knowledge &amp; Help</p>
        </section>

        <section className="block" id="needs">
          <div className="centered">
            <div className="kicker">Start here</div>
            <h2 className="sect">What does your informal business need solutions for?</h2>
          </div>
          <div className="needs-grid">
            {NEEDS.map(([label, hint, seed]) => (
              <button
                key={seed}
                type="button"
                className="need-card"
                onClick={() => {
                  setCat("all");
                  setQuery(seed);
                  document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <b>{label}</b>
                <span>{hint}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="block" id="tools">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="wm" src="/assets/logo.png" alt="" aria-hidden="true" />
          <div className="centered">
            <div className="kicker">The tools</div>
            <h2 className="sect">Everything, named for what it does.</h2>
            <p className="sub">
              Free tools for paperwork, money and pitching — search for the job you need done.
            </p>
          </div>
          <div className="toolbar">
            <svg className="tb-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </svg>
            <input
              className="f"
              type="search"
              autoComplete="off"
              placeholder="Search: receipt, sign pdf, loan, rent, bitcoin, tender…"
              aria-label="Search the tools"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="tb-count">
              {matches.length} {matches.length === 1 ? "tool" : "tools"}
            </span>
          </div>
          <div className="catbar">
            {CATS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={cat === id ? "on" : ""}
                onClick={() => setCat(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="tgrid">
            {grouped ? (
              <>
                <h3 className="tgroup">Your daily papers</h3>
                {core.map((t) => <ToolCard key={t.href} t={t} />)}
                <h3 className="tgroup">More tools</h3>
                {(expanded ? rest : rest.slice(0, 6)).map((t) => <ToolCard key={t.href} t={t} />)}
              </>
            ) : (
              matches.map((t) => <ToolCard key={t.href} t={t} />)
            )}
          </div>
          {grouped && rest.length > 6 && (
            <div className="centered" style={{ marginTop: 26 }}>
              <button type="button" className="btn quiet" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Show fewer tools ↑" : `Show all ${matches.length} tools ↓`}
              </button>
            </div>
          )}
          {matches.length === 0 && (
            <p className="note centered" style={{ marginTop: 26 }}>
              Nothing matches that — try a simpler word, like “receipt”, “loan” or “pdf”.
            </p>
          )}
        </section>

        <section className="block" id="pricing">
          <div className="centered">
            <div className="kicker">Pricing</div>
            <h2 className="sect">R0.00. Both ways.</h2>
            <p className="sub">
              Every tool is free either way — the only difference is whether Makhie is allowed to
              remember your work.
            </p>
          </div>
          <div className="pr-grid">
            <div className="card">
              <h3>Guest</h3>
              <div className="pr-price">R0.00<small>/no account</small></div>
              <ul className="pr-feats">
                <li>Every tool, right now — no sign-up</li>
                <li className="no">Your data is not saved</li>
                <li className="no">No long-term performance reports</li>
                <li className="no">No record of past transactions or payments</li>
                <li className="no">No paper trail of your work</li>
              </ul>
              <a className="btn quiet" href="#tools">Just use the tools</a>
            </div>
            <div className="card" style={{ borderColor: "var(--accent)" }}>
              <h3>Signed in</h3>
              <div className="pr-price">R0.00<small>/still free</small></div>
              <ul className="pr-feats">
                <li>Everything the guest gets</li>
                <li>Long-term performance dashboard, month after month</li>
                <li>Every transaction and payment on record</li>
                <li>A paper trail of all your work, on any device</li>
              </ul>
              <a className="btn" href="#" onClick={onSignInCta}>Sign in free</a>
            </div>
          </div>
          <p className="pr-note">Both cost nothing — that is the point.</p>
        </section>

        <div className="centered" id="mission" style={{ marginTop: 80 }}>
          <div className="kicker" style={{ fontSize: 10 }}>Why Makhie exists</div>
          <p className="note" style={{ maxWidth: 440, margin: "8px auto 0" }}>
            In isiZulu, your neighbour is <i>uMakhelwane</i> — your makhi. The one who helps
            without an invoice. That&apos;s what this site is, for your business.{" "}
            <a href="/about.html" style={{ color: "var(--accent-ink)", fontWeight: 600 }}>
              What a Makhie is →
            </a>
          </p>
        </div>

        <footer className="site">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="foot-mark" src="/assets/logo-small.png" alt="" />
          Makhie — free financial &amp; educational tools for the businesses that were never handed any.
          <br />
          First-party analytics only, consent-respecting, no ad trackers.
          <br />
          Questions? <a href="mailto:hello@makhie.example">hello@makhie.example</a>
          <div className="social">
            <a href="https://www.linkedin.com/in/sazi-ndlovu/" target="_blank" rel="noopener" aria-label="LinkedIn" title="Sazi Ndlovu on LinkedIn">
              <svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
            <a href="#" aria-label="X (Twitter)" title="Follow us on X">
              <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="#" aria-label="Instagram" title="Follow us on Instagram">
              <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
            </a>
            <a href="#" aria-label="TikTok" title="Follow us on TikTok">
              <svg viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
