/* ========================================================================
 * Portal PKSK — halaman pentadbiran khusus (/admin).
 *
 * - Jika belum log masuk sebagai admin, paparkan borang log masuk admin.
 * - Jika sudah log masuk sebagai admin, terus paparkan Dashboard Admin.
 * - Sesi log masuk dikekalkan oleh Supabase supaya tidak perlu log masuk
 *   semula setiap kali membuka halaman ini.
 * ==================================================================== */

(function () {
  "use strict";

  const app = document.getElementById("app");
  const logoutBtn = document.getElementById("adminLogoutBtn");
  if (!app || !logoutBtn) return;

  const escapeHtml = value => String(value == null ? "" : value).replace(/[&<>"']/g, char =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

  const isAdmin = () => window.pkskAuth?.state?.().access === "admin";

  // Selepas signIn, profil admin dimuat secara tak segerak oleh Supabase.
  // Tunggu sehingga profil siap (atau tamat masa) sebelum menyemak akses.
  async function waitForProfile() {
    for (let i = 0; i < 40; i++) {
      const state = window.pkskAuth.state();
      if (state.user && state.profile) return state;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return window.pkskAuth.state();
  }

  function renderLogin(message = "") {
    logoutBtn.hidden = true;
    app.innerHTML = `<section class="admin-login-page">
      <div class="admin-login-card">
        <p class="practice-eyebrow">Pentadbiran Portal</p>
        <h1>Log Masuk Admin PKSK</h1>
        <p class="admin-login-sub">Halaman ini khusus untuk pentadbir portal. Pengunjung biasa tidak perlu log masuk untuk menggunakan portal.</p>
        <form class="auth-form" id="adminLoginForm" novalidate>
          <label class="auth-field">
            <span>ID Pengguna / E-mel</span>
            <input name="identifier" autocomplete="username" required placeholder="ID admin atau e-mel">
          </label>
          <label class="auth-field">
            <span>Kata laluan</span>
            <input name="password" type="password" autocomplete="current-password" required placeholder="Kata laluan admin">
          </label>
          <div class="auth-msg" role="status" ${message ? "" : "hidden"}>${escapeHtml(message)}</div>
          <button type="submit" class="auth-submit">Log Masuk</button>
        </form>
      </div>
    </section>`;

    const form = app.querySelector("#adminLoginForm");
    const msg = app.querySelector(".auth-msg");
    const submit = app.querySelector(".auth-submit");

    const showMessage = text => { msg.hidden = !text; msg.textContent = text; };

    form.addEventListener("submit", async event => {
      event.preventDefault();
      const data = new FormData(form);
      const identifier = String(data.get("identifier") || "").trim();
      const password = String(data.get("password") || "");
      if (!identifier || !password) {
        showMessage("Sila isi ID pengguna/e-mel dan kata laluan.");
        return;
      }
      submit.disabled = true;
      submit.textContent = "Sebentar…";
      showMessage("");
      try {
        await window.pkskAuth.signIn(identifier, password);
        const state = await waitForProfile();
        if (state.access !== "admin") {
          await window.pkskAuth.signOut();
          throw new Error("Akaun ini bukan akaun pentadbir.");
        }
        renderDashboard();
      } catch (error) {
        const text = String(error?.message || error);
        showMessage(/Invalid login credentials|kata laluan salah/i.test(text)
          ? "ID pengguna/e-mel atau kata laluan salah."
          : /Email not confirmed/i.test(text)
            ? "Sila sahkan e-mel admin terlebih dahulu."
            : text);
        submit.disabled = false;
        submit.textContent = "Log Masuk";
      }
    });

    setTimeout(() => form.querySelector('[name="identifier"]').focus(), 0);
  }

  function renderDashboard() {
    if (!isAdmin()) return renderLogin();
    logoutBtn.hidden = false;
    window.pkskPremium?.openAdmin?.();
  }

  function route() {
    if (isAdmin()) renderDashboard(); else renderLogin();
  }

  logoutBtn.addEventListener("click", async () => {
    logoutBtn.disabled = true;
    try { await window.pkskAuth.signOut(); }
    finally { logoutBtn.disabled = false; renderLogin(); }
  });

  // Kekalkan sesi: init() memulihkan sesi Supabase yang tersimpan.
  window.pkskAuth.init().then(route).catch(() => renderLogin());
})();
