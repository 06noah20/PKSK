const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const sourcePath = "C:/Users/mhdzh/OneDrive/PKSK 2/SAINS/pksk-sains-fixed-files/pksk-sains-data-fixed.js";
const kbatSourcePath = "C:/Users/mhdzh/OneDrive/PKSK 2/SAINS/pksk-sains-kbat-bergambar-files/pksk-sains-kbat-bergambar.mjs";
const questionBankPath = "C:/Users/mhdzh/OneDrive/PKSK 2/SAINS/bank soalan sains 1/Bank_Soalan_Sains_PKSK_360.json";
const outPath = path.join(repoRoot, "js", "practice-science-sets.js");

function parseAssignedJson(source, prefixPattern, suffixPattern) {
  const jsonText = source
    .replace(prefixPattern, "")
    .replace(suffixPattern, "")
    .trim();
  return JSON.parse(jsonText);
}

function loadScienceSets() {
  if (!fs.existsSync(sourcePath) && fs.existsSync(outPath)) {
    const existing = fs.readFileSync(outPath, "utf8");
    const match = existing.match(/const scienceSets = (\{[\s\S]*?\});\s+window\.PKSK_SET_QUESTIONS/);
    if (!match) throw new Error("Salinan Sains sedia ada tidak boleh dibaca.");
    const parsed = JSON.parse(match[1]);
    return Object.entries(parsed).map(([set, questions]) => ({
      set: Number(set),
      questions: questions.map((question, index) => ({
        question: question.q,
        options: question.options,
        answer: question.answer,
        explanation: question.explain,
        id: question.sourceId || `S${set}-Q${index + 1}`,
      })),
    }));
  }

  const source = fs.readFileSync(sourcePath, "utf8");
  const data = parseAssignedJson(
    source,
    /^window\.SAINS_PKSK_SETS\s*=\s*/,
    /;\s*$/,
  );
  if (!Array.isArray(data)) {
    throw new Error("SAINS_PKSK_SETS tidak dijumpai dalam fail sumber.");
  }
  return data;
}

function loadKbatSets() {
  if (!fs.existsSync(kbatSourcePath) && fs.existsSync(outPath)) {
    const existing = fs.readFileSync(outPath, "utf8");
    const match = existing.match(/const scienceSets = (\{[\s\S]*?\});\s+window\.PKSK_SET_QUESTIONS/);
    if (!match) throw new Error("Salinan KBAT Sains sedia ada tidak boleh dibaca.");
    const parsed = JSON.parse(match[1]);
    return {
      sets: Object.entries(parsed).map(([set, questions]) => ({
        set: Number(set),
        questions: questions.slice(20, 40).map((question, index) => ({
          question: question.q,
          options: question.options,
          answer: question.answer,
          explanation: question.explain,
          skill: question.level,
          fig: question.fig,
          id: question.sourceId || `SKBAT${set}-Q${index + 1}`,
        })),
      })),
    };
  }

  const source = fs.readFileSync(kbatSourcePath, "utf8");
  const data = parseAssignedJson(
    source,
    /^const SAINS_PKSK_KBAT_SETS\s*=\s*/,
    /;\s*export default SAINS_PKSK_KBAT_SETS;\s*$/,
  );
  if (!Array.isArray(data.sets)) {
    throw new Error("SAINS_PKSK_KBAT_SETS tidak dijumpai dalam fail KBAT.");
  }
  return data;
}

function stableHash(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function prepareBankQuestion(question) {
  const options = "ABCD".split("").map((key) => question.options?.[key]);
  return {
    id: `BANK-SCI-${String(question.id).padStart(3, "0")}`,
    question: question.question,
    options,
    answer: question.answer,
    explanation: `Jawapan ${question.answer} paling tepat berdasarkan konsep ${question.skill || question.section || "Sains"} yang diuji.`,
    skill: [question.section, question.level, question.skill].filter(Boolean).join(" - "),
  };
}

function loadAndDistributeQuestionBank() {
  if (!fs.existsSync(questionBankPath)) {
    throw new Error(`Bank soalan Sains tidak dijumpai: ${questionBankPath}`);
  }

  const bank = JSON.parse(fs.readFileSync(questionBankPath, "utf8"));
  if (!Array.isArray(bank.questions) || bank.questions.length !== 360) {
    throw new Error(`Bank Sains perlu mempunyai 360 soalan, dijumpai ${bank.questions?.length ?? 0}.`);
  }

  const uniqueIds = new Set(bank.questions.map((question) => String(question.id)));
  const uniqueTexts = new Set(bank.questions.map((question) => cleanText(question.question).toLowerCase()));
  if (uniqueIds.size !== 360 || uniqueTexts.size !== 360) {
    throw new Error(`Bank Sains mengandungi ID atau teks soalan berulang (ID: ${uniqueIds.size}, teks: ${uniqueTexts.size}).`);
  }

  const sections = [...new Set(bank.questions.map((question) => question.section))];
  if (sections.length !== 12) {
    throw new Error(`Bank Sains perlu mempunyai 12 konstruk, dijumpai ${sections.length}.`);
  }

  const sets = Object.fromEntries(Array.from({ length: 9 }, (_, index) => [index + 2, []]));

  sections.forEach((section, sectionIndex) => {
    const sectionQuestions = bank.questions
      .filter((question) => question.section === section)
      .sort((a, b) => stableHash(`PKSK-SCIENCE-2026|${a.id}|${a.question}`) - stableHash(`PKSK-SCIENCE-2026|${b.id}|${b.question}`));
    if (sectionQuestions.length !== 30) {
      throw new Error(`Konstruk "${section}" perlu mempunyai 30 soalan, dijumpai ${sectionQuestions.length}.`);
    }

    // Setiap set menerima tiga soalan asas daripada setiap konstruk.
    for (let setIndex = 0; setIndex < 9; setIndex += 1) {
      const start = setIndex * 3;
      sets[setIndex + 2].push(...sectionQuestions.slice(start, start + 3));
    }

    // Tiga soalan baki diputarkan; setiap set menerima empat tambahan keseluruhannya.
    const extraSetIndexes = Array.from(
      { length: 3 },
      (_, offset) => (sectionIndex * 3 + offset) % 9,
    );
    extraSetIndexes.forEach((setIndex, offset) => {
      sets[setIndex + 2].push(sectionQuestions[27 + offset]);
    });
  });

  for (let setNo = 2; setNo <= 10; setNo += 1) {
    if (sets[setNo].length !== 40) {
      throw new Error(`Agihan bank bagi Set ${setNo} perlu 40 soalan, dijumpai ${sets[setNo].length}.`);
    }
  }

  return {
    sets: Object.fromEntries(
      Object.entries(sets).map(([setNo, questions]) => [
        setNo,
        questions
          .sort((a, b) => stableHash(`PKSK-SCIENCE-ORDER-${setNo}|${a.id}`) - stableHash(`PKSK-SCIENCE-ORDER-${setNo}|${b.id}`))
          .map(prepareBankQuestion),
      ]),
    ),
  };
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/Rajah menunjukkan/gi, "Situasi menunjukkan")
    .trim();
}

