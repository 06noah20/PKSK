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
    return `<svg viewBox="0 0 250 130" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi sekolah">
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

  // Lencana (crest) bulat sekolah — M untuk MRSM, S untuk SBP
  function crest(type) {
    const ring = type === "MRSM" ? "#d4a017" : "#e8e8e8";
    const bg = type === "MRSM" ? "#8a1f1f" : "#12315e";
    const ch = type === "MRSM" ? "M" : "S";
    return `<svg viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="17" cy="17" r="16" fill="${bg}" stroke="${ring}" stroke-width="2"/>
      <circle cx="17" cy="17" r="11.5" fill="none" stroke="${ring}" stroke-width="1" opacity=".7"/>
      <text x="17" y="22" font-size="13" font-weight="800" fill="#fff" text-anchor="middle" font-family="Georgia,serif">${ch}</text>
    </svg>`;
  }

  // Ilustrasi hero: perisai PKSK + buku & kad terapung (gaya mockup)
  const HERO_ART = `<svg viewBox="0 0 380 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Perisai PKSK">
    <defs>
      <linearGradient id="shg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#3f6db4"/><stop offset=".5" stop-color="#16386e"/><stop offset="1" stop-color="#0b204a"/>
      </linearGradient>
      <linearGradient id="shg2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#dfe9f7"/><stop offset="1" stop-color="#9fb6d9"/>
      </linearGradient>
    </defs>
    <ellipse cx="190" cy="272" rx="150" ry="14" fill="rgba(0,0,0,.30)"/>
    <ellipse cx="190" cy="252" rx="96" ry="20" fill="#0d2650"/>
    <rect x="94" y="216" width="192" height="38" rx="8" fill="#123061"/>
    <rect x="52" y="120" width="72" height="52" rx="9" fill="rgba(223,233,247,.10)" stroke="rgba(159,182,217,.35)"/>
    <rect x="64" y="134" width="30" height="22" rx="4" fill="#2e7cf6" opacity=".85"/>
    <polygon points="75,140 85,145 75,150" fill="#fff"/>
    <rect x="64" y="160" width="48" height="4" rx="2" fill="rgba(255,255,255,.35)"/>
    <rect x="286" y="96" width="66" height="56" rx="9" fill="rgba(223,233,247,.10)" stroke="rgba(159,182,217,.35)"/>
    <rect x="296" y="108" width="14" height="12" rx="3" fill="#5fa0f9"/>
    <rect x="314" y="110" width="30" height="4" rx="2" fill="rgba(255,255,255,.4)"/>
    <rect x="296" y="126" width="14" height="12" rx="3" fill="#5fa0f9"/>
    <rect x="314" y="128" width="30" height="4" rx="2" fill="rgba(255,255,255,.4)"/>
    <rect x="60" y="44" width="60" height="52" rx="9" fill="rgba(223,233,247,.10)" stroke="rgba(159,182,217,.35)"/>
    <path d="M72 84 l10 -16 8 9 10 -18 8 25" stroke="#5fa0f9" stroke-width="3" fill="none" stroke-linecap="round"/>
    <rect x="292" y="30" width="58" height="52" rx="9" fill="rgba(223,233,247,.10)" stroke="rgba(159,182,217,.35)"/>
    <circle cx="321" cy="50" r="10" fill="none" stroke="#5fa0f9" stroke-width="3"/>
    <path d="M321 60 l0 12 m-6 -4 l6 4 6 -4" stroke="#5fa0f9" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g>
      <path d="M190 52 l84 22 v58 c0 52 -38 84 -84 100 -46 -16 -84 -48 -84 -100 v-58 z" fill="url(#shg)" stroke="#7fa6e8" stroke-width="2.5"/>
      <path d="M190 66 l70 18 v50 c0 44 -32 72 -70 86 -38 -14 -70 -42 -70 -86 v-50 z" fill="none" stroke="rgba(223,233,247,.4)" stroke-width="1.5"/>
      <text x="190" y="138" font-size="42" font-weight="800" fill="url(#shg2)" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" letter-spacing="2">PKSK</text>
      <text x="190" y="160" font-size="9.5" fill="#c9d8ef" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" letter-spacing=".8">PENTAKSIRAN KEMASUKAN</text>
      <text x="190" y="173" font-size="9.5" fill="#c9d8ef" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" letter-spacing=".8">SEKOLAH KHUSUS</text>
      <polygon points="190,190 168,178 190,166 212,178" fill="#dfe9f7"/>
      <rect x="186" y="190" width="8" height="3" fill="#dfe9f7"/>
      <path d="M154 196 q-14 14 0 30 M226 196 q14 14 0 30" stroke="#9fb6d9" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>
    <rect x="284" y="196" width="70" height="13" rx="3" fill="#1c4a8f"/>
    <rect x="290" y="182" width="70" height="13" rx="3" fill="#2e7cf6"/>
    <rect x="286" y="168" width="66" height="13" rx="3" fill="#123061" stroke="#2c5fb3"/>
    <rect x="36" y="206" width="44" height="48" rx="6" fill="#123061"/>
    <path d="M46 206 q12 -22 24 0" stroke="#3f8f5f" stroke-width="5" fill="none"/>
    <path d="M58 206 q0 -18 -14 -24 M58 206 q2 -20 16 -26" stroke="#4caf72" stroke-width="4" fill="none" stroke-linecap="round"/>
  </svg>`;

  /* ---------------- Paparan: UTAMA ---------------- */
  function renderHome() {
    const cards = SCHOOLS.map((s, i) => `
      <div class="school">
        <div class="ph">${schoolArt(i)}</div>
        <div class="caption">
          <span class="crest">${crest(s.type)}</span>
          <div>
            <h4>${esc(s.name)}</h4>
            <div class="loc">${esc(s.loc)}</div>
          </div>
        </div>
      </div>`).join("");

    app.innerHTML = `
      <section class="hero">
        <div>
          <p class="eyebrow">Selamat Datang Ke</p>
          <h2>Portal <b>PKSK</b></h2>
          <p class="sub">Pentaksiran Kemasukan Sekolah Khusus</p>
          <div class="quote"><span class="qm">&ldquo;</span>
            <span>Kenali potensi diri, capai kecemerlangan, melangkah ke sekolah impian.&rdquo;</span></div>
          <p class="lead">Platform interaktif untuk membantu calon PKSK bersedia dengan lebih yakin dan terarah.</p>
          <div class="btn-row">
            <button class="btn" id="ctaPractice">🚀 Mula Belajar →</button>
            <button class="btn ghost" id="ctaNotes">📖 Teroka Topik</button>
          </div>
        </div>
        <div class="hero-art">${HERO_ART}</div>
      </section>

      <div class="statbar">
        <div class="stat"><div class="ic">🎓</div>
          <div><div class="num">${DATA.topics.length}</div><div class="lbl">Topik Pembelajaran</div></div></div>
        <div class="stat"><div class="ic">📚</div>
          <div><div class="num">Lebih 500+</div><div class="lbl">Soalan Tersedia</div></div></div>
        <div class="stat"><div class="ic">✅</div>
          <div><div class="num">20</div><div class="lbl">Set Soalan</div></div></div>
      </div>

      <div class="section-head"><span class="bar"></span>
        <h2>Sekolah Berasrama Penuh di Malaysia</h2>
        <span class="muted">Sasaran anda selepas lulus PKSK</span></div>
      <div class="carousel-wrap">
        <button class="cnav prev" id="cPrev" aria-label="Sebelumnya">‹</button>
        <div class="carousel" id="carousel" aria-label="Senarai sekolah MRSM dan SBP">${cards}</div>
        <button class="cnav next" id="cNext" aria-label="Seterusnya">›</button>
      </div>
      <div class="cdots" id="cDots"></div>

      <div class="section-head"><span class="bar"></span>
        <h2>Topik Pembelajaran</h2>
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
            <div class="t-meta">${t.questions.length} Soalan →
              ${best ? `<span class="badge ${done ? "done" : "todo"}">Terbaik ${best}%</span>` : ""}</div>
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
    initCarousel();
  }

  /* ---------------- Karusel sekolah: auto + anak panah + titik ---------------- */
  let carTimer = null;
  function initCarousel() {
    const car = app.querySelector("#carousel");
    const dotsEl = app.querySelector("#cDots");
    if (!car) return;
    const step = () => {
      const card = car.querySelector(".school");
      return card ? card.offsetWidth + 16 : 268;
    };
    const pages = () => Math.max(1, Math.ceil(car.scrollWidth / car.clientWidth));

    function buildDots() {
      dotsEl.innerHTML = "";
      for (let i = 0; i < pages(); i++) {
        const d = document.createElement("button");
        d.setAttribute("aria-label", "Halaman " + (i + 1));
        d.onclick = () => car.scrollTo({ left: i * car.clientWidth, behavior: "smooth" });
        dotsEl.appendChild(d);
      }
      syncDots();
    }
    function syncDots() {
      const p = Math.round(car.scrollLeft / car.clientWidth);
      [...dotsEl.children].forEach((d, i) => d.classList.toggle("active", i === p));
    }
    car.addEventListener("scroll", () => requestAnimationFrame(syncDots));
    app.querySelector("#cPrev").onclick = () => car.scrollBy({ left: -step() * 2, behavior: "smooth" });
    app.querySelector("#cNext").onclick = () => car.scrollBy({ left: step() * 2, behavior: "smooth" });

    // Auto-gerak setiap 3.5 saat; berhenti bila pengguna menyentuh/hover
    if (carTimer) clearInterval(carTimer);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      carTimer = setInterval(() => {
        if (!document.body.contains(car)) { clearInterval(carTimer); carTimer = null; return; }
        if (car.matches(":hover")) return;
        const end = car.scrollLeft + car.clientWidth >= car.scrollWidth - 4;
        if (end) car.scrollTo({ left: 0, behavior: "smooth" });
        else car.scrollBy({ left: step(), behavior: "smooth" });
      }, 3500);
    }
    buildDots();
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
