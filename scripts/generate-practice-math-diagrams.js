const fs = require("fs");
const vm = require("vm");

const sourcePath = process.argv[2];
if (!sourcePath) {
  throw new Error("Usage: node scripts/generate-practice-math-diagrams.js <source-html>");
}

function clean(value) {
  return String(value)
    .replace(/\u00d7/g, "x")
    .replace(/\u00f7/g, "/")
    .replace(/\u00b7/g, "-")
    .replace(/\u2192/g, "->")
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-");
}

const html = fs.readFileSync(sourcePath, "utf8");
const match = html.match(/const\s+patternSets\s*=\s*(\[[\s\S]*?\]);\s*let\s+currentSetIndex/);
if (!match) {
  throw new Error("Could not find patternSets data in source HTML");
}

const context = {};
vm.createContext(context);
const patternSets = vm.runInContext(match[1], context);

if (!Array.isArray(patternSets) || patternSets.length !== 10) {
  throw new Error(`Expected 10 pattern sets, got ${patternSets.length}`);
}
for (const set of patternSets) {
  if (!set.questions || set.questions.length !== 2) {
    throw new Error(`Set ${set.set} must contain exactly 2 diagram questions`);
  }
}

const output = `/* Generated from pksk_pola_nombor_10set.html: 2 diagram questions appended to each Matematik set. */
(function () {
  const patternSets = ${JSON.stringify(patternSets, null, 2)};

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function renderWheel(q) {
    const cx = 140;
    const cy = 140;
    const innerRadius = 66;
    const outerRadius = 108;
    const lineRadius = 78;

    const radialLines = q.inner.map(function (_, index) {
      const angle = (Math.PI * 2 * index) / q.inner.length - Math.PI / 2;
      const x = cx + Math.cos(angle) * lineRadius;
      const y = cy + Math.sin(angle) * lineRadius;
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(2) + '" y2="' + y.toFixed(2) + '" stroke="#6f1028" stroke-width="2" opacity=".55" />';
    }).join("");

    const innerTexts = q.inner.map(function (value, index) {
      const angle = (Math.PI * 2 * index) / q.inner.length - Math.PI / 2;
      const x = cx + Math.cos(angle) * innerRadius;
      const y = cy + Math.sin(angle) * innerRadius;
      return '<text x="' + x.toFixed(2) + '" y="' + (y + 7).toFixed(2) + '" text-anchor="middle" font-size="21" font-weight="900" fill="#1f2937">' + esc(value) + '</text>';
    }).join("");

    const outerBubbles = q.outer.map(function (value, index) {
      const angle = (Math.PI * 2 * index) / q.outer.length - Math.PI / 2;
      const x = cx + Math.cos(angle) * outerRadius;
      const y = cy + Math.sin(angle) * outerRadius;
      const missing = String(value) === "?";
      return '<g>' +
        '<circle cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r="22" fill="' + (missing ? "#6f1028" : "#fff8ec") + '" stroke="#d8b45f" stroke-width="2.5" />' +
        '<text x="' + x.toFixed(2) + '" y="' + (y + 7).toFixed(2) + '" text-anchor="middle" font-size="19" font-weight="950" fill="' + (missing ? "#fff" : "#6f1028") + '">' + esc(value) + '</text>' +
      '</g>';
    }).join("");

    return '<div class="math-diagram-area">' +
      '<svg class="math-wheel-shell" width="280" height="280" viewBox="0 0 280 280" role="img" aria-label="Roda nombor">' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="82" fill="#fff" stroke="#6f1028" stroke-width="3" />' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="18" fill="#fff8ec" stroke="#d8b45f" stroke-width="2" />' +
        radialLines + innerTexts + outerBubbles +
      '</svg>' +
    '</div>';
  }

  function renderDiscShape(disc, index) {
    const bottomIsMissing = String(disc.bottom) === "?";
    return '<svg class="math-disc-shell" width="125" height="125" viewBox="0 0 120 120" role="img" aria-label="Bulatan operasi ' + (index + 1) + '">' +
      '<circle cx="60" cy="60" r="52" fill="#fff" stroke="#6f1028" stroke-width="3" />' +
      '<path d="M60 60 L25 20" stroke="#6f1028" stroke-width="2.2" opacity=".65" />' +
      '<path d="M60 60 L95 20" stroke="#6f1028" stroke-width="2.2" opacity=".65" />' +
      '<path d="M60 60 L25 100" stroke="#6f1028" stroke-width="2.2" opacity=".65" />' +
      '<path d="M60 60 L95 100" stroke="#6f1028" stroke-width="2.2" opacity=".65" />' +
      '<text x="60" y="32" text-anchor="middle" font-size="21" font-weight="950" fill="#1f2937">' + esc(disc.top) + '</text>' +
      '<text x="35" y="66" text-anchor="middle" font-size="21" font-weight="950" fill="#1f2937">' + esc(disc.left) + '</text>' +
      '<text x="85" y="66" text-anchor="middle" font-size="21" font-weight="950" fill="#1f2937">' + esc(disc.right) + '</text>' +
      '<circle cx="60" cy="92" r="19" fill="' + (bottomIsMissing ? "#6f1028" : "#fff8ec") + '" stroke="#d8b45f" stroke-width="2" />' +
      '<text x="60" y="99" text-anchor="middle" font-size="21" font-weight="950" fill="' + (bottomIsMissing ? "#fff" : "#6f1028") + '">' + esc(disc.bottom) + '</text>' +
    '</svg>';
  }

  function renderDisc(q) {
    return '<div class="math-diagram-area"><div class="math-mini-diagrams">' + q.discs.map(renderDiscShape).join("") + '</div></div>';
  }

  function toQuestion(q, setNo, index) {
    const answer = q.options.findIndex(function (option) { return Number(option) === Number(q.answer); });
    if (answer < 0) throw new Error("Missing answer option for set " + setNo + " question " + q.no);
    return {
      sourceId: "MD" + String(setNo).padStart(2, "0") + "-" + String(index + 1).padStart(2, "0"),
      q: esc(q.text),
      options: q.options.map(function (option) { return String(option); }),
      answer: answer,
      category: "Pola nombor berajah",
      level: "KBAT",
      fig: q.type === "wheel" ? renderWheel(q) : renderDisc(q),
      explain: esc(q.explanation)
    };
  }

  window.PKSK_SET_QUESTIONS = window.PKSK_SET_QUESTIONS || {};
  patternSets.forEach(function (set) {
    const setNo = String(set.set);
    const current = window.PKSK_SET_QUESTIONS[setNo] || {};
    const existing = current.matematik || [];
    const additions = set.questions.map(function (question, index) {
      return toQuestion(question, set.set, index);
    });
    window.PKSK_SET_QUESTIONS[setNo] = {
      ...current,
      matematik: existing.concat(additions)
    };
  });
})();
`;

fs.writeFileSync("js/practice-math-diagram-sets.js", output, "utf8");
console.log("Generated 20 diagram questions into js/practice-math-diagram-sets.js");
