/* ========================================================================
 * Portal PKSK - Enjin Interaktif
 * Mengendalikan navigasi, mod Nota/Latihan PKSK, dan penjejakan kemajuan.
 * ==================================================================== */

(function () {
  "use strict";

  const DATA = window.PKSK_DATA;
  const app = document.getElementById("app");
  const STORE_KEY = "pksk_progress_v1";
  const PRACTICE_SET_KEY = "pksk_set_progress_v1";

  /* ---------------- Kemajuan (localStorage) ---------------- */
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveProgress(p) {
    localStorage.setItem(STORE_KEY, JSON.stringify(p));
  }
  let progress = loadProgress(); // { topicId: { best: %, attempts: n } }

  function loadSetProgress() {
    try { return JSON.parse(localStorage.getItem(PRACTICE_SET_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveSetProgress(p) {
    localStorage.setItem(PRACTICE_SET_KEY, JSON.stringify(p));
  }

  const totalQuestions = () =>
    DATA.topics.reduce((s, t) => s + t.questions.length, 0);
  const masteredCount = () =>
    DATA.topics.filter(t => (progress[t.id]?.best || 0) >= 80).length;

  /* ---------------- Util ---------------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const KEYS = ["A", "B", "C", "D", "E", "F"];
  const NOTE_STORE_KEY = "pksk_note_state_v1";
  const NOTE_ICONS = {
    pengetahuan: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 5a19 19 0 1 0 0 38 19 19 0 0 0 0-38z"/><path d="M8 24h32M24 5c5 5 7.5 11.3 7.5 19S29 38 24 43M24 5c-5 5-7.5 11.3-7.5 19S19 38 24 43"/><path d="M15 12c4 2 14 2 18 0M15 36c4-2 14-2 18 0"/></svg>`,
    matematik: `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="10" y="6" width="28" height="36" rx="6"/><path d="M16 14h16M16 23h4M24 23h4M32 23h1M16 30h4M24 30h4M32 30h1M16 36h12"/><path d="M33 34v5M30.5 36.5h5"/></svg>`,
    sains: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M20 6h8M24 6v12l10 17a5 5 0 0 1-4.3 7.5H18.3A5 5 0 0 1 14 35l10-17"/><path d="M17 34h14M19 29h10"/><circle cx="34" cy="14" r="3"/><path d="M36 11l4-4M32 17l-4 4"/></svg>`,
    english: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 12h13a5 5 0 0 1 5 5v24a5 5 0 0 0-5-5H8z"/><path d="M40 12H27a5 5 0 0 0-5 5v24a5 5 0 0 1 5-5h13z"/><path d="M13 20h7M13 27h8M29 20h6M29 27h7"/><path d="M30 8l2 4 4 .5-3 3 .8 4-3.8-2-3.8 2 .8-4-3-3 4-.5z"/></svg>`
  };
  const NOTE_ART = {
    pengetahuan: "assets/practice-general-knowledge.png",
    matematik: "assets/practice-mathematics.png",
    sains: "assets/practice-science.png",
    english: "assets/practice-english.png"
  };
  const PRACTICE_SET_ART = {
    1: "assets/practice-general-knowledge.png",
    2: "assets/practice-mathematics.png",
    3: "assets/practice-science.png",
    4: "assets/practice-english.png",
    5: "assets/practice-set-05.png",
    6: "assets/practice-set-06.png",
    7: "assets/practice-set-07.png",
    8: "assets/practice-set-08.png",
    9: "assets/practice-set-09.png",
    10: "assets/practice-set-10.png"
  };

  function getPracticeTopic(topic, setNo) {
    const setQuestions = window.PKSK_SET_QUESTIONS?.[setNo]?.[topic.id];
    if (!setQuestions) return topic;
    return {
      ...topic,
      questions: setQuestions
    };
  }

  const NOTE_LIBRARY = {
    pengetahuan: {
      intro: "Fokus kepada fakta umum, kenegaraan, isu semasa dan pengetahuan harian yang membantu murid membaca soalan dengan lebih yakin.",
      popular: ["Fakta Semasa", "Kenegaraan", "Sains Harian", "Nilai Murni"],
      tags: ["Fakta Semasa", "Kenegaraan", "Teknologi", "Alam Sekitar", "2025-2026", "KBAT"],
      sections: [
        {
          label: "Ringkasan",
          title: "Isu Semasa Malaysia dan Kesedaran Umum",
          tags: ["Fakta Semasa", "2025-2026"],
          points: [
            "Baca soalan berdasarkan konteks: negara, masyarakat, teknologi, kesihatan atau alam sekitar.",
            "Isu semasa yang sesuai diketahui termasuk pendidikan digital, keselamatan siber, kebersihan, kesihatan awam dan amalan lestari.",
            "Jawapan terbaik biasanya menunjukkan nilai murni seperti bertanggungjawab, bekerjasama dan prihatin."
          ],
          examples: ["Jika soalan menyebut banjir, fikir tentang keselamatan, bantuan komuniti dan penjagaan alam sekitar."],
          tips: ["Pilih jawapan yang paling logik, selamat dan memberi manfaat kepada masyarakat."],
          related: "Membantu soalan pengetahuan am tentang negara, sains harian dan nilai kemasyarakatan."
        },
        {
          label: "Fakta Penting",
          title: "Kenegaraan, Sejarah Ringkas dan Dasar Kerajaan",
          tags: ["Kenegaraan", "Sejarah"],
          points: [
            "Kenali simbol negara seperti Jalur Gemilang, Jata Negara, Rukun Negara dan lagu Negaraku.",
            "Fahami maksud perpaduan, hormat-menghormati, demokrasi dan tanggungjawab sebagai rakyat.",
            "Dasar kerajaan lazimnya bertujuan meningkatkan pendidikan, ekonomi, kesihatan, teknologi dan kesejahteraan rakyat."
          ],
          examples: ["Soalan tentang Jata Negara biasanya menilai pengetahuan asas kenegaraan dan identiti Malaysia."],
          tips: ["Untuk soalan sejarah ringkas, cari kata kunci nama tokoh, peristiwa, negeri atau konsep."],
          related: "Sesuai untuk latihan berkaitan negara, sejarah dan kewarganegaraan."
        },
        {
          label: "Tip KBAT",
          title: "Sains dan Matematik Harian",
          tags: ["Sains Harian", "Matematik Harian", "KBAT"],
          points: [
            "Sains harian melibatkan tenaga, kebersihan, makanan seimbang, cuaca, bahan dan keselamatan.",
            "Matematik harian melibatkan wang, masa, jarak, timbangan, peratus diskaun dan anggaran.",
            "Soalan KBAT meminta murid memilih tindakan paling sesuai, bukan sekadar menghafal fakta."
          ],
          examples: ["Jika harga selepas diskaun diminta, kenal pasti harga asal, kadar diskaun dan baki bayaran."],
          tips: ["Buang pilihan yang tidak munasabah dahulu, kemudian bandingkan dua pilihan terbaik."],
          related: "Menguatkan soalan gabungan pengetahuan am, nombor dan penyelesaian masalah harian."
        }
      ]
    },
    matematik: {
      intro: "Nota ini membantu murid menyelesaikan soalan berayat, KBAT dan pengiraan asas dengan langkah yang teratur.",
      popular: ["Formula", "Soalan Berayat", "Unit", "KBAT"],
      tags: ["Formula", "Wang", "Masa", "Pecahan", "Peratus", "KBAT"],
      sections: [
        {
          label: "Formula",
          title: "Formula dan Kata Kunci Penting",
          tags: ["Formula", "Operasi"],
          points: [
            "Jumlah: tambah semua nilai. Beza: tolak nilai besar dengan nilai kecil.",
            "Darab digunakan untuk kumpulan sama banyak; bahagi digunakan untuk agihan sama rata.",
            "Peratus bermaksud daripada 100. Pecahan perlu samakan penyebut sebelum tambah atau tolak."
          ],
          examples: ["20% daripada RM50 = 20/100 x 50 = RM10."],
          tips: ["Gariskan kata kunci seperti jumlah, baki, beza, setiap, sama banyak dan daripada."],
          related: "Sesuai sebelum menjawab soalan nombor, wang, masa dan operasi."
        },
        {
          label: "Teknik Menjawab",
          title: "Langkah Soalan Berayat",
          tags: ["KBAT", "Strategi"],
          points: [
            "Langkah 1: Baca soalan dua kali dan kenal pasti apa yang diminta.",
            "Langkah 2: Senaraikan maklumat penting seperti nombor, unit dan syarat.",
            "Langkah 3: Pilih operasi yang betul, kira dengan kemas dan semak unit jawapan."
          ],
          examples: ["Jika soalan tanya baki wang, operasi akhir biasanya tolak daripada jumlah wang asal."],
          tips: ["Jangan terus kira semua nombor. Tentukan hubungan antara nombor dahulu."],
          related: "Membantu semua latihan Matematik berbentuk penyelesaian masalah."
        },
        {
          label: "Kesilapan Lazim",
          title: "Unit, Masa, Ukuran dan Semakan",
          tags: ["Unit", "Masa", "Ukuran"],
          points: [
            "Tukar unit sebelum mengira: 1 km = 1000 m, 1 jam = 60 minit, RM1 = 100 sen.",
            "Untuk masa, susun jam dan minit dengan teliti sebelum tambah atau tolak.",
            "Semak jawapan dengan anggaran supaya jawapan tidak terlalu besar atau terlalu kecil."
          ],
          examples: ["2 jam 30 minit + 45 minit = 3 jam 15 minit."],
          tips: ["Tulis unit pada setiap langkah supaya tidak tersilap ketika menukar ukuran."],
          related: "Berkaitan latihan ukuran, wang, masa, pecahan dan peratus."
        }
      ]
    },
    sains: {
      intro: "Nota Sains ini menggabungkan konsep Tahun 4, Tahun 5 dan Tahun 6 dalam bentuk ringkas, sebab-akibat dan mudah diingat.",
      popular: ["Hidupan", "Tenaga", "Bahan", "Kemahiran Proses Sains"],
      tags: ["Tahun 4", "Tahun 5", "Tahun 6", "KBAT", "Eksperimen", "Alam Sekitar"],
      sections: [
        {
          label: "Ringkasan",
          title: "Hidupan, Tumbuhan dan Haiwan",
          tags: ["Hidupan", "Tumbuhan", "Haiwan"],
          points: [
            "Hidupan memerlukan makanan, air, udara dan tempat perlindungan.",
            "Tumbuhan membuat makanan melalui fotosintesis dengan cahaya matahari, air, karbon dioksida dan klorofil.",
            "Haiwan menyesuaikan diri dengan habitat untuk mendapatkan makanan, melindungi diri dan membiak."
          ],
          examples: ["Kaktus mempunyai batang tebal untuk menyimpan air di kawasan kering."],
          tips: ["Untuk soalan sebab-akibat, jawab dengan pola: kerana..., maka..." ],
          related: "Membantu latihan tentang hidupan, habitat, tumbuhan dan rantai makanan."
        },
        {
          label: "Fakta Penting",
          title: "Tenaga, Daya, Elektrik, Haba dan Bunyi",
          tags: ["Tenaga", "Daya", "Elektrik"],
          points: [
            "Tenaga boleh berubah bentuk seperti tenaga elektrik kepada cahaya atau haba.",
            "Daya boleh mengubah bentuk, arah atau kelajuan objek.",
            "Litar elektrik lengkap diperlukan untuk membolehkan mentol menyala."
          ],
          examples: ["Kipas menukar tenaga elektrik kepada tenaga kinetik dan sedikit bunyi."],
          tips: ["Perhatikan pemboleh ubah dalam eksperimen: dimanipulasi, bergerak balas dan dimalarkan."],
          related: "Berkaitan soalan tenaga, litar, daya, haba dan bunyi."
        },
        {
          label: "Tip KBAT",
          title: "Bahan, Alam Sekitar, Bumi dan Angkasa",
          tags: ["Bahan", "Alam Sekitar", "Angkasa"],
          points: [
            "Bahan mempunyai sifat seperti menyerap air, terapung, lut sinar, konduktor dan penebat.",
            "Amalan 3R iaitu kurangkan, guna semula dan kitar semula membantu menjaga alam sekitar.",
            "Bumi berputar menyebabkan siang dan malam, manakala peredaran Bumi mengelilingi Matahari berkaitan tahun."
          ],
          examples: ["Logam sesuai untuk periuk kerana mengalirkan haba dengan baik."],
          tips: ["Jawapan KBAT Sains perlu ada fakta dan alasan yang jelas."],
          related: "Menyokong latihan bahan, alam sekitar, angkasa dan kemahiran proses sains."
        }
      ]
    },
    english: {
      intro: "English notes focus on grammar, vocabulary and comprehension with simple bilingual support where useful.",
      popular: ["Grammar", "Vocabulary", "Comprehension", "Writing"],
      tags: ["Grammar", "Vocabulary", "Tenses", "WH-Questions", "Comprehension", "Writing"],
      sections: [
        {
          label: "Grammar",
          title: "Tenses, Subject-Verb Agreement and Prepositions",
          tags: ["Grammar", "Tenses"],
          points: [
            "Present tense: habits or facts. Example: She reads every day.",
            "Past tense: actions that happened before. Example: They visited the museum yesterday.",
            "Subject-verb agreement: singular subject usually takes singular verb, such as He plays."
          ],
          examples: ["Prepositions: in the room, on the table, at school. Maksud: kata sendi tempat/masa."],
          tips: ["Check time words such as yesterday, now, every day and tomorrow before choosing tense."],
          related: "Useful for grammar and sentence structure questions."
        },
        {
          label: "Vocabulary",
          title: "Vocabulary, Connectors and WH-Questions",
          tags: ["Vocabulary", "WH-Questions"],
          points: [
            "Vocabulary means word meaning. Baca ayat sebelum dan selepas perkataan untuk teka maksud.",
            "Connectors join ideas: because, although, but, so, and, however.",
            "WH-questions: Who for person, Where for place, When for time, Why for reason, How for method."
          ],
          examples: ["Why was Ali late? Because he missed the bus."],
          tips: ["Do not translate word by word. Understand the whole sentence."],
          related: "Supports vocabulary, connectors and comprehension latihan."
        },
        {
          label: "Teknik Menjawab",
          title: "Reading Comprehension and Sentence Starters",
          tags: ["Comprehension", "Writing"],
          points: [
            "Read the question first, then scan the passage for keywords.",
            "For main idea questions, choose the answer that covers the whole paragraph, not one small detail.",
            "Useful starters: In my opinion..., Firstly..., Besides that..., In conclusion..."
          ],
          examples: ["If the question asks 'What is the purpose?', cari tujuan penulis dalam keseluruhan teks."],
          tips: ["Common mistake: choosing an answer that is true but not stated in the passage."],
          related: "Berkaitan latihan kefahaman, grammar dan penulisan ringkas."
        }
      ]
    }
  };

  /* ---------------- Router ---------------- */
  const views = {
    home: renderHome,
    learn: renderLearnList,
    practice: renderTopicPicker,
    info: renderInfoPage,
    bicara: () => window.pkskArticles.renderHub(),
    help: renderHelpPage
  };

  function go(view) {
    document.getElementById("adminBtn")?.classList.remove("active");
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

  // Ilustrasi bangunan sekolah (SVG) - gaya senja yang konsisten & elegan.
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

  // Lencana (crest) bulat sekolah - M untuk MRSM, S untuk SBP
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

  // Ilustrasi hero: perisai PKSK - bersih, bercahaya, minimum elemen
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
            <h2 class="fhero-title">Belajar dengan strategi,<br><b>berkembang dengan potensi.</b></h2>
            <p class="fhero-sub">Platform pendidikan interaktif yang menghimpunkan latihan, panduan pembelajaran dan perkongsian ilmu untuk membantu murid berfikir dengan lebih kreatif, belajar dengan lebih terarah serta membina keyakinan menuju kecemerlangan.</p>
            <p class="fhero-tagline">Pendidikan Kreatif. Strategi Kecemerlangan.</p>
            <div class="btn-row">
              <button class="btn" id="ctaPractice">Bicara Ilmu</button>
              <button class="btn ghost" id="ctaNotes">Latihan PKSK <span class="ico">&rsaquo;</span></button>
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
        <div class="slider-duo-wrap">
          <div class="school-slider-panel">
            <div class="band-head">
              <div><h2>MRSM &amp; SBP di Malaysia</h2>
                <p>Top 10 MRSM dan SBP berdasarkan rujukan SPM 2024/2025 - sasaran anda selepas lulus PKSK.</p></div>
            </div>
            <div class="carousel-wrap">
              <button class="cnav prev" id="cPrev" aria-label="Sebelumnya">&lsaquo;</button>
              <div class="carousel" id="carousel" aria-label="Senarai sekolah MRSM dan SBP">${cards}</div>
              <button class="cnav next" id="cNext" aria-label="Seterusnya">&rsaquo;</button>
            </div>
            <div class="cdots" id="cDots"></div>
          </div>

          <aside class="coming-slider-panel" aria-label="Promosi akan datang">
            <div class="coming-badge">Akan Datang</div>
            <h2>Bonus Latihan PKSK</h2>
            <p class="coming-lead">Modul tambahan untuk melengkapkan persediaan selain Bahagian B.</p>

            <div class="coming-feature primary">
              <span class="coming-percent">20%</span>
              <div>
                <strong>Bahagian A</strong>
                <span>Kecerdasan Insaniah</span>
              </div>
            </div>

            <div class="coming-feature">
              <span class="coming-percent">10%</span>
              <div>
                <strong>Bahagian C</strong>
                <span>Artikulasi Penulisan</span>
              </div>
            </div>

            <div class="coming-orbit" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>

            <p class="coming-note">Latihan sahsiah, situasi, komunikasi dan penulisan ringkas akan ditambah secara berperingkat.</p>
          </aside>
        </div>
      </section>`;

    app.querySelector("#ctaPractice").onclick = () => go("bicara");
    app.querySelector("#ctaNotes").onclick = () => go("practice");
    initCarousel();
  }

  /* ---------------- Paparan: INFO PKSK ---------------- */
  function renderInfoPage() {
    const infoCards = [
      { title: "Bahagian A", subtitle: "Kecerdasan Insaniah", percent: "20%" },
      { title: "Bahagian B", subtitle: "Kecerdasan Intelek", percent: "70%" },
      { title: "Bahagian C", subtitle: "Artikulasi Penulisan", percent: "10%" }
    ];

    app.innerHTML = `
      <section class="info-page">
        <div class="info-hero">
          <div class="info-wrap">
            <p class="info-eyebrow">Info Portal</p>
            <h1>Pentaksiran Kemasukan Sekolah Khusus</h1>
          </div>
        </div>

        <div class="info-wrap info-content">
          <article class="info-main-panel">
            <h2>Pengenalan PKSK</h2>
            <p>Pentaksiran Kemasukan Sekolah Khusus atau PKSK ialah pentaksiran penting bagi murid yang ingin melanjutkan pembelajaran ke sekolah khusus seperti SBP, SMKA, SMT, Kolej Vokasional, Maktab Tentera Diraja dan laluan pendidikan khusus yang berkaitan.</p>
            <p>PKSK bukan hanya menguji pengetahuan akademik, tetapi turut menilai pemikiran kritis, penyelesaian masalah, sahsiah, minat, kecenderungan dan kesiapsiagaan murid untuk belajar dalam persekitaran yang lebih mencabar.</p>
            <p>Portal ini memberi penekanan khusus kepada aspek Kecerdasan Intelek kerana <strong style="color:#9b1c31;font-weight:900;">Bahagian B membawa peratusan markah yang paling besar berbanding bahagian lain</strong>. Melalui latihan pengukuhan yang tersusun, murid dapat membina keyakinan, membiasakan diri dengan bentuk soalan dan membuat persediaan yang lebih terarah untuk menghadapi Bahagian B.</p>

            <div class="info-card-grid">
              ${infoCards.map(card => `
                <div class="info-card">
                  <p>${card.title}</p>
                  <h3>${card.subtitle}</h3>
                  <strong>${card.percent}</strong>
                </div>
              `).join("")}
            </div>
          </article>

          <aside class="info-side-panel">
            <h3>Tujuan Portal</h3>
            <p>Portal ini menyediakan bahan latihan, pengukuhan, KBAT, kefahaman dan penulisan untuk membantu murid membuat persediaan secara lebih terarah.</p>

            <div class="info-note">
              <p>Nota Penting</p>
              <span>Bahan disediakan untuk latihan dan pengukuhan sahaja, bukan soalan ramalan atau soalan sebenar pentaksiran rasmi.</span>
            </div>
          </aside>
        </div>
      </section>`;
  }

  /* ---------------- Paparan: BANTUAN / CADANGAN ---------------- */
  function renderHelpPage() {
    app.innerHTML = `
      <section class="help-page">
        <div class="help-hero">
          <div class="help-wrap">
            <p class="help-eyebrow">Bantuan/Cadangan</p>
            <h1>Maklum Balas dan Pertanyaan Portal</h1>
            <p>Sila kemukakan sebarang pertanyaan, maklum balas atau cadangan penambahbaikan berkaitan penggunaan portal ini. Setiap maklum balas amat dihargai bagi memastikan pengalaman pembelajaran yang lebih kemas, efektif dan profesional.</p>
          </div>
        </div>

        <div class="help-wrap help-layout">
          <section class="help-form-card" aria-labelledby="helpFormTitle">
            <div class="help-form-head">
              <p>Borang Maklum Balas</p>
              <h2 id="helpFormTitle">Hubungi Pentadbir Portal</h2>
            </div>

            <form class="feedback-form" id="feedbackForm" novalidate>
              <label>
                <span>Nama</span>
                <input id="feedbackName" name="name" type="text" autocomplete="name" maxlength="120" required>
              </label>

              <label>
                <span>Emel</span>
                <input id="feedbackEmail" name="email" type="email" autocomplete="email" maxlength="160" required>
              </label>

              <label class="feedback-message">
                <span>Pertanyaan/Cadangan</span>
                <textarea id="feedbackMessage" name="message" rows="7" maxlength="4000" required></textarea>
              </label>

              <div class="feedback-actions">
                <button class="feedback-submit" id="feedbackSubmit" type="submit">Hantar</button>
                <p class="feedback-status" id="feedbackStatus" role="status" aria-live="polite"></p>
              </div>
            </form>
          </section>

          <aside class="help-side-card" aria-label="Panduan maklum balas">
            <p class="help-side-kicker">Ruang Rasmi</p>
            <h2>Maklum balas anda membantu portal ini kekal kemas dan bermanfaat.</h2>

            <div class="help-point">
              <strong>Pertanyaan</strong>
              <span>Gunakan ruang ini untuk bertanya tentang penggunaan portal atau kandungan pembelajaran.</span>
            </div>
            <div class="help-point">
              <strong>Cadangan</strong>
              <span>Kongsikan idea penambahbaikan supaya pengalaman pembelajaran lebih tersusun.</span>
            </div>
            <div class="help-point">
              <strong>Isu teknikal</strong>
              <span>Maklumkan jika terdapat paparan, butang atau fungsi yang tidak berjalan seperti sepatutnya.</span>
            </div>
          </aside>
        </div>
      </section>`;

    initFeedbackForm();
  }

  function initFeedbackForm() {
    const form = app.querySelector("#feedbackForm");
    const status = app.querySelector("#feedbackStatus");
    const submit = app.querySelector("#feedbackSubmit");
    if (!form || !status || !submit) return;

    const setStatus = (type, message) => {
      status.textContent = message;
      status.className = `feedback-status ${type ? "is-" + type : ""}`;
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const payload = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        message: form.elements.message.value.trim()
      };

      if (!payload.name || !payload.email || !payload.message) {
        setStatus("error", "Sila lengkapkan semua ruangan yang diperlukan.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        setStatus("error", "Sila masukkan alamat emel yang sah.");
        return;
      }

      submit.disabled = true;
      submit.textContent = "Menghantar...";
      setStatus("", "");

      try {
        const response = await fetch("/api/bantuan-cadangan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Feedback request failed");

        form.reset();
        setStatus("success", "Terima kasih. Maklum balas anda telah dihantar.");
      } catch (error) {
        setStatus("error", "Maaf, terdapat masalah semasa menghantar maklum balas. Sila cuba lagi.");
      } finally {
        submit.disabled = false;
        submit.textContent = "Hantar";
      }
    });
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
      <div class="section-head"><h2>Nota</h2>
        <span class="muted">Baca nota setiap topik</span></div>
      <div class="grid">
        ${DATA.topics.map(t => `
          <button class="topic" data-topic="${t.id}">
            <div class="t-icon">${t.icon}</div>
            <h3>${esc(t.title)}</h3>
            <p>${esc(t.summary)}</p>
            <div class="t-meta">${t.notes.length} nota &rarr;</div>
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
          <button class="btn" id="startPractice">Mula Latihan PKSK</button>
          <button class="btn ghost" id="backHome">&larr; Kembali</button>
        </div>
      </div></div>`;
    app.querySelector("#startPractice").onclick = () => runSession(t);
    app.querySelector("#backHome").onclick = () => go("home");
  }

  /* ---------------- Paparan: NOTA premium (override) ---------------- */
  function renderLearnList() {
    const topics = DATA.topics.map(t => ({ ...t, note: NOTE_LIBRARY[t.id] }));
    app.innerHTML = `<section class="notes-page">
      <div class="notes-hero">
        <div class="notes-hero-copy">
          <p class="notes-eyebrow">Portal Nota PKSK</p>
          <h1>Nota Pembelajaran</h1>
          <p>Baca nota ringkas, formula, strategi menjawab dan fakta penting mengikut subjek.</p>
        </div>
      </div>

      <div class="notes-toolbar" role="search">
        <div class="notes-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
          <input id="noteSearch" type="search" placeholder="Cari nota, topik atau subjek..." autocomplete="off">
        </div>
        <div class="notes-filters" aria-label="Tapis subjek nota">
          <button class="note-filter active" data-filter="all" type="button">Semua</button>
          ${topics.map(t => `<button class="note-filter" data-filter="${t.id}" type="button">${esc(t.title)}</button>`).join("")}
        </div>
      </div>

      <div class="notes-grid" id="notesGrid">
        ${topics.map(t => noteSubjectCard(t)).join("")}
      </div>

    </section>`;

    const search = app.querySelector("#noteSearch");
    const filters = app.querySelectorAll(".note-filter");
    const cards = app.querySelectorAll(".note-subject-card");
    let activeFilter = "all";

    function applyNoteFilters() {
      const q = search.value.trim().toLowerCase();
      cards.forEach(card => {
        const matchesFilter = activeFilter === "all" || card.dataset.topic === activeFilter;
        const matchesSearch = !q || card.dataset.search.includes(q);
        card.hidden = !(matchesFilter && matchesSearch);
      });
    }

    search.addEventListener("input", applyNoteFilters);
    filters.forEach(btn => btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter;
      filters.forEach(b => b.classList.toggle("active", b === btn));
      applyNoteFilters();
    }));
    cards.forEach(card => card.addEventListener("click", () => renderLearn(card.dataset.topic)));
  }

  function noteSubjectCard(topic) {
    const note = topic.note;
    const sectionCount = note?.sections?.length || topic.notes.length;
    const searchText = [
      topic.id,
      topic.title,
      topic.summary,
      note?.intro,
      ...(note?.tags || []),
      ...(note?.sections || []).flatMap(s => [s.title, s.label, ...(s.tags || []), ...(s.points || [])])
    ].join(" ").toLowerCase();

    return `<button class="note-subject-card" data-topic="${topic.id}" data-search="${esc(searchText)}">
      <span class="note-card-glow" aria-hidden="true"></span>
      <span class="note-subject-illustration">
        <img src="${NOTE_ART[topic.id] || NOTE_ART.pengetahuan}" alt="" loading="lazy">
      </span>
      <span class="note-subject-body">
        <span class="note-card-count">${sectionCount} nota tersedia</span>
        <h2>${esc(topic.title)}</h2>
        <p>${esc(note?.intro || topic.summary)}</p>
        <span class="note-tags">
          ${(note?.tags || []).slice(0, 3).map(tag => `<span>${esc(tag)}</span>`).join("")}
        </span>
        <strong>Baca nota &rarr;</strong>
      </span>
    </button>`;
  }

  function renderLearn(topicId) {
    const t = DATA.topics.find(x => x.id === topicId);
    if (!t) return renderHome();
    const note = NOTE_LIBRARY[t.id];

    app.innerHTML = `<section class="note-detail-page">
      <button class="note-back" id="backNotes" type="button">&larr; Kembali ke Nota</button>

      <div class="note-detail-hero">
        <div class="note-detail-icon">
          <span class="note-icon-shine"></span>
          ${NOTE_ICONS[t.id] || NOTE_ICONS.pengetahuan}
        </div>
        <div>
          <p class="notes-eyebrow">Nota ${esc(t.title)}</p>
          <h1>Nota ${esc(t.title)}</h1>
          <p>${esc(note?.intro || t.summary)}</p>
          <div class="note-detail-tags">
            ${(note?.tags || []).map(tag => `<span>${esc(tag)}</span>`).join("")}
          </div>
        </div>
      </div>

      <div class="note-detail-layout">
        <main class="note-accordion-list">
          <div class="note-section-title">
            <h2>Senarai Topik</h2>
            <p>Tekan setiap bahagian untuk buka atau tutup nota.</p>
          </div>
          ${(note?.sections || []).map((section, i) => noteAccordion(section, i)).join("")}
        </main>
      </div>
    </section>`;

    app.querySelector("#backNotes").onclick = renderLearnList;
  }

  function noteAccordion(section, index) {
    return `<details class="note-accordion" ${index === 0 ? "open" : ""}>
      <summary>
        <span class="note-accordion-label">${esc(section.label)}</span>
        <strong>${esc(section.title)}</strong>
        <span class="note-accordion-tags">${(section.tags || []).slice(0, 3).map(tag => `<em>${esc(tag)}</em>`).join("")}</span>
      </summary>
      <div class="note-accordion-body">
        <div class="note-card-block">
          <h3>Ringkasan</h3>
          <ul>${section.points.map(point => `<li>${esc(point)}</li>`).join("")}</ul>
        </div>
        <div class="note-mini-grid">
          <div class="note-mini-card">
            <span>Contoh Soalan</span>
            ${(section.examples || []).map(ex => `<p>${esc(ex)}</p>`).join("")}
          </div>
          <div class="note-mini-card">
            <span>Tip KBAT</span>
            ${(section.tips || []).map(tip => `<p>${esc(tip)}</p>`).join("")}
          </div>
        </div>
        <div class="note-related-box">
          <strong>Berkaitan dengan latihan</strong>
          <p>${esc(section.related || "Nota ini menyokong latihan dalam portal.")}</p>
        </div>
      </div>
    </details>`;
  }

  function getNoteState() {
    try {
      const state = JSON.parse(localStorage.getItem(NOTE_STORE_KEY)) || {};
      return { saved: state.saved || {}, read: state.read || {} };
    } catch (error) {
      return { saved: {}, read: {} };
    }
  }

  function saveNoteState(state) {
    localStorage.setItem(NOTE_STORE_KEY, JSON.stringify(state));
  }

  function toggleSavedNote(topicId) {
    const state = getNoteState();
    state.saved[topicId] = !state.saved[topicId];
    saveNoteState(state);
    const btn = app.querySelector("#saveNote");
    if (btn) {
      btn.classList.toggle("active", state.saved[topicId]);
      btn.textContent = state.saved[topicId] ? "Nota disimpan" : "Bookmark nota";
    }
  }

  function markSubjectRead(topicId) {
    const state = getNoteState();
    state.read[topicId] = true;
    saveNoteState(state);
    const btn = app.querySelector("#markRead");
    const text = app.querySelector("#noteProgressText");
    const fill = app.querySelector("#noteProgressFill");
    if (btn) {
      btn.classList.add("active");
      btn.textContent = "Sudah dibaca";
    }
    if (text) text.textContent = "100%";
    if (fill) fill.style.width = "100%";
  }

  /* ---------------- Pemilih topik (Latihan PKSK) ---------------- */
  function renderTopicPicker() {
    const label = "Latihan PKSK";
    const desc = "Jawab soalan sebenar PKSK - markah terbaik anda direkodkan.";
    const practiceArt = {
      pengetahuan: "assets/practice-general-knowledge.png",
      matematik: "assets/practice-mathematics.png",
      sains: "assets/practice-science.png",
      english: "assets/practice-english.png"
    };
    app.innerHTML = `<div class="wrap view">
      <div class="section-head practice-head"><h2>${label}</h2><span class="muted">${desc}</span></div>
      <div class="grid practice-grid">
        ${DATA.topics.map(t => `
          <button class="topic practice-topic" data-topic="${t.id}">
            <span class="practice-art">
              <img src="${practiceArt[t.id] || practiceArt.pengetahuan}" alt="" loading="lazy">
            </span>
            <span class="practice-copy">
              <h3>${esc(t.title)}</h3>
              <p>${esc(t.summary)}</p>
              <span class="t-meta">${t.questions.length} soalan &rarr;</span>
            </span>
          </button>`).join("")}
      </div></div>`;
    app.querySelectorAll(".topic").forEach(el =>
      el.addEventListener("click", () =>
        runSession(DATA.topics.find(x => x.id === el.dataset.topic))));
  }

  /* ---------------- Akses latihan ----------------
   * Semua set latihan dibuka secara percuma untuk semua pengunjung.
   * Tiada log masuk, pendaftaran, langganan atau kelulusan admin diperlukan.
   * Sistem akaun/langganan lama masih wujud dalam kod tetapi tidak lagi
   * digunakan pada portal awam supaya boleh diguna semula pada masa hadapan. */
  function canAccessSet() {
    return true;
  }
  // Dikekalkan sebagai fungsi kosong untuk keserasian dengan kod terdahulu;
  // tiada sekatan langganan atau modal naik taraf dipaparkan lagi.
  function showLockedNotice() {}
  // Segarkan senarai set bila status log masuk berubah
  document.addEventListener("pksk-auth-changed", () => {
    if (document.querySelector(".practice-set-grid")) renderTopicPicker();
  });
  document.addEventListener("pksk-questions-changed", () => {
    if (document.querySelector(".practice-set-grid")) renderTopicPicker();
  });

  /* ---------------- Paparan: LATIHAN SET (override) ---------------- */
  function renderTopicPicker() {
    const sets = Array.from({ length: 10 }, (_, i) => i + 1);
    const setProgress = loadSetProgress();
    app.innerHTML = `<section class="practice-page">
      <div class="practice-hero-panel">
        <div>
          <p class="practice-eyebrow">Pilih Set Latihan</p>
          <h1>Latihan PKSK (Bahagian B)</h1>
          <p>Pilih set latihan terlebih dahulu, kemudian pilih kategori subjek untuk mula menjawab soalan.</p>
        </div>
      </div>

      <div class="practice-set-grid">
        ${sets.map(setNo => practiceSetCard(setNo, setProgress)).join("")}
      </div>
    </section>`;

    app.querySelectorAll(".practice-set-card").forEach(card =>
      card.addEventListener("click", () => {
        const setNo = +card.dataset.set;
        if (!canAccessSet(setNo)) return showLockedNotice(setNo);
        renderPracticeSetDetail(setNo);
      }));
  }

  function practiceSetInfo(setNo, setProgress = loadSetProgress()) {
    const set = setProgress[String(setNo)] || {};
    const completed = DATA.topics.filter(t => set[t.id]?.completed).length;
    const pct = Math.round((completed / DATA.topics.length) * 100);
    const label = completed === 0 ? "Belum Mula" : completed === DATA.topics.length ? "Selesai" : "Sedang Berjalan";
    const tone = completed === 0 ? "todo" : completed === DATA.topics.length ? "done" : "active";
    return { completed, pct, label, tone };
  }

  function practiceSetCard(setNo, setProgress) {
    const padded = String(setNo).padStart(2, "0");
    const locked = !canAccessSet(setNo);
    return `<button class="practice-set-card${locked ? " locked" : ""}" data-set="${setNo}" type="button">
      ${locked ? `<span class="set-lock" aria-label="Perlu kelulusan akaun">🔒 PERLU KELULUSAN</span>` : ""}
      <span class="practice-set-top">
        <span class="practice-set-number">${padded}</span>
        <span class="practice-set-art">
          <img src="${PRACTICE_SET_ART[setNo]}" alt="" loading="lazy">
        </span>
      </span>
      <span class="practice-set-copy">
        <strong>Set Latihan ${setNo}</strong>
        <span>4 kategori soalan tersedia</span>
      </span>
      <span class="practice-subject-chips" aria-label="Kategori subjek">
        <span>Pengetahuan Am</span>
        <span>Matematik</span>
        <span>Sains</span>
        <span>English</span>
      </span>
      <span class="practice-open-btn">Buka Set &rarr;</span>
    </button>`;
  }

  function renderPracticeSetDetail(setNo) {
    if (!canAccessSet(setNo)) { showLockedNotice(setNo); return renderTopicPicker(); }
    const padded = String(setNo).padStart(2, "0");
    app.innerHTML = `<section class="practice-page">
      <div class="practice-detail-header">
        <div>
          <p class="practice-eyebrow">Set Latihan ${padded}</p>
          <h1>Set Latihan ${padded}</h1>
          <p>Pilih satu kategori subjek untuk mula menjawab soalan dalam set ini.</p>
        </div>
        <button class="practice-back-btn" id="backPracticeSets" type="button">Kembali ke Senarai Set</button>
      </div>

      <div class="practice-subject-grid">
        ${DATA.topics.map(t => {
          const practiceTopic = getPracticeTopic(t, setNo);
          const hasQuestions = practiceTopic.questions.length > 0;
          return `
            <article class="practice-subject-card">
              <span class="practice-subject-art">
                <img src="${NOTE_ART[t.id] || NOTE_ART.pengetahuan}" alt="" loading="lazy">
              </span>
              <h2>${esc(t.title)}</h2>
              <p>${esc(t.summary)}</p>
              <span class="practice-question-pill">${practiceTopic.questions.length} soalan</span>
              <button class="practice-start-btn" data-topic="${t.id}" type="button"${hasQuestions ? "" : " disabled aria-disabled=\"true\""}>${hasQuestions ? "Mula Latihan" : "Belum Tersedia"}</button>
            </article>`;
        }).join("")}
      </div>

    </section>`;

    app.querySelector("#backPracticeSets").onclick = renderTopicPicker;
    app.querySelectorAll(".practice-start-btn").forEach(btn =>
      btn.addEventListener("click", () => {
        const topic = DATA.topics.find(x => x.id === btn.dataset.topic);
        const practiceTopic = getPracticeTopic(topic, setNo);
        if (!practiceTopic.questions.length) return;
        runSession(practiceTopic, setNo);
      }));
  }

  /* ---------------- Sesi soalan (Latihan PKSK) ---------------- */
  function runSession(topic, setNo = null) {
    let idx = 0, answered = false;
    const total = topic.questions.length;
    const answers = Array(total).fill(null);
    const showQuestionNavigator = Boolean(setNo);

    function questionNavigatorMarkup() {
      const answeredCount = answers.filter(answer => answer !== null).length;
      return `<aside class="question-palette" aria-label="Navigasi nombor soalan">
        <div class="question-palette-head">
          <div><span>Set Latihan ${setNo} · ${esc(topic.title)}</span><strong>Navigasi Soalan</strong></div>
          <b>${answeredCount}/${total}</b>
        </div>
        <div class="question-number-grid">
          ${topic.questions.map((_, questionIndex) => {
            const isAnswered = answers[questionIndex] !== null;
            const stateClass = questionIndex === idx ? " is-current" : isAnswered ? " is-answered" : "";
            return `<button class="question-number-btn${stateClass}" type="button" data-question-index="${questionIndex}" aria-label="Buka soalan ${questionIndex + 1}"${questionIndex === idx ? ' aria-current="true"' : ""}>${questionIndex + 1}</button>`;
          }).join("")}
        </div>
        <div class="question-palette-legend" aria-hidden="true">
          <span><i class="current"></i>Semasa</span>
          <span><i class="answered"></i>Dijawab</span>
          <span><i></i>Belum</span>
        </div>
      </aside>`;
    }

    function currentScore() {
      return answers.reduce((sum, chosen, i) =>
        chosen === topic.questions[i].answer ? sum + 1 : sum, 0);
    }

    function goBack() {
      if (idx === 0) {
        if (setNo) return renderPracticeSetDetail(setNo);
        return renderTopicPicker();
      }
      idx--;
      render();
    }

    function renderQuestionNav() {
      const last = idx === total - 1;
      const canContinue = answers[idx] !== null;
      app.querySelector("#navBox").innerHTML = `<div class="question-nav-row">
        <button class="btn ghost" id="backQuestion" type="button">Kembali</button>
        ${canContinue ? `<button class="btn" id="next" type="button">${last ? "Lihat Keputusan &rarr;" : "Soalan Seterusnya &rarr;"}</button>` : ""}
      </div>`;
      app.querySelector("#backQuestion").onclick = goBack;
      const next = app.querySelector("#next");
      if (next) next.onclick = () => {
        if (last) return finish();
        idx++;
        render();
      };
    }

    // Dedahkan jawapan.
    function reveal(chosen) {
      if (answered) return;
      answered = true;
      answers[idx] = chosen;
      const qn = topic.questions[idx];
      const correct = qn.answer;
      app.querySelectorAll("#opts .opt").forEach(b => {
        b.disabled = true;
        if (+b.dataset.i === correct) b.classList.add("correct");
        if (+b.dataset.i === chosen && chosen !== correct) b.classList.add("wrong");
      });
      const right = chosen === correct;
      const head = right ? "Betul!" : "Kurang tepat.";
      app.querySelector("#explainBox").innerHTML =
        `<div class="explain"><b>${head}</b>${qn.explain ? " " + esc(qn.explain) : ""}</div>`;
      renderQuestionNav();
    }

    function render() {
      answered = answers[idx] !== null;
      const qn = topic.questions[idx];
      const selected = answers[idx];
      const pct = Math.round((idx / total) * 100);
      const questionCard = `<div class="card">
          <div class="qhead">
            <span class="qcount">${esc(topic.title)} - Latihan PKSK</span>
            <span class="qcount">Soalan ${idx + 1} / ${total}</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div class="qtext">${esc(qn.q)}</div>
          ${qn.fig ? `<div class="figure">${qn.fig}</div>` : ""}
          <div class="opts" id="opts">
            ${qn.options.map((o, i) => `
              <button class="opt ${selected !== null && i === qn.answer ? "correct" : ""} ${selected !== null && i === selected && selected !== qn.answer ? "wrong" : ""}" data-i="${i}" ${selected !== null ? "disabled" : ""}>
                <span class="key">${KEYS[i]}</span><span>${esc(o)}</span>
              </button>`).join("")}
          </div>
          <div id="explainBox">${selected !== null ? `<div class="explain"><b>${selected === qn.answer ? "Betul!" : "Kurang tepat."}</b>${qn.explain ? " " + esc(qn.explain) : ""}</div>` : ""}</div>
          <div id="navBox"></div>
        </div>`;
      app.innerHTML = `<div class="wrap view${showQuestionNavigator ? " quiz-navigator-wrap" : ""}">
        ${showQuestionNavigator
          ? `<div class="quiz-session-layout">${questionCard}${questionNavigatorMarkup()}</div>`
          : questionCard}
      </div>`;

      app.querySelectorAll("#opts .opt").forEach(btn =>
        btn.addEventListener("click", () => reveal(+btn.dataset.i)));
      app.querySelectorAll("[data-question-index]").forEach(button =>
        button.addEventListener("click", () => {
          idx = +button.dataset.questionIndex;
          render();
        }));
      renderQuestionNav();
    }

    function finish() {
      const score = currentScore();
      const pct = Math.round((score / total) * 100);
      // Rekod markah terbaik untuk penjejakan kemajuan
      const prev = progress[topic.id] || { best: 0, attempts: 0 };
      progress[topic.id] = {
        best: Math.max(prev.best, pct),
        attempts: prev.attempts + 1
      };
      saveProgress(progress);
      if (setNo) {
        const setProgress = loadSetProgress();
        const key = String(setNo);
        const set = setProgress[key] || {};
        const prevSet = set[topic.id] || { best: 0, attempts: 0, completed: false };
        set[topic.id] = {
          best: Math.max(prevSet.best || 0, pct),
          attempts: (prevSet.attempts || 0) + 1,
          completed: true
        };
        setProgress[key] = set;
        saveSetProgress(setProgress);
      }
      const pass = pct >= 80;
      const color = pass ? "var(--good)" : pct >= 50 ? "var(--warn)" : "var(--bad)";
      const msg = pass ? "Cemerlang! Anda menguasai topik ini."
        : pct >= 50 ? "Bagus! Ulang untuk tingkatkan markah."
        : "Jangan putus asa - cuba baca nota semula.";
      app.innerHTML = `<div class="wrap view">
        <div class="card result">
          <div class="ring" style="background:${color}">${pct}%</div>
          <h2>${score} / ${total} betul</h2>
          <p class="muted">${msg}</p>
          <div class="btn-row" style="justify-content:center">
            <button class="btn" id="retry">Cuba Semula</button>
            ${setNo ? `<button class="btn ghost" id="backSet">Kembali ke Set</button>` : ""}
          </div>
        </div></div>`;
      app.querySelector("#retry").onclick = () => runSession(topic, setNo);
      if (setNo) app.querySelector("#backSet").onclick = () => renderPracticeSetDetail(setNo);
    }

    render();
  }

  /* ---------------- Butang CTA header ---------------- */
  const navCta = document.getElementById("navCta");
  if (navCta) navCta.addEventListener("click", () => go("practice"));

  /* ---------------- Mula ---------------- */
  go("home");
})();