function answerToIndex(answer, setNo, index) {
  if (Number.isInteger(answer)) return answer;
  if (typeof answer === "string") {
    const normalized = answer.trim().toUpperCase();
    const mapped = "ABCD".indexOf(normalized);
    if (mapped !== -1) return mapped;
  }
  throw new Error(`Set ${setNo} soalan ${index}: format jawapan tidak sah.`);
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function imageTag(file, alt) {
  return `<img class="science-question-image science-raster-image" src="assets/science-realistic/${escapeAttr(file)}" alt="${escapeAttr(alt)}">`;
}

function remotePhotoTag(url, alt) {
  return `<img class="science-question-image science-raster-image science-photo-image" src="${escapeAttr(url)}" alt="${escapeAttr(alt)}" loading="lazy">`;
}

const SET1_NO_FIG = new Set([14, 16, 17, 18, 19, 30, 31, 32, 34, 36, 37, 38, 39, 40]);
const SET2_NO_FIG = new Set([1, 4, 6, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 27, 28, 30, 33, 37, 39, 40]);

function set1PhotoFigure(index) {
  const uploadedImageIndexes = new Set([2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 21, 22, 23, 24, 25, 26, 27, 28, 29, 33, 35]);
  if (uploadedImageIndexes.has(index)) {
    const file = `q${String(index).padStart(2, "0")}.png`;
    return `<img class="science-question-image science-raster-image science-photo-image" src="assets/science-set1-realistic/${file}" alt="Rajah Sains Set 1 soalan ${index}" loading="lazy">`;
  }
  const photoIndexes = new Set([1]);
  if (!photoIndexes.has(index)) return "";
  const file = `q${String(index).padStart(2, "0")}.jpg`;
  return `<img class="science-question-image science-raster-image science-photo-image" src="assets/science-set1-realistic/${file}" alt="Foto realistik Sains Set 1 soalan ${index}" loading="lazy">`;
}

function set2PhotoFigure(index) {
  const uploadedImageIndexes = new Set([2, 7, 22, 25, 26, 29, 31]);
  if (!uploadedImageIndexes.has(index)) return "";
  const file = `q${String(index).padStart(2, "0")}.png`;
  return `<img class="science-question-image science-raster-image science-photo-image" src="assets/science-set2/${file}" alt="Rajah Sains Set 2 soalan ${index}" loading="lazy">`;
}

function set4PhotoFigure(index) {
  const uploadedImageIndexes = new Set([
    1, 2, 4, 5, 6, 7, 9, 10, 11, 14, 15, 16, 17, 18, 21, 22, 23, 24,
    26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  ]);
  if (!uploadedImageIndexes.has(index)) return "";
  const file = `q${String(index).padStart(2, "0")}.png`;
  return `<img class="science-question-image science-raster-image science-photo-image" src="assets/science-set4/${file}" alt="Rajah Sains Set 4 soalan ${index}" loading="lazy">`;
}

function figureBox(content) {
  return `<div class="science-auto-figure" style="max-width:880px;margin:0 auto;padding:18px;border-radius:18px;background:#fff8fb;border:1px solid rgba(138,21,56,.16);box-shadow:0 12px 28px rgba(31,41,55,.08);">${content}</div>`;
}

function simpleTable(headers, rows) {
  return `<table style="width:100%;max-width:760px;margin:0 auto;border-collapse:collapse;text-align:center;background:#fff;">` +
    `<thead><tr>${headers.map((header) => `<th style="border:1px solid #d8e2ef;padding:10px;color:#8a1538;">${header}</th>`).join("")}</tr></thead>` +
    `<tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td style="border:1px solid #d8e2ef;padding:10px;">${cell}</td>`).join("")}</tr>`).join("")}</tbody>` +
    `</table>`;
}

