# AGENTS.md

Vscode Toolbox: monorepo com 14 ferramentas pequenas. Seis entram na extensão unificada do VS Code (`package.json` + `src/extension.js`, 18 comandos). As demais vivem em `tools/` como CLI, biblioteca ou extensão própria. Cada ferramenta tem seu `AGENTS.md`, README e testes: leia o da ferramenta antes de mexer nela.

## Stack

- Raiz: extensão VS Code (`vscode ^1.80.0`), JavaScript, `node --test`.
- `tools/*`: cada uma escolhe o próprio stack. Há Bun (`bun.lock`), Node, Python com uv (`csvpeek`, `pyproject.toml`, `uv.lock`) e TypeScript.

## Commands

```bash
npm test                          # raiz: node --test "test/*.test.js" (o que o CI roda)
node --check src/extension.js     # sintaxe da extensão (CI)
cd tools/<nome> && <comando do seu AGENTS.md / package.json>   # ferramenta
```

Não há comando único para todas as ferramentas. Use o `package.json` ou `pyproject.toml` de cada uma.

## Structure

- `src/extension.js`, `src/transforms.js`: extensão unificada e transformações de texto dela.
- `test/`: testes da raiz.
- `tools/<nome>/`: uma ferramenta por pasta (`casewrench`, `colormate`, `csvpeek`, `envdiff`, `envlens`, `hashcheck`, `jsonpeek`, `jwtpeek`, `kv`, `minesweep`, `snapsort`, `sortlines`, `todo-lens`, `whenkit`). Cada uma tem `README.md`, `AGENTS.md` e `tests/`.
- `docs/readme/`: imagens do README.
- Lista e comandos de cada ferramenta: tabela em `README.md`.

## Conventions

- Antes de mudar uma ferramenta, leia o `AGENTS.md` dela. As regras ficam ali, não aqui.
- Mudanças na extensão unificada precisam de `npm test` e `node --check src/extension.js` verdes.
- Documentação em pt-BR, como o `README.md`.

<!-- base-actions-main-policy -->
## GitHub Actions — padrão obrigatório (@main)

- Referencie as actions internas sempre pelo branch, nunca por SHA:
  - `uses: juninmd/base-actions/<action>@main`
  - `uses: juninmd/base-actions/.github/workflows/<arquivo>.yml@main`
- Não fixe `@<sha>` em `juninmd/base-actions`: a atualização é centralizada no
  `main` e passa a valer no próximo run.
- PRs cujos checks não iniciam por billing/spending limit são mesclados pelo bot central
  `juninmd/base-actions/.github/workflows/auto-merge-billing-blocked.yml`.
  Para impedir o merge automático de um PR, aplique a label `do-not-merge`.

## Gotchas

- O CI (`.github/workflows/ci.yml`) roda só `node --check src/extension.js` e `npm test` da raiz. Os testes em `tools/*/tests` não rodam no CI. Rode-os localmente a cada mudança numa ferramenta.
- O `tools/envdiff` tem fixtures de encoding (UTF-16 e BOM) em `tests/fixtures/`. Não os normalize ao editar.
