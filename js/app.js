/* ========================================================================
 * Portal PKSK — Enjin Interaktif
 * Mengendalikan navigasi, mod Nota/Latihan PKSK, dan penjejakan kemajuan.
 * ==================================================================== */

(function () {
  "use strict";

  const DATA = window.PKSK_DATA;
  const app = document.getElementById("app");
  const STORE_KEY = "pksk_progress_v1";

  /* ---------------- Kemajuan (localStorage) ---------------- */
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveProgress(p) {
    localStorage.setItem(STORE_KEY, JSON.stringify(p));
  }
  let progress = loadProgress(); // { topicId: { best: %, attempts: n } }

  const totalQuestions = () =>
    DATA.topics.reduce((s, t) => s + t.questions.length, 0);
  const masteredCount = () =>
    DATA.topics.filter(t => (progress[t.id]?.best || 0) >= 80).length;

  /* ---------------- Util ---------------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const KEYS = ["A", "B", "C", "D", "E", "F"];

  /* ---------------- Router ---------------- */
  const views = {
    home: renderHome,
    learn: renderLearnList,
    practice: renderTopicPicker,
    progress: renderProgress
  };

  function go(view) {
    document.querySelectorAll(".tab").forEach(b =>
      b.classList.toggle("active", b.dataset.view === view));
    (views[view] || renderHome)();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.getElementById("tabbar").addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if (btn) go(btn.dataset.view);
  });

  /* ---------------- Paparan: UTAMA ---------------- */
  function renderHome() {
    app.innerHTML = `
      <section class="card hero">
        <span class="hero-emoji">🎓</span>
        <h2>Selamat datang ke Portal PKSK</h2>
        <p>Belajar, berlatih dan uji kefahaman anda secara interaktif.</p>
        <div class="stat-row">
          <div class="stat"><div class="num">${DATA.topics.length}</div><div class="lbl">Topik</div></div>
          <div class="stat"><div class="num">${totalQuestions()}</div><div class="lbl">Soalan</div></div>
          <div class="stat"><div class="num">${masteredCount()}</div><div class="lbl">Dikuasai</div></div>
        </div>
      </section>

      <div class="section-head"><h2>Topik Pembelajaran</h2>
        <span class="muted">Klik untuk mula belajar</span></div>
      <div class="grid">
        ${DATA.topics.map(t => {
          const best = progress[t.id]?.best || 0;
          const done = best >= 80;
          return `
          <button class="topic" data-topic="${t.id}">
            <div class="t-icon">${t.icon}</div>
            <h3>${esc(t.title)}</h3>
            <p>${esc(t.summary)}</p>
            <div class="t-meta">
              ${t.questions.length} soalan ·
              <span class="badge ${done ? "done" : "todo"}">${best ? "Terbaik " + best + "%" : "Belum cuba"}</span>
            </div>
          </button>`;
        }).join("")}
      </div>`;

    app.querySelectorAll(".topic").forEach(el =>
      el.addEventListener("click", () => renderLearn(el.dataset.topic)));
  }

  /* ---------------- Paparan: NOTA (senarai) ---------------- */
  function renderLearnList() {
    app.innerHTML = `
      <div class="section-head"><h2>📖 Nota</h2>
        <span class="muted">Baca nota setiap topik</span></div>
      <div class="grid">
        ${DATA.topics.map(t => `
          <button class="topic" data-topic="${t.id}">
            <div class="t-icon">${t.icon}</div>
            <h3>${esc(t.title)}</h3>
            <p>${esc(t.summary)}</p>
            <div class="t-meta">${t.notes.length} nota →</div>
          </button>`).join("")}
      </div>`;
    app.querySelectorAll(".topic").forEach(el =>
      el.addEventListener("click", () => renderLearn(el.dataset.topic)));
  }

  /* ---------------- Paparan: NOTA (topik) ---------------- */
  function renderLearn(topicId) {
    const t = DATA.topics.find(x => x.id === topicId);
    if (!t) return renderHome();
    app.innerHTML = `
      <div class="section-head">
        <h2>${t.icon} ${esc(t.title)}</h2>
        <span class="badge todo">Nota</span>
      </div>
      <div class="card">
        <p class="muted" style="margin-top:0">${esc(t.summary)}</p>
        ${t.notes.map((n, i) => `<div class="note"><b>${i + 1}.</b> ${esc(n)}</div>`).join("")}
        <div class="btn-row">
          <button class="btn" id="startPractice">✏️ Mula Latihan PKSK</button>
          <button class="btn ghost" id="backHome">← Kembali</button>
        </div>
      </div>`;
    app.querySelector("#startPractice").onclick = () => runSession(t);
    app.querySelector("#backHome").onclick = () => go("home");
  }

  /* ---------------- Pemilih topik (Latihan PKSK) ---------------- */
  function renderTopicPicker() {
    const label = "✏️ Latihan PKSK";
    const desc = "Jawab soalan sebenar PKSK — markah terbaik anda direkodkan.";
    app.innerHTML = `
      <div class="section-head"><h2>${label}</h2><span class="muted">${desc}</span></div>
      <div class="grid">
        ${DATA.topics.map(t => `
          <button class="topic" data-topic="${t.id}">
            <div class="t-icon">${t.icon}</div>
            <h3>${esc(t.title)}</h3>
            <p>${esc(t.summary)}</p>
            <div class="t-meta">${t.questions.length} soalan →</div>
          </button>`).join("")}
      </div>`;
    app.querySelectorAll(".topic").forEach(el =>
      el.addEventListener("click", () =>
        runSession(DATA.topics.find(x => x.id === el.dataset.topic))));
  }

  /* ---------------- Sesi soalan (Latihan PKSK) ---------------- */
  function runSession(topic) {
    let idx = 0, score = 0, answered = false;
    const total = topic.questions.length;

    // Dedahkan jawapan.
    function reveal(chosen) {
      if (answered) return;
      answered = true;
      const qn = topic.questions[idx];
      const correct = qn.answer;
      app.querySelectorAll("#opts .opt").forEach(b => {
        b.disabled = true;
        if (+b.dataset.i === correct) b.classList.add("correct");
        if (+b.dataset.i === chosen && chosen !== correct) b.classList.add("wrong");
      });
      const right = chosen === correct;
      if (right) score++;
      const head = right ? "✅ Betul!" : "❌ Kurang tepat.";
      app.querySelector("#explainBox").innerHTML =
        `<div class="explain"><b>${head}</b>${qn.explain ? " " + esc(qn.explain) : ""}</div>`;
      const last = idx === total - 1;
      app.querySelector("#navBox").innerHTML =
        `<button class="btn" id="next">${last ? "Lihat Keputusan →" : "Soalan Seterusnya →"}</button>`;
      app.querySelector("#next").onclick = () => {
        if (last) return finish();
        idx++; render();
      };
    }

    function render() {
      answered = false;
      const qn = topic.questions[idx];
      const pct = Math.round((idx / total) * 100);
      app.innerHTML = `
        <div class="card">
          <div class="qhead">
            <span class="qcount">${topic.icon} ${esc(topic.title)} · Latihan PKSK</span>
            <span class="qcount">Soalan ${idx + 1} / ${total}</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div class="qtext">${esc(qn.q)}</div>
          ${qn.fig ? `<div class="figure">${qn.fig}</div>` : ""}
          <div class="opts" id="opts">
            ${qn.options.map((o, i) => `
              <button class="opt" data-i="${i}">
                <span class="key">${KEYS[i]}</span><span>${esc(o)}</span>
              </button>`).join("")}
          </div>
          <div id="explainBox"></div>
          <div id="navBox"></div>
        </div>`;

      app.querySelectorAll("#opts .opt").forEach(btn =>
        btn.addEventListener("click", () => reveal(+btn.dataset.i)));
    }

    function finish() {
      const pct = Math.round((score / total) * 100);
      // Rekod markah terbaik untuk penjejakan kemajuan
      const prev = progress[topic.id] || { best: 0, attempts: 0 };
      progress[topic.id] = {
        best: Math.max(prev.best, pct),
        attempts: prev.attempts + 1
      };
      saveProgress(progress);
      const pass = pct >= 80;
      const color = pass ? "var(--good)" : pct >= 50 ? "var(--warn)" : "var(--bad)";
      const msg = pass ? "Cemerlang! Anda menguasai topik ini. 🎉"
        : pct >= 50 ? "Bagus! Ulang untuk tingkatkan markah."
        : "Jangan putus asa — cuba baca nota semula.";
      app.innerHTML = `
        <div class="card result">
          <div class="ring" style="background:${color}">${pct}%</div>
          <h2>${score} / ${total} betul</h2>
          <p class="muted">${msg}</p>
          <div class="btn-row" style="justify-content:center">
            <button class="btn" id="retry">🔁 Cuba Semula</button>
            <button class="btn ghost" id="review">📖 Baca Nota</button>
            <button class="btn ghost" id="home">🏠 Utama</button>
          </div>
        </div>`;
      app.querySelector("#retry").onclick = () => runSession(topic);
      app.querySelector("#review").onclick = () => renderLearn(topic.id);
      app.querySelector("#home").onclick = () => go("home");
    }

    render();
  }

  /* ---------------- Paparan: KEMAJUAN ---------------- */
  function renderProgress() {
    const attempts = Object.values(progress).reduce((s, p) => s + (p.attempts || 0), 0);
    const avg = DATA.topics.length
      ? Math.round(DATA.topics.reduce((s, t) => s + (progress[t.id]?.best || 0), 0) / DATA.topics.length)
      : 0;
    app.innerHTML = `
      <div class="section-head"><h2>📊 Kemajuan Saya</h2>
        <button class="btn ghost" id="reset" style="margin:0">🗑️ Set Semula</button></div>
      <section class="card hero" style="background:linear-gradient(135deg,var(--brand),var(--brand-2))">
        <div class="stat-row" style="margin-top:0">
          <div class="stat"><div class="num">${masteredCount()}/${DATA.topics.length}</div><div class="lbl">Topik Dikuasai</div></div>
          <div class="stat"><div class="num">${avg}%</div><div class="lbl">Purata Terbaik</div></div>
          <div class="stat"><div class="num">${attempts}</div><div class="lbl">Jumlah Cubaan</div></div>
        </div>
      </section>
      <div class="card">
        ${DATA.topics.map(t => {
          const best = progress[t.id]?.best || 0;
          const done = best >= 80;
          return `
          <div style="margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <span><b>${t.icon} ${esc(t.title)}</b>
                <span class="badge ${done ? "done" : "todo"}">${done ? "Dikuasai" : best ? best + "%" : "Belum"}</span></span>
              <span class="muted">${best}%</span>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width:${best}%"></div></div>
          </div>`;
        }).join("")}
      </div>`;
    app.querySelector("#reset").onclick = () => {
      if (confirm("Set semula semua kemajuan?")) {
        progress = {}; saveProgress(progress); renderProgress();
      }
    };
  }

  /* ---------------- Tema gelap / terang ---------------- */
  const themeBtn = document.getElementById("themeToggle");
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    themeBtn.textContent = t === "dark" ? "☀️" : "🌙";
    localStorage.setItem("pksk_theme", t);
  }
  themeBtn.addEventListener("click", () =>
    applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"));
  applyTheme(localStorage.getItem("pksk_theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

  /* ---------------- Mula ---------------- */
  go("home");
})();
