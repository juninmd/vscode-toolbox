// Pure case-conversion — no vscode dependency, unit-testable.

/** Split any identifier/phrase into lowercase word tokens. */
function splitWords(s) {
  return String(s)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // camelCase boundary
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // HTTPServer -> HTTP Server
    .replace(/[_\-.\s/]+/g, " ") // separators
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

const cap = (w) => (w ? w[0].toUpperCase() + w.slice(1) : w);

const CONVERTERS = {
  camel: (w) => w.map((x, i) => (i === 0 ? x : cap(x))).join(""),
  pascal: (w) => w.map(cap).join(""),
  snake: (w) => w.join("_"),
  kebab: (w) => w.join("-"),
  constant: (w) => w.join("_").toUpperCase(),
  dot: (w) => w.join("."),
  title: (w) => w.map(cap).join(" "),
  sentence: (w) => (w.length ? cap(w.join(" ")) : ""),
  lower: (w) => w.join(" "),
};

const TARGETS = Object.keys(CONVERTERS);

/** Convert a string to a target case. Unknown target → original string. */
function convert(str, target) {
  const fn = CONVERTERS[target];
  if (!fn) return str;
  const words = splitWords(str);
  // Separator-only input (e.g. "---", "   ") has no words: keep it, never erase it.
  return words.length ? fn(words) : String(str);
}

module.exports = { splitWords, convert, TARGETS, CONVERTERS };
