/* Makhie shared platform layer.
   One tiny global (MK): Supabase client, sign-in state, record saving with an
   offline/local fallback, and the helpers every tool shares (money, PDFs,
   signature pads, QR codes, downloads). Tools must keep working logged out —
   signing in only adds persistence and the dashboard. */
(function () {
  "use strict";

  var LOGO64 = "data:image/png;base64,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";
  var SUPA_URL = "https://tlpcyfpsqcchhrpymehu.supabase.co";
  var SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRscGN5ZnBzcWNjaGhycHltZWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MjMzMjUsImV4cCI6MjEwNDE5OTMyNX0.mDcjVKnfNYqR5KAq2Hg-VnqPk3wY7OFlcgZFxw2iO8I";

  var sb = null;
  try { sb = window.supabase.createClient(SUPA_URL, SUPA_KEY); } catch (e) { /* offline page still works */ }

  /* ---------------- auth ---------------- */
  // PROCHECK is the standing test bypass on this profile: it opens a local
  // demo session so every signed-in surface can be exercised without an account.
  var demo = localStorage.getItem("mk.demo") === "1";
  if (/procheck/i.test(location.search)) { demo = true; localStorage.setItem("mk.demo", "1"); }

  var authCbs = [], currentUser = null, authKnown = false;

  function setUser(u) {
    currentUser = u; authKnown = true;
    authCbs.forEach(function (cb) { try { cb(u); } catch (e) {} });
  }
  function init() {
    if (demo) { setUser({ id: "demo", email: "demo@makhie.test", demo: true }); return; }
    if (!sb) { setUser(null); return; }
    sb.auth.getSession().then(function (r) {
      setUser(r.data.session ? r.data.session.user : null);
    }).catch(function () { setUser(null); });
    sb.auth.onAuthStateChange(function (_ev, session) {
      if (!demo) setUser(session ? session.user : null);
    });
  }

  function onAuth(cb) { authCbs.push(cb); if (authKnown) cb(currentUser); }

  function signIn(email, pass) {
    if (/^procheck$/i.test(email.trim())) {
      localStorage.setItem("mk.demo", "1"); demo = true;
      setUser({ id: "demo", email: "demo@makhie.test", demo: true });
      return Promise.resolve({ demo: true });
    }
    return sb.auth.signInWithPassword({ email: email, password: pass }).then(function (r) {
      if (r.error) throw r.error; return r.data;
    });
  }
  function signUp(email, pass) {
    return sb.auth.signUp({ email: email, password: pass }).then(function (r) {
      if (r.error) throw r.error; return r.data;
    });
  }
  function signInGoogle() {
    // OAuth cannot round-trip back to a file:// page — Google needs a hosted URL.
    if (location.protocol === "file:") return Promise.reject({ code: "needs-hosting" });
    return sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: location.href.split("#")[0].split("?")[0], skipBrowserRedirect: true }
    }).then(function (r) {
      if (r.error) throw r.error;
      // Preflight the authorize URL so a disabled provider shows a friendly
      // message in the modal instead of navigating onto a raw JSON error page.
      return fetch(r.data.url, { redirect: "manual" }).then(function (resp) {
        if (resp.type === "opaqueredirect" || resp.ok || (resp.status >= 300 && resp.status < 400)) {
          location.href = r.data.url;
          return r.data;
        }
        throw { code: "provider-disabled" };
      }, function () {
        // Preflight blocked (CORS/offline) — fall back to the normal redirect.
        location.href = r.data.url;
        return r.data;
      });
    });
  }
  function signOut() {
    if (demo) { localStorage.removeItem("mk.demo"); demo = false; setUser(null); return Promise.resolve(); }
    return sb.auth.signOut().then(function () { setUser(null); });
  }

  /* ------------- records (documents) ------------- */
  // Local-first, always: every record lands in localStorage the moment it is
  // made, then syncs up to makhie_documents when a signed-in connection
  // exists. Nothing is ever lost to a login wall, a dead spot, or a failed
  // insert — unsynced records simply wait (synced:false) and push later.
  // client_id + a unique (user_id, client_id) index make retries harmless.
  function localDocs() {
    try { return JSON.parse(localStorage.getItem("mk.docs") || "[]"); } catch (e) { return []; }
  }
  function setLocalDocs(all) {
    try { localStorage.setItem("mk.docs", JSON.stringify(all)); } catch (e) {}
  }
  function canCloud() { return !!(currentUser && !currentUser.demo && sb); }
  function toRow(rec) {
    return { user_id: currentUser.id, client_id: rec.client_id, kind: rec.kind,
      title: rec.title, amount_cents: rec.amount_cents, data: rec.data };
  }
  var flushing = false;
  function flushDocs() {
    if (flushing || !canCloud()) return Promise.resolve();
    var all = localDocs();
    var pending = all.filter(function (r) { return !r.synced; });
    if (!pending.length) return Promise.resolve();
    flushing = true;
    var q;
    try {
      q = sb.from("makhie_documents")
        .upsert(pending.map(toRow), { onConflict: "user_id,client_id", ignoreDuplicates: true });
    } catch (e) { flushing = false; return Promise.resolve(); }
    return q.then(function (r) {
        if (!r.error) {
          // Re-read before marking: a saveDoc that landed mid-flight must not
          // be overwritten by this stale snapshot. Only the pushed ids flip.
          var ids = {};
          pending.forEach(function (x) { ids[x.client_id] = 1; });
          var fresh = localDocs();
          fresh.forEach(function (rec) { if (ids[rec.client_id]) rec.synced = true; });
          setLocalDocs(fresh);
        }
      }).catch(function () {})
      .then(function () { flushing = false; });
  }
  function saveDoc(kind, title, amountCents, data) {
    var rec = { client_id: uid(10), kind: kind, title: title,
      amount_cents: Math.round(amountCents || 0), data: data || {},
      created_at: new Date().toISOString(), synced: false };
    var all = localDocs(); all.push(rec); setLocalDocs(all);
    maybeNudge();
    if (!canCloud()) return Promise.resolve(rec);
    return sb.from("makhie_documents").insert(toRow(rec)).then(function (r) {
      if (!r.error) {
        var again = localDocs();
        again.forEach(function (x) { if (x.client_id === rec.client_id) x.synced = true; });
        setLocalDocs(again);
      }
      return rec; // a failed insert is not an error — it stays queued locally
    }).catch(function () { return rec; });
  }
  function listDocs() {
    if (!canCloud()) return Promise.resolve(localDocs());
    return flushDocs().then(function () {
      return sb.from("makhie_documents")
        .select("client_id,kind,title,amount_cents,data,created_at")
        .order("created_at", { ascending: true }).limit(1000)
        .then(function (r) {
          if (r.error) throw r.error;
          // Anything still unsynced (flush raced or failed) shows up merged,
          // so the user's view never depends on sync having finished.
          var seen = {};
          r.data.forEach(function (d) { if (d.client_id) seen[d.client_id] = 1; });
          var extra = localDocs().filter(function (x) { return !x.synced && !seen[x.client_id]; });
          return r.data.concat(extra).sort(function (a, b) {
            return String(a.created_at) < String(b.created_at) ? -1 : 1;
          });
        });
    });
  }
  // Bulk push for tools that keep their own local books (cashbook, loantrack):
  // hand over rows shaped for makhie_documents; duplicates are ignored.
  function pushDocs(rows) {
    if (!canCloud() || !rows.length) return Promise.resolve(false);
    return sb.from("makhie_documents").upsert(rows.map(function (r) {
      return { user_id: currentUser.id, client_id: r.client_id, kind: r.kind,
        title: r.title, amount_cents: r.amount_cents, data: r.data };
    }), { onConflict: "user_id,client_id", ignoreDuplicates: true })
      .then(function (r) { return !r.error; }).catch(function () { return false; });
  }

  /* ------------- backup & restore ------------- */
  // One file, everything on this phone: every mk.* key except session flags.
  // mk.plan stays out on both sides — it is an entitlement, not the user's
  // data, and a backup file must never be a way to switch Pro on.
  var SKIP_KEYS = { "mk.demo": 1, "mk.nudged": 1, "mk.plan": 1 };
  function backup() {
    var out = { makhie_backup: 1, at: new Date().toISOString(), keys: {} };
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf("mk.") === 0 && !SKIP_KEYS[k]) out.keys[k] = localStorage.getItem(k);
    }
    download(new Blob([JSON.stringify(out, null, 1)], { type: "application/json" }),
      "makhie-backup-" + new Date().toISOString().slice(0, 10) + ".json");
  }
  function restore(file) {
    return file.text().then(function (t) {
      var j = JSON.parse(t);
      if (!j || j.makhie_backup !== 1 || !j.keys) throw new Error("Not a Makhie backup file.");
      Object.keys(j.keys).forEach(function (k) {
        if (k.indexOf("mk.") === 0 && !SKIP_KEYS[k]) {
          try { localStorage.setItem(k, j.keys[k]); } catch (e) {}
        }
      });
      return Object.keys(j.keys).length;
    });
  }

  /* ------------- backup nudge ------------- */
  // After ten records that exist only on this phone, say so — once. Every
  // tool stays fully usable without an account; this is a seatbelt, not a wall.
  function localCount() {
    var n = localDocs().filter(function (r) { return !r.synced; }).length;
    ["mk.cash", "mk.loans"].forEach(function (k) {
      try { n += (JSON.parse(localStorage.getItem(k) || "[]")).length; } catch (e) {}
    });
    return n;
  }
  function maybeNudge() {
    if (currentUser && !currentUser.demo) return;
    if (localStorage.getItem("mk.nudged")) return;
    var n = localCount();
    if (n < 10 || document.getElementById("mk-nudge")) return;
    var bar = document.createElement("div");
    bar.id = "mk-nudge";
    bar.style.cssText = "position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:60;" +
      "background:rgba(27,39,64,.92);-webkit-backdrop-filter:blur(14px) saturate(1.4);" +
      "backdrop-filter:blur(14px) saturate(1.4);border:1px solid rgba(255,255,255,.14);" +
      "color:#fff;border-radius:16px;padding:10px 14px;display:flex;gap:10px;" +
      "align-items:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 18px 50px -14px rgba(27,39,64,.6);" +
      "font-size:13.5px;max-width:92vw;";
    bar.innerHTML = "<span>" + n + " records live only on this phone. Back them up free.</span>" +
      "<button class='btn' id='mk-nudge-go' style='padding:6px 12px'>Back up</button>" +
      "<button class='btn quiet' id='mk-nudge-no' style='padding:6px 10px'>Later</button>";
    document.body.appendChild(bar);
    bar.querySelector("#mk-nudge-go").addEventListener("click", function () {
      localStorage.setItem("mk.nudged", "1"); bar.remove(); openAuthModal();
    });
    bar.querySelector("#mk-nudge-no").addEventListener("click", function () {
      localStorage.setItem("mk.nudged", "1"); bar.remove();
    });
  }

  /* ------------- plan (Makhie Pro) ------------- */
  // Free: every tool, this device. Pro: your business name on every paper —
  // and whatever grows next. The demo/test session counts as Pro so every
  // gated surface stays testable.
  function plan() {
    // Signing in is the upgrade: your name and logo go on everything.
    return (demo || localStorage.getItem("mk.plan") === "pro" || (currentUser && !currentUser.demo)) ? "pro" : "free";
  }
  function biz() {
    try { return JSON.parse(localStorage.getItem("mk.biz") || "{}"); } catch (e) { return {}; }
  }
  function setBiz(b) { try { localStorage.setItem("mk.biz", JSON.stringify(b || {})); } catch (e) {} }
  var upModal;
  function openUpgrade() {
    if (!upModal) {
      upModal = document.createElement("div");
      upModal.className = "mk-overlay";
      upModal.innerHTML =
        "<div class='mk-modal' role='dialog' aria-modal='true'>" +
        "<h3>Makhie Pro</h3>" +
        "<p class='note'>Your business name and logo on every paper Makhie makes for you — receipts, agreements, statements. Papers that look like <b>your</b> business, not ours.</p>" +
        "<button class='btn' id='mk-up-pay' style='width:100%'>Pay securely</button>" +
        "<p class='note' id='mk-up-hint' style='text-align:center'></p>" +
        "<div class='note' style='text-align:center'>Have an access code? " +
        "<input class='f' id='mk-up-code' style='width:120px;display:inline-block' placeholder='Code'>" +
        " <a href='#' id='mk-up-apply'>Apply</a></div>" +
        "</div>";
      document.body.appendChild(upModal);
      upModal.addEventListener("click", function (e) { if (e.target === upModal) upModal.classList.remove("open"); });
      upModal.querySelector("#mk-up-pay").addEventListener("click", function () {
        upModal.querySelector("#mk-up-hint").textContent =
          "Checkout opens here once payments are switched on — nothing to pay yet.";
      });
      upModal.querySelector("#mk-up-apply").addEventListener("click", function (e) {
        e.preventDefault();
        var code = upModal.querySelector("#mk-up-code").value.trim();
        if (/^procheck$/i.test(code)) {
          localStorage.setItem("mk.plan", "pro");
          upModal.querySelector("#mk-up-hint").textContent = "Pro is on for this device ✓";
          setTimeout(function () { location.reload(); }, 700);
        } else {
          upModal.querySelector("#mk-up-hint").textContent = "That code wasn't recognised.";
        }
      });
    }
    upModal.classList.add("open");
  }

  /* ------------- header auth widget ------------- */
  function mountAuth(nav) {
    if (!nav) return;
    var slot = document.createElement("span");
    nav.appendChild(slot);
    function render(u) {
      if (u) {
        slot.innerHTML = "<a class='link' href='" + rel("dashboard.html") + "'>Dashboard</a>" +
          "<a class='link' href='#' id='mk-out' title='" + esc(u.email) + "'>Sign out" + (u.demo ? " (test)" : "") + "</a>";
        slot.querySelector("#mk-out").addEventListener("click", function (e) {
          e.preventDefault(); signOut().then(function () { location.reload(); });
        });
      } else {
        slot.innerHTML = "<a class='link' href='#' id='mk-in'>Sign in</a>";
        slot.querySelector("#mk-in").addEventListener("click", function (e) { e.preventDefault(); openAuthModal(); });
      }
    }
    onAuth(render);
  }
  function rel(page) {
    return /\/apps\//.test(location.pathname) ? page : "apps/" + page;
  }

  var modal;
  function openAuthModal() {
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "mk-overlay";
      modal.innerHTML =
        "<div class='mk-modal' role='dialog' aria-modal='true'>" +
        "<h3 id='mk-auth-title'>Sign in to Makhie</h3>" +
        "<p class='note'>Your documents and numbers stay in your own account, ready for the dashboard.</p>" +
        "<button class='btn quiet' id='mk-google' style='width:100%'>Continue with Google</button>" +
        "<div class='note' style='text-align:center;margin:4px 0'>or with email</div>" +
        "<input class='f' id='mk-email' type='email' placeholder='Email address' autocomplete='email'>" +
        "<input class='f' id='mk-pass' type='password' placeholder='Password (8+ characters)' autocomplete='current-password'>" +
        "<button class='btn' id='mk-go' style='width:100%'>Sign in</button>" +
        "<div class='note' style='text-align:center'>New here? <a href='#' id='mk-mode'>Create an account</a></div>" +
        "<p class='note' id='mk-hint'></p>" +
        "</div>";
      document.body.appendChild(modal);
      var creating = false;
      var hint = modal.querySelector("#mk-hint");
      modal.addEventListener("click", function (e) { if (e.target === modal) modal.classList.remove("open"); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") modal.classList.remove("open"); });
      modal.querySelector("#mk-mode").addEventListener("click", function (e) {
        e.preventDefault(); creating = !creating;
        modal.querySelector("#mk-auth-title").textContent = creating ? "Create your Makhie account" : "Sign in to Makhie";
        modal.querySelector("#mk-go").textContent = creating ? "Create account" : "Sign in";
        e.target.textContent = creating ? "Sign in instead" : "Create an account";
      });
      modal.querySelector("#mk-google").addEventListener("click", function () {
        hint.textContent = "Opening Google…";
        signInGoogle().catch(function (e2) {
          hint.textContent = e2 && e2.code === "needs-hosting"
            ? "Google sign-in only works once Makhie is hosted online — on this device, use email instead."
            : "Google sign-in isn't switched on yet — use email for now.";
        });
      });
      modal.querySelector("#mk-go").addEventListener("click", function () {
        var em = modal.querySelector("#mk-email").value.trim();
        var pw = modal.querySelector("#mk-pass").value;
        if (!em || (!pw && !/^procheck$/i.test(em))) { hint.textContent = "Enter your email and password."; return; }
        hint.textContent = creating ? "Creating your account…" : "Signing in…";
        (creating ? signUp(em, pw) : signIn(em, pw)).then(function () {
          location.reload();
        }).catch(function (e2) {
          hint.textContent = (e2 && e2.message) ? e2.message : "That didn't work — try again.";
        });
      });
    }
    modal.classList.add("open");
  }

  /* ------------- small shared helpers ------------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function uid(n) {
    var a = "abcdefghjkmnpqrstuvwxyz23456789", out = "";
    var rnd = crypto.getRandomValues(new Uint8Array(n || 8));
    for (var i = 0; i < rnd.length; i++) out += a[rnd[i] % a.length];
    return out;
  }
  function moneyC(cents, cur) {
    return (cur || "R") + (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
  function parseAmount(s) { // "8.5k", "R1 200", "1,200.50" → cents
    if (s == null) return 0;
    var t = String(s).toLowerCase().replace(/r/g, "").replace(/[\s,]/g, "");
    var k = /k$/.test(t); t = t.replace(/k$/, "");
    var n = parseFloat(t);
    if (!isFinite(n)) return 0;
    return Math.round(n * (k ? 1000 : 1) * 100);
  }
  function download(blob, name) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 900);
  }
  function qrDataUrl(text, cell) {
    var qr = window.qrcode(0, "M");
    qr.addData(text); qr.make();
    return qr.createDataURL(cell || 6, 8);
  }
  function waLink(text) { return "https://wa.me/?text=" + encodeURIComponent(text); }
  var WA_ICON = "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z'/></svg>";

  /* ------------- shared PDF scaffolding (jsPDF) ------------- */
  // Every Makhie paper shares one look: title row, meta on the right,
  // hairline rules, "Generated with Makhie" foot.
  function pdfStart(title, metaLines) {
    var doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
    var W = 210, M = 18;
    doc.setFont("helvetica", "bold").setFontSize(19).setTextColor(27, 39, 64);
    doc.text(title.toUpperCase(), M, 22);
    doc.setFont("helvetica", "normal").setFontSize(9.5).setTextColor(92, 106, 133);
    (metaLines || []).forEach(function (t, i) { doc.text(String(t), W - M, 16 + i * 5, { align: "right" }); });
    doc.setDrawColor(27, 39, 64).setLineWidth(0.5); doc.line(M, 27, W - M, 27);
    var ctx = { doc: doc, W: W, M: M, y: 36 };
    ctx.room = function (need) { if (ctx.y > 282 - (need || 0)) { doc.addPage(); ctx.y = 22; } };
    ctx.kv = function (k, v) {
      ctx.room(6);
      doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(92, 106, 133);
      doc.text(String(k).toUpperCase(), M, ctx.y);
      doc.setFont("helvetica", "normal").setTextColor(27, 39, 64);
      var lines = doc.splitTextToSize(String(v || "—"), 110);
      doc.text(lines, M + 62, ctx.y);
      ctx.y += Math.max(1, lines.length) * 5 + 2.5;
    };
    ctx.h = function (t) {
      ctx.room(10); ctx.y += 3;
      doc.setFont("helvetica", "bold").setFontSize(11.5).setTextColor(27, 39, 64);
      doc.text(t, M, ctx.y); ctx.y += 2.5;
      doc.setDrawColor(223, 230, 242).setLineWidth(0.3); doc.line(M, ctx.y, W - M, ctx.y);
      ctx.y += 5.5;
    };
    ctx.p = function (t, mute) {
      ctx.room(8);
      doc.setFont("helvetica", "normal").setFontSize(10);
      if (mute) doc.setTextColor(92, 106, 133); else doc.setTextColor(27, 39, 64);
      var lines = doc.splitTextToSize(String(t), W - 2 * M);
      doc.text(lines, M, ctx.y); ctx.y += lines.length * 5 + 2;
    };
    ctx.seal = function () {
      var pages = doc.getNumberOfPages();
      // Pro: the foot of every page carries the user's business, not ours.
      var b = plan() === "pro" ? biz() : {};
      for (var i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(92, 106, 133);
        if (b.name) {
          if (b.logo) { try { doc.addImage(b.logo, "PNG", M, 284.6, 5.6, 5.6); } catch (e) {} }
          doc.text(String(b.name), M + (b.logo ? 7.5 : 0), 288.6);
          doc.text("made with Makhie", W - M, 288.6, { align: "right" });
        } else {
          try { doc.addImage(LOGO64, "PNG", M, 285.5, 7.5, 3.6); } catch (e) {}
          doc.text("Created on Makhie", M + 9.5, 288.6);
        }
      }
      return doc;
    };
    ctx.finish = function (name) {
      ctx.seal();
      doc.save(name);
      // Remember the last paper this page produced, so "Send PDF on WhatsApp"
      // can hand over the actual file.
      lastPdf = { blob: doc.output("blob"), name: name };
      return doc;
    };
    return ctx;
  }

  /* ------------- send a real PDF to WhatsApp ------------- */
  // Web Share API attaches the actual file (mobile share sheet → WhatsApp).
  // Where files can't be shared, the PDF is already downloaded and WhatsApp
  // opens with the message ready to attach it.
  var lastPdf = null;
  function sharePdf(blob, name, text) {
    function fallback() {
      window.open(waLink((text ? text + "\n" : "") + "📎 " + name + " — attaching the PDF now."), "_blank", "noopener");
      return "fallback";
    }
    try {
      var file = new File([blob], name, { type: "application/pdf" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({ files: [file], title: name, text: text || "" })
          .then(function () { return "shared"; })
          .catch(function (e) { return (e && e.name === "AbortError") ? "shared" : fallback(); });
      }
    } catch (e) {}
    return Promise.resolve(fallback());
  }
  function shareLastPdf(text) {
    if (!lastPdf) return Promise.resolve("none");
    return sharePdf(lastPdf.blob, lastPdf.name, text);
  }

  /* ------------- shared signature pad ------------- */
  function sigPad(canvas) {
    var ctx = canvas.getContext("2d"), drawing = false, last = null, ink = false, locked = false;
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#16265c"; ctx.lineWidth = 4;
    function pos(e) {
      var r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
    }
    canvas.addEventListener("pointerdown", function (e) { if (locked) return; drawing = true; last = pos(e); canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener("pointermove", function (e) {
      if (!drawing || locked) return;
      var p = pos(e);
      ctx.beginPath(); ctx.moveTo(last.x, last.y);
      ctx.quadraticCurveTo(last.x, last.y, (last.x + p.x) / 2, (last.y + p.y) / 2);
      ctx.lineTo(p.x, p.y); ctx.stroke();
      last = p; if (!ink) { ink = true; if (api.onink) api.onink(); }
    });
    addEventListener("pointerup", function () { drawing = false; });
    var api = {
      hasInk: function () { return ink; },
      clear: function () { ctx.clearRect(0, 0, canvas.width, canvas.height); ink = false; if (api.onclear) api.onclear(); },
      lock: function () { locked = true; canvas.classList.add("locked"); },
      trimmedPng: function () {
        var img = ctx.getImageData(0, 0, canvas.width, canvas.height), d = img.data;
        var minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
        for (var y = 0; y < canvas.height; y++) for (var x = 0; x < canvas.width; x++) {
          if (d[(y * canvas.width + x) * 4 + 3] > 10) {
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
          }
        }
        var w = Math.max(1, maxX - minX + 1), h = Math.max(1, maxY - minY + 1);
        var t = document.createElement("canvas"); t.width = w; t.height = h;
        t.getContext("2d").drawImage(canvas, minX, minY, w, h, 0, 0, w, h);
        return { url: t.toDataURL("image/png"), w: w, h: h };
      }
    };
    return api;
  }

  /* ------------- side calculator (floating, on app pages) ------------- */
  // A pocket calculator one tap away, so nobody leaves the page to do maths.
  function mountCalc() {
    if (!/\/apps\//.test(location.pathname)) return;
    var css = document.createElement("style");
    css.textContent =
      ".mkc-fab{position:fixed;right:18px;bottom:18px;z-index:55;width:46px;height:46px;border-radius:50%;" +
      "border:1px solid var(--glass-edge,rgba(27,39,64,.08));background:rgba(255,255,255,.92);cursor:pointer;" +
      "box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 1px 2px rgba(27,39,64,.06),0 10px 24px -8px rgba(27,39,64,.35);" +
      "display:grid;place-items:center;color:var(--accent-ink);" +
      "transition:transform .22s cubic-bezier(.22,1,.36,1),border-color .22s,box-shadow .22s cubic-bezier(.22,1,.36,1);}" +
      ".mkc-fab:hover{transform:translateY(-2px);border-color:var(--accent);" +
      "box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 2px 4px rgba(27,39,64,.06),0 14px 30px -10px rgba(30,95,214,.5);}" +
      ".mkc-fab:active{transform:translateY(0) scale(.96);}" +
      ".mkc-fab svg{width:20px;height:20px;}" +
      ".mkc{position:fixed;right:18px;bottom:74px;z-index:55;width:224px;background:rgba(255,255,255,.94);" +
      "border:1px solid rgba(255,255,255,.8);" +
      "border-radius:18px;box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 1px 2px rgba(27,39,64,.08)," +
      "0 22px 50px -16px rgba(27,39,64,.4),0 30px 70px -30px rgba(30,95,214,.3);padding:12px;display:none;}" +
      "@supports ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){" +
      ".mkc{background:linear-gradient(170deg,rgba(255,255,255,.88),rgba(255,255,255,.7));" +
      "backdrop-filter:blur(18px) saturate(1.6);-webkit-backdrop-filter:blur(18px) saturate(1.6);}}" +
      ".mkc.open{display:block;animation:mkc-in .26s cubic-bezier(.22,1,.36,1);}" +
      "@keyframes mkc-in{from{opacity:0;transform:translateY(8px) scale(.97);}to{opacity:1;transform:none;}}" +
      ".mkc-out{font:700 20px/1.2 -apple-system,BlinkMacSystemFont,sans-serif;text-align:right;" +
      "font-variant-numeric:tabular-nums;color:var(--ink);background:rgba(238,243,252,.85);border-radius:10px;" +
      "box-shadow:inset 0 1px 2px rgba(27,39,64,.05);" +
      "padding:10px 12px;margin-bottom:10px;min-height:42px;word-break:break-all;}" +
      ".mkc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}" +
      ".mkc-grid button{border:1px solid var(--line);background:rgba(255,255,255,.85);border-radius:10px;padding:9px 0;" +
      "font:600 14px inherit;font-family:inherit;color:var(--ink);cursor:pointer;" +
      "box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 1px 2px rgba(27,39,64,.05);" +
      "transition:background-color .15s,transform .12s cubic-bezier(.22,1,.36,1),box-shadow .15s;}" +
      ".mkc-grid button:hover{background:var(--accent-soft);}" +
      ".mkc-grid button:active{transform:scale(.94);box-shadow:inset 0 1px 2px rgba(27,39,64,.12);}" +
      ".mkc-grid button.op{color:var(--accent-ink);font-weight:800;}" +
      ".mkc-grid button.eq{background:linear-gradient(180deg,#3874e3,var(--accent) 55%,#1a53bd);" +
      "border-color:var(--accent-ink);color:#fff;" +
      "box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 4px 10px -4px rgba(30,95,214,.55);}" +
      "@media (prefers-reduced-motion:reduce){.mkc.open{animation:none;}.mkc-fab,.mkc-grid button{transition:none;}" +
      ".mkc-fab:hover,.mkc-fab:active,.mkc-grid button:active{transform:none;}}";
    document.head.appendChild(css);

    var fab = document.createElement("button");
    fab.className = "mkc-fab"; fab.type = "button";
    fab.setAttribute("aria-label", "Open the side calculator");
    fab.title = "Quick calculator";
    fab.innerHTML = "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round'>" +
      "<rect x='5' y='3' width='14' height='18' rx='2'/><path d='M8.5 7h7'/>" +
      "<path d='M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01M8.5 19h.01M12 19h.01M15.5 19h.01' stroke-width='2.4'/></svg>";
    var panel = document.createElement("div");
    panel.className = "mkc";
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Calculator");
    panel.innerHTML = "<div class='mkc-out' id='mkc-out'>0</div><div class='mkc-grid'>" +
      ["C","⌫","%","÷","7","8","9","×","4","5","6","−","1","2","3","+","0",".","00","="].map(function (k) {
        var cls = "=" === k ? "eq" : ("C⌫%÷×−+".indexOf(k) > -1 ? "op" : "");
        return "<button type='button' " + (cls ? "class='" + cls + "' " : "") + "data-k='" + k + "'>" + k + "</button>";
      }).join("") + "</div>";
    document.body.appendChild(fab);
    document.body.appendChild(panel);

    // Pocket-calculator state: left value, pending op, current entry.
    var acc = null, op = null, cur = "0", fresh = true;
    var out = panel.querySelector("#mkc-out");
    function show(v) { out.textContent = String(v).length > 14 ? Number(v).toPrecision(10) : String(v); }
    function apply() {
      var b = parseFloat(cur);
      if (acc == null || !op) return b;
      if (op === "+") return acc + b;
      if (op === "−") return acc - b;
      if (op === "×") return acc * b;
      if (op === "÷") return b === 0 ? NaN : acc / b;
      return b;
    }
    function round(n) { return isFinite(n) ? Math.round(n * 1e10) / 1e10 : n; }
    function press(k) {
      if (k >= "0" && k <= "9" || k === "00") {
        cur = fresh || cur === "0" ? (k === "00" ? "0" : k) : cur + k; fresh = false; show(cur);
      } else if (k === ".") {
        if (fresh) { cur = "0."; fresh = false; } else if (cur.indexOf(".") < 0) cur += ".";
        show(cur);
      } else if (k === "C") { acc = null; op = null; cur = "0"; fresh = true; show("0"); }
      else if (k === "⌫") { cur = cur.length > 1 ? cur.slice(0, -1) : "0"; show(cur); }
      else if (k === "%") { cur = String(round(parseFloat(cur) / 100)); show(cur); }
      else if (k === "=") {
        var r = round(apply());
        show(isFinite(r) ? r : "—");
        acc = null; op = null; cur = isFinite(r) ? String(r) : "0"; fresh = true;
      } else { // + − × ÷
        var v = round(apply());
        acc = isFinite(v) ? v : 0; op = k; cur = String(acc); fresh = true; show(acc);
      }
    }
    panel.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-k]");
      if (b) press(b.getAttribute("data-k"));
    });
    fab.addEventListener("click", function () { panel.classList.toggle("open"); });
    document.addEventListener("keydown", function (e) {
      if (!panel.classList.contains("open")) return;
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      var map = { "*": "×", "/": "÷", "-": "−", "+": "+", "Enter": "=", "=": "=", "Backspace": "⌫", "Escape": "C", ".": "." };
      var k = /^[0-9]$/.test(e.key) ? e.key : map[e.key];
      if (k) { e.preventDefault(); press(k); }
    });
  }

  /* ------------- pluggable AI (free-tier friendly) ------------- */
  // Providers, in order: the Makhie edge function (Gemini free tier, key kept
  // server-side), then Chrome's built-in on-device model. Features that use
  // MK.ai stay hidden until a provider answers, so nothing ever looks broken.
  var AI_URL = SUPA_URL + "/functions/v1/makhie-ai";
  var aiProbe = null;
  function aiAvailable() {
    if (aiProbe) return aiProbe;
    aiProbe = fetch(AI_URL, {
      method: "POST",
      headers: { "content-type": "application/json", apikey: SUPA_KEY, Authorization: "Bearer " + SUPA_KEY },
      body: JSON.stringify({ ping: true })
    }).then(function (r) { return r.ok ? "edge" : chromeAi(); })
      .catch(function () { return chromeAi(); });
    return aiProbe;
    // The interface existing is not enough — the on-device model must actually
    // be available, or buttons would appear and then fail.
    function chromeAi() {
      try {
        if (window.LanguageModel && window.LanguageModel.availability) {
          return window.LanguageModel.availability()
            .then(function (a) { return a === "available" ? "chrome" : null; })
            .catch(function () { return null; });
        }
        if (window.ai && window.ai.languageModel && window.ai.languageModel.capabilities) {
          return window.ai.languageModel.capabilities()
            .then(function (c) { return c.available === "readily" ? "chrome" : null; })
            .catch(function () { return null; });
        }
      } catch (e) {}
      return null;
    }
  }
  function ai(system, prompt) {
    return aiAvailable().then(function (mode) {
      if (mode === "edge") {
        return fetch(AI_URL, {
          method: "POST",
          headers: { "content-type": "application/json", apikey: SUPA_KEY, Authorization: "Bearer " + SUPA_KEY },
          body: JSON.stringify({ system: system, prompt: prompt })
        }).then(function (r) { return r.json(); }).then(function (j) {
          if (!j || !j.text) throw new Error(j && j.error || "empty");
          return j.text;
        });
      }
      if (mode === "chrome") {
        var LM = window.LanguageModel || window.ai.languageModel;
        return LM.create({ initialPrompts: [{ role: "system", content: system }] })
          .then(function (s) { return s.prompt(prompt); });
      }
      throw new Error("unavailable");
    });
  }
  // Reveal opt-in AI controls (class .mk-ai, hidden by default) when a provider exists.
  function mountAi() {
    var els = document.querySelectorAll(".mk-ai");
    if (!els.length) return;
    aiAvailable().then(function (mode) {
      if (mode) [].forEach.call(els, function (el) { el.style.display = ""; });
    });
  }

  /* ------------- first-party telemetry, usage & favourites ------------- */
  function sid() {
    try {
      var v = sessionStorage.getItem("mk.sid");
      if (!v) { v = uid(12); sessionStorage.setItem("mk.sid", v); }
      return v;
    } catch (e) { return "anon"; }
  }
  function ping(tag) {
    if (!sb) return;
    var u = currentUser && !currentUser.demo ? currentUser : null;
    sb.from("makhie_events").insert({
      sid: sid(), user_id: u ? u.id : null, email: u ? u.email : null,
      page: tag || location.pathname.replace(/^.*\/(apps\/)?/, "").replace(".html", "") || "home"
    }).then(function () {});
  }
  function consent() { try { return localStorage.getItem("mk.consent"); } catch (e) { return null; } }
  function mountTelemetry() {
    // The footer promises consent-respecting analytics; the ribbon makes it true.
    if (consent() === "yes") startPings();
    else if (consent() !== "no") mountConsent();
  }
  function startPings() {
    ping();
    setInterval(function () {
      if (document.visibilityState === "visible") ping("hb:" + location.pathname.split("/").pop());
    }, 90000);
  }
  function mountConsent() {
    var bar = document.createElement("div");
    bar.className = "consent";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Cookies and analytics");
    bar.innerHTML =
      "<p><b>A neighbourly heads-up.</b> Makhie uses its own cookies to remember your work on " +
      "this device, and first-party analytics to count visits — no ad trackers, nothing sold, ever.</p>" +
      "<span class='c-acts'>" +
      "<button class='btn small' id='mk-c-yes' type='button'>Accept</button>" +
      "<button class='btn quiet small' id='mk-c-no' type='button'>Deny</button>" +
      "</span>";
    document.body.appendChild(bar);
    requestAnimationFrame(function () { requestAnimationFrame(function () { bar.classList.add("show"); }); });
    function close(choice) {
      try { localStorage.setItem("mk.consent", choice); } catch (e) {}
      bar.classList.remove("show");
      setTimeout(function () { bar.remove(); }, 550);
      if (choice === "yes") startPings();
    }
    bar.querySelector("#mk-c-yes").addEventListener("click", function () { close("yes"); });
    bar.querySelector("#mk-c-no").addEventListener("click", function () { close("no"); });
  }
  // Frequently used: a simple visit counter per tool, on this device.
  function bumpUsage() {
    var m = location.pathname.match(/apps\/([\w-]+)\.html/);
    if (!m) return;
    try {
      var u2 = JSON.parse(localStorage.getItem("mk.use") || "{}");
      u2[m[1]] = (u2[m[1]] || 0) + 1;
      localStorage.setItem("mk.use", JSON.stringify(u2));
    } catch (e) {}
  }
  function usage() { try { return JSON.parse(localStorage.getItem("mk.use") || "{}"); } catch (e) { return {}; } }
  function favs() { try { return JSON.parse(localStorage.getItem("mk.favs") || "[]"); } catch (e) { return []; } }
  function setFavs(a) { try { localStorage.setItem("mk.favs", JSON.stringify(a || [])); } catch (e) {} }

  // Business identity follows the account: profile row in makhie_documents.
  function saveBizCloud(b) {
    var u = currentUser;
    if (!u || u.demo || !sb) return Promise.resolve();
    return sb.from("makhie_documents").select("id").eq("kind", "profile").limit(1).then(function (r) {
      if (r.data && r.data.length) {
        return sb.from("makhie_documents").update({ data: b, title: b.name || "Profile" }).eq("id", r.data[0].id);
      }
      return sb.from("makhie_documents").insert({ user_id: u.id, kind: "profile", title: b.name || "Profile", data: b });
    });
  }
  function loadBizCloud() {
    if (!sb) return;
    sb.from("makhie_documents").select("data").eq("kind", "profile").limit(1).then(function (r) {
      if (r.data && r.data.length && r.data[0].data && r.data[0].data.name) {
        setBiz(r.data[0].data);
      }
    });
  }
  // A banned account is shown the door mid-session too.
  function checkBanned(u) {
    if (!u || u.demo || !sb) return;
    sb.rpc("makhie_check_banned", { em: u.email }).then(function (r) {
      if (r.data === true) {
        signOut().then(function () {
          alert("This Makhie account has been deactivated. Contact support if you believe this is a mistake.");
          location.href = /\/apps\//.test(location.pathname) ? "../index.html" : "index.html";
        });
      }
    });
  }

  /* ------------- boot ------------- */
  // Sync whenever a signed-in connection (re)appears.
  onAuth(function (u) { if (u && !u.demo) { flushDocs(); checkBanned(u); loadBizCloud(); } });
  addEventListener("online", function () { flushDocs(); });
  // The living accents every page shares: flowing hairline, breathing corner
  // dots, and content that settles in as it scrolls into view.
  function mountTexture() {
    ["topline", "corner-dots"].forEach(function (cls) {
      if (!document.querySelector("." + cls.split(" ")[0] + (cls === "corner-dots" ? ":not(.tl)" : ""))) {
        var d = document.createElement("div");
        d.className = cls; d.setAttribute("aria-hidden", "true");
        document.body.appendChild(d);
      }
    });
    var targets = document.querySelectorAll(".card, .centered, footer.site, .toolbar");
    if (!targets.length) return;
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    [].forEach.call(targets, function (el) { el.classList.add("reveal"); io.observe(el); });
  }

  // The background marks glint — one at a time, at random, softly.
  function mountGlints() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var box = document.createElement("div");
    box.className = "glints"; box.setAttribute("aria-hidden", "true");
    document.body.appendChild(box);
    var CELL_W = 520, CELL_H = 460;
    var MARKS = [
      { x: 60, y: 70, src: "logo-glint-a.png" },
      { x: 320, y: 300, src: "logo-glint-b.png" }
    ];
    var base = /\/apps\//.test(location.pathname) ? "../assets/" : "assets/";
    setInterval(function () {
      if (document.visibilityState !== "visible" || Math.random() < 0.2) return;
      var cols = Math.ceil(innerWidth / CELL_W), rows = Math.ceil(innerHeight / CELL_H);
      var m = MARKS[Math.random() < 0.5 ? 0 : 1];
      var img = document.createElement("img");
      img.className = "glint";
      img.src = base + m.src;
      img.style.left = (Math.floor(Math.random() * cols) * CELL_W + m.x) + "px";
      img.style.top = (Math.floor(Math.random() * rows) * CELL_H + m.y) + "px";
      box.appendChild(img);
      requestAnimationFrame(function () { requestAnimationFrame(function () { img.classList.add("on"); }); });
      setTimeout(function () { img.classList.remove("on"); }, 1500);
      setTimeout(function () { img.remove(); }, 2900);
    }, 1700);
  }

  function bootDom() {
    mountAuth(document.querySelector("header.site .nav"));
    mountCalc();
    mountAi();
    maybeNudge();
    mountTexture();
    mountGlints();
    mountTelemetry();
    bumpUsage();
    // Every WhatsApp share button gets the real glyph, automatically.
    [].forEach.call(document.querySelectorAll(".btn.wa"), function (el) {
      if (!el.querySelector("svg")) el.insertAdjacentHTML("afterbegin", WA_ICON);
    });
  }
  // Under Next.js the script loads after DOMContentLoaded has already fired —
  // boot immediately in that case, listen otherwise.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootDom);
  else bootDom();
  init();

  window.MK = {
    sb: sb, onAuth: onAuth, openAuthModal: openAuthModal,
    saveDoc: saveDoc, listDocs: listDocs, pushDocs: pushDocs, flushDocs: flushDocs,
    backup: backup, restore: restore, nudge: maybeNudge,
    plan: plan, openUpgrade: openUpgrade, biz: biz, setBiz: setBiz, saveBizCloud: saveBizCloud,
    usage: usage, favs: favs, setFavs: setFavs,
    esc: esc, uid: uid, moneyC: moneyC, parseAmount: parseAmount,
    download: download, qrDataUrl: qrDataUrl, waLink: waLink, waIcon: WA_ICON,
    sharePdf: sharePdf, shareLastPdf: shareLastPdf,
    pdfStart: pdfStart, sigPad: sigPad, logo: LOGO64,
    ai: ai, aiAvailable: aiAvailable,
    user: function () { return currentUser; }
  };
})();
