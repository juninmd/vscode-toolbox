const vscode = require("vscode");
const { sortLines, unique, reverse, shuffle, splitLines, joinLines } = require("./src/lines");
const { selectionToLineRange } = require("./src/range");

/** Run a transform over the selected lines (or the whole doc if no selection). */
function transformLines(fn) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  const doc = editor.document;
  let range = editor.selection;
  if (range.isEmpty) {
    range = new vscode.Range(0, 0, doc.lineCount - 1, doc.lineAt(doc.lineCount - 1).text.length);
  } else {
    // expand to full lines (a selection ending at column 0 does not include that line)
    const { startLine, endLine } = selectionToLineRange(range.start, range.end);
    range = new vscode.Range(startLine, 0, endLine, doc.lineAt(endLine).text.length);
  }
  const { lines, trailingNewline } = splitLines(doc.getText(range));
  const eol = doc.eol === vscode.EndOfLine.CRLF ? "\r\n" : "\n";
  const result = joinLines(fn(lines), eol, trailingNewline);
  editor.edit((b) => b.replace(range, result));
}

function activate(context) {
  const cmds = {
    "sortlines.sort": () => transformLines((l) => sortLines(l)),
    "sortlines.sortInsensitive": () => transformLines((l) => sortLines(l, { caseInsensitive: true })),
    "sortlines.sortNatural": () => transformLines((l) => sortLines(l, { natural: true })),
    "sortlines.sortDescending": () => transformLines((l) => sortLines(l, { descending: true })),
    "sortlines.unique": () => transformLines(unique),
    "sortlines.reverse": () => transformLines(reverse),
    "sortlines.shuffle": () => transformLines((l) => shuffle(l)),
  };
  for (const [id, fn] of Object.entries(cmds)) {
    context.subscriptions.push(vscode.commands.registerCommand(id, fn));
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