function getSet2MalaySourceQuestions(fallbackQuestion) {
  const questions = [
    {
      id: "S2-MY-Q01",
      question: "Rajah menunjukkan seekor kucing bersama anaknya. Antara berikut, yang manakah menunjukkan ciri-ciri haiwan tersebut?",
      options: ["Haiwan yang menjaga telur", "Haiwan yang mempunyai sisik", "Haiwan yang melahirkan anak", "Haiwan yang mempunyai tanduk"],
      answer: "C",
      explanation: "Kucing ialah mamalia yang melahirkan anak.",
      fig: figureBox(`<p style="margin:0;text-align:center;font-weight:800;color:#8a1538;">Kucing dewasa bersama anak kucing</p>`),
    },
    {
      id: "S2-MY-Q02",
      question: "Rajah menunjukkan laluan udara semasa proses menarik nafas: Hidung -> Y -> X. Apakah yang diwakili oleh X dan Y?",
      options: ["X = Mulut, Y = Peparu", "X = Trakea, Y = Peparu", "X = Peparu, Y = Trakea", "X = Peparu, Y = Salur udara"],
      answer: "C",
      explanation: "Semasa menarik nafas, udara bergerak dari hidung ke trakea dan seterusnya ke peparu.",
      fig: figureBox(`<p style="margin:0;text-align:center;font-weight:800;">Hidung &rarr; Y &rarr; X</p>`),
    },
    {
      id: "S2-MY-Q03",
      question: "Maklumat berikut ialah maksud bagi satu proses: Penyingkiran bahan buangan yang tidak diperlukan oleh badan. Apakah proses itu?",
      options: ["Perkumuhan", "Pernafasan", "Penyahtinjaan", "Tindak balas terhadap rangsangan"],
      answer: "A",
      explanation: "Perkumuhan ialah proses menyingkirkan bahan buangan daripada badan.",
    },
    {
      id: "S2-MY-Q04",
      question: "Rajah menunjukkan tabiat buruk manusia seperti tidur lewat, badan kotor dan makan makanan berlebihan. Apakah yang akan berlaku jika tabiat di atas berterusan?",
      options: ["Mampu melawan pelbagai jenis penyakit", "Dapat menjalani kehidupan dengan gembira dan bahagia", "Manusia akan lambat bergerak balas terhadap rangsangan", "Makan makanan yang berlebihan akan menjadikan tubuh badan sihat"],
      answer: "C",
      explanation: "Tabiat buruk boleh menjejaskan kesihatan dan menyebabkan tindak balas badan menjadi lambat.",
    },
    {
      id: "S2-MY-Q05",
      question: "Rajah menunjukkan empat jenis haiwan, iaitu ikan paus, ketam, katak dan pari. Antara berikut, yang manakah bernafas menggunakan insang?",
      options: ["Ikan paus dan pari", "Katak dan ketam", "Ketam dan pari", "Ikan paus dan katak"],
      answer: "C",
      explanation: "Ketam dan pari bernafas menggunakan insang.",
    },
    {
      id: "S2-MY-Q06",
      question: "Maklumat penyiasatan di sawah padi menunjukkan bilangan belalang lebih banyak daripada ular, bilangan helang kurang daripada ular, dan bilangan katak lebih daripada helang tetapi kurang daripada ular. Carta palang yang manakah mewakili maklumat tersebut?",
      options: ["Ular paling sedikit, katak sederhana, helang tinggi, belalang paling tinggi", "Ular tinggi, katak sederhana, helang rendah, belalang paling tinggi", "Ular tinggi, katak sederhana, helang paling rendah, belalang paling tinggi", "Ular sederhana, katak tinggi, helang sederhana, belalang paling tinggi"],
      answer: "B",
      explanation: "Susunan yang betul ialah helang paling sedikit, diikuti katak, ular dan belalang paling banyak.",
      fig: figureBox(simpleTable(["Haiwan", "Keadaan bilangan"], [["Helang", "paling sedikit"], ["Katak", "lebih daripada helang"], ["Ular", "lebih daripada katak"], ["Belalang", "paling banyak"]])),
    },
    {
      id: "S2-MY-Q07",
      question: "Rajah menunjukkan seekor kura-kura. Apakah tingkah laku haiwan tersebut untuk melindungi diri daripada musuh?",
      options: ["Menyamar", "Menggulungkan diri", "Mempunyai cangkerang yang keras", "Memasukkan anggota badannya ke dalam cangkerang"],
      answer: "D",
      explanation: "Kura-kura melindungi diri dengan memasukkan kepala dan anggota badannya ke dalam cangkerang.",
    },
    {
      id: "S2-MY-Q08",
      question: "Bilangan murid di Sekolah Kebangsaan Semarak Jaya yang menghidap selesema bertambah daripada 15 orang kepada 80 orang dalam masa seminggu. Apakah kesimpulan yang boleh dibuat?",
      options: ["Selesema ialah penyakit yang berjangkit", "Selesema disebabkan oleh mikroorganisma", "Selesema ialah penyakit yang menyerang kanak-kanak", "Selesema semakin bertambah apabila bilangan hari bertambah"],
      answer: "A",
      explanation: "Pertambahan bilangan pesakit dalam masa singkat menunjukkan selesema mudah berjangkit.",
    },
    {
      id: "S2-MY-Q09",
      question: "Rajah menunjukkan ikan jerung dan ikan remora yang sedang berinteraksi antara satu sama lain. Apakah bentuk interaksi simbiosis antara dua haiwan tersebut?",
      options: ["Parasitisme", "Komensalisme", "Mutualisme", "Intraspesies"],
      answer: "B",
      explanation: "Ikan remora mendapat manfaat, manakala ikan jerung tidak terjejas. Ini ialah komensalisme.",
    },
    {
      id: "S2-MY-Q10",
      question: "Rajah menunjukkan satu objek diletakkan di hadapan lampu suluh. Bagaimanakah untuk menjadikan saiz bayang-bayang bola itu lebih besar daripada saiz asal?",
      options: ["Dekatkan bola dengan skrin", "Jauhkan bola dengan skrin", "Ubah kedudukan lampu suluh", "Ubah kedudukan skrin"],
      answer: "B",
      explanation: "Bayang-bayang menjadi lebih besar apabila objek dijauhkan daripada skrin dan didekatkan kepada sumber cahaya.",
      fig: figureBox(`<p style="margin:0;text-align:center;font-weight:800;">Lampu suluh &rarr; Bola &rarr; Skrin</p>`),
    },
    {
      id: "S2-MY-Q11",
      question: "Antara fenomena berikut, yang manakah melibatkan prinsip pembiasan cahaya?",
      options: ["L dan N", "M dan N", "L dan O", "M dan O"],
      answer: "A",
      explanation: "Pensel kelihatan bengkok dalam air dan objek dalam akuarium melibatkan pembiasan cahaya.",
      fig: figureBox(simpleTable(["L", "M", "N", "O"], [["Pensel dalam air", "Cermin", "Akuarium", "Bayang-bayang"]])),
    },
    {
      id: "S2-MY-Q12",
      question: "Rajah menunjukkan dua perkakas elektrik R dan S. R ialah cerek elektrik dan S ialah pembesar suara. Antara berikut, alat yang manakah sama dengan R dan S berdasarkan perubahan bentuk tenaga?",
      options: ["R = lampu meja, S = mesin basuh", "R = seterika, S = pengering rambut", "R = pembakar roti, S = radio", "R = periuk nasi, S = kipas"],
      answer: "C",
      explanation: "Cerek dan pembakar roti menukarkan tenaga elektrik kepada haba, manakala pembesar suara dan radio menghasilkan bunyi.",
    },
    {
      id: "S2-MY-Q13",
      question: "Rajah menunjukkan sebuah rumah yang dipasang dengan panel suria. Apakah kegunaan paling utama panel suria tersebut?",
      options: ["Menghilangkan bau di dalam rumah", "Meningkatkan suhu di dalam rumah", "Memanaskan air", "Membekalkan tenaga elektrik ke dalam rumah"],
      answer: "D",
      explanation: "Panel suria menukarkan tenaga cahaya Matahari kepada tenaga elektrik.",
    },
    {
      id: "S2-MY-Q14",
      question: "Maklumat menunjukkan langkah mengukur suhu air: R letakkan termometer ke dalam air, S tunggu sehingga aras merkuri berhenti bergerak, T pegang batang termometer secara tegak, U laraskan kedudukan mata pada meniskus dan baca suhu. Susunkan langkah mengikut urutan yang betul.",
      options: ["T, R, S dan U", "T, S, R dan U", "R, U, T dan S", "R, T, U dan S"],
      answer: "A",
      explanation: "Termometer perlu dipegang tegak dahulu, diletakkan ke dalam air, ditunggu sehingga bacaan stabil dan kemudian dibaca pada aras mata.",
      fig: figureBox(simpleTable(["Langkah", "Tindakan"], [["T", "Pegang termometer secara tegak"], ["R", "Letakkan termometer ke dalam air"], ["S", "Tunggu sehingga bacaan stabil"], ["U", "Baca pada aras mata"]])),
    },
    {
      id: "S2-MY-Q15",
      question: "Selepas tart habis dibakar, acuannya tidak boleh ditanggalkan. Apakah langkah terbaik supaya tart dapat dikeluarkan daripada acuan dengan mudah?",
      options: ["Cungkil acuan menggunakan garfu", "Biarkan acuan tart sejuk pada suhu bilik", "Jemur acuan tart di bawah cahaya Matahari", "Rendam acuan tart dalam bekas berisi air panas"],
      answer: "D",
      explanation: "Air panas menyebabkan acuan mengembang sedikit lalu tart lebih mudah dikeluarkan.",
    },
    {
      id: "S2-MY-Q16",
      question: "Rajah menunjukkan jisim Q yang diukur menggunakan neraca tiga palang. Bacaan palang menunjukkan 20 g dan 7.7 g. Berapakah jisim Q?",
      options: ["20.7 g", "7.20 g", "27.7 g", "277.5 g"],
      answer: "C",
      explanation: "Jumlah bacaan ialah 20 g + 7.7 g = 27.7 g.",
    },
    {
      id: "S2-MY-Q17",
      question: "Jadual menunjukkan masa yang diambil oleh empat buah kereta untuk bergerak sejauh 200 km: R = 5 jam, S = 3 jam, T = 8 jam, U = 2 jam. Pilih urutan daripada paling perlahan kepada paling laju.",
      options: ["T, R, S, U", "U, S, R, T", "T, S, R, U", "U, S, T, R"],
      answer: "A",
      explanation: "Untuk jarak yang sama, masa paling lama menunjukkan kelajuan paling perlahan.",
      fig: figureBox(simpleTable(["Kereta", "R", "S", "T", "U"], [["Masa (jam)", "5", "3", "8", "2"]])),
    },
    {
      id: "S2-MY-Q18",
      question: "Kereta mainan bergerak menuruni landasan condong di atas tiga permukaan. Jarak yang dilalui ialah kaca 12 cm, simen 9 cm dan kertas pasir 6 cm. Apakah kesimpulan penyiasatan ini?",
      options: ["Daya geseran paling besar di atas permukaan kertas pasir", "Daya geseran paling besar di atas permukaan kaca", "Semakin berkurang daya geseran, kereta mainan bergerak lebih dekat", "Semakin bertambah daya geseran, kereta mainan bergerak lebih jauh"],
      answer: "A",
      explanation: "Jarak paling pendek berlaku pada kertas pasir, menunjukkan daya geseran paling besar.",
      fig: figureBox(simpleTable(["Permukaan", "Jarak"], [["Kaca", "12 cm"], ["Simen", "9 cm"], ["Kertas pasir", "6 cm"]])),
    },
    {
      id: "S2-MY-Q19",
      question: "Rajah menunjukkan dua kumpulan objek. Kumpulan P terdiri daripada payung, baju hujan dan khemah. Kumpulan Q terdiri daripada tayar, meja dan stoking. Apakah sumber asas bahan bagi P dan Q?",
      options: ["P = Petroleum, Q = Tumbuhan", "P = Tumbuhan, Q = Haiwan", "P = Petroleum, Q = Haiwan", "P = Batuan, Q = Petroleum"],
      answer: "A",
      explanation: "Objek dalam P lazimnya berasaskan bahan daripada petroleum, manakala objek dalam Q boleh dikaitkan dengan sumber tumbuhan seperti getah, kayu dan kapas.",
    },
    {
      id: "S2-MY-Q20",
      question: "Rajah menunjukkan makanan dalam tin. Bagaimanakah cara untuk mencegah tin makanan itu daripada berkarat?",
      options: ["Menyalut dengan plastik", "Menyadur dengan logam", "Mengecat", "Menyapu minyak atau gris"],
      answer: "C",
      explanation: "Mengecat menghalang permukaan tin daripada bersentuhan terus dengan air dan udara.",
    },
    {
      id: "S2-MY-Q21",
      question: "Nabil meletakkan gelas berisi kiub ais di atas meja. Selepas 15 minit, terdapat air di dalam gelas. Apakah proses yang berlaku?",
      options: ["Pembekuan", "Penyejatan", "Peleburan", "Kondensasi"],
      answer: "C",
      explanation: "Kiub ais berubah daripada pepejal kepada cecair melalui proses peleburan.",
    },
    {
      id: "S2-MY-Q22",
      question: "Jadual menunjukkan sifat kimia bahan melalui rasa: R berasa masam, S berasa manis atau masin atau tawar, dan T berasa pahit. Apakah bahan yang boleh diwakili oleh R, S dan T?",
      options: ["R = Cuka, S = Garam, T = Peria", "R = Peria, S = Gula, T = Lemon", "R = Tepung gandum, S = Kubis, T = Tomato", "R = Badam, S = Minyak, T = Nasi"],
      answer: "A",
      explanation: "Cuka masam, garam masin dan peria pahit.",
      fig: figureBox(simpleTable(["Bahan", "Rasa"], [["R", "Masam"], ["S", "Manis / masin / tawar"], ["T", "Pahit"]])),
    },
    {
      id: "S2-MY-Q23",
      question: "Rajah menunjukkan cara yang betul untuk melupuskan sejenis bahan buangan. Jika bahan buangan itu tidak dilupuskan dengan cara yang betul, apakah yang akan berlaku kepada alam sekitar?",
      options: ["Menyebabkan pencemaran udara", "Menjadi tempat pembiakan haiwan perosak", "Menyebabkan perubahan iklim", "Memudaratkan haiwan dan tumbuhan akuatik"],
      answer: "B",
      explanation: "Sisa pepejal yang tidak dilupuskan dengan betul boleh menjadi tempat pembiakan haiwan perosak.",
    },
    {
      id: "S2-MY-Q24",
      question: "Antara berikut, yang manakah merupakan bahan buangan tidak terbiodegradasi?",
      options: ["Surat khabar", "Tulang ikan", "Kotak kadbod", "Balang kaca"],
      answer: "D",
      explanation: "Balang kaca tidak mudah diuraikan oleh mikroorganisma.",
    },
    {
      id: "S2-MY-Q25",
      question: "Maklumat menunjukkan langkah membuat jeruk mangga: potong mangga, basuh dan tuskan, campur dengan garam dan biarkan semalaman, basuh dan tuskan lagi, langkah T, kemudian tutup balang dengan ketat. Apakah langkah T?",
      options: ["Letakkan mangga ke dalam sebuah balang", "Keringkan mangga di bawah cahaya Matahari", "Rendam mangga dalam larutan cuka semalaman dan tambah sedikit gula", "Rendam mangga dalam larutan gula yang pekat untuk beberapa hari dan tambah sedikit cuka"],
      answer: "C",
      explanation: "Selepas garam dibasuh, mangga perlu direndam dalam larutan cuka dan ditambah gula sebelum balang ditutup.",
    },
    {
      id: "S2-MY-Q26",
      question: "Rajah menunjukkan aktiviti yang melibatkan daya, iaitu seorang lelaki menolak objek. Antara aktiviti berikut, yang manakah melibatkan daya yang sama?",
      options: ["Mengepam tayar basikal", "Mendayung sampan", "Menarik pintu", "Menolak troli"],
      answer: "D",
      explanation: "Menolak troli menggunakan daya tolakan seperti dalam rajah.",
    },
    {
      id: "S2-MY-Q27",
      question: "Seorang murid merekodkan fasa Bulan pada 1, 5, 10, 15, 20 dan 25 haribulan. Pada 1 dan 20 haribulan Bulan tidak kelihatan, pada 5 dan 25 haribulan kelihatan sabit, dan pada 15 haribulan Bulan purnama. Ramalkan fasa Bulan pada 27 haribulan.",
      options: ["Bulan separa", "Bulan purnama", "Anak bulan", "Bulan sabit"],
      answer: "D",
      explanation: "Selepas 25 haribulan, fasa Bulan masih hampir kepada bentuk sabit.",
    },
    {
      id: "S2-MY-Q28",
      question: "Rajah menunjukkan satu buruj. Apakah arah yang ditunjukkan oleh buruj tersebut?",
      options: ["Utara", "Selatan", "Timur", "Barat"],
      answer: "B",
      explanation: "Buruj yang ditunjukkan digunakan sebagai panduan arah Selatan.",
    },
    {
      id: "S2-MY-Q29",
      question: "Rajah menunjukkan satu fenomena yang berlaku di kawasan X pada Bumi. Apakah yang menyebabkan fenomena ini berlaku?",
      options: ["Putaran Bumi pada paksinya dari Barat ke Timur", "Putaran Bumi pada paksinya dari Timur ke Barat", "Peredaran Bumi mengelilingi Matahari dari arah Timur ke Barat", "Peredaran Bumi mengelilingi Matahari dari arah Barat ke Timur"],
      answer: "A",
      explanation: "Fenomena siang dan malam berlaku kerana Bumi berputar pada paksinya dari Barat ke Timur.",
    },
    {
      id: "S2-MY-Q30",
      question: "Rajah menunjukkan perbandingan saiz antara Matahari, Bumi dan Bulan. Berapakah nisbah saiz antara Matahari, Bumi dan Bulan?",
      options: ["400 : 4 : 1", "1 : 4 : 400", "1 : 40 : 400", "40 : 4 : 1"],
      answer: "A",
      explanation: "Nisbah anggaran saiz Matahari, Bumi dan Bulan ialah 400 : 4 : 1.",
    },
    {
      id: "S2-MY-Q31",
      question: "Rajah menunjukkan kedudukan planet dalam Sistem Suria. Apakah planet yang paling besar dalam Sistem Suria?",
      options: ["Utarid", "Bumi", "Musytari", "Marikh"],
      answer: "C",
      explanation: "Musytari ialah planet paling besar dalam Sistem Suria.",
    },
    {
      id: "S2-MY-Q32",
      question: "Rajah menunjukkan Matahari, Bulan dan Bumi berada pada kedudukan sebaris dengan Bulan di antara Matahari dan Bumi. Apakah fenomena yang berlaku?",
      options: ["Gerhana Bulan", "Fasa-fasa Bulan", "Gerhana Matahari", "Bulan purnama"],
      answer: "C",
      explanation: "Gerhana Matahari berlaku apabila Bulan berada di antara Matahari dan Bumi.",
    },
    {
      id: "S2-MY-Q33",
      question: "Mengapakah tempoh masa gerhana Bulan lebih lama berbanding gerhana Matahari?",
      options: ["Saiz Bumi lebih besar berbanding Bulan", "Bulan lebih dekat dengan Bumi", "Bayang-bayang Bumi jatuh ke atas Bulan", "Gerhana Matahari berlaku pada waktu malam"],
      answer: "A",
      explanation: "Bayang-bayang Bumi lebih besar kerana saiz Bumi lebih besar daripada Bulan.",
    },
    {
      id: "S2-MY-Q34",
      question: "Rajah menunjukkan perkembangan teknologi dalam bidang pertanian daripada W kepada X, Y dan Z. X menunjukkan manusia menuai, Y menggunakan haiwan membajak dan Z menggunakan traktor. Apakah W?",
      options: ["Manusia mengumpul hasil hutan", "Manusia bercucuk tanam menggunakan alat ringkas", "Manusia menaiki rakit", "Manusia tinggal di gua"],
      answer: "B",
      explanation: "Peringkat awal teknologi pertanian melibatkan penggunaan alat ringkas untuk bercucuk tanam.",
    },
    {
      id: "S2-MY-Q35",
      question: "Antara alat berikut, yang manakah menggunakan prinsip roda dan gandar?",
      options: ["Gunting dan pemutar skru", "Tombol pintu dan pengasah pensel", "Pemutar skru dan tombol pintu", "Gunting dan pengasah pensel"],
      answer: "B",
      explanation: "Tombol pintu dan pengasah pensel menggunakan prinsip roda dan gandar.",
    },
    {
      id: "S2-MY-Q36",
      question: "Rajah menunjukkan dua buah bas X dan Y. Bas Y lebih stabil berbanding bas X. Apakah faktor yang mempengaruhi kestabilan bas Y?",
      options: ["Warna dan ketinggian", "Luas tapak dan bentuk", "Ketinggian dan luas tapak", "Luas tapak dan jisim"],
      answer: "C",
      explanation: "Objek lebih stabil apabila mempunyai pusat graviti lebih rendah dan luas tapak yang lebih besar.",
    },
    {
      id: "S2-MY-Q37",
      question: "Rajah menunjukkan seorang jurutera binaan. Beliau dikehendaki membina bangunan yang kuat dan kukuh. Apakah yang perlu dilakukan?",
      options: ["Mengurangkan kos pembinaan", "Memastikan struktur bangunan diletakkan dengan betul", "Menggunakan bahan binaan yang bermutu rendah", "Menggunakan bahan binaan yang terdiri daripada konkrit dan besi"],
      answer: "D",
      explanation: "Konkrit dan besi ialah bahan yang sesuai untuk membina struktur bangunan yang kuat.",
    },
    {
      id: "S2-MY-Q38",
      question: "Rajah menunjukkan seekor zirafah yang sedang minum air. Mengapakah zirafah mengangkangkan kaki hadapannya?",
      options: ["Untuk menguatkan kakinya", "Untuk mengurangkan jisimnya", "Memudahkannya untuk minum air", "Untuk menambahkan kestabilan badannya"],
      answer: "D",
      explanation: "Mengangkangkan kaki menambah luas tapak dan menjadikan badan lebih stabil.",
    },
    {
      id: "S2-MY-Q39",
      question: "Antara berikut, aktiviti yang manakah menggunakan teknologi?",
      options: ["J dan K", "K dan M", "K dan L", "J dan M"],
      answer: "A",
      explanation: "Aktiviti J dan K menggunakan alatan atau teknologi untuk memudahkan kerja manusia.",
    },
  ];

  const formatted = questions.map((question, index) => ({
    ...question,
    skill: "Sains Set 2",
    topic: "Penyelesaian Masalah Sains",
    level: "Sains PKSK",
  }));
  return [
    ...formatted,
    {
      ...fallbackQuestion,
      id: fallbackQuestion.id || "S2-Q40",
    },
  ];
}

