const fs = require("fs");

const file = process.argv[2];
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const unique = new Set(data.map((item) => item.soalan.trim().toLowerCase()));
const pola = data.filter((item) => /pola/i.test([item.topik, item.soalan, item.aras].join(" ")));
const topics = [...new Set(data.map((item) => item.topik))];

console.log(`total=${data.length}`);
console.log(`unique=${unique.size}`);
console.log(`pola=${pola.length}`);
console.log(`topics=${topics.join(" | ")}`);
console.log(`pola_sample=${pola.slice(0, 5).map((item) => `${item.set}-${item.no}:${item.topik}`).join(" | ")}`);
