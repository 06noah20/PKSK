/* ========================================================================
 * Portal PKSK — UI Log Masuk / Daftar (Supabase)
 * Menyambungkan butang #loginBtn di header kepada modal auth.
 * Tiada perubahan pada reka bentuk sedia ada; modal ikut tema maroon.
 * ==================================================================== */

(function () {
  "use strict";

  const loginBtn = document.getElementById("loginBtn");
  if (!loginBtn) return;

  const btnLabel = () => loginBtn.querySelector(".login-label") || loginBtn;

  /* ---------------- Modal ---------------- */
  let overlay = null;

  function buildModal() {
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.className = "auth-overlay";
    overlay.innerHTML = `
      <div class="auth-modal" role="dialog" aria-modal="true" aria-label="Log Masuk Portal PKSK">
        <button class="auth-close" aria-label="Tutup">×</button>
        <h3 class="auth-title">Portal <b>PKSK</b></h3>
        <div class="auth-tabs">
          <button class="auth-tab active" data-mode="login">Log Masuk</button>
          <button class="auth-tab" data-mode="signup">Daftar Akaun</button>
        </div>
        <form class="auth-form" novalidate>
          <label class="auth-field auth-name" hidden>
            <span>Nama penuh</span>
            <input type="text" name="fullName" autocomplete="name" placeholder="Nama anda">
          </label>
          <label class="auth-field">
            <span>E-mel</span>
            <input type="email" name="email" autocomplete="email" required placeholder="nama@email.com">
          </label>
          <label class="auth-field">
            <span>Kata laluan</span>
            <input type="password" name="password" autocomplete="current-password" required minlength="6" placeholder="Sekurang-kurangnya 6 aksara">
          </label>
          <div class="auth-msg" hidden></div>
          <button type="submit" class="auth-submit">Log Masuk</button>
        </form>
        <p class="auth-note">Akaun percuma memberi akses kepada Set Latihan 1.
          Naik taraf premium membuka semua set.</p>
      </div>`;
    document.body.appendChild(overlay);

    const modal = overlay.querySelector(".auth-modal");
    const form = overlay.querySelector(".auth-form");
    const msg = overlay.querySelector(".auth-msg");
    const nameField = overlay.querySelector(".auth-name");
    const submit = overlay.querySelector(".auth-submit");
    const pwInput = form.querySelector('input[name="password"]');
    let mode = "login";

    function setMode(m) {
      mode = m;
      overlay.querySelectorAll(".auth-tab").forEach(t =>
        t.classList.toggle("active", t.dataset.mode === m));
      nameField.hidden = m !== "signup";
      submit.textContent = m === "signup" ? "Daftar" : "Log Masuk";
      pwInput.autocomplete = m === "signup" ? "new-password" : "current-password";
      showMsg("");
    }

    function showMsg(text, ok) {
      msg.hidden = !text;
      msg.textContent = text;
      msg.className = "auth-msg" + (ok ? " ok" : "");
    }

    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    overlay.querySelector(".auth-close").addEventListener("click", close);
    overlay.querySelectorAll(".auth-tab").forEach(t =>
      t.addEventListener("click", () => {
        // "Daftar Akaun" = aliran sama seperti klik set premium (daftar + QR + resit)
        if (t.dataset.mode === "signup") { close(); window.pkskPremium?.openUpgrade?.(); return; }
        setMode(t.dataset.mode);
      }));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!window.pkskAuth?.configured()) {
        showMsg("Log masuk belum diaktifkan oleh pentadbir portal. (Isi konfigurasi dalam js/supabase-client.js)");
        return;
      }
      const fd = new FormData(form);
      const email = (fd.get("email") || "").toString().trim();
      const password = (fd.get("password") || "").toString();
      const fullName = (fd.get("fullName") || "").toString().trim();
      if (!email || password.length < 6) {
        showMsg("Sila isi e-mel dan kata laluan (min. 6 aksara).");
        return;
      }
      submit.disabled = true; submit.textContent = "Sebentar…";
      try {
        if (mode === "signup") {
          const res = await window.pkskAuth.signUp(email, password, fullName);
          if (res?.user && !res.session) {
            showMsg("Berjaya! Sila semak e-mel anda untuk pengesahan akaun.", true);
          } else {
            showMsg("Akaun didaftarkan. Selamat datang!", true);
            setTimeout(close, 900);
          }
        } else {
          await window.pkskAuth.signIn(email, password);
          showMsg("Berjaya log masuk!", true);
          setTimeout(close, 700);
        }
      } catch (err) {
        const t = String(err?.message || err);
        showMsg(
          /Invalid login credentials/i.test(t) ? "E-mel atau kata laluan salah." :
          /already registered/i.test(t) ? "E-mel ini sudah didaftarkan — sila log masuk." :
          /Email not confirmed/i.test(t) ? "Sila sahkan e-mel anda dahulu (semak inbox/spam)." :
          t);
      } finally {
        submit.disabled = false;
        submit.textContent = mode === "signup" ? "Daftar" : "Log Masuk";
      }
    });

    overlay._setMode = setMode;
    return overlay;
  }

  function open(mode) {
    buildModal();
    overlay._setMode(mode || "login");
    overlay.classList.add("show");
    overlay.querySelector('input[name="email"]').focus();
  }
  function close() { overlay?.classList.remove("show"); }

  /* ---------------- Butang header ---------------- */
  function refreshButton(s) {
    const st = s || window.pkskAuth?.state?.() || { user: null };
    if (st.user) {
      const name = st.profile?.full_name || st.user.email || "Akaun";
      const short = name.split("@")[0].split(" ")[0];
      loginBtn.classList.add("logged-in");
      loginBtn.innerHTML = `<span class="tab-ico" aria-hidden="true">👤</span>${short}` +
        (st.access === "premium" || st.access === "admin"
          ? ` <span class="badge-premium">${st.access === "admin" ? "ADMIN" : "PREMIUM"}</span>` : "");
      loginBtn.title = "Klik untuk log keluar";
    } else {
      loginBtn.classList.remove("logged-in");
      loginBtn.innerHTML = `<span class="tab-ico" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0z"/></svg>
        </span> Log Masuk`;
      loginBtn.title = "";
    }
  }

  loginBtn.addEventListener("click", async () => {
    const st = window.pkskAuth?.state?.();
    if (st?.user) {
      if (confirm("Log keluar dari akaun anda?")) {
        await window.pkskAuth.signOut();
      }
    } else {
      open("login");
    }
  });

  /* API awam untuk modul lain (cth. kunci set premium) */
  window.pkskAuthUI = { open, close };

  /* ---------------- Notifikasi kelulusan ---------------- */
  function notifyApproval(st) {
    if (!st?.user) return;
    const key = "pksk_notified_" + st.user.id;
    if (st.access === "premium") {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, "1");
        toast("🎉 Tahniah! Akaun anda telah diluluskan — semua set latihan kini terbuka.");
      }
    } else {
      localStorage.removeItem(key); // set semula jika belum premium
    }
  }
  function toast(text) {
    let t = document.getElementById("pkskToast");
    if (!t) { t = document.createElement("div"); t.id = "pkskToast"; t.className = "pksk-toast"; document.body.appendChild(t); }
    t.textContent = text; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 6000);
  }

  /* ---------------- Mula ---------------- */
  if (window.pkskAuth) {
    window.pkskAuth.onChange((st) => { refreshButton(st); notifyApproval(st); });
    window.pkskAuth.init().then(() => { const s = window.pkskAuth.state(); refreshButton(s); notifyApproval(s); }).catch(() => {});
  }
})();
