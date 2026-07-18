/* ========================================================================
 * Portal PKSK — satu UI untuk log masuk, pendaftaran dan paparan akaun.
 * Pendaftaran dari header dan set premium menggunakan modal yang sama.
 * ==================================================================== */

(function () {
  "use strict";

  const loginBtn = document.getElementById("loginBtn");
  if (!loginBtn) return;

  let overlay = null;

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, char =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function close() {
    overlay?.remove();
    overlay = null;
  }

  function createOverlay(content, className = "") {
    close();
    overlay = document.createElement("div");
    overlay.className = "auth-overlay show";
    overlay.innerHTML = `<div class="auth-modal ${className}" role="dialog" aria-modal="true">
      <button class="auth-close" type="button" aria-label="Tutup">×</button>${content}</div>`;
    document.body.appendChild(overlay);
    let pressedOnBackdrop = false;
    overlay.addEventListener("pointerdown", event => {
      pressedOnBackdrop = event.target === overlay;
    });
    overlay.addEventListener("pointerup", event => {
      if (pressedOnBackdrop && event.target === overlay) close();
      pressedOnBackdrop = false;
    });
    overlay.addEventListener("pointercancel", () => { pressedOnBackdrop = false; });
    overlay.querySelector(".auth-close").addEventListener("click", close);
    return overlay;
  }

  function open(mode = "login") {
    if (mode === "signup" && window.pkskPremium?.openUpgrade) {
      close();
      window.pkskPremium.openUpgrade();
      return;
    }
    const view = createOverlay(`
      <h3 class="auth-title">Portal <b>PKSK</b></h3>
      <div class="auth-tabs">
        <button class="auth-tab" type="button" data-mode="login">Log Masuk</button>
        <button class="auth-tab" type="button" data-mode="signup">Daftar Akaun</button>
      </div>
      <form class="auth-form" novalidate>
        <label class="auth-field auth-name" hidden>
          <span>Nama penuh</span>
          <input type="text" name="fullName" autocomplete="name" placeholder="Nama anda">
        </label>
        <label class="auth-field">
          <span class="auth-identifier-label">ID Pengguna / E-mel</span>
          <input type="text" name="identifier" autocomplete="username" required placeholder="ID pengguna atau e-mel">
        </label>
        <label class="auth-field">
          <span>Kata laluan</span>
          <input type="password" name="password" autocomplete="current-password" required minlength="6" placeholder="Sekurang-kurangnya 6 aksara">
        </label>
        <div class="auth-msg" role="status" hidden></div>
        <button type="submit" class="auth-submit">Log Masuk</button>
      </form>
      <p class="auth-note auth-flow-note"></p>`);

    const form = view.querySelector(".auth-form");
    const msg = view.querySelector(".auth-msg");
    const nameField = view.querySelector(".auth-name");
    const identifierInput = form.querySelector('[name="identifier"]');
    const identifierLabel = view.querySelector(".auth-identifier-label");
    const passwordInput = form.querySelector('[name="password"]');
    const submit = view.querySelector(".auth-submit");
    const note = view.querySelector(".auth-flow-note");
    let currentMode = mode === "signup" ? "signup" : "login";

    function showMessage(text, ok = false) {
      msg.hidden = !text;
      msg.textContent = text;
      msg.className = "auth-msg" + (ok ? " ok" : "");
    }

    function setMode(nextMode) {
      currentMode = nextMode;
      view.querySelectorAll(".auth-tab").forEach(tab =>
        tab.classList.toggle("active", tab.dataset.mode === currentMode));
      const signingUp = currentMode === "signup";
      nameField.hidden = !signingUp;
      identifierInput.type = signingUp ? "email" : "text";
      identifierInput.autocomplete = signingUp ? "email" : "username";
      identifierInput.placeholder = signingUp ? "nama@email.com" : "ID pengguna atau e-mel";
      identifierLabel.textContent = signingUp ? "E-mel" : "ID Pengguna / E-mel";
      passwordInput.autocomplete = signingUp ? "new-password" : "current-password";
      submit.textContent = signingUp ? "Hantar Pendaftaran" : "Log Masuk";
      note.innerHTML = signingUp
        ? "Selepas mendaftar, akaun anda terus wujud tetapi Set Latihan 2–10 kekal berkunci sehingga diluluskan admin."
        : "Log masuk untuk menyemak status akaun dan notifikasi kelulusan anda.";
      showMessage("");
    }

    view.querySelectorAll(".auth-tab").forEach(tab =>
      tab.addEventListener("click", () => {
        if (tab.dataset.mode === "signup" && window.pkskPremium?.openUpgrade) {
          close();
          window.pkskPremium.openUpgrade();
        } else setMode(tab.dataset.mode);
      }));

    form.addEventListener("submit", async event => {
      event.preventDefault();
      const data = new FormData(form);
      const identifier = String(data.get("identifier") || "").trim();
      const password = String(data.get("password") || "");
      const fullName = String(data.get("fullName") || "").trim();
      const signingUp = currentMode === "signup";

      if (!identifier || password.length < 6 || (signingUp && !fullName)) {
        showMessage(signingUp
          ? "Sila isi nama, e-mel dan kata laluan sekurang-kurangnya 6 aksara."
          : "Sila isi ID pengguna/e-mel dan kata laluan.");
        return;
      }

      submit.disabled = true;
      submit.textContent = "Sebentar…";
      try {
        if (signingUp) {
          const result = await window.pkskAuth.signUp(identifier, password, fullName);
          if (result?.user && !result.session) {
            showMessage("Akaun telah dicipta. Sila sahkan e-mel, kemudian log masuk untuk melihat status kelulusan admin.", true);
          } else {
            showMessage("Pendaftaran berjaya. Akaun anda sedang menunggu kelulusan admin.", true);
            setTimeout(() => openAccount(), 850);
          }
        } else {
          await window.pkskAuth.signIn(identifier, password);
          const current = window.pkskAuth.state();
          showMessage("Berjaya log masuk!", true);
          if (current.access === "admin") {
            setTimeout(() => {
              close();
              window.pkskPremium?.openAdmin?.();
            }, 650);
          } else {
            setTimeout(() => openAccount(), 650);
          }
        }
      } catch (error) {
        const text = String(error?.message || error);
        showMessage(
          /Invalid login credentials|kata laluan salah/i.test(text)
            ? "ID pengguna/e-mel atau kata laluan salah."
            : /already registered|sudah didaftarkan/i.test(text)
              ? "E-mel ini sudah didaftarkan — sila log masuk."
              : /Email not confirmed/i.test(text)
                ? "Sila sahkan e-mel anda dahulu (semak inbox atau spam)."
                : text);
      } finally {
        submit.disabled = false;
        submit.textContent = currentMode === "signup" ? "Hantar Pendaftaran" : "Log Masuk";
      }
    });

    setMode(currentMode);
    setTimeout(() => identifierInput.focus(), 0);
  }

  function statusCopy(status) {
    if (status === "approved") return {
      tone: "approved",
      title: "Akaun telah diluluskan",
      body: "Tahniah! Admin telah meluluskan akaun anda. Set Latihan 2–10 kini sudah dibuka."
    };
    if (status === "rejected") return {
      tone: "rejected",
      title: "Pendaftaran belum diluluskan",
      body: "Permohonan anda tidak diluluskan. Sila hubungi pentadbir PKSK untuk semakan lanjut."
    };
    return {
      tone: "pending",
      title: "Menunggu kelulusan admin",
      body: "Akaun anda sudah wujud. Set Latihan 1 boleh digunakan, manakala Set 2–10 akan dibuka selepas admin meluluskan pendaftaran."
    };
  }

  function openAccount() {
    const state = window.pkskAuth?.state?.();
    if (!state?.user) return open("login");
    const isAdmin = state.access === "admin";
    const name = state.profile?.full_name || state.user.email || state.user.username || "Akaun";
    const identifier = state.user.username || state.user.email || "";
    const status = statusCopy(state.approval);
    const notification = state.notification ? `
      <section class="account-notification ${escapeHtml(status.tone)}" role="status">
        <span class="account-notification-icon">${state.approval === "approved" ? "✓" : "!"}</span>
        <div><strong>Notifikasi baharu</strong><p>${escapeHtml(status.body)}</p></div>
      </section>` : "";

    const view = createOverlay(`
      <div class="account-heading">
        <span class="account-avatar">${escapeHtml(name.charAt(0).toUpperCase())}</span>
        <div><h3>${escapeHtml(name)}</h3><p>${escapeHtml(identifier)}</p></div>
      </div>
      ${notification}
      ${isAdmin ? `
        <section class="account-status approved">
          <strong>Akaun Pentadbir</strong>
          <p>Gunakan butang Panel Admin pada bar utama untuk mengurus portal.</p>
        </section>` : `
        <section class="account-status ${escapeHtml(status.tone)}">
          <span class="account-status-label">Status Akaun</span>
          <strong>${escapeHtml(status.title)}</strong>
          <p>${escapeHtml(status.body)}</p>
        </section>
        ${state.notification ? `<button class="account-secondary" type="button" data-action="read">Tandakan notifikasi sudah dibaca</button>` : ""}`}
      <button class="account-logout" type="button" data-action="logout">Log Keluar</button>`, "account-modal");

    view.querySelector('[data-action="logout"]').addEventListener("click", async () => {
      await window.pkskAuth.signOut();
      close();
    });
    view.querySelector('[data-action="read"]')?.addEventListener("click", async event => {
      event.currentTarget.disabled = true;
      await window.pkskAuth.markApprovalNotificationRead();
      openAccount();
    });
  }

  function refreshButton(nextState) {
    const state = nextState || window.pkskAuth?.state?.() || { user: null };
    if (state.user) {
      const name = state.profile?.full_name || state.user.username || state.user.email || "Akaun";
      const shortName = name.split("@")[0].split(" ")[0];
      const badge = state.access === "admin"
        ? '<span class="badge-premium">ADMIN</span>'
        : state.access === "premium"
          ? '<span class="badge-premium">DILULUSKAN</span>'
          : '<span class="badge-pending">MENUNGGU</span>';
      const dot = state.notification ? '<span class="account-alert-dot" aria-label="Notifikasi baharu"></span>' : "";
      loginBtn.classList.add("logged-in");
      loginBtn.innerHTML = `<span class="tab-ico" aria-hidden="true">👤</span>${escapeHtml(shortName)}${badge}${dot}`;
      loginBtn.title = "Buka paparan akaun";
    } else {
      loginBtn.classList.remove("logged-in");
      loginBtn.innerHTML = `<span class="tab-ico" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0z"/></svg>
        </span> Log Masuk / Daftar`;
      loginBtn.title = "Log masuk atau daftar akaun";
    }
  }

  loginBtn.addEventListener("click", () => {
    const state = window.pkskAuth?.state?.();
    if (state?.user) openAccount(); else open("login");
  });

  window.pkskAuthUI = { open, close, openAccount };

  if (window.pkskAuth) {
    window.pkskAuth.onChange(refreshButton);
    window.pkskAuth.init().then(() => refreshButton()).catch(() => {});
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
