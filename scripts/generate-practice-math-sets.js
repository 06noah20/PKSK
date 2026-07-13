const fs = require("fs");

const sourcePath = process.argv[2];
if (!sourcePath) {
  throw new Error("Usage: node scripts/generate-practice-math-sets.js <source-file>");
}

function fixText(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (!/[ÃÂâ]/.test(text)) return text;
  try {
    return Buffer.from(text, "latin1").toString("utf8");
  } catch (error) {
    return text;
  }
}

function choiceArray(pilihan) {
  return ["A", "B", "C", "D"].map((key) => fixText(pilihan[key]));
}

function answerIndex(jawapan) {
  return { A: 0, B: 1, C: 2, D: 3 }[String(jawapan).trim().toUpperCase()];
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function numberText(value) {
  return esc(String(value).replace(/\.0+$/, ""));
}

function fractionFromQuestion(q) {
  const match = q.match(/(\d+)\s*\/\s*(\d+)/);
  return match ? [Number(match[1]), Number(match[2])] : null;
}

function mathFigureShell(inner) {
  return `<div class="math-diagram-area">${inner}</div>`;
}

function shadedFigure(item) {
  const fraction = fractionFromQuestion(item.q);
  if (!fraction) return "";
  const [num, den] = fraction;
  const cols = den === 10 ? 5 : den;
  const rows = Math.ceil(den / cols);
  const cell = 44;
  const gap = 4;
  const width = cols * cell + (cols - 1) * gap + 32;
  const height = rows * cell + (rows - 1) * gap + 58;
  const cells = Array.from({ length: den }, (_, i) => {
    const x = 16 + (i % cols) * (cell + gap);
    const y = 18 + Math.floor(i / cols) * (cell + gap);
    const fill = i < num ? "#8a1538" : "#fff8ec";
    return `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="8" fill="${fill}" stroke="#d8b45f" stroke-width="2" />`;
  }).join("");
  return mathFigureShell(`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Rajah kawasan berlorek">
    ${cells}
    <text x="${width / 2}" y="${height - 16}" text-anchor="middle" font-size="15" font-weight="800" fill="#6f1028">${num}/${den} kawasan berlorek</text>
  </svg>`);
}

function areaFigure(item) {
  const dims = item.q.match(/(\d+)\s*cm\s*x\s*(\d+)\s*cm/i);
  const fraction = fractionFromQuestion(item.q);
  if (!dims || !fraction) return "";
  const length = dims[1];
  const width = dims[2];
  const [num, den] = fraction;
  return mathFigureShell(`<svg width="430" height="210" viewBox="0 0 430 210" role="img" aria-label="Rajah segi empat tepat dan segi tiga">
    <rect x="40" y="55" width="210" height="105" rx="8" fill="#fff8ec" stroke="#6f1028" stroke-width="3" />
    <polygon points="250,55 365,160 250,160" fill="#f8e6ee" stroke="#6f1028" stroke-width="3" />
    <text x="145" y="112" text-anchor="middle" font-size="18" font-weight="900" fill="#1f2937">Segi empat tepat</text>
    <text x="145" y="138" text-anchor="middle" font-size="16" font-weight="800" fill="#6f1028">${length} cm x ${width} cm</text>
    <text x="300" y="134" text-anchor="middle" font-size="15" font-weight="800" fill="#6f1028">Segi tiga</text>
    <text x="300" y="154" text-anchor="middle" font-size="14" font-weight="800" fill="#1f2937">${num}/${den} luas segi empat</text>
  </svg>`);
}

function massFigure(item) {
  const values = [...item.q.matchAll(/(\d+\.\d+)\s*kg/g)].map((match) => match[1]);
  if (values.length < 2) return "";
  return mathFigureShell(`<svg width="430" height="190" viewBox="0 0 430 190" role="img" aria-label="Rajah dua jisim">
    <rect x="55" y="58" width="120" height="80" rx="18" fill="#fff8ec" stroke="#6f1028" stroke-width="3" />
    <rect x="255" y="58" width="120" height="80" rx="18" fill="#fff8ec" stroke="#6f1028" stroke-width="3" />
    <path d="M95 58 Q115 18 135 58" fill="none" stroke="#d8b45f" stroke-width="5" stroke-linecap="round" />
    <path d="M295 58 Q315 18 335 58" fill="none" stroke="#d8b45f" stroke-width="5" stroke-linecap="round" />
    <text x="115" y="106" text-anchor="middle" font-size="22" font-weight="950" fill="#6f1028">${values[0]} kg</text>
    <text x="315" y="106" text-anchor="middle" font-size="22" font-weight="950" fill="#6f1028">${values[1]} kg</text>
    <text x="215" y="108" text-anchor="middle" font-size="28" font-weight="950" fill="#1f2937">-</text>
  </svg>`);
}

function wheelFigure(item) {
  const match = item.explain.match(/Jadi\s+(\d+)\s*\+\s*(\d+)\s*=\s*(\d+)/i);
  if (!match) return "";
  const a = match[1];
  const b = match[2];
  const ans = match[3];
  return mathFigureShell(`<svg width="300" height="250" viewBox="0 0 300 250" role="img" aria-label="Rajah roda nombor">
    <circle cx="150" cy="125" r="70" fill="#fff" stroke="#6f1028" stroke-width="3" />
    <line x1="150" y1="125" x2="94" y2="82" stroke="#6f1028" stroke-width="2" opacity=".55" />
    <line x1="150" y1="125" x2="206" y2="82" stroke="#6f1028" stroke-width="2" opacity=".55" />
    <line x1="150" y1="125" x2="150" y2="195" stroke="#6f1028" stroke-width="2" opacity=".55" />
    <circle cx="94" cy="82" r="25" fill="#fff8ec" stroke="#d8b45f" stroke-width="2" />
    <circle cx="206" cy="82" r="25" fill="#fff8ec" stroke="#d8b45f" stroke-width="2" />
    <circle cx="150" cy="35" r="26" fill="#6f1028" stroke="#d8b45f" stroke-width="2" />
    <text x="94" y="89" text-anchor="middle" font-size="21" font-weight="950" fill="#1f2937">${a}</text>
    <text x="206" y="89" text-anchor="middle" font-size="21" font-weight="950" fill="#1f2937">${b}</text>
    <text x="150" y="43" text-anchor="middle" font-size="21" font-weight="950" fill="#fff">?</text>
    <text x="150" y="228" text-anchor="middle" font-size="15" font-weight="850" fill="#6f1028">Nombor luar = ${a} + ${b} = ${ans}</text>
  </svg>`);
}

function discFigure(item) {
  const normalized = item.explain
    .replace(/[()]/g, " ")
    .replace(/×/g, "x")
    .replace(/−/g, "-");
  const match = normalized.match(/Jadi\s+(.+?)\s*=\s*(\d+(?:\.\d+)?)/i);
  if (!match) return "";
  const numbers = [...match[1].matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]);
  if (numbers.length < 3) return "";
  const [top, left, right] = numbers;
  return mathFigureShell(`<svg width="260" height="190" viewBox="0 0 260 190" role="img" aria-label="Rajah bulatan operasi">
    <circle cx="130" cy="88" r="64" fill="#fff" stroke="#6f1028" stroke-width="3" />
    <path d="M130 88 L86 38" stroke="#6f1028" stroke-width="2.2" opacity=".65" />
    <path d="M130 88 L174 38" stroke="#6f1028" stroke-width="2.2" opacity=".65" />
    <path d="M130 88 L86 138" stroke="#6f1028" stroke-width="2.2" opacity=".65" />
    <path d="M130 88 L174 138" stroke="#6f1028" stroke-width="2.2" opacity=".65" />
    <text x="130" y="49" text-anchor="middle" font-size="23" font-weight="950" fill="#1f2937">${numberText(top)}</text>
    <text x="93" y="96" text-anchor="middle" font-size="23" font-weight="950" fill="#1f2937">${numberText(left)}</text>
    <text x="167" y="96" text-anchor="middle" font-size="23" font-weight="950" fill="#1f2937">${numberText(right)}</text>
    <circle cx="130" cy="135" r="23" fill="#6f1028" stroke="#d8b45f" stroke-width="2" />
    <text x="130" y="143" text-anchor="middle" font-size="23" font-weight="950" fill="#fff">?</text>
  </svg>`);
}

