// whenkit — dependency-free duration & relative-time helpers.

const UNIT_MS = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
} as const;

export type Unit = keyof typeof UNIT_MS;

// Order matters for formatting (largest first). ms handled separately.
const ORDER: Array<[Unit, number]> = [
  ["w", UNIT_MS.w],
  ["d", UNIT_MS.d],
  ["h", UNIT_MS.h],
  ["m", UNIT_MS.m],
  ["s", UNIT_MS.s],
];

const TOKEN = /(-?\d+(?:\.\d+)?)\s*(ms|s|m|h|d|w)/gi;
const FULL = /^(?:-?\d+(?:\.\d+)?\s*(?:ms|s|m|h|d|w)\s*)+$/i;

/**
 * Parse a duration string like "1h30m", "2.5h", "90 m", "-1d" into milliseconds.
 * Bare numbers are treated as milliseconds. Throws on unparseable input.
 */
export function parseDuration(input: string | number): number {
  if (typeof input === "number") return input;
  const trimmed = input.trim();
  if (trimmed === "") throw new Error("empty duration");
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);

  if (!FULL.test(trimmed)) throw new Error(`cannot parse duration: "${input}"`);

  let total = 0;
  TOKEN.lastIndex = 0;
  for (let m = TOKEN.exec(trimmed); m; m = TOKEN.exec(trimmed)) {
    total += Number(m[1]) * UNIT_MS[m[2].toLowerCase() as Unit];
  }
  return total;
}

export interface FormatOptions {
  /** Max number of unit segments to emit (e.g. 2 → "1h 30m"). Default: all. */
  parts?: number;
  /** Join separator. Default: " ". */
  separator?: string;
}

/**
 * Format milliseconds as a compact duration like "1h 30m".
 * Negative values keep a leading "-". Zero → "0ms".
 */
export function formatDuration(ms: number, opts: FormatOptions = {}): string {
  const { parts = Infinity, separator = " " } = opts;
  if (!Number.isFinite(ms)) throw new Error("ms must be finite");
  const sign = ms < 0 ? "-" : "";
  let rest = Math.abs(Math.trunc(ms));
  if (rest === 0) return "0ms";

  const out: string[] = [];
  for (const [unit, size] of ORDER) {
    if (rest >= size) {
      const n = Math.floor(rest / size);
      rest -= n * size;
      out.push(`${n}${unit}`);
      if (out.length >= parts) break;
    }
  }
  if (rest > 0 && out.length < parts) out.push(`${rest}ms`);
  return sign + out.join(separator);
}

const REL: Array<[Unit, number, string]> = [
  ["w", UNIT_MS.w, "week"],
  ["d", UNIT_MS.d, "day"],
  ["h", UNIT_MS.h, "hour"],
  ["m", UNIT_MS.m, "minute"],
  ["s", UNIT_MS.s, "second"],
];

/**
 * Human relative time between `date` and `now` (default: current time).
 * Past → "3 hours ago", future → "in 2 days", <1s → "just now". Throws on invalid dates.
 */
export function humanize(date: Date | number, now: Date | number = Date.now()): string {
  const then = typeof date === "number" ? date : date.getTime();
  const ref = typeof now === "number" ? now : now.getTime();
  if (Number.isNaN(then) || Number.isNaN(ref)) throw new Error("invalid date");
  const diff = ref - then;
  const abs = Math.abs(diff);
  if (abs < UNIT_MS.s) return "just now";

  for (const [, size, label] of REL) {
    if (abs >= size) {
      const n = Math.floor(abs / size);
      const plural = n === 1 ? label : `${label}s`;
      return diff >= 0 ? `${n} ${plural} ago` : `in ${n} ${plural}`;
    }
  }
  return "just now";
}

/** Convert a duration to a specific unit (float). */
export function toUnit(input: string | number, unit: Unit): number {
  return parseDuration(input) / UNIT_MS[unit];
}
