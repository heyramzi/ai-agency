import { relative } from "node:path";
import type { Finding, Report } from "./types.js";

const RESET = "[0m";
const DIM = "[2m";
const BOLD = "[1m";
const RED = "[31m";
const YELLOW = "[33m";
const GREEN = "[32m";

/** Codes ordered by what actually breaks a registry, worst first. */
const ORDER = [
  "duplicate-name",
  "outside-codebase",
  "missing-frontmatter",
  "frontmatter-unparseable",
  "missing-name",
  "missing-description",
  "dangling-symlink",
  "broken-reference",
];

export function render(report: Report, opts: { color: boolean; cwd: string }): string {
  const c = (code: string, text: string) => (opts.color ? `${code}${text}${RESET}` : text);
  const short = (p: string) => {
    const rel = relative(opts.cwd, p);
    return rel && !rel.startsWith("..") ? rel : p;
  };

  const lines: string[] = [];
  const errors = report.findings.filter((f) => f.severity === "error");
  const warns = report.findings.filter((f) => f.severity === "warn");

  lines.push(
    c(BOLD, `${report.skills.length} skills`) +
      c(DIM, ` across ${report.scanned.length} roots`),
  );
  lines.push("");

  if (report.findings.length === 0) {
    lines.push(c(GREEN, "Nothing to clean up."));
    return lines.join("\n");
  }

  for (const group of [
    { label: "errors", items: errors, color: RED },
    { label: "warnings", items: warns, color: YELLOW },
  ]) {
    if (group.items.length === 0) continue;
    lines.push(c(BOLD, `${group.items.length} ${group.label}`));
    for (const finding of sortFindings(group.items)) {
      const mark = finding.fixable ? c(DIM, " [fixable]") : "";
      lines.push(`  ${c(group.color, finding.code)}${mark}  ${finding.message}`);
      for (const path of finding.paths) lines.push(c(DIM, `      ${short(path)}`));
    }
    lines.push("");
  }

  const fixable = report.findings.filter((f) => f.fixable).length;
  if (fixable > 0) lines.push(c(DIM, `${fixable} can be repaired with \`skill-cleaner fix\`.`));

  return lines.join("\n").trimEnd();
}

export function sortFindings(findings: Finding[]): Finding[] {
  const rank = (code: string) => {
    const index = ORDER.indexOf(code);
    return index === -1 ? ORDER.length : index;
  };
  return [...findings].sort(
    (a, b) => rank(a.code) - rank(b.code) || a.code.localeCompare(b.code),
  );
}