function scienceRasterFigure(text) {
  if (/(ayam|chicken)/.test(text)) {
    return imageTag("animal-chicken.png", "Gambar realistik ayam");
  }
  if (/buaya/.test(text)) {
    return imageTag("animal-crocodile.png", "Gambar realistik buaya");
  }
  if (/kucing/.test(text)) {
    return imageTag("animal-cat.png", "Gambar realistik kucing");
  }
  if (/kura-kura|kura/.test(text)) {
    return imageTag("animal-turtle.png", "Gambar realistik kura-kura");
  }
  if (/(haiwan|ikan|burung|belalang|ular|helang|tikus)/.test(text)) {
    return imageTag("animal-general.png", "Gambar realistik haiwan");
  }
  if (/(tumbuhan|pucuk|akar|daun|fotosintesis|cahaya matahari|padi|pokok)/.test(text)) {
    return imageTag("plant-light.png", "Gambar realistik tumbuhan");
  }
  if (/(manusia|murid|tangan|cawan panas|peparu|bernafas|air kencing|organ|kesihatan|makanan seimbang)/.test(text)) {
    return imageTag("human-response.png", "Gambar realistik manusia");
  }
  if (/(litar|mentol|bateri|suis|elektrik)/.test(text)) {
    return imageTag("circuit-electric.png", "Gambar realistik litar elektrik");
  }
  if (/(magnet|besi|tarik|daya|geseran|graviti)/.test(text)) {
    return imageTag("magnet-force.png", "Gambar realistik magnet dan daya");
  }
  if (/(bumi|bulan|matahari|gerhana|fasa|bayang|cahaya|pantulan|objek digerakkan|skrin)/.test(text)) {
    return imageTag("earth-moon-sun.png", "Gambar realistik Bumi Bulan Matahari");
  }
  if (/(air|ais|wap|penyejatan|kondensasi|pembekuan|mendidih|suhu|termometer)/.test(text)) {
    return imageTag("water-temperature.png", "Gambar realistik air dan suhu");
  }
  if (/(bahan|kayu|plastik|logam|kain|getah|konduktor|penebat|larut)/.test(text)) {
    return imageTag("materials.png", "Gambar realistik bahan");
  }
  if (/(siratan makanan|rantai makanan|pemangsa|mangsa|ekosistem)/.test(text)) {
    return imageTag("animal-general.png", "Gambar realistik haiwan dan ekosistem");
  }
  if (/(graf|carta|jadual|eksperimen|pemerhatian|keputusan)/.test(text)) {
    return imageTag("materials.png", "Gambar realistik bahan dan pemerhatian eksperimen");
  }
  return "";
}

