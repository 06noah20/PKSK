/* ========================================================================
 * Portal PKSK — pendaftaran berbayar, kelulusan admin dan urus soalan.
 * ==================================================================== */

(function () {
  "use strict";

  const BANK = {
    payTo: "Nurul Husna",
    bank: "CIMB",
    account: "70 5679772 9",
    amount: 15,
    plan: "Premium (6 bulan) — semua set latihan",
    qr: "assets/QR.jpeg"
  };

  const escapeHtml = value => String(value == null ? "" : value).replace(/[&<>"']/g, char =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

  function createOverlay(content, className = "") {
    const overlay = document.createElement("div");
    overlay.className = "auth-overlay show";
    overlay.innerHTML = `<div class="auth-modal ${className}" role="dialog" aria-modal="true">
      <button class="auth-close" type="button" aria-label="Tutup">×</button>${content}</div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
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
    return { overlay, close };
  }

  function openUpgrade() {
    const auth = window.pkskAuth;
    const state = auth?.state?.() || { access: "anon" };
    if (state.access === "premium") return window.pkskAuthUI?.openAccount?.();
    if (state.access === "admin") return openAdmin();

    const loggedIn = Boolean(state.user);
    const registrationFields = loggedIn ? `
      <section class="pay-signed-in">
        <strong>${escapeHtml(state.profile?.full_name || state.user.email || "Pengguna")}</strong>
        <span>Akaun sudah wujud — lengkapkan pembayaran untuk semakan admin.</span>
      </section>` : `
      <div class="pay-section-title">1. Daftar Akaun</div>
      <label class="auth-field"><span>Nama penuh</span>
        <input name="fullName" autocomplete="name" placeholder="Nama anda" required></label>
      <label class="auth-field"><span>E-mel</span>
        <input name="email" type="email" autocomplete="email" placeholder="nama@email.com" required></label>
      <label class="auth-field"><span>Kata laluan</span>
        <input name="password" type="password" autocomplete="new-password" minlength="6" placeholder="Min. 6 aksara" required></label>`;

    const paymentStep = loggedIn ? 1 : 2;
    const proofStep = loggedIn ? 2 : 3;
    const { overlay, close } = createOverlay(`
      <h3 class="auth-title">Daftar & <b>Buka Semua Set</b></h3>
      <div class="pay-plan"><span>${escapeHtml(BANK.plan)}</span><strong>RM${BANK.amount}</strong></div>
      <form class="auth-form pay-form" novalidate>
        ${registrationFields}
        <div class="pay-section-title">${paymentStep}. Buat Pembayaran (imbas QR)</div>
        <div class="pay-qr"><img src="${escapeHtml(BANK.qr)}" alt="Kod QR pembayaran CIMB"></div>
        <ul class="pay-bank">
          <li><span>Bank</span><b>${escapeHtml(BANK.bank)}</b></li>
          <li><span>Nama</span><b>${escapeHtml(BANK.payTo)}</b></li>
          <li><span>No. Akaun</span><b>${escapeHtml(BANK.account)}</b></li>
        </ul>

        <div class="pay-section-title">${proofStep}. Hantar Bukti Bayaran</div>
        <label class="auth-field"><span>Rujukan / Nama pembayar</span>
          <input name="reference" required placeholder="cth: nombor rujukan / nama di resit"></label>
        <label class="auth-field"><span>Muat naik resit (gambar)</span>
          <input name="receipt" type="file" accept="image/png,image/jpeg,image/webp" class="pay-file" required></label>
        <p class="pay-file-hint">Format JPG, PNG atau WebP. Maksimum 2 MB.</p>
        <label class="auth-field"><span>Catatan (pilihan)</span>
          <input name="note" placeholder="cth: tarikh & masa bayaran"></label>
        <div class="auth-msg" role="status" hidden></div>
        <button type="submit" class="auth-submit">${loggedIn ? "Hantar Bukti Bayaran" : "Daftar & Hantar Bukti"}</button>
      </form>`, "premium-modal");

    const form = overlay.querySelector(".pay-form");
    const message = overlay.querySelector(".auth-msg");
    const submit = overlay.querySelector(".auth-submit");
    const showMessage = (text, ok = false) => {
      message.hidden = !text;
      message.textContent = text;
      message.className = "auth-msg" + (ok ? " ok" : "");
    };

    form.addEventListener("submit", async event => {
      event.preventDefault();
      const data = new FormData(form);
      const reference = String(data.get("reference") || "").trim();
      const file = form.querySelector('[name="receipt"]').files[0] || null;
      if (!reference) return showMessage("Sila isi rujukan atau nama pembayar.");
      if (!file) return showMessage("Sila sertakan gambar resit pembayaran.");
      if (file.size > 2 * 1024 * 1024) return showMessage("Saiz resit melebihi 2 MB.");

      submit.disabled = true;
      submit.textContent = "Menghantar…";
      try {
        if (!loggedIn) {
          const fullName = String(data.get("fullName") || "").trim();
          const email = String(data.get("email") || "").trim();
          const password = String(data.get("password") || "");
          if (!fullName || !email || password.length < 6) {
            throw new Error("Sila lengkapkan maklumat pendaftaran. Kata laluan minimum 6 aksara.");
          }
          const result = await auth.signUp(email, password, fullName);
          if (result?.user && !result.session) {
            throw new Error("Akaun dicipta. Sila sahkan e-mel dan log masuk semula untuk menghantar resit.");
          }
        }

        await auth.submitPayment({
          reference,
          amount: BANK.amount,
          note: String(data.get("note") || "").trim(),
          file
        });

        overlay.querySelector(".premium-modal").innerHTML = `
          <button class="auth-close" type="button" aria-label="Tutup">×</button>
          <div class="pay-success-icon">✓</div>
          <h3 class="auth-title">Pendaftaran Berjaya Dihantar</h3>
          <p class="auth-note pay-success-copy">Akaun anda sudah wujud dan bukti bayaran telah diterima. Set Latihan 2–10 masih berkunci sehingga admin meluluskan pendaftaran.</p>
          <button type="button" class="auth-submit" id="viewAccountStatus">Lihat Status Akaun</button>`;
        overlay.querySelector(".auth-close").addEventListener("click", close);
        overlay.querySelector("#viewAccountStatus").addEventListener("click", () => {
          close();
          window.pkskAuthUI?.openAccount?.();
        });
      } catch (error) {
        const text = String(error?.message || error);
        showMessage(/already registered|sudah didaftarkan/i.test(text)
          ? "E-mel sudah didaftarkan. Log masuk dahulu, kemudian hantar bukti bayaran."
          : text);
        submit.disabled = false;
        submit.textContent = loggedIn ? "Hantar Bukti Bayaran" : "Daftar & Hantar Bukti";
      }
    });
  }

  async function openAdmin() {
    if (window.pkskAuth?.state?.().access !== "admin") return;
    const app = document.getElementById("app");
    if (!app) return;
    document.querySelectorAll("#tabbar .tab").forEach(tab => tab.classList.remove("active"));
    document.getElementById("adminBtn")?.classList.add("active");
    app.innerHTML = `<section class="admin-page">
      <div class="admin-page-shell">
        <div class="admin-panel-head">
          <div><p class="practice-eyebrow">Pentadbiran Portal</p><h1>Panel Admin PKSK</h1>
            <p>Urus bank soalan, artikel portal dan ruang Minda Santai dari satu halaman.</p></div>
          <span class="admin-mode-badge">ADMIN</span>
        </div>
        <nav class="admin-nav" aria-label="Navigasi panel admin">
          <button type="button" class="active" data-admin-view="questions">Urus Soalan</button>
          <button type="button" data-admin-view="articles">Urus Artikel</button>
          <button type="button" data-admin-view="poster">Minda Santai</button>
        </nav>
        <section id="adminQuestionsView"></section>
        <section id="adminArticlesView" hidden></section>
        <section id="adminPosterView" hidden></section>
      </div>
    </section>`;
    window.scrollTo({ top: 0, behavior: "smooth" });

    const panel = app.querySelector(".admin-page");
    const questionsView = panel.querySelector("#adminQuestionsView");
    const articlesView = panel.querySelector("#adminArticlesView");
    const posterView = panel.querySelector("#adminPosterView");
    questionsView.dataset.ready = "true";
    await renderQuestionManager(questionsView);

    panel.querySelectorAll("[data-admin-view]").forEach(button =>
      button.addEventListener("click", async () => {
        const view = button.dataset.adminView;
        panel.querySelectorAll("[data-admin-view]").forEach(item => item.classList.toggle("active", item === button));
        questionsView.hidden = view !== "questions";
        articlesView.hidden = view !== "articles";
        posterView.hidden = view !== "poster";
        if (view === "articles" && !articlesView.dataset.ready) {
          articlesView.dataset.ready = "true";
          await renderArticleManager(articlesView);
        }
        if (view === "poster" && !posterView.dataset.ready) {
          posterView.dataset.ready = "true";
          await renderPosterManager(posterView);
        }
      }));
  }

  async function renderPosterManager(host) {
    host.innerHTML = `
      <div class="article-admin-toolbar">
        <div><strong>Ruang Minda Santai</strong><span>Muat naik atau kemas kini poster kartun yang dipaparkan di laman utama.</span></div>
      </div>
      <div class="poster-admin">
        <div class="poster-admin-preview" id="posterAdminPreview"><p class="auth-note">Memuatkan…</p></div>
        <form class="poster-admin-form" id="posterAdminForm" novalidate>
          <label class="auth-field"><span>Muat naik poster (PNG, JPG atau WebP)</span>
            <input type="file" name="poster" accept="image/png,image/jpeg,image/webp" required></label>
          <p class="pay-file-hint">Disyorkan bersaiz segi empat sama (contoh 800×800). Maksimum 8 MB.</p>
          <div class="auth-msg" role="status" hidden></div>
          <div class="question-editor-buttons">
            <button type="button" class="danger" id="posterRemove" hidden>Buang Poster</button>
            <button type="submit" class="admin-primary">Simpan Poster</button>
          </div>
        </form>
      </div>`;

    const preview = host.querySelector("#posterAdminPreview");
    const form = host.querySelector("#posterAdminForm");
    const message = form.querySelector(".auth-msg");
    const submit = form.querySelector('[type="submit"]');
    const removeBtn = host.querySelector("#posterRemove");
    const showMessage = (text, ok = false) => {
      message.hidden = !text;
      message.textContent = text;
      message.className = "auth-msg" + (ok ? " ok" : "");
    };

    async function draw() {
      let url = null;
      try { url = await window.pkskPoster.get(); } catch (_) { url = null; }
      if (url) {
        preview.innerHTML = `<img src="${escapeHtml(url)}" alt="Poster Minda Santai semasa">`;
        removeBtn.hidden = false;
      } else {
        preview.innerHTML = `<div class="poster-admin-empty"><span>🖼️</span><p>Belum ada poster. Muat naik untuk memaparkannya di laman utama.</p></div>`;
        removeBtn.hidden = true;
      }
    }

    form.addEventListener("submit", async event => {
      event.preventDefault();
      const file = form.querySelector('[name="poster"]').files[0] || null;
      if (!file) return showMessage("Sila pilih fail poster.");
      submit.disabled = true;
      submit.textContent = "Menyimpan…";
      showMessage("");
      try {
        const savedUrl = await window.pkskPoster.save(file);
        form.reset();
        showMessage("Poster berjaya dikemas kini dan kini dipaparkan di laman utama.", true);
        if (savedUrl) {
          preview.innerHTML = `<img src="${escapeHtml(savedUrl)}" alt="Poster Minda Santai semasa">`;
          removeBtn.hidden = false;
        } else {
          await draw();
        }
      } catch (error) {
        showMessage(error?.message || error);
      } finally {
        submit.disabled = false;
        submit.textContent = "Simpan Poster";
      }
    });

    removeBtn.addEventListener("click", async () => {
      if (!confirm("Buang poster Minda Santai daripada laman utama?")) return;
      removeBtn.disabled = true;
      try {
        await window.pkskPoster.remove();
        showMessage("Poster telah dibuang.", true);
        await draw();
      } catch (error) {
        showMessage(error?.message || error);
      } finally {
        removeBtn.disabled = false;
      }
    });

    await draw();
  }

  async function renderAccounts(host, pendingBadge) {
    host.innerHTML = `
      <div class="admin-summary" id="adminSummary"></div>
      <div class="admin-filters" role="group" aria-label="Tapis akaun">
        <button type="button" class="active" data-filter="all">Semua</button>
        <button type="button" data-filter="pending">Menunggu</button>
        <button type="button" data-filter="approved">Diluluskan</button>
        <button type="button" data-filter="rejected">Ditolak</button>
      </div>
      <div class="admin-list"><p class="auth-note">Memuatkan akaun…</p></div>`;

    const list = host.querySelector(".admin-list");
    const summary = host.querySelector("#adminSummary");
    let records = [];
    let filter = "all";

    function label(status) {
      return status === "approved" ? "Diluluskan" : status === "rejected" ? "Ditolak" : "Menunggu";
    }

    function draw() {
      const counts = records.reduce((result, record) => {
        const status = record.approval_status || "pending";
        result[status] = (result[status] || 0) + 1;
        return result;
      }, { pending: 0, approved: 0, rejected: 0 });
      pendingBadge.textContent = counts.pending;
      summary.innerHTML = `
        <div><strong>${records.length}</strong><span>Jumlah Akaun</span></div>
        <div><strong>${counts.pending}</strong><span>Menunggu</span></div>
        <div><strong>${counts.approved}</strong><span>Diluluskan</span></div>`;

      const visible = filter === "all" ? records : records.filter(record => (record.approval_status || "pending") === filter);
      if (!visible.length) {
        list.innerHTML = '<p class="admin-empty">Tiada akaun untuk paparan ini.</p>';
        return;
      }

      list.innerHTML = visible.map(record => {
        const status = record.approval_status || "pending";
        const paid = Boolean(record.payment_reference && record.receipt_url);
        const date = record.payment_submitted_at || record.created_at;
        return `<article class="admin-req status-${escapeHtml(status)}">
          <div class="admin-user-avatar">${escapeHtml((record.full_name || record.email || "P").charAt(0).toUpperCase())}</div>
          <div class="admin-req-main">
            <strong>${escapeHtml(record.full_name || "Pengguna")}</strong>
            <span class="admin-req-meta">${escapeHtml(record.email || record.username || "")}</span>
            ${paid ? `
              <span class="admin-payment-ref">Rujukan: ${escapeHtml(record.payment_reference)} · RM${escapeHtml(record.payment_amount || BANK.amount)}</span>
              ${record.payment_note ? `<span class="admin-req-note">${escapeHtml(record.payment_note)}</span>` : ""}
              <a class="admin-req-receipt" href="${escapeHtml(record.receipt_url)}" target="_blank" rel="noopener">Lihat resit pembayaran</a>`
              : '<span class="admin-payment-missing">Bukti bayaran belum dihantar</span>'}
            <span class="admin-req-date">${date ? new Date(date).toLocaleString("ms-MY") : ""}</span>
          </div>
          <div class="admin-req-actions">
            <span class="admin-badge ${escapeHtml(status)}">${label(status)}</span>
            ${status !== "approved" && paid ? `<button class="admin-approve" type="button" data-id="${escapeHtml(record.id)}">Luluskan</button>` : ""}
            ${status === "pending" ? `<button class="admin-reject" type="button" data-id="${escapeHtml(record.id)}">Tolak</button>` : ""}
          </div>
        </article>`;
      }).join("");

      list.querySelectorAll(".admin-approve").forEach(button =>
        button.addEventListener("click", () => review(button, "approveRegistration")));
      list.querySelectorAll(".admin-reject").forEach(button =>
        button.addEventListener("click", () => review(button, "rejectRegistration")));
    }

    async function reload() {
      try { records = await window.pkskAuth.listRegistrations(); draw(); }
      catch (error) { list.innerHTML = `<p class="auth-msg">Ralat: ${escapeHtml(error?.message || error)}</p>`; }
    }

    async function review(button, action) {
      if (action === "rejectRegistration" && !confirm("Tolak pendaftaran pengguna ini?")) return;
      button.disabled = true;
      button.textContent = "Memproses…";
      try { await window.pkskAuth[action](button.dataset.id); await reload(); }
      catch (error) { alert("Ralat: " + (error?.message || error)); button.disabled = false; }
    }

    host.querySelectorAll(".admin-filters button").forEach(button =>
      button.addEventListener("click", () => {
        filter = button.dataset.filter;
        host.querySelectorAll(".admin-filters button").forEach(item => item.classList.toggle("active", item === button));
        draw();
      }));
    await reload();
  }

  async function renderQuestionManager(host) {
    const api = window.pkskQuestionAdmin;
    await api.ready;
    host.innerHTML = `
      <div class="question-admin-toolbar">
        <label><span>Set Latihan</span><select id="questionSet">${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}">Set ${i + 1}</option>`).join("")}</select></label>
        <label><span>Subjek</span><select id="questionSubject">${Object.entries(api.subjects).map(([id, name]) => `<option value="${id}">${escapeHtml(name)}</option>`).join("")}</select></label>
        <button type="button" class="admin-primary" id="addQuestion">+ Soalan Baharu</button>
      </div>
      <div class="question-admin-actions">
        <button type="button" id="importQuestions">Import JSON</button>
        <input id="questionJsonFile" type="file" accept="application/json,.json" hidden>
        <button type="button" id="exportQuestions">Eksport JSON</button>
        <button type="button" class="danger" id="resetQuestions">Pulihkan Asal</button>
      </div>
      <p class="question-admin-note">Tambah atau kemas kini soalan terus di sini. Import JSON akan menggantikan semua soalan untuk set dan subjek yang dipilih.</p>
      <div id="questionEditor" hidden></div>
      <div class="question-admin-list" id="questionAdminList"></div>`;

    const setSelect = host.querySelector("#questionSet");
    const subjectSelect = host.querySelector("#questionSubject");
    const list = host.querySelector("#questionAdminList");
    const editor = host.querySelector("#questionEditor");

    function location() { return { setNo: Number(setSelect.value), subject: subjectSelect.value }; }

    function drawList() {
      const { setNo, subject } = location();
      const questions = api.getQuestions(setNo, subject);
      list.innerHTML = `<div class="question-list-head"><strong>${questions.length} soalan</strong><span>Set ${setNo} · ${escapeHtml(api.subjects[subject])}</span></div>` +
        (questions.length ? questions.map((question, index) => `
          <article class="question-admin-row">
            <span class="question-admin-number">${index + 1}</span>
            <div><strong>${escapeHtml(question.q)}</strong><span>Jawapan: ${String.fromCharCode(65 + question.answer)} · ${question.options.length} pilihan</span></div>
            <button type="button" data-edit="${index}">Edit</button>
            <button type="button" class="danger" data-delete="${index}">Padam</button>
          </article>`).join("") : '<p class="admin-empty">Belum ada soalan untuk pilihan ini.</p>');

      list.querySelectorAll("[data-edit]").forEach(button => button.addEventListener("click", () => openEditor(Number(button.dataset.edit))));
      list.querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", async () => {
        if (!confirm("Padam soalan ini?")) return;
        const current = location();
        await api.deleteQuestion(current.setNo, current.subject, Number(button.dataset.delete));
        drawList();
      }));
    }

    function imageUrlFromFigure(figure) {
      return String(figure || "").match(/<img[^>]+src=["']([^"']+)/i)?.[1] || "";
    }

    function openEditor(index = null) {
      const current = location();
      const question = index == null ? null : api.getQuestions(current.setNo, current.subject)[index];
      const options = question?.options || ["", "", "", ""];
      const currentImageUrl = imageUrlFromFigure(question?.fig);
      editor.hidden = false;
      editor.innerHTML = `<form class="question-editor-form">
        <div class="question-editor-head"><strong>${index == null ? "Tambah Soalan" : `Kemas Kini Soalan ${index + 1}`}</strong><button type="button" data-close-editor>×</button></div>
        <label><span>Teks soalan</span><textarea name="q" required>${escapeHtml(question?.q || "")}</textarea></label>
        <div class="question-option-grid">
          ${[0, 1, 2, 3].map(i => `<label><span>Pilihan ${String.fromCharCode(65 + i)}</span><input name="option${i}" value="${escapeHtml(options[i] || "")}" required></label>`).join("")}
        </div>
        <label><span>Jawapan betul</span><select name="answer">${[0, 1, 2, 3].map(i => `<option value="${i}" ${question?.answer === i ? "selected" : ""}>${String.fromCharCode(65 + i)}</option>`).join("")}</select></label>
        <label><span>Penjelasan jawapan</span><textarea name="explain">${escapeHtml(question?.explain || "")}</textarea></label>
        <label><span>Muat naik gambar rajah (pilihan)</span><input name="imageFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label>
        <p class="question-image-hint">PNG, JPG, WebP atau GIF. Maksimum 3 MB.</p>
        ${currentImageUrl ? `<div class="question-current-image"><img src="${escapeHtml(currentImageUrl)}" alt="Rajah semasa"><label><input type="checkbox" name="removeImage"> Buang gambar semasa</label></div>` : ""}
        <div class="auth-msg" hidden></div>
        <div class="question-editor-buttons"><button type="button" data-close-editor>Batal</button><button type="submit" class="admin-primary">Simpan Soalan</button></div>
      </form>`;

      editor.querySelectorAll("[data-close-editor]").forEach(button => button.addEventListener("click", () => { editor.hidden = true; }));
      editor.querySelector("form").addEventListener("submit", async event => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const submit = form.querySelector('[type="submit"]');
        const message = form.querySelector(".auth-msg");
        submit.disabled = true;
        submit.textContent = "Menyimpan…";
        try {
          const imageFile = form.querySelector('[name="imageFile"]').files[0] || null;
          let figure = data.get("removeImage") ? "" : String(question?.fig || "");
          if (imageFile) {
            const imageUrl = await api.uploadImage(imageFile);
            figure = `<img src="${escapeHtml(imageUrl)}" alt="Rajah soalan" loading="lazy">`;
          }
          const raw = {
            q: data.get("q"),
            options: [0, 1, 2, 3].map(i => data.get(`option${i}`)),
            answer: Number(data.get("answer")),
            explain: data.get("explain"),
            ...(figure ? { fig: figure } : {})
          };
          await api.saveQuestion(current.setNo, current.subject, index, raw);
          editor.hidden = true;
          drawList();
        } catch (error) {
          message.hidden = false;
          message.textContent = error?.message || error;
          submit.disabled = false;
          submit.textContent = "Simpan Soalan";
        }
      });
    }

    setSelect.addEventListener("change", () => { editor.hidden = true; drawList(); });
    subjectSelect.addEventListener("change", () => { editor.hidden = true; drawList(); });
    host.querySelector("#addQuestion").addEventListener("click", () => openEditor());
    host.querySelector("#importQuestions").addEventListener("click", () => host.querySelector("#questionJsonFile").click());
    host.querySelector("#questionJsonFile").addEventListener("change", async event => {
      const file = event.target.files[0];
      if (!file || !confirm("Import ini akan menggantikan semua soalan untuk set dan subjek dipilih. Teruskan?")) return;
      try {
        const current = location();
        await api.importQuestions(current.setNo, current.subject, await file.text());
        drawList();
      } catch (error) { alert("Import gagal: " + (error?.message || error)); }
      event.target.value = "";
    });
    host.querySelector("#exportQuestions").addEventListener("click", () => {
      const current = location();
      const blob = new Blob([api.exportQuestions(current.setNo, current.subject)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pksk-set${current.setNo}-${current.subject}.json`;
      link.click();
      URL.revokeObjectURL(url);
    });
    host.querySelector("#resetQuestions").addEventListener("click", async () => {
      if (!confirm("Pulihkan soalan asal untuk set dan subjek ini? Semua perubahan admin akan dibuang.")) return;
      const current = location();
      await api.resetSubject(current.setNo, current.subject);
      editor.hidden = true;
      drawList();
    });
    drawList();
  }

  async function renderArticleManager(host) {
    const api = window.pkskArticles;
    await api.ready;
    host.innerHTML = `
      <div class="article-admin-toolbar">
        <div><strong>Pengurusan Bicara Ilmu</strong><span>Tambah, kemas kini dan terbitkan artikel tanpa mengubah kod portal.</span></div>
        <button type="button" class="admin-primary" id="addArticle">+ Artikel Baharu</button>
      </div>
      <div id="articleAdminEditor" hidden></div>
      <div class="article-admin-list" id="articleAdminList"><p class="auth-note">Memuatkan artikel…</p></div>`;

    const editor = host.querySelector("#articleAdminEditor");
    const list = host.querySelector("#articleAdminList");

    function statusLabel(article) {
      return article.published === false ? "Disembunyikan" : "Diterbitkan";
    }

    async function drawList() {
      const articles = await api.listAdminArticles();
      list.innerHTML = articles.length ? articles.map(article => `
        <article class="article-admin-row ${article.published === false ? "is-hidden" : ""}">
          <img src="${escapeHtml(article.image)}" alt="" loading="lazy">
          <div class="article-admin-main">
            <strong>${escapeHtml(article.title)}</strong>
            <span>${escapeHtml(article.category)} · ${escapeHtml(article.date)} · ${escapeHtml(article.readTime)}</span>
            <small>${article.managed ? "Disimpan melalui Panel Admin" : "Artikel asal portal"}</small>
          </div>
          <span class="article-admin-status">${statusLabel(article)}</span>
          <div class="article-admin-actions">
            ${article.published !== false ? `<button type="button" data-preview="${escapeHtml(article.slug)}">Lihat</button>` : ""}
            <button type="button" data-edit-article="${escapeHtml(article.slug)}">Edit</button>
            ${article.published !== false
              ? `<button type="button" class="danger" data-hide-article="${escapeHtml(article.slug)}">Padam</button>`
              : `<button type="button" data-restore-article="${escapeHtml(article.slug)}">Terbitkan Semula</button>`}
          </div>
        </article>`).join("") : '<p class="admin-empty">Belum ada artikel.</p>';

      list.querySelectorAll("[data-preview]").forEach(button => button.addEventListener("click", () => {
        api.renderArticle(button.dataset.preview);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }));
      list.querySelectorAll("[data-edit-article]").forEach(button =>
        button.addEventListener("click", () => openEditor(button.dataset.editArticle)));
      list.querySelectorAll("[data-hide-article]").forEach(button => button.addEventListener("click", async () => {
        if (!confirm("Padam artikel ini daripada paparan Bicara Ilmu?")) return;
        button.disabled = true;
        try { await api.hideManagedArticle(button.dataset.hideArticle); await drawList(); }
        catch (error) { alert("Artikel tidak dapat dipadam: " + (error?.message || error)); button.disabled = false; }
      }));
      list.querySelectorAll("[data-restore-article]").forEach(button => button.addEventListener("click", async () => {
        button.disabled = true;
        try {
          const article = await api.getAdminArticle(button.dataset.restoreArticle);
          await api.saveManagedArticle({ ...article, published: true });
          await drawList();
        } catch (error) { alert("Artikel tidak dapat diterbitkan: " + (error?.message || error)); button.disabled = false; }
      }));
    }

    async function openEditor(slug = "") {
      const article = slug ? await api.getAdminArticle(slug) : null;
      editor.hidden = false;
      editor.innerHTML = `<form class="article-editor-form">
        <div class="question-editor-head">
          <strong>${article ? "Edit Artikel" : "Artikel Baharu"}</strong>
          <button type="button" data-close-article-editor>×</button>
        </div>
        <div class="article-editor-grid">
          <label class="article-field-wide"><span>Tajuk artikel</span>
            <input name="title" required value="${escapeHtml(article?.title || "")}" placeholder="Tajuk artikel"></label>
          <label><span>Pautan ringkas (slug)</span>
            <input name="slug" value="${escapeHtml(article?.slug || "")}" placeholder="dijana daripada tajuk" ${article ? "readonly" : ""}></label>
          <label><span>Kategori</span>
            <input name="category" value="${escapeHtml(article?.category || "Pendidikan")}" required></label>
          <label><span>Penulis</span>
            <input name="author" value="${escapeHtml(article?.author || "Editorial PKSKMY")}" required></label>
          <label><span>Tarikh paparan</span>
            <input name="date" value="${escapeHtml(article?.date || "")}" placeholder="contoh: 20 Julai 2026"></label>
          <label><span>Masa bacaan</span>
            <input name="readTime" value="${escapeHtml(article?.readTime || "")}" placeholder="dijana secara automatik"></label>
          <label class="article-field-wide"><span>Ringkasan kad</span>
            <textarea name="excerpt" rows="3" placeholder="Ringkasan pendek artikel">${escapeHtml(article?.excerpt || "")}</textarea></label>
          <label class="article-field-wide"><span>Muat naik fail artikel (.md)</span>
            <input name="markdownFile" type="file" accept="text/markdown,.md,text/plain"></label>
          <label class="article-field-wide"><span>Kandungan Markdown</span>
            <textarea name="markdown" rows="18" required placeholder="# Tajuk artikel…">${escapeHtml(article?.markdown || "")}</textarea></label>
          <label class="article-field-wide"><span>Muat naik poster (PNG, JPG atau WebP)</span>
            <input name="poster" type="file" accept="image/png,image/jpeg,image/webp"></label>
        </div>
        <div class="article-poster-preview ${article?.image ? "has-image" : ""}">
          ${article?.image ? `<img src="${escapeHtml(article.image)}" alt="Pratonton poster">` : ""}
          <span>${article?.image ? "Poster semasa" : "Poster belum dipilih"}</span>
        </div>
        <label class="article-publish-toggle"><input name="published" type="checkbox" ${article?.published === false ? "" : "checked"}> Paparkan artikel kepada pengguna</label>
        <div class="auth-msg" role="status" hidden></div>
        <div class="question-editor-buttons">
          <button type="button" data-close-article-editor>Batal</button>
          <button type="submit" class="admin-primary">Simpan Artikel</button>
        </div>
      </form>`;
      editor.scrollIntoView({ behavior: "smooth", block: "start" });

      const form = editor.querySelector("form");
      const title = form.elements.title;
      const slugInput = form.elements.slug;
      const markdown = form.elements.markdown;
      const excerpt = form.elements.excerpt;
      const preview = form.querySelector(".article-poster-preview");
      let posterPreviewUrl = "";

      editor.querySelectorAll("[data-close-article-editor]").forEach(button => button.addEventListener("click", () => {
        if (posterPreviewUrl) URL.revokeObjectURL(posterPreviewUrl);
        editor.hidden = true;
      }));
      title.addEventListener("input", () => {
        if (!article && !slugInput.dataset.manual) slugInput.value = api.slugify(title.value);
      });
      slugInput.addEventListener("input", () => { slugInput.dataset.manual = "true"; });
      form.elements.markdownFile.addEventListener("change", async event => {
        const file = event.target.files[0];
        if (!file) return;
        const text = await file.text();
        markdown.value = text;
        const heading = /^#\s+(.+)$/m.exec(text)?.[1]?.trim();
        if (!title.value.trim() && heading) {
          title.value = heading;
          slugInput.value = api.slugify(heading);
        }
        if (!excerpt.value.trim()) {
          excerpt.value = text.replace(/^#{1,6}\s+.*$/gm, "").replace(/[*_>`#\[\]()!-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 210);
        }
      });
      form.elements.poster.addEventListener("change", event => {
        const file = event.target.files[0];
        if (!file) return;
        if (posterPreviewUrl) URL.revokeObjectURL(posterPreviewUrl);
        posterPreviewUrl = URL.createObjectURL(file);
        preview.classList.add("has-image");
        preview.innerHTML = `<img src="${escapeHtml(posterPreviewUrl)}" alt="Pratonton poster baharu"><span>Poster baharu</span>`;
      });
      form.addEventListener("submit", async event => {
        event.preventDefault();
        const submit = form.querySelector('[type="submit"]');
        const message = form.querySelector(".auth-msg");
        submit.disabled = true;
        submit.textContent = "Menyimpan…";
        message.hidden = true;
        try {
          await api.saveManagedArticle({
            id: article?.id || null,
            image: article?.image || "",
            title: title.value,
            slug: slugInput.value,
            category: form.elements.category.value,
            author: form.elements.author.value,
            date: form.elements.date.value,
            readTime: form.elements.readTime.value,
            excerpt: excerpt.value,
            markdown: markdown.value,
            published: form.elements.published.checked
          }, form.elements.poster.files[0] || null);
          if (posterPreviewUrl) URL.revokeObjectURL(posterPreviewUrl);
          editor.hidden = true;
          await drawList();
        } catch (error) {
          message.hidden = false;
          message.textContent = error?.message || error;
          submit.disabled = false;
          submit.textContent = "Simpan Artikel";
        }
      });
    }

    host.querySelector("#addArticle").addEventListener("click", () => openEditor());
    await drawList();
  }

  function syncAdminButton(nextState) {
    const state = nextState || window.pkskAuth?.state?.() || {};
    let button = document.getElementById("adminBtn");
    if (state.access === "admin") {
      if (!button) {
        button = document.createElement("button");
        button.id = "adminBtn";
        button.className = "nav-cta admin-cta";
        button.type = "button";
        button.textContent = "Panel Admin";
        button.addEventListener("click", openAdmin);
        const login = document.getElementById("loginBtn");
        login?.parentNode?.insertBefore(button, login);
      }
    } else button?.remove();
  }

  window.pkskPremium = { openUpgrade, openAdmin };
  if (window.pkskAuth) {
    window.pkskAuth.onChange(syncAdminButton);
    syncAdminButton();
  }
})();
