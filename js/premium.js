/* ========================================================================
 * Portal PKSK — Naik Taraf Premium (QR manual + resit + kelulusan admin)
 *
 * >>> ISI BUTIRAN BANK ANDA DI SINI <<< (QR: assets/bank-qr.png)
 * ==================================================================== */

(function () {
  "use strict";

  const BANK = {
    payTo:   "NAMA PEMILIK AKAUN",
    bank:    "Maybank",
    account: "1234 5678 9012",
    amount:  "RM30",
    plan:    "Premium (12 bulan) — semua set latihan",
    qr:      "assets/bank-qr.png"
  };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function demoTag() {
    return window.pkskAuth?.isDemo?.()
      ? `<p class="demo-tag">🧪 Mod demo — data disimpan pada pelayar ini sahaja.</p>` : "";
  }

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

  /* ---------------- Daftar &/atau Naik Taraf ---------------- */
  function openUpgrade() {
    const auth = window.pkskAuth;
    const st = auth.state();
    if (st.access === "premium" || st.access === "admin") {
      overlay(`<h3 class="auth-title">Anda sudah <b>Premium</b> 🎉</h3>
        <p class="auth-note" style="font-size:13.5px">Semua set latihan sudah terbuka. Terima kasih!</p>`);
      return;
    }

    const loggedIn = !!st.user;
    const regFields = loggedIn ? "" : `
      <div class="pay-section-title">1. Daftar Akaun</div>
      <label class="auth-field"><span>Nama penuh</span>
        <input name="fullName" autocomplete="name" placeholder="Nama anda" required></label>
      <label class="auth-field"><span>E-mel</span>
        <input name="email" type="email" autocomplete="email" placeholder="nama@email.com" required></label>
      <label class="auth-field"><span>Kata laluan</span>
        <input name="password" type="password" autocomplete="new-password" minlength="6" placeholder="Min. 6 aksara" required></label>`;

    const { el, close } = overlay(`
      <h3 class="auth-title">${loggedIn ? "Naik Taraf" : "Daftar &"} <b>Premium</b></h3>
      ${demoTag()}
      <div class="pay-plan"><span>${esc(BANK.plan)}</span><strong>${esc(BANK.amount)}</strong></div>
      <form class="auth-form pay-form">
        ${regFields}
        <div class="pay-section-title">${loggedIn ? "1" : "2"}. Buat Pembayaran (imbas QR)</div>
        <div class="pay-qr">
          <img src="${esc(BANK.qr)}" alt="Kod QR bank"
            onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'pay-qr-missing',textContent:'QR belum dimuat naik (assets/bank-qr.png)'}))">
        </div>
        <ul class="pay-bank">
          <li><span>Bank</span><b>${esc(BANK.bank)}</b></li>
          <li><span>Nama</span><b>${esc(BANK.payTo)}</b></li>
          <li><span>No. Akaun</span><b>${esc(BANK.account)}</b></li>
          <li><span>Jumlah</span><b>${esc(BANK.amount)}</b></li>
        </ul>
        <div class="pay-section-title">${loggedIn ? "2" : "3"}. Hantar Bukti Bayaran</div>
        <label class="auth-field"><span>Rujukan / Nama pembayar</span>
          <input name="reference" required placeholder="cth: nombor rujukan / nama di resit"></label>
        <label class="auth-field"><span>Muat naik resit (gambar)</span>
          <input name="receipt" type="file" accept="image/*" class="pay-file"></label>
        <label class="auth-field"><span>Catatan (pilihan)</span>
          <input name="note" placeholder="cth: tarikh & masa bayaran"></label>
        <div class="auth-msg" hidden></div>
        <button type="submit" class="auth-submit">${loggedIn ? "Hantar Bukti Bayaran" : "Daftar & Hantar Bukti"}</button>
      </form>`);

    const form = el.querySelector(".pay-form");
    const msg = el.querySelector(".auth-msg");
    const submit = el.querySelector(".auth-submit");
    const showMsg = (t, ok) => { msg.hidden = !t; msg.textContent = t; msg.className = "auth-msg" + (ok ? " ok" : ""); };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const reference = (fd.get("reference") || "").toString().trim();
      if (!reference) return showMsg("Sila isi rujukan pembayaran.");
      const file = form.querySelector('input[name="receipt"]').files[0] || null;

      submit.disabled = true; submit.textContent = "Menghantar…";
      try {
        if (!loggedIn) {
          const email = (fd.get("email") || "").toString().trim();
          const password = (fd.get("password") || "").toString();
          const fullName = (fd.get("fullName") || "").toString().trim();
          if (!fullName || !email || password.length < 6)
            throw new Error("Sila lengkapkan maklumat pendaftaran (kata laluan min. 6 aksara).");
          await auth.signUp(email, password, fullName);
        }
        await auth.submitPayment({
          reference,
          amount: parseFloat((fd.get("amount") || BANK.amount).toString().replace(/[^\d.]/g, "")) || null,
          note: (fd.get("note") || "").toString().trim() || null,
          file
        });
        el.querySelector(".premium-modal").innerHTML = `
          <button class="auth-close" aria-label="Tutup">×</button>
          <h3 class="auth-title">Berjaya Dihantar ✅</h3>
          <p class="auth-note" style="font-size:13.5px">
            ${loggedIn ? "" : "Akaun anda telah didaftarkan. "}Bukti bayaran anda akan disemak
            oleh pentadbir. Akaun anda dinaik taraf ke <b>premium</b> selepas diluluskan.</p>
          <button type="button" class="auth-submit" id="paydone">Selesai</button>`;
        el.querySelector(".auth-close").addEventListener("click", close);
        el.querySelector("#paydone").addEventListener("click", close);
      } catch (err) {
        const t = String(err?.message || err);
        showMsg(/already registered|sudah didaftarkan/i.test(t)
          ? "E-mel ini sudah didaftarkan — sila log masuk dahulu, kemudian buat pembayaran."
          : "Gagal: " + t);
        submit.disabled = false; submit.textContent = loggedIn ? "Hantar Bukti Bayaran" : "Daftar & Hantar Bukti";
      }
    });
  }

  /* ---------------- Panel Admin ---------------- */
  async function openAdmin() {
    if (window.pkskAuth?.state?.().access !== "admin") return;
    const { el } = overlay(`<h3 class="auth-title">Panel <b>Admin</b> — Permintaan Bayaran</h3>
      ${demoTag()}<div class="admin-list" id="adminList"><p class="auth-note">Memuatkan…</p></div>`);
    await loadRequests(el.querySelector("#adminList"));
  }

  async function loadRequests(host) {
    let data;
    try { data = await window.pkskAuth.listPaymentRequests(); }
    catch (err) { host.innerHTML = `<p class="auth-msg">Ralat: ${esc(err.message || err)}</p>`; return; }
    if (!data.length) { host.innerHTML = `<p class="auth-note">Tiada permintaan buat masa ini.</p>`; return; }

    host.innerHTML = data.map(r => `
      <div class="admin-req status-${esc(r.status)}">
        <div class="admin-req-main">
          <strong>${esc(r.full_name || r.email || "Pengguna")}</strong>
          <span class="admin-req-meta">${esc(r.email || "")} · ${esc(r.reference || "")}${r.amount ? " · RM" + esc(r.amount) : ""}</span>
          ${r.note ? `<span class="admin-req-note">${esc(r.note)}</span>` : ""}
          ${r.receipt_url ? `<a class="admin-req-receipt" href="${esc(r.receipt_url)}" target="_blank" rel="noopener">📎 Lihat resit</a>` : `<span class="admin-req-note">(tiada resit dimuat naik)</span>`}
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
      b.addEventListener("click", () => act(b, host, "approvePayment")));
    host.querySelectorAll(".admin-reject").forEach(b =>
      b.addEventListener("click", () => act(b, host, "rejectPayment")));
  }

  async function act(btn, host, fn) {
    if (fn === "rejectPayment" && !confirm("Tolak permintaan ini?")) return;
    btn.disabled = true; btn.textContent = "…";
    try { await window.pkskAuth[fn](btn.dataset.id); await loadRequests(host); }
    catch (err) { alert("Ralat: " + (err.message || err)); btn.disabled = false; }
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
    } else if (btn) { btn.remove(); }
  }

  window.pkskPremium = { openUpgrade, openAdmin };

  if (window.pkskAuth) {
    window.pkskAuth.onChange(syncAdminButton);
    syncAdminButton();
  }
})();