function scienceSvg(title, subtitle, body, palette = {}) {
  const main = palette.main || "#8a1538";
  const accent = palette.accent || "#f59e0b";
  const soft = palette.soft || "#fff7fb";
  return `<svg class="science-auto-figure" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 360" role="img" aria-label="${escapeAttr(title)}">
    <defs>
      <linearGradient id="sciBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${soft}"/>
        <stop offset="0.58" stop-color="#f8fafc"/>
        <stop offset="1" stop-color="#eef6ff"/>
      </linearGradient>
      <filter id="sciShadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#1f2937" flood-opacity=".16"/>
      </filter>
      <marker id="sciArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
        <path d="M0,0 L0,6 L9,3 z" fill="${main}"/>
      </marker>
    </defs>
    <rect width="980" height="360" rx="28" fill="url(#sciBg)"/>
    <circle cx="875" cy="60" r="120" fill="${main}" opacity=".07"/>
    <circle cx="115" cy="320" r="150" fill="${accent}" opacity=".08"/>
    <text x="42" y="54" font-family="Arial, sans-serif" font-size="25" font-weight="800" fill="#172033">${escapeHtml(title)}</text>
    <text x="42" y="86" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="#64748b">${escapeHtml(subtitle)}</text>
    ${body}
  </svg>`;
}

