# 🔧 casewrench

A **VS Code extension** that converts the selection between naming cases — `camelCase`, `PascalCase`, `snake_case`, `kebab-case`, `CONSTANT_CASE`, `dot.case`, `Title Case`, `Sentence case`, `lower words`.

Works across every input style (it splits `HTTPServer`, `getURLFromID`, `hello_world`, `hello-world` correctly), on **multi-cursor** selections at once.

## Use
- `Ctrl+Alt+C` (or command **casewrench: Converter caixa da seleção…**) → pick the target case.
- Or bind a direct command like `casewrench.to.snake` to your own key.

## Layout
- `src/cases.js` — pure `splitWords` + `convert` (the tested core, no `vscode` import).
- `extension.js` — QuickPick + multi-selection apply.

## Dev
```bash
bun test
# F5 in VS Code for the Extension Development Host, or: npx @vscode/vsce package
```

MIT.
