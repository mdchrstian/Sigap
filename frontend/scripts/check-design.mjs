#!/usr/bin/env node
// Design guard: fails on values banned by DESIGN.md. Usage: node scripts/check-design.mjs [paths...]
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";

const roots = process.argv.slice(2);
if (roots.length === 0) roots.push("src");

const EXT = new Set([".ts", ".tsx", ".css"]);
const SKIP_FILES = new Set(["src/lib/status.ts", "src/index.css"]);
const norm = (p) => p.split("\\").join("/").replace(/^\.\//, "");

function* walk(p) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const f of readdirSync(p)) {
      if (f === "node_modules") continue;
      yield* walk(join(p, f));
    }
  } else yield p;
}

const SP = "(?:p|m|gap|space|inset|top|left|right|bottom)(?:[xytblrse]|-x|-y)?";
const BAD_STEP = "(?:5|7|9|10|11|14|20)";
const rules = [
  { name: "arbitrary [#..] class", re: /\[#/ },
  { name: "6-digit hex", re: /#[0-9a-fA-F]{6}\b/, exts: [".tsx"] },
  { name: "gradient", re: /gradient/ },
  { name: "backdrop-blur", re: /backdrop-blur/ },
  { name: "glow shadow", re: /shadow-\[0_0/ },
  { name: "arbitrary text-[", re: /text-\[/ },
  { name: "banned spacing step", re: new RegExp(`(?:^|[\\s"'\`:])-?${SP}-${BAD_STEP}(?![\\d.])`) },
  { name: "arbitrary px spacing", re: new RegExp(`(?:^|[\\s"'\`:])-?${SP}-\\[[^\\]]*px\\]`) },
  { name: "emoji", re: /\p{Extended_Pictographic}/u },
];

let failed = 0;
for (const root of roots) {
  for (const file of walk(root)) {
    const f = norm(file);
    if (!EXT.has(extname(f))) continue;
    if (/\.test\./.test(basename(f))) continue;
    if (SKIP_FILES.has(f) || [...SKIP_FILES].some((s) => f.endsWith("/" + s))) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const r of rules) {
        if (r.exts && !r.exts.includes(extname(f))) continue;
        if (r.re.test(line)) {
          console.log(`${f}:${i + 1}: ${r.name}: ${line.trim()}`);
          failed++;
        }
      }
    });
  }
}
if (failed) {
  console.log(`\n${failed} design violation(s)`);
  process.exit(1);
}
console.log("check:design OK");
