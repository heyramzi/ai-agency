import { sep } from "node:path";
import type { Located } from "./types.js";

/**
 * A marketplace directory is the upstream clone a plugin is installed *from*,
 * not the copy the runtime loads, and it usually carries one mirror of every
 * skill per supported runtime (`.cursor/`, `.gemini/`, `.pi/`, and so on).
 * Counting those as registrations turned a single plugin into twenty-five
 * conflicting entries.
 */
export const isMarketplaceClone = (path: string): boolean =>
  path.includes(`${sep}plugins${sep}marketplaces${sep}`);

/** `.../plugins/cache/<marketplace>/<plugin>/<version>/...` */
const CACHE_VERSION = /[/\\]plugins[/\\]cache[/\\]([^/\\]+)[/\\]([^/\\]+)[/\\]([^/\\]+)[/\\]/;

/**
 * Only the newest cached version of a plugin is live. Older ones sit on disk
 * after an upgrade and would otherwise read as the same skill registered five
 * times, which is an upgrade history rather than a conflict.
 */
export function keepNewestPluginVersions(located: Located[]): Located[] {
  const newest = new Map<string, { version: string; items: Located[] }>();
  const passthrough: Located[] = [];

  for (const item of located) {
    const match = CACHE_VERSION.exec(item.realPath);
    if (!match) {
      passthrough.push(item);
      continue;
    }
    const [, marketplace = "", plugin = "", version = ""] = match;
    const key = `${marketplace}/${plugin}`;
    const current = newest.get(key);
    if (!current || compareVersions(version, current.version) > 0) {
      newest.set(key, { version, items: [item] });
    } else if (compareVersions(version, current.version) === 0) {
      current.items.push(item);
    }
  }

  return [...passthrough, ...[...newest.values()].flatMap((entry) => entry.items)];
}

/** Numeric segment compare, so 4.0.10 sorts above 4.0.9 as a string never would. */
export function compareVersions(a: string, b: string): number {
  const partsA = a.split(/[.\-+]/);
  const partsB = b.split(/[.\-+]/);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = Number(partsA[i] ?? 0);
    const numB = Number(partsB[i] ?? 0);
    if (Number.isNaN(numA) || Number.isNaN(numB)) {
      const cmp = (partsA[i] ?? "").localeCompare(partsB[i] ?? "");
      if (cmp !== 0) return cmp;
      continue;
    }
    if (numA !== numB) return numA - numB;
  }
  return 0;
}
