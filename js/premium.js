/* ========================================================================
 * Portal PKSK — Naik Taraf Premium (bayaran QR manual)
 * ------------------------------------------------------------------------
 * Aliran:
 *   1. Pengguna klik "Naik Taraf Premium" -> papar QR bank + butiran.
 *   2. Selepas bayar, pengguna hantar borang (rujukan + jumlah).
 *   3. Admin log masuk -> Panel Admin -> Luluskan -> pengguna jadi premium.
 *
 * >>> ISI BUTIRAN BANK ANDA DI SINI <<<
 * Muat naik gambar QR ke: assets/bank-qr.png
 * ==================================================================== */

(function () {
  "use strict";

  const BANK = {
    payTo:   "NAMA PEMILIK AKAUN",     // nama pada akaun bank
    bank:    "Maybank",                 // nama bank
    account: "1234 5678 9012",          // nombor akaun
    amount:  "RM30",                    // harga langganan premium
    plan:    "Premium (12 bulan)",      // label pelan
    qr:      "assets/bank-qr.png"       // gambar QR (muat naik ke sini)
  };
  const APPROVE_MONTHS = 12;

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function overlay(html) {
    const o = document.createElement("div");
    o.className = "auth-overlay show";
    o.innerHTML = `<div class="auth-modal premium-modal" role="dialog" aria-modal="true">
      <button class="auth-close" aria-label="Tutup">×</button>${html}</div>`;
    document.body.appendChild(o);
    const close = () => o.remove();
    o.addEventListener("click", (e) => { if (e.target === o) close(); });
    o.querySelector(".auth-close").addEventListener("click", close);
    return { el: o, close };
  }

  /* ---------------- Halaman Naik Taraf ---------------- */
  async function openUpgrade() {
    const auth = window.pkskAuth;
    if (!auth?.configured?.()) {
      overlay(`<h3 class="auth-title">Naik Taraf <b>Premium</b></h3>
        <p class="auth-note" style="font-size:13.5px">Sistem langganan belum diaktifkan oleh pentadbir portal.</p>`);
      return;
    }
    const st = auth.state();
    if (!st.user) {
      window.pkskAuthUI?.open?.("login");
      return;
    }
    if (st.access === "premium" || st.access === "admin") {
      overlay(`<h3 class="auth-title">Anda sudah <b>Premium</b> 🎉</h3>
        <p class="auth-note" style="font-size:13.5px">Semua set latihan sudah terbuka untuk anda. Terima kasih!</p>`);
      return;
    }

    const { el, close } = overlay(`
      <h3 class="auth-title">Naik Taraf <b>Premium</b></h3>
      <div class="pay-plan"><span>${esc(BANK.plan)}</span><strong>${esc(BANK.amount)}</strong></div>
      <div class="pay-qr">
        <img src="${esc(BANK.qr)}" alt="Kod QR bank"
          onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'pay-qr-missing',textContent:'Kod QR belum dimuat naik (assets/bank-qr.png)'}))">
      </div>
      <ul class="pay-bank">
        <li><span>Bank</span><b>${esc(BANK.bank)}</b></li>
        <li><span>Nama</span><b>${esc(BANK.payTo)}</b></li>
        <li><span>No. Akaun</span><b>${esc(BANK.account)}</b></li>
        <li><span>Jumlah</span><b>${esc(BANK.amount)}</b></li>
      </ul>
      <p class="pay-step">Selepas membuat pembayaran, isi maklumat di bawah untuk pengesahan:</p>
      <form class="auth-form pay-form">
        <label class="auth-field"><span>Rujukan / Nama pembayar</span>
          <input name="reference" required placeholder="cth: nombor rujukan atau nama di resit"></label>
        <label class="auth-field"><span>Jumlah dibayar</span>
          <input name="amount" value="${esc(BANK.amount)}"></label>
        <label class="auth-field"><span>Catatan (pilihan)</span>
          <input name="note" placeholder="cth: tarikh / masa pembayaran"></label>
        <div class="auth-msg" hidden></div>
        <button type="submit" class="auth-submit">Hantar Untuk Pengesahan</button>
      </form>`);

    const form = el.querySelector(".pay-form");
    const msg = el.querySelector(".auth-msg");
    const submit = el.querySelector(".auth-submit");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const reference = (fd.get("reference") || "").toString().trim();
      if (!reference) { msg.hidden = false; msg.className = "auth-msg"; msg.textContent = "Sila isi rujukan pembayaran."; return; }
      submit.disabled = true; submit.textContent = "Menghantar…";
      try {
        const client = auth.client;
        const { error } = await client.from("payment_requests").insert({
          user_id: st.user.id,
          full_name: st.profile?.full_name || null,
          email: st.user.email || null,
          amount: parseFloat((fd.get("amount") || "").toString().replace(/[^\d.]/g, "")) || null,
          reference,
          note: (fd.get("note") || "").toString().trim() || null
        });
        if (error) throw error;
        el.querySelector(".premium-modal").innerHTML = `
          <button class="auth-close" aria-label="Tutup">×</button>
          <h3 class="auth-title">Permintaan Dihantar ✅</h3>
          <p class="auth-note" style="font-size:13.5px">
            Terima kasih! Pembayaran anda akan disemak oleh pentadbir.
            Akaun anda akan dinaik taraf ke <b>premium</b> selepas diluluskan.</p>
          <button type="button" class="auth-submit" id="paydone">Selesai</button>`;
        el.querySelector(".auth-close").addEventListener("click", close);
        el.querySelector("#paydone").addEventListener("click", close);
      } catch (err) {
        msg.hidden = false; msg.className = "auth-msg";
        msg.textContent = "Gagal menghantar: " + (err?.message || err);
        submit.disabled = false; submit.textContent = "Hantar Untuk Pengesahan";
      }
    });
  }

  /* ---------------- Panel Admin ---------------- */
  async function openAdmin() {
    const auth = window.pkskAuth;
    if (auth?.state?.().access !== "admin") return;
    const { el } = overlay(`<h3 class="auth-title">Panel <b>Admin</b> — Permintaan Bayaran</h3>
      <div class="admin-list" id="adminList"><p class="auth-note">Memuatkan…</p></div>`);
    await loadRequests(el.querySelector("#adminList"));
  }

  async function loadRequests(host) {
    const client = window.pkskAuth.client;
    const { data, error } = await client
      .from("payment_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) { host.innerHTML = `<p class="auth-msg">Ralat: ${esc(error.message)}</p>`; return; }
    if (!data.length) { host.innerHTML = `<p class="auth-note">Tiada permintaan buat masa ini.</p>`; return; }

    host.innerHTML = data.map(r => `
      <div class="admin-req status-${esc(r.status)}" data-id="${esc(r.id)}">
        <div class="admin-req-main">
          <strong>${esc(r.full_name || r.email || "Pengguna")}</strong>
          <span class="admin-req-meta">${esc(r.email || "")} · ${esc(r.reference || "")}${r.amount ? " · RM" + esc(r.amount) : ""}</span>
          ${r.note ? `<span class="admin-req-note">${esc(r.note)}</span>` : ""}
          <span class="admin-req-date">${new Date(r.created_at).toLocaleString("ms-MY")}</span>
        </div>
        <div class="admin-req-actions">
          ${r.status === "pending"
            ? `<button class="admin-approve" data-id="${esc(r.id)}">Luluskan</button>
               <button class="admin-reject" data-id="${esc(r.id)}">Tolak</button>`
            : `<span class="admin-badge ${esc(r.status)}">${r.status === "approved" ? "Diluluskan" : "Ditolak"}</span>`}
        </div>
      </div>`).join("");

    host.querySelectorAll(".admin-approve").forEach(b =>
      b.addEventListener("click", () => act(b, host, "approve_premium", { p_request: b.dataset.id, p_months: APPROVE_MONTHS })));
    host.querySelectorAll(".admin-reject").forEach(b =>
      b.addEventListener("click", () => act(b, host, "reject_payment", { p_request: b.dataset.id })));
  }

  async function act(btn, host, rpc, args) {
    if (rpc === "reject_payment" && !confirm("Tolak permintaan ini?")) return;
    btn.disabled = true; btn.textContent = "…";
    try {
      const { error } = await window.pkskAuth.client.rpc(rpc, args);
      if (error) throw error;
      await loadRequests(host);
    } catch (err) {
      alert("Ralat: " + (err?.message || err));
      btn.disabled = false;
    }
  }

  /* ---------------- Butang Admin dalam header ---------------- */
  function syncAdminButton(s) {
    const st = s || window.pkskAuth?.state?.() || {};
    let btn = document.getElementById("adminBtn");
    if (st.access === "admin") {
      if (!btn) {
        btn = document.createElement("button");
        btn.id = "adminBtn"; btn.className = "nav-cta admin-cta"; btn.type = "button";
        btn.textContent = "🛡️ Admin";
        btn.addEventListener("click", openAdmin);
        const login = document.getElementById("loginBtn");
        login?.parentNode?.insertBefore(btn, login);
      }
    } else if (btn) {
      btn.remove();
    }
  }

  window.pkskPremium = { openUpgrade, openAdmin };

  if (window.pkskAuth) {
    window.pkskAuth.onChange(syncAdminButton);
    syncAdminButton();
  }
})();
