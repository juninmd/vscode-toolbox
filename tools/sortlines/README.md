# 🗂️ sortlines

A **VS Code extension** for quick line surgery on the selection (or the whole file when nothing is selected):

| command | does |
|---------|------|
| Ordenar (A→Z) | locale sort |
| Ordenar (ignorar maiúsc.) | case-insensitive sort |
| Ordenar natural | `file2` before `file10` |
| Ordenar (Z→A) | descending |
| Remover duplicadas | dedupe, keeping first occurrence |
| Inverter | reverse order |
| Embaralhar | random shuffle |

## Layout
- `src/lines.js` — pure `sortLines` / `unique` / `reverse` / `shuffle` / `naturalCompare` (tested core).
- `extension.js` — 7 commands operating on the selected full lines.

## Dev
```bash
bun test
# F5 for the Extension Development Host, or: npx @vscode/vsce package
```

MIT.
