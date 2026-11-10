const vscode = require("vscode");
const { convert, TARGETS } = require("./src/cases");

const LABELS = {
  camel: "camelCase",
  pascal: "PascalCase",
  snake: "snake_case",
  kebab: "kebab-case",
  constant: "CONSTANT_CASE",
  dot: "dot.case",
  title: "Title Case",
  sentence: "Sentence case",
  lower: "lower words",
};

async function pickAndConvert() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  const hasText = editor.selections.some((s) => !s.isEmpty);
  if (!hasText) {
    vscode.window.showInformationMessage("casewrench: selecione o texto a converter.");
    return;
  }
  const pick = await vscode.window.showQuickPick(
    TARGETS.map((t) => ({ label: LABELS[t], target: t })),
    { placeHolder: "Converter seleção para…" },
  );
  if (!pick) return;
  await applyCase(editor, pick.target);
}

function applyCase(editor, target) {
  return editor.edit((b) => {
    for (const sel of editor.selections) {
      if (sel.isEmpty) continue;
      b.replace(sel, convert(editor.document.getText(sel), target));
    }
  });
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("casewrench.convert", pickAndConvert),
  );
  // Also register a direct command per target for keybindings/palette.
  for (const t of TARGETS) {
    context.subscriptions.push(
      vscode.commands.registerCommand(`casewrench.to.${t}`, () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) applyCase(editor, t);
      }),
    );
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
