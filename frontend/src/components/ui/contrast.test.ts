import { STATUS_MAP } from "../../lib/status";

// No @types/node in this project: load fs dynamically (tests run with cwd = frontend/).
declare const process: { cwd(): string };
const fsName: string = "node:fs";
const { readFileSync } = (await import(/* @vite-ignore */ fsName)) as {
  readFileSync(p: string, enc: string): string;
};
const css = readFileSync(`${process.cwd()}/src/index.css`, "utf8");

const tokens: Record<string, string> = {};
for (const m of css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) tokens[m[1]] = m[2];

function lum(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a: string, b: string) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
const t = (n: string) => (n === "white" ? "#ffffff" : tokens[n]);

const pairs: [string, string, number][] = [
  ["ink", "surface", 7],
  ["ink", "ground", 7],
  ["muted", "ground", 7],
  ["white", "rambu", 4.5],
  ["white", "info", 4.5],
  ["white", "aspal", 4.5],
  ["white", "danger", 4.5],
  ["ink", "marka", 4.5],
];

it("parses tokens", () => {
  expect(tokens.ink).toBeDefined();
  expect(tokens.rambu).toBeDefined();
});

it.each(pairs)("%s on %s >= %d", (fg, bg, min) => {
  expect(ratio(t(fg), t(bg))).toBeGreaterThanOrEqual(min);
});

it.each(Object.entries(STATUS_MAP))("status %s fg/bg >= 4.5", (_k, s) => {
  expect(ratio(s.fg, s.bg)).toBeGreaterThanOrEqual(4.5);
});
