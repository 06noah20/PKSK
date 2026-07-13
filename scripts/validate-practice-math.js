global.window = global;

require("../js/practice-math-sets.js");
require("../js/practice-math-diagram-sets.js");

const rows = [];
let bad = 0;
let missingVisual = 0;

for (let setNo = 1; setNo <= 10; setNo++) {
  const questions = window.PKSK_SET_QUESTIONS[setNo].matematik;
  const diagrams = questions.filter((item) => item.fig).length;
  const missingDiagram = questions.filter((item) =>
    !(item.sourceId || "").startsWith("MD") && /carta pai|rajah nombor/i.test(item.q)
  ).length;
  const visualWithoutFig = questions.filter((item) =>
    /rajah|berlorek|pola|bulatan/i.test(`${item.q} ${item.category || ""}`) && !item.fig
  ).length;
  rows.push([setNo, questions.length, diagrams, missingDiagram, visualWithoutFig]);
  bad += missingDiagram;
  missingVisual += visualWithoutFig;
}

console.log(JSON.stringify(rows));
console.log(`bad=${bad}`);
console.log(`missingVisual=${missingVisual}`);

if (rows.some((row) => row[1] !== 29 || row[2] < 2 || row[3] !== 0 || row[4] !== 0)) {
  process.exit(1);
}