function buildFigure(item) {
  if (/Diberi kawasan berlorek/i.test(item.q)) return shadedFigure(item);
  if (/segi empat tepat dan sebuah segi tiga/i.test(item.q)) return areaFigure(item);
  if (/Rajah menunjukkan dua jisim/i.test(item.q)) return massFigure(item);
  if (/Rajah menunjukkan satu roda nombor/i.test(item.q)) return wheelFigure(item);
  if (/Perhatikan pola dalam setiap bulatan/i.test(item.q)) return discFigure(item);
  return "";
}

let seed = 20260710;
function rand() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

function shuffle(items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function questionKey(item) {
  return item.q.trim().toLowerCase();
}

function distribute(items, sets, quotaPerSet, targetKey) {
  const counts = new Map(Object.keys(sets).map((setNo) => [setNo, 0]));
  const shuffled = shuffle(items);

  for (const item of shuffled) {
    const key = questionKey(item);
    const candidates = Object.keys(sets)
      .filter((setNo) => counts.get(setNo) < quotaPerSet)
      .filter((setNo) => !sets[setNo].some((existing) => questionKey(existing) === key))
      .sort((a, b) => counts.get(a) - counts.get(b) || Number(a) - Number(b));

    const fallback = Object.keys(sets)
      .filter((setNo) => counts.get(setNo) < quotaPerSet)
      .sort((a, b) => counts.get(a) - counts.get(b) || Number(a) - Number(b));

    const setNo = candidates[0] || fallback[0];
    if (!setNo) {
      throw new Error(`Unable to distribute ${targetKey} question: ${item.q}`);
    }
    sets[setNo].push(item);
    counts.set(setNo, counts.get(setNo) + 1);
  }

  for (const [setNo, count] of counts.entries()) {
    if (count !== quotaPerSet) {
      throw new Error(`Set ${setNo} expected ${quotaPerSet} ${targetKey} questions, got ${count}`);
    }
  }
}

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
if (source.length !== 300) {
  throw new Error(`Expected 300 math questions, got ${source.length}`);
}

const questions = source.map((item, index) => {
  const q = fixText(item.soalan);
  const category = fixText(item.topik);
  const answer = answerIndex(item.jawapan);
  if (answer === undefined) {
    throw new Error(`Invalid answer at row ${index + 1}: ${item.jawapan}`);
  }
  return {
    sourceId: `M${String(index + 1).padStart(3, "0")}`,
    q,
    options: choiceArray(item.pilihan),
    answer,
    category,
    level: fixText(item.aras),
    explain: fixText(item.catatan_jawapan || item.jawapan_teks || "")
  };
});

questions.forEach((item) => {
  const fig = buildFigure(item);
  if (fig) item.fig = fig;
});

function needsMissingDiagram(item) {
  const text = `${item.category} ${item.q}`;
  return /carta pai/i.test(text) || /rajah nombor/i.test(item.q);
}

const filteredQuestions = questions.filter((item) => !needsMissingDiagram(item));
const removedQuestions = questions.filter(needsMissingDiagram);
if (removedQuestions.length !== 30 || filteredQuestions.length !== 270) {
  throw new Error(`Expected to remove 30 missing-diagram questions, removed ${removedQuestions.length}`);
}

const exactRows = new Set(questions.map((item) => JSON.stringify({
  q: item.q,
  options: item.options,
  answer: item.answer
})));
if (exactRows.size !== questions.length) {
  console.warn(`Source contains ${questions.length - exactRows.size} exact duplicate record(s). They are preserved because the request uses all 300 records.`);
}

const pola = filteredQuestions.filter((item) => /pola/i.test(`${item.category} ${item.q}`));
const nonPola = filteredQuestions.filter((item) => !/pola/i.test(`${item.category} ${item.q}`));
if (pola.length !== 10 || nonPola.length !== 260) {
  throw new Error(`Expected 10 usable pola and 260 non-pola questions after filtering, got ${pola.length} pola and ${nonPola.length} non-pola`);
}

const sets = {};
for (let setNo = 1; setNo <= 10; setNo++) {
  sets[setNo] = [];
}

distribute(pola, sets, 1, "pola");
distribute(nonPola, sets, 26, "non-pola");

for (const setNo of Object.keys(sets)) {
  sets[setNo] = shuffle(sets[setNo]);
  const uniqueInSet = new Set(sets[setNo].map(questionKey));
  if (sets[setNo].length !== 27 || uniqueInSet.size !== 27) {
    throw new Error(`Set ${setNo} has duplicate text or wrong count`);
  }
}

const output = `/* Generated from attached Matematik bank: missing-diagram questions removed, remaining records distributed into Set 1-10. */
(function () {
  const setQuestions = ${JSON.stringify(sets, null, 2)};

  window.PKSK_SET_QUESTIONS = window.PKSK_SET_QUESTIONS || {};
  Object.entries(setQuestions).forEach(([setNo, questions]) => {
    window.PKSK_SET_QUESTIONS[setNo] = {
      ...(window.PKSK_SET_QUESTIONS[setNo] || {}),
      matematik: questions
    };
  });
})();
`;

fs.writeFileSync("js/practice-math-sets.js", output, "utf8");

const total = Object.values(sets).reduce((sum, set) => sum + set.length, 0);
console.log(`Generated ${total} math questions into sets 1-10.`);
console.log("Removed 30 missing-diagram questions: carta pai and rajah nombor.");
console.log("Each set contains 27 bank questions; diagram add-on file appends 2 visual questions per set.");
