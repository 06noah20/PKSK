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
    practice: renderTopicPicker
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

  /* ---------------- Senarai sekolah MRSM & SBP ---------------- */
  const SCHOOLS = [
    { name: "Malay College Kuala Kangsar (MCKK)", loc: "Kuala Kangsar, Perak", type: "SBP" },
    { name: "MRSM Pengkalan Chepa", loc: "Kota Bharu, Kelantan", type: "MRSM" },
    { name: "Kolej Tunku Kurshiah (TKC)", loc: "Nilai, Negeri Sembilan", type: "SBP" },
    { name: "MRSM Langkawi", loc: "Langkawi, Kedah", type: "MRSM" },
    { name: "Sekolah Tun Fatimah (STF)", loc: "Johor Bahru, Johor", type: "SBP" },
    { name: "MRSM Kepala Batas", loc: "Kepala Batas, Pulau Pinang", type: "MRSM" },
    { name: "Sekolah Dato' Abdul Razak (SDAR)", loc: "Seremban, Negeri Sembilan", type: "SBP" },
    { name: "MRSM Kuantan", loc: "Kuantan, Pahang", type: "MRSM" },
    { name: "Sekolah Sultan Alam Shah (SAS)", loc: "Putrajaya", type: "SBP" },
    { name: "MRSM Jasin", loc: "Jasin, Melaka", type: "MRSM" },
    { name: "Sekolah Seri Puteri (SSP)", loc: "Cyberjaya, Selangor", type: "SBP" },
    { name: "MRSM Balik Pulau", loc: "Balik Pulau, Pulau Pinang", type: "MRSM" },
    { name: "Sekolah Tuanku Abdul Rahman (STAR)", loc: "Ipoh, Perak", type: "SBP" },
    { name: "MRSM Serting", loc: "Jempol, Negeri Sembilan", type: "MRSM" },
    { name: "Sekolah Menengah Sains Selangor", loc: "Cheras, Kuala Lumpur", type: "SBP" },
    { name: "MRSM Gerik", loc: "Gerik, Perak", type: "MRSM" }
  ];

  // Ilustrasi bangunan sekolah (SVG) — digunakan jika tiada foto sebenar
  // dalam assets/sekolah/. Warna berbeza mengikut indeks.
  function schoolArt(i) {
    const skies = ["#dbeafe", "#e0e7ff", "#dcfce7", "#fef3c7", "#fce7f3", "#e0f2fe"];
    const walls = ["#14336b", "#7c2d92", "#0e7490", "#a16207", "#9d174d", "#166534"];
    const sky = skies[i % skies.length], wall = walls[i % walls.length];
    return `<svg viewBox="0 0 250 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi sekolah">
      <rect width="250" height="130" fill="${sky}"/>
      <circle cx="215" cy="24" r="13" fill="#fbbf24" opacity=".85"/>
      <rect x="0" y="102" width="250" height="28" fill="#86b98a"/>
      <rect x="30" y="52" width="60" height="50" fill="${wall}" opacity=".85"/>
      <rect x="160" y="52" width="60" height="50" fill="${wall}" opacity=".85"/>
      <rect x="85" y="40" width="80" height="62" fill="${wall}"/>
      <polygon points="80,40 125,16 170,40" fill="#b45309"/>
      <rect x="118" y="72" width="14" height="30" rx="2" fill="#fde68a"/>
      <rect x="95" y="50" width="12" height="12" fill="#e0f2fe"/><rect x="143" y="50" width="12" height="12" fill="#e0f2fe"/>
      <rect x="40" y="60" width="11" height="11" fill="#e0f2fe"/><rect x="62" y="60" width="11" height="11" fill="#e0f2fe"/>
      <rect x="170" y="60" width="11" height="11" fill="#e0f2fe"/><rect x="192" y="60" width="11" height="11" fill="#e0f2fe"/>
      <rect x="123" y="8" width="3" height="14" fill="#64748b"/><rect x="126" y="8" width="12" height="7" fill="#dc2626"/>
    </svg>`;
  }

  // Ilustrasi hero: mortarboard di atas buku + komputer riba
  const HERO_ART = `<svg viewBox="0 0 360 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi pembelajaran">
    <ellipse cx="180" cy="228" rx="150" ry="16" fill="rgba(0,0,0,.18)"/>
    <rect x="196" y="120" width="130" height="86" rx="8" fill="#0b1b3a"/>
    <rect x="204" y="128" width="114" height="70" rx="4" fill="#eaf0f9"/>
    <rect x="212" y="136" width="52" height="8" rx="3" fill="#2c5fb3"/>
    <rect x="212" y="150" width="98" height="5" rx="2" fill="#c3d0e8"/>
    <rect x="212" y="160" width="86" height="5" rx="2" fill="#c3d0e8"/>
    <rect x="212" y="172" width="40" height="16" rx="4" fill="#c9a227"/>
    <rect x="182" y="206" width="158" height="10" rx="5" fill="#12264d"/>
    <rect x="52" y="176" width="122" height="18" rx="4" fill="#1d4382"/>
    <rect x="46" y="158" width="134" height="18" rx="4" fill="#c9a227"/>
    <rect x="56" y="140" width="114" height="18" rx="4" fill="#3868b8"/>
    <polygon points="112,96 40,120 112,144 184,120" fill="#0b1b3a"/>
    <polygon points="112,104 64,120 112,136 160,120" fill="#12264d"/>
    <rect x="109" y="118" width="6" height="6" fill="#c9a227"/>
    <line x1="178" y1="122" x2="178" y2="152" stroke="#c9a227" stroke-width="3"/>
    <circle cx="178" cy="156" r="5" fill="#c9a227"/>
    <circle cx="52" cy="60" r="4" fill="#f2d879" opacity=".8"/>
    <circle cx="300" cy="48" r="5" fill="#7fa6e8" opacity=".8"/>
    <circle cx="330" cy="96" r="3" fill="#f2d879" opacity=".7"/>
    <path d="M250 70 l6 12 13 2 -9 9 2 13 -12 -6 -12 6 2 -13 -9 -9 13 -2 z" fill="#f2d879" opacity=".9"/>
  </svg>`;

  /* ---------------- Paparan: UTAMA ---------------- */
  function renderHome() {
    const cards = SCHOOLS.map((s, i) => `
      <div class="school">
        <div class="ph">
          <span class="tag ${s.type.toLowerCase()}">${s.type}</span>
          ${schoolArt(i)}
        </div>
        <div class="info">
          <h4>${esc(s.name)}</h4>
          <div class="loc">📍 ${esc(s.loc)}</div>
        </div>
      </div>`).join("");

    app.innerHTML = `
      <section class="card hero">
        <div>
          <span class="eyebrow">Pentaksiran Kemasukan Sekolah Khusus</span>
          <h2>Selamat datang ke<br>Portal <b>PKSK</b></h2>
          <p>Platform interaktif untuk pembelajaran yang lebih pintar, efektif dan menyeronokkan.</p>
          <p class="quote">"Belajar hari ini, capai kecemerlangan esok."</p>
          <div class="btn-row">
            <button class="btn" id="ctaPractice">Mula Latihan →</button>
            <button class="btn ghost" id="ctaNotes">Lihat Nota 📖</button>
          </div>
        </div>
        <div class="hero-art">${HERO_ART}</div>
      </section>

      <div class="stat-row">
        <div class="stat"><div class="ic">🎓</div>
          <div><div class="num">${DATA.topics.length}</div><div class="lbl">Topik Pembelajaran</div></div></div>
        <div class="stat"><div class="ic">📋</div>
          <div><div class="num">500+</div><div class="lbl">Soalan Tersedia</div></div></div>
      </div>

      <div class="section-head"><h2>🏫 Sekolah Impian — MRSM &amp; SBP di Malaysia</h2>
        <span class="muted">Sasaran anda selepas lulus PKSK</span></div>
      <div class="slider" aria-label="Senarai sekolah MRSM dan SBP">
        <div class="slider-track">${cards}${cards}</div>
      </div>

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
              ${t.questions.length} Soalan ·
              <span class="badge ${done ? "done" : "todo"}">${best ? "Terbaik " + best + "%" : "Belum cuba"}</span>
            </div>
          </button>`;
        }).join("")}
      </div>

      <div class="features">
        <div class="feature"><div class="ic">🎯</div>
          <div><h4>Pembelajaran Interaktif</h4><p>Belajar dengan soalan interaktif yang menyeronokkan.</p></div></div>
        <div class="feature"><div class="ic">⚡</div>
          <div><h4>Maklum Balas Serta-Merta</h4><p>Jawapan disemak terus dengan jalan kira & penerangan.</p></div></div>
        <div class="feature"><div class="ic">💡</div>
          <div><h4>Belajar Bila-Bila Masa</h4><p>Akses di mana-mana, pada bila-bila masa.</p></div></div>
      </div>`;

    app.querySelector("#ctaPractice").onclick = () => go("practice");
    app.querySelector("#ctaNotes").onclick = () => go("learn");
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
          </div>
        </div>`;
      app.querySelector("#retry").onclick = () => runSession(topic);
    }

    render();
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
