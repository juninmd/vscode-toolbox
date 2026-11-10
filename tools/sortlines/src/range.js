// Pure range helpers — no vscode dependency, unit-testable.

/** Selection → full-line range. A selection ending at column 0 of a later line excludes that line. */
function selectionToLineRange(start, end) {
  const endLine = end.character === 0 && end.line > start.line ? end.line - 1 : end.line;
  return { startLine: start.line, endLine };
}

module.exports = { selectionToLineRange };
