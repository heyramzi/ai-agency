// BATCH workload rebalance harness.
//
// Reads a fetched task list, computes a balanced plan (assignee + points + batch
// + dates) with a per-person weekly capacity cap, prints a person x batch table
// on a dry run, and applies on APPLY=1.
//
// Setup:
//   1. Edit LISTS, TEAM, the field/option IDs, and CAP below for the target space.
//      Discover field + option IDs with: GET /api/v2/list/{id}/field
//   2. Fetch tasks into TASKS_FILE first (id, name, status, statusType, priority,
//      assignees:[id], list). See the fetch snippet in the skill, or adapt.
//   3. Dry run:  node rebalance.mjs
//   4. Apply:    APPLY=1 node rebalance.mjs
//
// Auth: reads the highest-priority token from ~/.config/clickup/config.json.

import https from "https";
import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const cfg = require(process.env.HOME + "/.config/clickup/config.json");
const TOK = cfg.tokens.sort((a, b) => a.priority - b.priority)[0].token;
const DRY = process.env.APPLY !== "1";
const TASKS_FILE = process.env.TASKS_FILE || "/tmp/tasks.json";

// ---- CONFIGURE PER WORKSPACE ----
const LISTS = []; // not used at apply time; tasks come from TASKS_FILE
const TEAM = { Owner: 0, Editor1: 0, Editor2: 0, Producer: 0 }; // names to ClickUp user ids, from `cu members --json`
const REVIEWER = "Owner"; // gets review-status tasks
const PRODUCER = "Producer"; // gets planning tasks
const EDITORS = ["Editor1", "Editor2", "Producer"]; // production pool, least-loaded greedy
const CAP = 15; // points per person per week

const F_BATCH = "0d09cb09-69ac-4aef-b901-589b2c53e643";
const F_POINTS = "e006202b-a557-4a31-b167-9bdbc9e958b9";
const BATCH = {
  Previous: "9128ede9-d609-499d-b7ab-2f0bdcd3667d",
  ThisWeek: "2d72ab5f-4c11-4da7-bfe7-d433f8af5739",
  NextWeek: "daa0658c-d1d1-4dad-a659-a807725a7ca0",
  Later: "f0b4e442-679f-43b9-a2a2-448eb39ceb95",
  Backlog: "56b19dfa-6896-4ce8-895f-3a40c7abfd42", // "Someday" or "Maybe"
};
const POINTOPT = {
  1: "0a7c7635-b4d0-4cc6-bf29-c350b1fbf29a",
  2: "12965e5b-7c9f-4cc5-8088-3cd66edbfe37",
  3: "6601a828-e0c0-452e-b8da-5675353b4111",
};

// Week dates. Set these to the current Monday/Friday before running.
const U = (y, m, d) => Date.UTC(y, m - 1, d, 12, 0, 0);
const DATES = {
  ThisWeek: { start: U(2026, 6, 15), due: U(2026, 6, 19) },
  NextWeek: { start: U(2026, 6, 22), due: U(2026, 6, 26) },
  Later: { start: U(2026, 6, 29), due: U(2026, 7, 10) },
  Backlog: { start: null, due: null },
};
// ---------------------------------

const REAL = new Set(Object.values(TEAM));
const PRIO = { urgent: 4, high: 3, normal: 2, low: 1, null: 2, undefined: 2 };

