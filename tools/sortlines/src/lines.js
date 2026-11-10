// Pure line operations — no vscode dependency, unit-testable.

/** Natural compare: "file2" < "file10", digits compared numerically. */
function naturalCompare(a, b) {
  const ax = String(a).match(/\d+|\D+/g) || [];
  const bx = String(b).match(/\d+|\D+/g) || [];
  const n = Math.min(ax.length, bx.length);
  for (let i = 0; i < n; i++) {
    const an = /^\d/.test(ax[i]);
    const bn = /^\d/.test(bx[i]);
    if (an && bn) {
      const d = Number(ax[i]) - Number(bx[i]);
      if (d !== 0) return d;
    } else {
      const c = ax[i].localeCompare(bx[i]);
      if (c !== 0) return c;
    }
  }
  return ax.length - bx.length;
}

function sortLines(lines, opts = {}) {
  const { natural = false, caseInsensitive = false, descending = false } = opts;
  const key = caseInsensitive ? (s) => s.toLowerCase() : (s) => s;
  const cmp = natural
    ? (a, b) => naturalCompare(key(a), key(b))
    : (a, b) => key(a).localeCompare(key(b));
  const out = [...lines].sort(cmp);
  if (descending) out.reverse();
  return out;
}

/** Deduplicate, preserving first occurrence. */
function unique(lines) {
  const seen = new Set();
  return lines.filter((l) => (seen.has(l) ? false : (seen.add(l), true)));
}

function reverse(lines) {
  return [...lines].reverse();
}

/** Fisher-Yates shuffle on a copy. rng() → [0,1). */
function shuffle(lines, rng = Math.random) {
  const out = [...lines];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Split text into lines, setting a final line break aside so it is not sorted into the middle. */
function splitLines(text) {
  const lines = text.split(/\r?\n/);
  const trailingNewline = lines.length > 1 && lines[lines.length - 1] === "";
  if (trailingNewline) lines.pop();
  return { lines, trailingNewline };
}

function joinLines(lines, eol = "\n", trailingNewline = false) {
  return lines.join(eol) + (trailingNewline ? eol : "");
}

module.exports = { naturalCompare, sortLines, unique, reverse, shuffle, splitLines, joinLines };