function animalFigure(kind) {
  const lower = kind.toLowerCase();
  if (lower.includes("buaya")) {
    return scienceSvg("Ilustrasi: Buaya", "Haiwan reptilia yang bertelur dan berkulit bersisik", `
      <rect x="36" y="120" width="908" height="190" rx="26" fill="#dbeafe"/>
      <path d="M36 245 C170 210 245 275 384 232 C526 188 657 238 944 202 L944 310 L36 310 Z" fill="#93c5fd" opacity=".75"/>
      <path d="M105 242 C230 160 470 175 670 210 C735 222 800 210 882 230 C801 256 730 255 660 245 C458 284 280 282 105 242 Z" fill="#6b7b39" filter="url(#sciShadow)"/>
      <path d="M672 210 C752 182 830 196 900 228 C835 245 762 248 675 232 Z" fill="#7f8f42"/>
      <circle cx="807" cy="214" r="7" fill="#111827"/>
      <path d="M826 230 L890 230" stroke="#f8fafc" stroke-width="5" stroke-linecap="round"/>
      <path d="M152 237 L76 270 M210 249 L170 295 M555 242 L520 292 M610 242 L650 292" stroke="#4d5f2a" stroke-width="18" stroke-linecap="round"/>
      <path d="M190 198 C300 170 485 184 632 212" fill="none" stroke="#a3b35d" stroke-width="14" stroke-linecap="round" stroke-dasharray="9 15"/>
      <text x="390" y="334" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#475569">Ciri utama: reptilia, bertelur, kulit bersisik</text>
    `, { main: "#8a1538", accent: "#2563eb", soft: "#f8fbff" });
  }
  if (lower.includes("kucing")) {
    return scienceSvg("Ilustrasi: Kucing", "Mamalia yang melahirkan dan menyusukan anak", `
      <ellipse cx="515" cy="226" rx="185" ry="72" fill="#d9a66f" filter="url(#sciShadow)"/>
      <circle cx="685" cy="190" r="72" fill="#d9a66f"/>
      <path d="M642 132 L668 82 L690 139 M718 139 L751 88 L753 153" fill="#c9874b"/>
      <circle cx="662" cy="185" r="8" fill="#111827"/><circle cx="712" cy="185" r="8" fill="#111827"/>
      <path d="M683 204 Q696 214 710 204" fill="none" stroke="#111827" stroke-width="4" stroke-linecap="round"/>
      <path d="M350 212 C260 150 210 195 245 256" fill="none" stroke="#d9a66f" stroke-width="28" stroke-linecap="round"/>
      <path d="M395 274 L365 322 M490 282 L476 326 M612 278 L636 324" stroke="#b77942" stroke-width="18" stroke-linecap="round"/>
      <text x="500" y="334" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#475569">Ciri utama: mamalia, menyusukan anak</text>
    `, { main: "#8a1538", accent: "#f59e0b", soft: "#fff7ed" });
  }
  if (lower.includes("kura")) {
    return scienceSvg("Ilustrasi: Kura-kura", "Haiwan bercangkerang yang melindungi diri daripada musuh", `
      <ellipse cx="500" cy="218" rx="205" ry="86" fill="#5f7f3a" filter="url(#sciShadow)"/>
      <path d="M337 216 Q500 92 665 216 Q500 302 337 216 Z" fill="#7da34f" stroke="#3f6212" stroke-width="6"/>
      <path d="M400 190 L500 125 L600 190 L560 258 L438 258 Z" fill="none" stroke="#3f6212" stroke-width="5"/>
      <circle cx="725" cy="214" r="42" fill="#7da34f"/><circle cx="742" cy="204" r="5" fill="#111827"/>
      <path d="M305 222 L250 250 M382 274 L342 320 M612 274 L652 320" stroke="#5f7f3a" stroke-width="22" stroke-linecap="round"/>
      <text x="500" y="334" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#475569">Ciri utama: cangkerang sebagai perlindungan</text>
    `, { main: "#166534", accent: "#84cc16", soft: "#f0fdf4" });
  }
  return scienceSvg("Ilustrasi: Haiwan", "Kenal pasti ciri dan tingkah laku haiwan", `
    <circle cx="500" cy="202" r="96" fill="#fef3c7" stroke="#f59e0b" stroke-width="6" filter="url(#sciShadow)"/>
    <path d="M430 180 Q500 108 570 180 Q550 268 500 286 Q450 268 430 180 Z" fill="#fb923c"/>
    <circle cx="470" cy="190" r="9" fill="#111827"/><circle cx="530" cy="190" r="9" fill="#111827"/>
    <path d="M482 225 Q500 239 520 225" fill="none" stroke="#111827" stroke-width="5" stroke-linecap="round"/>
    <text x="500" y="334" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#475569">Perhatikan ciri seperti pembiakan, pernafasan dan perlindungan</text>
  `);
}

