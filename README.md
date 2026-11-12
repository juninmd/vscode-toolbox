# Developer Toolbox

Kit de micro-ferramentas para VS Code: ordenar e deduplicar linhas, converter casing, decodificar JWT, calcular hashes, converter cores e até um campo minado — pelo menu de contexto ou pela paleta de comandos, sem sair do editor.

O repositório reúne 14 ferramentas. A extensão unificada (`package.json` + `src/extension.js`) integra **6 delas como 18 comandos**; as outras 8 vivem em `tools/` como CLI, biblioteca, extensão ou serviço, com README e testes próprios.

## Instalação

Pré-requisito: VS Code **1.80** ou superior (`engines.vscode` no `package.json`).

O projeto não tem pipeline de publicação; o caminho documentado aqui é gerar o VSIX e instalar localmente. Requer Node.js com `npx`:

```bash
git clone https://github.com/juninmd/vscode-toolbox.git
cd vscode-toolbox
npx @vscode/vsce package
code --install-extension vscode-toolbox-1.0.0.vsix
```

Depois de instalar, os comandos aparecem na paleta com o prefixo `Toolbox:`. Para desenvolvimento, abra a pasta no VS Code e pressione **F5** para iniciar o Extension Development Host.

Não há atalhos de teclado padrão: o `package.json` não declara `keybindings`. Para criar os seus, use **Ctrl+K Ctrl+S** (Keyboard Shortcuts), busque pelo nome do comando e atribua a combinação.

## Comandos

Os comandos de ordenação e de casing agem na seleção; **sem seleção, eles substituem o arquivo inteiro**. JWT, hash e cor exigem texto selecionado; o campo minado não usa a seleção.

### Linhas (`sortlines`)

| Comando | Título na paleta | O que faz |
|---|---|---|
| `toolbox.sortlines.sort` | Toolbox: Sort Lines (A→Z) | Ordena com `localeCompare` |
| `toolbox.sortlines.sortInsensitive` | Toolbox: Sort Lines (Case-Insensitive) | Ordena ignorando maiúsculas/minúsculas |
| `toolbox.sortlines.sortNatural` | Toolbox: Sort Lines (Natural Numbering) | Ordena números por valor: `file2` antes de `file10` |
| `toolbox.sortlines.sortDescending` | Toolbox: Sort Lines (Z→A) | Ordem decrescente |
| `toolbox.sortlines.unique` | Toolbox: Remove Duplicate Lines | Remove duplicatas exatas, mantendo a primeira ocorrência |
| `toolbox.sortlines.reverse` | Toolbox: Reverse Lines | Inverte a ordem das linhas |
| `toolbox.sortlines.shuffle` | Toolbox: Shuffle Lines | Embaralha (Fisher-Yates) |

### Casing (`casewrench`)

| Comando | Título na paleta | Exemplo de saída |
|---|---|---|
| `toolbox.case.camel` | Toolbox: Convert to camelCase | `userProfile` |
| `toolbox.case.pascal` | Toolbox: Convert to PascalCase | `UserProfile` |
| `toolbox.case.snake` | Toolbox: Convert to snake_case | `user_profile` |
| `toolbox.case.kebab` | Toolbox: Convert to kebab-case | `user-profile` |
| `toolbox.case.constant` | Toolbox: Convert to CONSTANT_CASE | `USER_PROFILE` |
| `toolbox.case.title` | Toolbox: Convert to Title Case | `User Profile` |
| `toolbox.case.dot` | Toolbox: Convert to dot.case | `user.profile` |

A conversão separa palavras em qualquer caractere não alfanumérico e na transição de minúscula para maiúscula. `hello_world`, `hello-world` e `hello world` chegam ao mesmo resultado.

### Inspeção e utilidades

| Comando | Título na paleta | O que faz |
|---|---|---|
| `toolbox.jwt.decode` | Toolbox: Decode Selected JWT Token | Lê header e payload do JWT selecionado e abre um documento JSON com os dois blocos |
| `toolbox.hash.check` | Toolbox: Calculate Hash (MD5 / SHA256) of Selection | Calcula MD5, SHA-1 e SHA-256 do texto selecionado; o quick pick copia o escolhido |
| `toolbox.color.convert` | Toolbox: Convert Color (HEX <-> RGB) | Converte um HEX (`#rgb` ou `#rrggbb`) selecionado para `rgb(r, g, b)` |
| `toolbox.minesweep.play` | Toolbox: Play Minesweeper | Abre `tools/minesweep/index.html` num painel Webview |

O menu de contexto do editor (**botão direito → 🛠️ Developer Toolbox**) expõe 9 desses 18 comandos, agrupados em ordenação, casing, inspeção, cor e diversão. Os demais ficam só na paleta.

## Uso

Ordenação natural em uma lista de arquivos:

```text
file10.log
file2.log
file1.log
```

Execute **Toolbox: Sort Lines (Natural Numbering)** com as três linhas selecionadas:

```text
file1.log
file2.log
file10.log
```

Converter um identificador. Com `user profile` selecionado, **Toolbox: Convert to camelCase** produz `userProfile`.

Decodificar um JWT: selecione o token (o comando usa apenas o texto da seleção) e rode **Toolbox: Decode Selected JWT Token**. A extensão abre um documento novo no formato:

```json
// HEADER:
{ "alg": "HS256", "typ": "JWT" }

// PAYLOAD:
{ "sub": "42" }
```

Hash: selecione o texto, rode o comando e escolha entre **SHA-256**, **MD5** e **SHA-1** no quick pick. O valor vai para a área de transferência; a extensão avisa se não houver seleção.

