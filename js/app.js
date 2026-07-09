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
    { name: "MRSM Kuala Kubu Bharu", rank: 1, score: "1.261", type: "MRSM", image: "mrsm-kuala-kubu-bharu.jpg", search: "https://www.bing.com/images/search?q=MRSM+Kuala+Kubu+Bharu+gambar+sekolah+rasmi" },
    { name: "MRSM Kepala Batas", rank: 2, score: "1.312", type: "MRSM", image: "mrsm-kepala-batas.jpg", search: "https://www.bing.com/images/search?q=MRSM+Kepala+Batas+gambar+sekolah+rasmi" },
    { name: "MRSM Johor Bahru", rank: 3, score: "1.350", type: "MRSM", image: "mrsm-johor-bahru.jpg", search: "https://www.bing.com/images/search?q=MRSM+Johor+Bahru+gambar+sekolah+rasmi" },
    { name: "MRSM Tun Ghafar Baba", rank: 4, score: "1.390", type: "MRSM", image: "mrsm-tun-ghafar-baba.jpg", search: "https://www.bing.com/images/search?q=MRSM+Tun+Ghafar+Baba+gambar+sekolah+rasmi" },
    { name: "MRSM Gemencheh", rank: 5, score: "1.411", type: "MRSM", image: "mrsm-gemencheh.jpg", search: "https://www.bing.com/images/search?q=MRSM+Gemencheh+gambar+sekolah+rasmi" },
    { name: "MRSM Taiping", rank: 6, score: "1.414", type: "MRSM", image: "mrsm-taiping.jpg", search: "https://www.bing.com/images/search?q=MRSM+Taiping+gambar+sekolah+rasmi" },
    { name: "MRSM Pengkalan Chepa", rank: 7, score: "1.439", type: "MRSM", image: "mrsm-pengkalan-chepa.jpg", search: "https://www.bing.com/images/search?q=MRSM+Pengkalan+Chepa+gambar+sekolah+rasmi" },
    { name: "MRSM Kota Putra", rank: 8, score: "1.489", type: "MRSM", image: "mrsm-kota-putra.jpg", search: "https://www.bing.com/images/search?q=MRSM+Kota+Putra+gambar+sekolah+rasmi" },
    { name: "MRSM Sungai Besar", rank: 9, score: "1.489", type: "MRSM", image: "mrsm-sungai-besar.jpg", search: "https://www.bing.com/images/search?q=MRSM+Sungai+Besar+gambar+sekolah+rasmi" },
    { name: "MRSM Balik Pulau", rank: 10, score: "1.489", type: "MRSM", image: "mrsm-balik-pulau.jpg", search: "https://www.bing.com/images/search?q=MRSM+Balik+Pulau+gambar+sekolah+rasmi" },
    { name: "SBPI Gombak", rank: 1, score: "0.93", type: "SBP", image: "sbpi-gombak.jpg", search: "https://www.bing.com/images/search?q=SBPI+Gombak+gambar+sekolah+rasmi" },
    { name: "Sekolah Tun Fatimah", rank: 2, score: "1.04", type: "SBP", image: "sekolah-tun-fatimah.jpg", search: "https://www.bing.com/images/search?q=Sekolah+Tun+Fatimah+gambar+sekolah+rasmi" },
    { name: "Kolej Tunku Kurshiah", rank: 3, score: "1.05", type: "SBP", image: "kolej-tunku-kurshiah.jpg", search: "https://www.bing.com/images/search?q=Kolej+Tunku+Kurshiah+gambar+sekolah+rasmi" },
    { name: "SMS Tuanku Munawir", rank: 4, score: "1.16", type: "SBP", image: "sms-tuanku-munawir.jpg", search: "https://www.bing.com/images/search?q=SMS+Tuanku+Munawir+gambar+sekolah+rasmi" },
    { name: "SBPI Rawang", rank: 5, score: "1.16", type: "SBP", image: "sbpi-rawang.jpg", search: "https://www.bing.com/images/search?q=SBPI+Rawang+gambar+sekolah+rasmi" },
    { name: "Sekolah Alam Shah", rank: 6, score: "1.17", type: "SBP", image: "sekolah-alam-shah.jpg", search: "https://www.bing.com/images/search?q=Sekolah+Alam+Shah+gambar+sekolah+rasmi" },
    { name: "Kolej Melayu Kuala Kangsar", rank: 7, score: "1.23", type: "SBP", image: "kolej-melayu-kuala-kangsar.jpg", search: "https://www.bing.com/images/search?q=Kolej+Melayu+Kuala+Kangsar+gambar+sekolah+rasmi" },
    { name: "Sekolah Seri Puteri", rank: 8, score: "1.24", type: "SBP", image: "sekolah-seri-puteri.jpg", search: "https://www.bing.com/images/search?q=Sekolah+Seri+Puteri+gambar+sekolah+rasmi" },
    { name: "Kolej Yayasan Saad", rank: 9, score: "1.24", type: "SBP", image: "kolej-yayasan-saad.jpg", search: "https://www.bing.com/images/search?q=Kolej+Yayasan+Saad+gambar+sekolah+rasmi" },
    { name: "SMS Hulu Selangor", rank: 10, score: "1.32", type: "SBP", image: "sms-hulu-selangor.jpg", search: "https://www.bing.com/images/search?q=SMS+Hulu+Selangor+gambar+sekolah+rasmi" }
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

  function schoolMedia(s, i) {
    const art = schoolArt(i);
    if (!s.image) return art;
    return `<span class="fallback-art">${art}</span>
      <img src="assets/sekolah/${esc(s.image)}" alt="Gambar ${esc(s.name)}" loading="lazy" hidden
        onload="this.hidden=false;this.previousElementSibling.hidden=true"
        onerror="this.hidden=true;this.previousElementSibling.hidden=false">`;
  }

  // Ilustrasi hero: perisai PKSK — bersih, bercahaya, minimum elemen
  const HERO_ART_NEW = `<div class="pksk-hero-visual" aria-label="Visual PKSK">
    <div class="pksk-bg-ring ring-1"></div>
    <div class="pksk-bg-ring ring-2"></div>
    <div class="pksk-bg-ring ring-3"></div>

    <div class="floating-card chart-card">
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <polyline points="12,54 28,36 40,45 58,18" />
        <circle cx="58" cy="18" r="3" />
      </svg>
    </div>

    <div class="floating-card list-card">
      <span></span>
      <span></span>
      <span></span>
    </div>

    <div class="pksk-shield">
      <div class="shield-inner">
        <div class="shield-glow"></div>
        <h1>PKSK</h1>
        <p>PENTAKSIRAN KEMASUKAN<br>SEKOLAH KHUSUS</p>
        <div class="graduate-cap">
          <div class="cap-top"></div>
          <div class="cap-base"></div>
          <div class="cap-string left"></div>
          <div class="cap-string right"></div>
        </div>
      </div>
    </div>

    <div class="book-stack">
      <div></div>
      <div></div>
      <div></div>
    </div>

    <div class="pksk-platform"></div>
  </div>`;

  /* ---------------- Paparan: UTAMA ---------------- */
  function renderHome() {
    const cards = SCHOOLS.map((s, i) => `
      <div class="school">
        <div class="ph">${schoolMedia(s, i)}</div>
        <div class="caption">
          <span class="crest">${crest(s.type)}</span>
          <div>
            <div class="school-rank">${esc(s.type)} #${s.rank} - GPS/GPM ${esc(s.score)}</div>
            <h4>${esc(s.name)}</h4>
          </div>
        </div>
      </div>`).join("");

    app.innerHTML = `
      <section class="fhero">
        <div class="fhero-inner">
          <div class="fhero-copy">
            <h2 class="fhero-title">Persediaan tepat,<br>langkah pertama ke<br><b>sekolah impian.</b></h2>
            <p class="fhero-sub">Portal pembelajaran interaktif yang membantu calon <b>PKSK</b> bersedia dengan lebih yakin dan terarah menuju MRSM &amp; SBP terbaik negara.</p>
            <div class="btn-row">
              <button class="btn" id="ctaPractice">Mula Latihan <span class="ico">🚀</span></button>
              <button class="btn ghost" id="ctaNotes">Nota PKSK <span class="ico">›</span></button>
            </div>
          </div>
          <div class="fhero-visual">
            <span class="blob blob-1"></span>
            <span class="blob blob-2"></span>
            <span class="fdot fdot-1"></span><span class="fdot fdot-2"></span>
            <span class="fdot fdot-3"></span><span class="fdot fdot-4"></span>
            <div class="photo-frame">
              <img class="hero-photo" src="assets/hero-students.jpg" alt="Pelajar PKSK"
                onload="this.parentElement.classList.add('has-photo')" onerror="this.remove()">
              <div class="photo-illus" aria-hidden="true">
                <svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg">
                  <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#fbeaef"/><stop offset="1" stop-color="#f4d9e1"/></linearGradient></defs>
                  <rect width="300" height="260" rx="24" fill="url(#pg)"/>
                  <circle cx="150" cy="96" r="40" fill="#e7a9bd"/>
                  <path d="M150 60 l46 16 -46 16 -46 -16 z" fill="var(--accent)"/>
                  <path d="M118 84 v18 c0 12 64 12 64 0 v-18" fill="none" stroke="var(--accent)" stroke-width="4"/>
                  <rect x="70" y="150" width="160" height="70" rx="14" fill="#fff"/>
                  <rect x="88" y="168" width="90" height="8" rx="4" fill="#f0c4d1"/>
                  <rect x="88" y="186" width="124" height="8" rx="4" fill="#f6dbe3"/>
                  <rect x="88" y="204" width="70" height="8" rx="4" fill="#f0c4d1"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="slider-band">
        <div class="wrap">
          <div class="band-head">
            <div><h2>MRSM &amp; SBP di Malaysia</h2>
              <p>Top 10 MRSM dan SBP berdasarkan rujukan SPM 2024/2025 — sasaran anda selepas lulus PKSK.</p></div>
          </div>
          <div class="carousel-wrap">
            <button class="cnav prev" id="cPrev" aria-label="Sebelumnya">‹</button>
            <div class="carousel" id="carousel" aria-label="Senarai sekolah MRSM dan SBP">${cards}</div>
            <button class="cnav next" id="cNext" aria-label="Seterusnya">›</button>
          </div>
          <div class="cdots" id="cDots"></div>
        </div>
      </section>`;

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

  /* ---------------- Butang CTA header ---------------- */
  const navCta = document.getElementById("navCta");
  if (navCta) navCta.addEventListener("click", () => go("practice"));

  /* ---------------- Mula ---------------- */
  go("home");
})();
