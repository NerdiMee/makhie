/* GET PAID IN CRYPTO — provider abstraction.
   One interface, two implementations:
     mock — fully working simulation (default; no provider configured)
     real — a stub that refuses politely until a provider is connected via the
            makhie-crypto-webhook edge function + CRYPTO_* secrets
   The page talks only to MKCrypto; swapping providers never touches the UI.
   No keys, no secrets, no custody here — ever. */
(function () {
  "use strict";
  var sb = window.MK && MK.sb;

  /* Live ZAR rate for the quote (display + creation quote in mock mode).
     The real provider quotes and locks its own rate server-side. */
  function getExchangeRate() {
    try {
      var c = JSON.parse(localStorage.getItem("mk.crypto.rate") || "null");
      if (c && Date.now() - c.at < 5 * 60 * 1000) return Promise.resolve(c);
    } catch (e) {}
    return fetch("https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=zar")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d["usd-coin"] || !d["usd-coin"].zar) throw new Error("rate");
        var out = { zarPerUnit: d["usd-coin"].zar, asset: "USDC", at: Date.now() };
        try { localStorage.setItem("mk.crypto.rate", JSON.stringify(out)); } catch (e) {}
        return out;
      })
      .catch(function () {
        try {
          var c2 = JSON.parse(localStorage.getItem("mk.crypto.rate") || "null");
          if (c2) { c2.stale = true; return c2; }
        } catch (e) {}
        throw new Error("rate_unavailable");
      });
  }

  var mockProvider = {
    name: "mock",
    mode: "mock",
    getExchangeRate: getExchangeRate,
    createPaymentSession: function (amountCents, asset, rate, description) {
      return sb.rpc("makhie_crypto_create", {
        amount_cents: amountCents, asset: asset, rate: rate, descr: description || ""
      }).then(function (r) {
        if (r.error) throw r.error;
        if (r.data && r.data.error) throw new Error(r.data.error);
        return r.data;
      });
    },
    getPaymentStatus: function (id) {
      return sb.from("makhie_crypto_sessions")
        .select("id,status,tx_hash,completed_at,expires_at,amount_zar_cents,crypto_amount,crypto_asset")
        .eq("id", id).single()
        .then(function (r) { if (r.error) throw r.error; return r.data; });
    },
    getPaymentAddress: function (session) { return session.payment_address; },
    getTransaction: function (id) { return mockProvider.getPaymentStatus(id); },
    listSessions: function () {
      return sb.rpc("makhie_crypto_expire").then(function () {
        return sb.from("makhie_crypto_sessions")
          .select("id,amount_zar_cents,crypto_amount,crypto_asset,status,created_at,tx_hash,description")
          .order("created_at", { ascending: false }).limit(50)
          .then(function (r) { if (r.error) throw r.error; return r.data; });
      });
    },
    // Simulation controls — the mock stand-in for provider webhooks. The
    // server enforces the same state machine + idempotency the real webhook
    // will use, so testing here tests the real flow's rules.
    simulate: function (id, event) {
      return sb.rpc("makhie_crypto_mock_event", { sid: id, event: event })
        .then(function (r) { if (r.error) throw r.error; return r.data; });
    },
    verifyWebhook: function () { throw new Error("mock provider has no inbound webhooks"); }
  };

  var realProvider = {
    name: "real",
    mode: "unconfigured",
    getExchangeRate: getExchangeRate,
    createPaymentSession: function () {
      return Promise.reject(new Error("No crypto payment provider is connected yet. Deploy the makhie-crypto-webhook function and set the CRYPTO_* secrets, then switch MK_CRYPTO_PROVIDER to 'real'."));
    },
    getPaymentStatus: mockProvider.getPaymentStatus,
    getPaymentAddress: mockProvider.getPaymentAddress,
    getTransaction: mockProvider.getPaymentStatus,
    listSessions: mockProvider.listSessions,
    simulate: function () { return Promise.reject(new Error("Simulation is mock-mode only.")); },
    verifyWebhook: function () { throw new Error("verified server-side in the edge function"); }
  };

  // Provider selection. Real config lives server-side; this flag only picks
  // which client path to use and defaults safely to mock.
  var which = (window.MK_CRYPTO_PROVIDER || localStorage.getItem("mk.crypto.provider") || "mock");
  window.MKCrypto = which === "real" ? realProvider : mockProvider;
})();