## As 14 ferramentas

| Ferramenta | O que é | Estado neste repositório |
|---|---|---|
| [sortlines](tools/sortlines/README.md) | Ordenação e limpeza de linhas | Integrada: 7 comandos |
| [casewrench](tools/casewrench/README.md) | Conversão de casing | Integrada: 7 comandos |
| [jwtpeek](tools/jwtpeek/README.md) | Decodificação de JWT | Integrada como decodificador; o CLI em `tools/jwtpeek` também verifica assinatura e expiração |
| [hashcheck](tools/hashcheck/README.md) | Hashes de texto e arquivo | Integrada para texto; o CLI em `tools/hashcheck` tem SHA-512, arquivos e verificação |
| [colormate](tools/colormate/README.md) | Conversão de cores | Integrada para HEX→RGB; a versão original cobre `rgb()`/`hsl()` e swatches |
| [minesweep](tools/minesweep/README.md) | Campo minado | Integrada como painel Webview |
| [csvpeek](tools/csvpeek/README.md) | Inspeção de CSV (tipos, stats, colunas) | CLI Python em `tools/csvpeek` |
| [envdiff](tools/envdiff/README.md) | Diff de arquivos `.env` com máscara de segredos | CLI Bun em `tools/envdiff` |
| [envlens](tools/envlens/README.md) | Avisa `process.env.X` sem definição em `.env` | Extensão VS Code separada |
| [jsonpeek](tools/jsonpeek/README.md) | Visualizador de JSON em árvore | Extensão Chrome MV3 |
| [kv](tools/kv/README.md) | Armazenamento chave-valor JSON via HTTP | Serviço Bun em `tools/kv` |
| [snapsort](tools/snapsort/README.md) | Organiza fotos em `YYYY/MM` por data | CLI Python em `tools/snapsort` |
| [todo-lens](tools/todo-lens/README.md) | Lista `TODO`/`FIXME` do arquivo atual | Extensão VS Code separada |
| [whenkit](tools/whenkit/README.md) | Durações e tempo relativo | Biblioteca TypeScript em `tools/whenkit` |

As oito ferramentas fora da extensão não são carregadas pelo `src/extension.js`; para usá-las, siga o README da pasta correspondente (cada uma tem pré-requisitos próprios — `uv`, `bun`, Chrome ou VS Code).

## Como funciona

```text
vscode-toolbox/
├── package.json          # publisher, comandos, menus e metadados
├── src/
│   └── extension.js      # implementação dos 18 comandos e do painel do jogo
└── tools/
    ├── sortlines/        # uma pasta por ferramenta, com README e testes
    ├── casewrench/
    ├── ...
    └── whenkit/
```

A extensão é JavaScript puro, ativada em `onStartupFinished`. Os comandos de linha e de casing leem a seleção do editor ativo e a substituem por `editor.edit`, percorrendo cada seleção (o que atende múltiplos cursores). O hash usa a seleção apenas como entrada e copia o digest; a cor substitui o HEX por `rgb()`; o JWT abre um documento novo com o resultado; o campo minado cria um `WebviewPanel` e carrega o HTML de `tools/minesweep`.

O `package.json` da raiz é o único manifesto que o VS Code lê. Os `package.json` dentro de `tools/` pertencem às versões originais e não são instalados pela extensão unificada.

## Limitações

- **JWT sem validação.** O comando decodifica e formata header/payload; não verifica assinatura nem checa `exp`/`nbf`. Para isso existe o CLI `tools/jwtpeek`.
- **Hash só de texto selecionado.** Não há hash de arquivo na extensão; o `tools/hashcheck` faz streaming de arquivos e verifica digests.
- **Cor em uma direção.** Apesar do título “HEX <-> RGB”, a implementação só reconhece HEX e grava `rgb()`; seleções em `rgb()` ou `hsl()` recebem apenas uma mensagem.
- **Sem atalhos padrão.** Nenhum `keybindings` é declarado; atribua os seus em Keyboard Shortcuts.
- **Testes por ferramenta.** O `package.json` da raiz define `test` como `echo No test specified`; as suítes estão em `tools/*/tests` e rodam com `bun test` ou `pytest`, conforme a ferramenta.
- **Campo minado depende do arquivo local.** O painel lê `tools/minesweep/index.html` do diretório da extensão e mostra um fallback se o arquivo não existir.
- **Sem publicação automatizada.** Não há workflow de CI neste repositório; o VSIX é gerado manualmente.

## Desenvolvimento

Para empacotar novamente após uma alteração:

```bash
npx @vscode/vsce package
code --install-extension vscode-toolbox-1.0.0.vsix --force
```

Testes das ferramentas (cada pasta tem o seu runner):

```bash
(cd tools/sortlines && bun test)
(cd tools/casewrench && bun test)
(cd tools/envdiff && bun test)
(cd tools/csvpeek && uv sync --group dev && uv run pytest -q)
(cd tools/snapsort && uv sync --group dev && uv run pytest -q)
```

Consulte o README de cada ferramenta para os comandos exatos de build — por exemplo, `jwtpeek`, `hashcheck` e `whenkit` usam `bun run build` com `tsdown`, e `csvpeek`/`snapsort` usam `uv`.

## Licença

O `package.json` declara **MIT**, mas o repositório não tem arquivo `LICENSE` na raiz — existe apenas `tools/minesweep/LICENSE`, que cobre aquela ferramenta. Para reutilizar o conjunto, confirme a licença com o mantenedor.
