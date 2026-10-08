#!/usr/bin/env node
// How a topic does across the competitor catalogues, before anyone scripts it.
// usage: node topic-demand.mjs "<title regex>" ["<title regex>" ...]

// Per pattern: matching titles, median breakout (1.0 is the channel's median), the share
// at 2x or more, and our own catalogue on the same pattern.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// The catalogues folder: COMPETITOR_INTEL_DATA, or `topic-demand.internal.json` beside this file, which stays out of the public copy.
const local = new URL("topic-demand.internal.json", import.meta.url);
const internal = fs.existsSync(local) ? JSON.parse(fs.readFileSync(local, "utf8")) : {};
const configured = process.env.COMPETITOR_INTEL_DATA ?? internal.data ?? null;
if (!configured) {
  console.error("Set COMPETITOR_INTEL_DATA to the folder holding <source>/catalogue.json.");
  process.exit(1);
}
const DATA = configured.replace(/^~(?=\/)/, os.homedir());
const OWN = process.env.OWN_CATALOGUE ?? internal.own ?? "";
const patterns = process.argv.slice(2);
if (patterns.length === 0) {
  console.error('usage: node topic-demand.mjs "<title regex>" ...');
  process.exit(1);
}

const theirs = [];
const ours = [];
for (const src of fs.readdirSync(DATA)) {
  const file = path.join(DATA, src, "catalogue.json");
  if (!fs.existsSync(file)) continue;
  for (const v of JSON.parse(fs.readFileSync(file, "utf8")).videos ?? []) {
    if (typeof v.breakout !== "number") continue;
    (src === OWN ? ours : theirs).push({ title: (v.title ?? "").toLowerCase(), b: v.breakout });
  }
}

const median = (xs) => {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};
const fmt = (x) => (x === null ? "  -  " : x.toFixed(2).padStart(5));

console.log(
  `${theirs.length} competitor videos, ${ours.length} of ours. Weak: median under 1 on 8 or more matches.\n`,
);
for (const p of patterns) {
  const re = new RegExp(p, "i");
  const m = theirs.filter((v) => re.test(v.title)).map((v) => v.b);
  const o = ours.filter((v) => re.test(v.title)).map((v) => v.b);
  const hit = m.length ? Math.round((100 * m.filter((b) => b >= 2).length) / m.length) : 0;
  const verdict = m.length < 8 ? "thin data, judge it" : median(m) < 1 ? "weak" : "ok";
  console.log(
    `${p.padEnd(40)} n=${String(m.length).padStart(4)} median=${fmt(median(m))} 2x+=${String(hit).padStart(3)}%  ours n=${o.length} median=${fmt(median(o))}  ${verdict}`,
  );
}
