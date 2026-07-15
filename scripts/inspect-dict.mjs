import fs from "fs";
const t = fs.readFileSync("src/lib/i18n/dictionaries.ts", "utf8");
const idx = t.indexOf("const fr");
console.log(JSON.stringify(t.slice(idx, idx + 350)));
const matches = [...t.matchAll(/settings:\s*"([^"]+)"/g)].map((m) => m[1]);
console.log("settings values:", matches);
console.log("has as const", t.includes("as const"));
console.log("has mojibake marker", t.includes("Ã"));
