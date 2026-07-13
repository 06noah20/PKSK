const fs = require("fs");
const vm = require("vm");

const sourcePath = process.argv[2];
if (!sourcePath) {
  throw new Error("Usage: node scripts/generate-practice-general-sets.js <source-file>");
}

const source = fs.readFileSync(sourcePath, "utf8");
const context = {};
vm.createContext(context);
const parsed = JSON.parse(vm.runInContext(`${source}\nJSON.stringify(semuaSoalan);`, context));

const seen = new Set();
const duplicates = parsed.filter((item) => {
  const key = item.soalan.trim().toLowerCase();
  if (seen.has(key)) return true;
  seen.add(key);
  return false;
});

if (parsed.length !== 240) {
  throw new Error(`Expected 240 questions, got ${parsed.length}`);
}
if (duplicates.length) {
  throw new Error(`Duplicate questions found: ${duplicates.slice(0, 3).map((item) => item.soalan).join(" | ")}`);
}

let seed = 20260710;
function rand() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

const shuffled = parsed.slice();
for (let i = shuffled.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
}

const sets = {};
for (let setNo = 3; setNo <= 10; setNo++) {
  const slice = shuffled.slice((setNo - 3) * 30, (setNo - 2) * 30);
  sets[setNo] = slice.map((item) => ({
    q: item.soalan,
    options: item.pilihan,
    answer: item.jawapan,
    category: item.tema,
    explain: item.penjelasan
  }));
}

const output = `/* Generated from attached Pengetahuan Am bank: 240 unique questions, shuffled into Set 3-10. */
(function () {
  const setQuestions = ${JSON.stringify(sets, null, 2)};

  window.PKSK_SET_QUESTIONS = window.PKSK_SET_QUESTIONS || {};
  Object.entries(setQuestions).forEach(([setNo, questions]) => {
    window.PKSK_SET_QUESTIONS[setNo] = {
      ...(window.PKSK_SET_QUESTIONS[setNo] || {}),
      pengetahuan: questions
    };
  });
})();
`;

fs.writeFileSync("js/practice-general-sets.js", output, "utf8");

const total = Object.values(sets).reduce((sum, questions) => sum + questions.length, 0);
console.log(`Generated ${total} questions into sets 3-10.`);
