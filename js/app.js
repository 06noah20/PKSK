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

  // Ilustrasi bangunan sekolah (SVG) — gaya senja yang konsisten & elegan.
  // Digantikan foto sebenar secara automatik jika ada dalam assets/sekolah/.
  function schoolArt(i) {
    const skies = [
      ["#bcd6f7", "#e8f1fd"], ["#c3d9f2", "#f0e9dd"], ["#b6cff0", "#ddeafc"],
      ["#c9ddf5", "#f5eee1"], ["#b1cceb", "#e4effc"], ["#c0d8f4", "#eef0e6"]
    ][i % 6];
    const roof = ["#9a3b2e", "#8d4a2f", "#7d3b3b"][i % 3];
    const g = `sk${i}`;
    return `<svg viewBox="0 0 252 190" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi sekolah">
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${skies[0]}"/><stop offset="1" stop-color="${skies[1]}"/>
      </linearGradient></defs>
      <rect width="252" height="190" fill="url(#${g})"/>
      <circle cx="212" cy="34" r="15" fill="#fff" opacity=".75"/>
      <ellipse cx="60" cy="30" rx="26" ry="9" fill="#fff" opacity=".5"/>
      <ellipse cx="150" cy="18" rx="20" ry="7" fill="#fff" opacity=".4"/>
      <rect x="0" y="142" width="252" height="48" fill="#9dbb92"/>
      <rect x="0" y="142" width="252" height="7" fill="#87a87c"/>
      <ellipse cx="28" cy="132" rx="18" ry="22" fill="#4e7a52"/>
      <rect x="25" y="140" width="6" height="14" fill="#5d4a37"/>
      <ellipse cx="228" cy="128" rx="20" ry="26" fill="#456e4a"/>
      <rect x="225" y="140" width="6" height="16" fill="#5d4a37"/>
      <rect x="42" y="88" width="168" height="54" rx="3" fill="#f2ede2"/>
      <rect x="42" y="88" width="168" height="8" fill="#e4dcc9"/>
      <polygon points="36,88 126,58 216,88" fill="${roof}"/>
      <polygon points="52,88 126,64 200,88" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="2"/>
      <rect x="106" y="70" width="40" height="72" rx="3" fill="#e8e0cf"/>
      <polygon points="100,70 126,54 152,70" fill="${roof}"/>
      <rect x="118" y="108" width="16" height="34" rx="2" fill="#59493a"/>
      <rect x="121" y="98" width="10" height="6" rx="2" fill="#7d99c9"/>
      ${[54, 72, 158, 176, 194].map(x =>
        `<rect x="${x}" y="100" width="12" height="16" rx="1.5" fill="#7d99c9"/>
         <rect x="${x}" y="122" width="12" height="14" rx="1.5" fill="#8fa9d4"/>`).join("")}
      <rect x="124" y="36" width="2.5" height="20" fill="#8a8f99"/>
      <rect x="126.5" y="36" width="13" height="8" fill="#1d4a94"/>
      <path d="M0 152 h252" stroke="#b7cbae" stroke-width="1.5" opacity=".6"/>
      <rect x="112" y="152" width="28" height="38" fill="#c9cfd8" opacity=".55"/>
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

  // Ilustrasi hero: perisai PKSK — bersih, bercahaya, minimum elemen
  const HERO_ART = `<svg viewBox="0 0 420 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Perisai PKSK">
    <defs>
      <radialGradient id="glow" cx=".5" cy=".45" r=".55">
        <stop offset="0" stop-color="#2e7cf6" stop-opacity=".38"/>
        <stop offset="1" stop-color="#2e7cf6" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2f5fa8"/>
        <stop offset=".55" stop-color="#153a72"/>
        <stop offset="1" stop-color="#0a1f44"/>
      </linearGradient>
      <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e8f0fb"/>
        <stop offset="1" stop-color="#8fa9cf"/>
      </linearGradient>
      <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset=".6" stop-color="#d7e3f5"/>
        <stop offset="1" stop-color="#9fb6d9"/>
      </linearGradient>
    </defs>

    <circle cx="210" cy="172" r="165" fill="url(#glow)"/>
    <circle cx="210" cy="172" r="128" fill="none" stroke="rgba(143,184,249,.22)"/>
    <circle cx="210" cy="172" r="152" fill="none" stroke="rgba(143,184,249,.12)"/>

    <ellipse cx="210" cy="332" rx="130" ry="12" fill="rgba(0,0,0,.32)"/>
    <path d="M128 300 h164 a8 8 0 0 1 8 8 v14 a8 8 0 0 1 -8 8 h-164 a8 8 0 0 1 -8 -8 v-14 a8 8 0 0 1 8 -8 z" fill="#0d2650"/>
    <ellipse cx="210" cy="300" rx="90" ry="14" fill="#123061"/>

    <g>
      <path d="M210 42 l96 26 v66 c0 62 -44 98 -96 118 -52 -20 -96 -56 -96 -118 v-66 z"
        fill="url(#rim)"/>
      <path d="M210 50 l88 24 v60 c0 57 -40 90 -88 109 -48 -19 -88 -52 -88 -109 v-60 z"
        fill="url(#face)"/>
      <path d="M210 62 l76 21 v52 c0 49 -34 78 -76 95 -42 -17 -76 -46 -76 -95 v-52 z"
        fill="none" stroke="rgba(232,240,251,.30)" stroke-width="1.5"/>
      <text x="210" y="158" font-size="46" font-weight="800" fill="url(#metal)"
        text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" letter-spacing="3">PKSK</text>
      <text x="210" y="182" font-size="9" fill="#b9cdec" text-anchor="middle"
        font-family="Segoe UI, Arial, sans-serif" letter-spacing="1.4">PENTAKSIRAN KEMASUKAN</text>
      <text x="210" y="195" font-size="9" fill="#b9cdec" text-anchor="middle"
        font-family="Segoe UI, Arial, sans-serif" letter-spacing="1.4">SEKOLAH KHUSUS</text>
      <path d="M166 216 q-16 18 0 40 M254 216 q16 18 0 40"
        stroke="url(#metal)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <polygon points="210,232 186,220 210,208 234,220" fill="url(#metal)"/>
      <line x1="228" y1="224" x2="228" y2="238" stroke="#d7e3f5" stroke-width="2.5"/>
      <circle cx="228" cy="241" r="3" fill="#d7e3f5"/>
    </g>

    <g opacity=".95">
      <rect x="18" y="96" width="66" height="54" rx="10" fill="rgba(232,240,251,.07)" stroke="rgba(143,184,249,.30)"/>
      <path d="M32 134 l11 -16 9 9 12 -19" stroke="#5fa0f9" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="336" y="76" width="66" height="54" rx="10" fill="rgba(232,240,251,.07)" stroke="rgba(143,184,249,.30)"/>
      <rect x="348" y="90" width="10" height="10" rx="2.5" fill="#5fa0f9"/>
      <rect x="364" y="92" width="26" height="4" rx="2" fill="rgba(232,240,251,.45)"/>
      <rect x="348" y="108" width="10" height="10" rx="2.5" fill="#5fa0f9"/>
      <rect x="364" y="110" width="26" height="4" rx="2" fill="rgba(232,240,251,.45)"/>
    </g>

    <g>
      <ellipse cx="357" cy="305" rx="48" ry="6" fill="rgba(0,0,0,.28)"/>
      <rect x="316" y="288" width="82" height="13" rx="3" fill="#1c4a8f"/>
      <rect x="322" y="274" width="82" height="13" rx="3" fill="#2e7cf6"/>
      <rect x="318" y="260" width="78" height="13" rx="3" fill="#0f2a55" stroke="#2c5fb3"/>
    </g>
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
        <div class="hero-inner">
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
        </div>
      </section>
      <div class="wrap">
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
        <span class="muted">Subjek yang diuji dalam PKSK</span></div>
      <div class="grid">
        ${DATA.topics.map(t => {
          const best = progress[t.id]?.best || 0;
          const done = best >= 80;
          return `
          <div class="topic static">
            <div class="t-icon">${t.icon}</div>
            <h3>${esc(t.title)}</h3>
            <p>${esc(t.summary)}</p>
            <div class="t-meta">${t.questions.length} Soalan
              ${best ? `<span class="badge ${done ? "done" : "todo"}">Terbaik ${best}%</span>` : ""}</div>
          </div>`;
        }).join("")}
      </div>

      <div class="features">
        <div class="feature"><div class="ic">🎯</div>
          <div><h4>Pembelajaran Interaktif</h4><p>Belajar dengan soalan interaktif yang menyeronokkan.</p></div></div>
        <div class="feature"><div class="ic">⚡</div>
          <div><h4>Maklum Balas Serta-Merta</h4><p>Jawapan disemak terus dengan jalan kira & penerangan.</p></div></div>
        <div class="feature"><div class="ic">💡</div>
          <div><h4>Belajar Bila-Bila Masa</h4><p>Akses di mana-mana, pada bila-bila masa.</p></div></div>
      </div>
      </div>`;

    app.querySelector("#ctaPractice").onclick = () => go("practice");
    app.querySelector("#ctaNotes").onclick = () => go("learn");
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
    app.innerHTML = `<div class="wrap view">
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
      </div></div>`;
    app.querySelectorAll(".topic").forEach(el =>
      el.addEventListener("click", () => renderLearn(el.dataset.topic)));
  }

  /* ---------------- Paparan: NOTA (topik) ---------------- */
  function renderLearn(topicId) {
    const t = DATA.topics.find(x => x.id === topicId);
    if (!t) return renderHome();
    app.innerHTML = `<div class="wrap view">
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
      </div></div>`;
    app.querySelector("#startPractice").onclick = () => runSession(t);
    app.querySelector("#backHome").onclick = () => go("home");
  }

  /* ---------------- Pemilih topik (Latihan PKSK) ---------------- */
  function renderTopicPicker() {
    const label = "✏️ Latihan PKSK";
    const desc = "Jawab soalan sebenar PKSK — markah terbaik anda direkodkan.";
    app.innerHTML = `<div class="wrap view">
      <div class="section-head"><h2>${label}</h2><span class="muted">${desc}</span></div>
      <div class="grid">
        ${DATA.topics.map(t => `
          <button class="topic" data-topic="${t.id}">
            <div class="t-icon">${t.icon}</div>
            <h3>${esc(t.title)}</h3>
            <p>${esc(t.summary)}</p>
            <div class="t-meta">${t.questions.length} soalan →</div>
          </button>`).join("")}
      </div></div>`;
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
      app.innerHTML = `<div class="wrap view">
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
        </div></div>`;

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
      app.innerHTML = `<div class="wrap view">
        <div class="card result">
          <div class="ring" style="background:${color}">${pct}%</div>
          <h2>${score} / ${total} betul</h2>
          <p class="muted">${msg}</p>
          <div class="btn-row" style="justify-content:center">
            <button class="btn" id="retry">🔁 Cuba Semula</button>
          </div>
        </div></div>`;
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
