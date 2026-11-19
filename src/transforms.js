// Pure text transforms behind the Toolbox commands: no vscode dependency, so `node --test` covers them.

const lines = (text) => text.split(/\r?\n/);

const sortLines = (text) => lines(text).sort((a, b) => a.localeCompare(b)).join('\n');
const sortLinesInsensitive = (text) => lines(text).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).join('\n');
const sortLinesNatural = (text) => lines(text).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })).join('\n');
const sortLinesDescending = (text) => lines(text).sort((a, b) => b.localeCompare(a)).join('\n');
const uniqueLines = (text) => Array.from(new Set(lines(text))).join('\n');
const reverseLines = (text) => lines(text).reverse().join('\n');

function shuffleLines(text, random = Math.random) {
  const arr = lines(text);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('\n');
}

// Letters and digits of any script: "ação_do_usuário" must not lose its accents.
function words(str) {
  return str.replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2')
            .replace(/[^\p{L}\p{N}]+/gu, ' ')
            .trim()
            .split(/\s+/)
            .filter(Boolean);
}

const capitalize = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

const toCamel = (t) => words(t).map((w, i) => (i === 0 ? w.toLowerCase() : capitalize(w))).join('');
const toPascal = (t) => words(t).map(capitalize).join('');
const toSnake = (t) => words(t).map((w) => w.toLowerCase()).join('_');
const toKebab = (t) => words(t).map((w) => w.toLowerCase()).join('-');
const toConstant = (t) => words(t).map((w) => w.toUpperCase()).join('_');
const toTitle = (t) => words(t).map(capitalize).join(' ');
const toDot = (t) => words(t).map((w) => w.toLowerCase()).join('.');

module.exports = {
  sortLines, sortLinesInsensitive, sortLinesNatural, sortLinesDescending, uniqueLines, reverseLines, shuffleLines,
  words, toCamel, toPascal, toSnake, toKebab, toConstant, toTitle, toDot,
};