function autoScienceFigure(q, setNo, index) {
  const text = q.toLowerCase();
  const raster = scienceRasterFigure(text);
  if (raster) return raster;
  if (/(buaya|kucing|kura-kura|haiwan|ikan|burung|belalang|ular|helang|tikus)/.test(text)) {
    if (text.includes("buaya")) return animalFigure("buaya");
    if (text.includes("kucing")) return animalFigure("kucing");
    if (text.includes("kura-kura")) return animalFigure("kura-kura");
    return animalFigure("haiwan");
  }
  if (/(tumbuhan|pucuk|akar|daun|fotosintesis|cahaya matahari)/.test(text)) {
    return scienceSvg("Ilustrasi: Tumbuhan", "Tumbuhan bergerak balas terhadap rangsangan dan memerlukan cahaya", `
      <rect x="110" y="264" width="310" height="34" rx="12" fill="#92400e" opacity=".35"/>
      <path d="M275 265 C260 215 282 165 345 122" fill="none" stroke="#166534" stroke-width="15" stroke-linecap="round"/>
      <ellipse cx="238" cy="202" rx="58" ry="30" fill="#86efac" stroke="#166534" stroke-width="4" transform="rotate(-28 238 202)"/>
      <ellipse cx="372" cy="135" rx="62" ry="32" fill="#86efac" stroke="#166534" stroke-width="4" transform="rotate(24 372 135)"/>
      <circle cx="760" cy="98" r="52" fill="#fde68a" stroke="#f59e0b" stroke-width="5"/>
      <path d="M708 124 L440 165 M722 150 L455 205" stroke="#f59e0b" stroke-width="6" stroke-linecap="round" stroke-dasharray="12 10"/>
      <text x="500" y="334" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#475569">Pucuk tumbuhan condong ke arah cahaya</text>
    `, { main: "#166534", accent: "#f59e0b", soft: "#f0fdf4" });
  }
  if (/(manusia|murid|tangan|cawan panas|peparu|bernafas|air kencing|organ|kesihatan|makanan seimbang)/.test(text)) {
    return scienceSvg("Ilustrasi: Manusia", "Sistem badan dan gerak balas manusia", `
      <circle cx="500" cy="118" r="48" fill="#f8c8a0" stroke="#9f1239" stroke-width="5"/>
      <path d="M500 168 L500 265 M430 202 L570 202 M462 265 L430 318 M538 265 L570 318" stroke="#8a1538" stroke-width="18" stroke-linecap="round"/>
      <path d="M462 206 C438 170 456 140 490 165 L490 240 C458 230 444 220 462 206 Z" fill="#fecdd3" stroke="#be123c" stroke-width="4"/>
      <path d="M538 206 C562 170 544 140 510 165 L510 240 C542 230 556 220 538 206 Z" fill="#fecdd3" stroke="#be123c" stroke-width="4"/>
      <circle cx="725" cy="205" r="42" fill="#fde68a" stroke="#f59e0b" stroke-width="5"/>
      <text x="725" y="212" text-anchor="middle" font-family="Arial" font-size="19" font-weight="800" fill="#92400e">Rangsangan</text>
      <text x="500" y="334" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#475569">Manusia bernafas, bergerak balas dan menjaga kesihatan badan</text>
    `, { main: "#8a1538", accent: "#f59e0b", soft: "#fff1f2" });
  }
  if (/(litar|mentol|bateri|suis|elektrik)/.test(text)) {
    return scienceSvg("Ilustrasi: Litar Elektrik", "Litar lengkap membolehkan arus elektrik mengalir", `
      <rect x="115" y="150" width="150" height="80" rx="14" fill="#fef3c7" stroke="#92400e" stroke-width="5" filter="url(#sciShadow)"/>
      <text x="190" y="198" text-anchor="middle" font-family="Arial" font-size="22" font-weight="800" fill="#92400e">Bateri</text>
      <circle cx="750" cy="190" r="58" fill="#fde68a" stroke="#ca8a04" stroke-width="6"/>
      <text x="750" y="198" text-anchor="middle" font-family="Arial" font-size="21" font-weight="800" fill="#92400e">Mentol</text>
      <path d="M265 190 L420 190 M560 190 L692 190 M808 190 L880 190 L880 292 L115 292 L115 190" fill="none" stroke="#334155" stroke-width="8"/>
      <rect x="420" y="170" width="140" height="38" rx="8" fill="#e2e8f0" stroke="#334155" stroke-width="5"/>
      <path d="M438 190 L545 190" stroke="#16a34a" stroke-width="8" stroke-linecap="round"/>
      <text x="500" y="334" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#475569">Komponen asas: bateri, suis, wayar dan mentol</text>
    `, { main: "#8a1538", accent: "#f59e0b", soft: "#fffbeb" });
  }
  if (/(magnet|besi|tarik|daya|geseran|graviti)/.test(text)) {
    return scienceSvg("Ilustrasi: Daya", "Daya boleh menarik, menolak atau mengubah gerakan objek", `
      <path d="M360 128 h80 v120 c0 54-44 98-98 98s-98-44-98-98V128h80v116c0 10 8 18 18 18s18-8 18-18z" fill="#ef4444" stroke="#991b1b" stroke-width="6" filter="url(#sciShadow)"/>
      <path d="M560 128 h80v116c0 10 8 18 18 18s18-8 18-18V128h80v120c0 54-44 98-98 98s-98-44-98-98z" fill="#2563eb" stroke="#1d4ed8" stroke-width="6" filter="url(#sciShadow)"/>
      <rect x="448" y="195" width="74" height="36" rx="8" fill="#94a3b8" stroke="#334155" stroke-width="4"/>
      <line x1="525" y1="213" x2="558" y2="213" stroke="#8a1538" stroke-width="6" marker-end="url(#sciArrow)"/>
      <text x="500" y="334" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#475569">Contoh bahan magnet: besi, keluli dan klip logam</text>
    `, { main: "#8a1538", accent: "#2563eb", soft: "#eff6ff" });
  }
  if (/(bumi|bulan|matahari|gerhana|fasa|bayang|cahaya|pantulan)/.test(text)) {
    return scienceSvg("Ilustrasi: Bumi, Bulan dan Cahaya", "Kedudukan objek mempengaruhi bayang-bayang dan gerhana", `
      <circle cx="180" cy="185" r="62" fill="#fde68a" stroke="#f59e0b" stroke-width="6" filter="url(#sciShadow)"/>
      <circle cx="485" cy="185" r="58" fill="#60a5fa" stroke="#1d4ed8" stroke-width="6"/>
      <path d="M450 160 C485 135 530 150 545 190 C515 218 475 222 445 195 Z" fill="#22c55e" opacity=".75"/>
      <circle cx="735" cy="185" r="36" fill="#cbd5e1" stroke="#475569" stroke-width="5"/>
      <line x1="248" y1="162" x2="425" y2="162" stroke="#f59e0b" stroke-width="6" marker-end="url(#sciArrow)"/>
      <line x1="248" y1="208" x2="425" y2="208" stroke="#f59e0b" stroke-width="6" marker-end="url(#sciArrow)"/>
      <path d="M545 185 Q640 118 735 185 Q640 252 545 185" fill="none" stroke="#334155" stroke-width="4" stroke-dasharray="10 10"/>
      <text x="500" y="334" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#475569">Cahaya bergerak lurus dan boleh menghasilkan bayang-bayang</text>
    `, { main: "#1d4ed8", accent: "#f59e0b", soft: "#eff6ff" });
  }
  if (/(air|ais|wap|penyejatan|kondensasi|pembekuan|mendidih|suhu|termometer)/.test(text)) {
    return scienceSvg("Ilustrasi: Air dan Suhu", "Perubahan keadaan jirim berlaku apabila haba diserap atau dibebaskan", `
      <rect x="210" y="132" width="190" height="170" rx="22" fill="#bfdbfe" stroke="#2563eb" stroke-width="6" filter="url(#sciShadow)"/>
      <path d="M218 220 C250 200 280 240 313 220 C345 200 370 235 394 220 L394 290 L218 290 Z" fill="#38bdf8" opacity=".75"/>
      <rect x="560" y="106" width="58" height="178" rx="29" fill="#fee2e2" stroke="#be123c" stroke-width="6"/>
      <rect x="578" y="170" width="22" height="88" rx="11" fill="#ef4444"/>
      <circle cx="589" cy="280" r="34" fill="#ef4444"/>
      <path d="M462 170 C442 138 500 132 480 96 M510 175 C490 142 548 135 528 100" fill="none" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
      <text x="500" y="334" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#475569">Air boleh menjadi ais, cecair atau wap air</text>
    `, { main: "#2563eb", accent: "#ef4444", soft: "#f0f9ff" });
  }
  if (/(bahan|kayu|plastik|logam|kain|getah|konduktor|penebat|larut)/.test(text)) {
    return scienceSvg("Ilustrasi: Bahan", "Bahan berbeza mempunyai sifat yang berbeza", `
      <rect x="245" y="160" width="120" height="112" rx="18" fill="#b45309" stroke="#78350f" stroke-width="5" filter="url(#sciShadow)"/>
      <rect x="430" y="140" width="130" height="132" rx="22" fill="#60a5fa" stroke="#1d4ed8" stroke-width="5" filter="url(#sciShadow)"/>
      <circle cx="665" cy="210" r="66" fill="#cbd5e1" stroke="#475569" stroke-width="5" filter="url(#sciShadow)"/>
      <text x="305" y="296" text-anchor="middle" font-family="Arial" font-size="18" font-weight="800" fill="#78350f">Kayu</text>
      <text x="495" y="296" text-anchor="middle" font-family="Arial" font-size="18" font-weight="800" fill="#1d4ed8">Plastik</text>
      <text x="665" y="296" text-anchor="middle" font-family="Arial" font-size="18" font-weight="800" fill="#475569">Logam</text>
      <text x="500" y="334" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#475569">Bandingkan sifat seperti kekonduksian, serapan dan kekuatan</text>
    `, { main: "#8a1538", accent: "#2563eb", soft: "#f8fafc" });
  }
  return "";
}