function api(method, path, body) {
  return new Promise((res, rej) => {
    const data = body ? JSON.stringify(body) : null;
    const r = https.request(
      "https://api.clickup.com/api/v2" + path,
      { method, headers: { Authorization: TOK, "Content-Type": "application/json" } },
      (rsp) => {
        let d = "";
        rsp.on("data", (x) => (d += x));
        rsp.on("end", () => {
          try {
            res({ status: rsp.statusCode, body: JSON.parse(d) });
          } catch {
            res({ status: rsp.statusCode, raw: d });
          }
        });
      },
    );
    r.on("error", rej);
    if (data) r.write(data);
    r.end();
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function call(method, path, body) {
  for (let a = 0; a < 5; a++) {
    const r = await api(method, path, body);
    if (r.status === 429) {
      await sleep(2000 * (a + 1));
      continue;
    }
    return r;
  }
  return { status: "failretry" };
}

// WHY: effort heuristic from the task name, keeps a realistic 1/2/3 spread.
function pointsFor(name) {
  const n = name.toLowerCase();
  if (/keynote|conference|annual|highlight reel|year in review|documentary|developer day|\brecap\b|campaign|full edit/.test(n)) return 3;
  if (/review|^plan |\bscript\b|gather|finalize|export|\bclip\b|teaser|\bintro\b|\bcut\b|behind the scenes|q&a|social media|onboarding/.test(n)) return 1;
  return 2;
}

const tasks = JSON.parse(fs.readFileSync(TASKS_FILE, "utf8"));
const load = Object.fromEntries(Object.keys(TEAM).map((k) => [k, 0]));
const plan = [];

for (const t of tasks) {
  const pts = pointsFor(t.name);
  const st = (t.status || "").toLowerCase();
  const stype = t.statusType;
  if (stype === "closed" || st === "closed") {
    plan.push({ ...t, pts, assignee: null, batch: "Previous" });
    continue;
  }
  let assignee, flow;
  if (/review/.test(st)) {
    assignee = REVIEWER;
    flow = "review";
  } else if (st === "in progress") {
    const cur = (t.assignees || []).find((a) => REAL.has(a));
    assignee = cur ? Object.keys(TEAM).find((k) => TEAM[k] === cur) : EDITORS.reduce((a, b) => (load[a] <= load[b] ? a : b));
    flow = "prog";
  } else if (/^plan |\bscript\b|gather|storyboard|brief/.test(t.name.toLowerCase())) {
    assignee = PRODUCER;
    flow = "open";
  } else {
    assignee = EDITORS.reduce((a, b) => (load[a] <= load[b] ? a : b));
    flow = "open";
  }
  load[assignee] += pts;
  plan.push({ ...t, pts, assignee, flow, batch: null });
}

// Pack each person into batches with the weekly cap. WIP stays in This Week.
const rank = (p) => (p.flow === "prog" ? 0 : p.flow === "review" ? 1 : 2);
for (const person of Object.keys(TEAM)) {
  const arr = plan.filter((p) => p.assignee === person);
  arr.sort((a, b) => rank(a) - rank(b) || PRIO[b.priority] - PRIO[a.priority] || b.pts - a.pts);
  let tw = 0, nw = 0, la = 0;
  for (const p of arr) {
    if (p.flow === "prog") {
      p.batch = "ThisWeek";
      tw += p.pts;
    } else if (tw + p.pts <= CAP) {
      p.batch = "ThisWeek";
      tw += p.pts;
    } else if (nw + p.pts <= CAP) {
      p.batch = "NextWeek";
      nw += p.pts;
    } else if (la + p.pts <= CAP * 2) {
      p.batch = "Later";
      la += p.pts;
    } else {
      p.batch = "Backlog";
    }
  }
}

// Print the workload table.
const batches = ["ThisWeek", "NextWeek", "Later", "Backlog", "Previous"];
const grid = {};
for (const p of plan) {
  const a = p.assignee || "(closed)";
  grid[a] = grid[a] || {};
  grid[a][p.batch] = grid[a][p.batch] || { n: 0, pts: 0 };
  grid[a][p.batch].n++;
  grid[a][p.batch].pts += p.pts;
}
console.log("\n=== WORKLOAD PLAN (count / points) ===");
console.log(["Person".padEnd(10), ...batches.map((b) => b.padEnd(13))].join(""));
for (const a of [...Object.keys(TEAM), "(closed)"]) {
  if (!grid[a]) continue;
  const row = [a.padEnd(10)];
  for (const b of batches) {
    const g = grid[a][b];
    row.push((g ? `${g.n}t/${g.pts}p` : "-").padEnd(13));
  }
  console.log(row.join(""));
}
console.log("\nactive:", plan.filter((p) => p.batch !== "Previous").length, "| closed->Previous:", plan.filter((p) => p.batch === "Previous").length, "| DRY:", DRY);

if (!DRY) {
  let ok = 0, fail = 0, i = 0;
  for (const p of plan) {
    i++;
    const errs = [];
    let r = await call("POST", `/task/${p.id}/field/${F_BATCH}`, { value: BATCH[p.batch] });
    if (r.status < 200 || r.status >= 300) errs.push("batch:" + r.status);
    await sleep(120);
    if (p.batch !== "Previous") {
      r = await call("POST", `/task/${p.id}/field/${F_POINTS}`, { value: POINTOPT[p.pts] });
      if (r.status < 200 || r.status >= 300) errs.push("pts:" + r.status);
      await sleep(120);
      const d = DATES[p.batch];
      const tid = TEAM[p.assignee];
      const rem = (p.assignees || []).filter((a) => a !== tid);
      r = await call("PUT", `/task/${p.id}`, {
        assignees: { add: [tid], rem },
        start_date: d.start,
        start_date_time: false,
        due_date: d.due,
        due_date_time: false,
      });
      if (r.status < 200 || r.status >= 300) errs.push("upd:" + r.status);
      await sleep(120);
    }
    if (errs.length) {
      fail++;
      console.log("FAIL", p.id, (p.name || "").slice(0, 40), errs.join(","));
    } else ok++;
    if (i % 20 === 0) console.log(`...${i}/${plan.length} ok=${ok} fail=${fail}`);
  }
  console.log(`\nDONE ok=${ok} fail=${fail}`);
}