function normalizeQuestion(question, setNo, index) {
  const options = Array.isArray(question.options) ? question.options.map(cleanText) : [];
  const answer = answerToIndex(question.answer, setNo, index);
  const q = cleanText(question.question);
  const explain = cleanText(question.explanation) ||
    `Jawapan yang betul ialah ${"ABCD"[answer]}. Pilihan ini paling tepat berdasarkan maklumat dalam soalan${question.image ? " dan rajah" : ""}.`;
  const image = cleanText(question.image);
  const directFigure = cleanText(question.fig);
  const isVectorFigure = /<svg|data:image\/svg/i.test(image) || /<svg|data:image\/svg/i.test(directFigure);
  const suppressFigure =
    (setNo === 1 && SET1_NO_FIG.has(index)) ||
    (setNo === 2 && SET2_NO_FIG.has(index));
  const set1Figure = suppressFigure ? "" : setNo === 1 ? set1PhotoFigure(index) : "";
  const set2Figure = suppressFigure ? "" : setNo === 2 ? set2PhotoFigure(index) : "";
  const set4Figure = suppressFigure ? "" : setNo === 4 ? set4PhotoFigure(index) : "";
  const autoFigure = suppressFigure ? "" : image && !isVectorFigure ? "" : directFigure && !isVectorFigure ? "" : autoScienceFigure(q, setNo, index);

  if (!q) throw new Error(`Set ${setNo} soalan ${index}: teks soalan kosong.`);
  if (options.length !== 4 || options.some((option) => !option)) {
    throw new Error(`Set ${setNo} soalan ${index}: pilihan jawapan tidak lengkap.`);
  }
  if (!Number.isInteger(answer) || answer < 0 || answer > 3) {
    throw new Error(`Set ${setNo} soalan ${index}: indeks jawapan tidak sah.`);
  }
  if (!explain) throw new Error(`Set ${setNo} soalan ${index}: penerangan kosong.`);

  return {
    sourceId: cleanText(question.id || `S${setNo}-Q${index}`),
    q,
    options,
    answer,
    category: "Sains",
    level: cleanText(question.skill) || "Sains PKSK",
    explain,
    ...(suppressFigure ? {} : set1Figure ? {
      fig: set1Figure,
    } : set2Figure ? {
      fig: set2Figure,
    } : set4Figure ? {
      fig: set4Figure,
    } : image && !isVectorFigure ? {
      fig: `<img class="science-question-image" src="${escapeAttr(image)}" alt="Rajah soalan Sains">`,
    } : directFigure && !isVectorFigure ? {
      fig: directFigure,
    } : autoFigure ? {
      fig: autoFigure,
    } : {}),
  };
}

function main() {
  const sourceSets = loadScienceSets();
  const kbatData = loadKbatSets();
  const kbatSets = kbatData.sets;
  const bankDistribution = loadAndDistributeQuestionBank();
  if (sourceSets.length !== 10) {
    throw new Error(`Jumlah set Sains sepatutnya 10, dijumpai ${sourceSets.length}.`);
  }
  if (kbatSets.length !== 10) {
    throw new Error(`Jumlah set KBAT Sains sepatutnya 10, dijumpai ${kbatSets.length}.`);
  }

  const outputSets = {};
  const seenIds = new Set();
  const seenQuestionTexts = new Set();
  const issues = [];

  for (const sourceSet of sourceSets) {
    const setNo = Number(sourceSet.set);
    if (!Number.isInteger(setNo) || setNo < 1 || setNo > 10) {
      throw new Error(`Nombor set tidak sah: ${sourceSet.set}`);
    }
    if (setNo === 1 && (!Array.isArray(sourceSet.questions) || sourceSet.questions.length !== 40)) {
      throw new Error(`Sumber Set 1 perlu ada 40 soalan, dijumpai ${sourceSet.questions?.length ?? 0}.`);
    }
    const kbatSet = kbatSets.find((set) => Number(set.set) === setNo);
    if (setNo === 1 && (!kbatSet || !Array.isArray(kbatSet.questions) || kbatSet.questions.length < 20)) {
      throw new Error("Sumber KBAT Set 1 perlu ada sekurang-kurangnya 20 soalan.");
    }

    const seenInSet = new Set();
    const mergedQuestions = setNo === 1
      ? [
        ...sourceSet.questions.slice(0, 20),
        ...kbatSet.questions.slice(0, 20),
      ]
      : bankDistribution.sets[setNo];
    outputSets[setNo] = mergedQuestions.map((question, index) => {
      const normalized = normalizeQuestion(question, setNo, index + 1);
      const questionKey = normalized.q.toLowerCase();
      if (seenInSet.has(questionKey)) issues.push(`Duplikasi dalam Set ${setNo}: ${normalized.sourceId}`);
      seenInSet.add(questionKey);
      if (seenQuestionTexts.has(questionKey)) issues.push(`Teks soalan berulang antara set: ${normalized.sourceId}`);
      seenQuestionTexts.add(questionKey);

      if (seenIds.has(normalized.sourceId)) issues.push(`Duplikasi ID: ${normalized.sourceId}`);
      seenIds.add(normalized.sourceId);
      return normalized;
    });
  }

  const total = Object.values(outputSets).reduce((sum, questions) => sum + questions.length, 0);
  if (total !== 400) throw new Error(`Jumlah soalan Sains perlu 400, dijumpai ${total}.`);
  if (seenIds.size !== 400) throw new Error(`ID unik Sains perlu 400, dijumpai ${seenIds.size}.`);
  if (seenQuestionTexts.size !== 400) throw new Error(`Teks soalan unik Sains perlu 400, dijumpai ${seenQuestionTexts.size}.`);
  if (issues.length) throw new Error(issues.join("\n"));

  const output = `// Auto-generated by scripts/generate-practice-science-sets.js\n` +
    `// Sources: Set 1 from ${sourcePath} + ${kbatSourcePath}; Set 2-10 from ${questionBankPath}.\n` +
    `(function () {\n` +
    `  const scienceSets = ${JSON.stringify(outputSets, null, 2)};\n\n` +
    `  window.PKSK_SET_QUESTIONS = window.PKSK_SET_QUESTIONS || {};\n` +
    `  Object.entries(scienceSets).forEach(([setNo, questions]) => {\n` +
    `    window.PKSK_SET_QUESTIONS[setNo] = {\n` +
    `      ...(window.PKSK_SET_QUESTIONS[setNo] || {}),\n` +
    `      sains: questions,\n` +
    `    };\n` +
    `  });\n` +
    `})();\n`;

  fs.writeFileSync(outPath, output, "utf8");
  console.log(`Generated ${path.relative(repoRoot, outPath)} with ${total} Sains questions.`);
  console.log(Object.entries(outputSets).map(([setNo, questions]) => `Set ${setNo}: ${questions.length}`).join(", "));
}

main();
