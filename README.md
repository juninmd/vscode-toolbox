# 🛠️ Developer Toolbox (VS Code Extension)

**All-in-one Swiss Army knife extension for developers in Visual Studio Code.**

Consolida 14 micro-ferramentas e utilitários anteriormente dispersos em repositórios isolados.

---

## ✨ Ferramentas Integradas

### 1. 🔤 Sortlines
- **Ordenar (A→Z)** e **(Z→A)**
- **Ordenação Case-Insensitive** e **Natural**
- **Remover Linhas Duplicadas**
- **Inverter Linhas** e **Embaralhar (Shuffle)**

### 2. 🔀 Casewrench (Conversor de Casing)
- `camelCase`, `PascalCase`, `snake_case`, `kebab-case`, `CONSTANT_CASE`, `Title Case`, `dot.case`

### 3. 🔑 JWT Peek
- Selecione qualquer JWT e execute **Toolbox: Decode Selected JWT Token** para abrir Header e Payload formatados em JSON legível.

### 4. 🔒 Hash Check
- Calcula instantaneamente **MD5, SHA-1 e SHA-256** do texto selecionado com um clique para copiar para a área de transferência.

### 5. 🎨 Colormate
- Conversão rápida entre formatos de cores no editor (HEX para RGB).

### 6. 💣 Minesweeper
- Campo minado retrô embutido em painel Webview para pausas rápidas.

### 7. 📦 Utilitários Adicionais em `tools/`
- `tools/csvpeek`: Inspeção rápida de arquivos CSV
- `tools/jsonpeek`: Visualizador leve de JSON
- `tools/whenkit`: Utilitários de tempo e data relativa
- `tools/envlens` & `tools/envdiff`: Lentes e diff de variáveis `.env`
- `tools/snapsort`: Ordenador e particionador de dados
- `tools/kv`: Armazenamento de chave-valor local
- `tools/todo-lens`: Destaque e listagem de TODOs

---

## 📁 Estrutura

```
vscode-toolbox/
├── package.json          # Manifest unificado com comandos e menus de contexto
├── src/
│   └── extension.js      # Ponto de entrada com handlers integrados
└── tools/                # Código-fonte original preservado de cada ferramenta
    ├── casewrench/
    ├── colormate/
    ├── csvpeek/
    ├── envdiff/
    ├── envlens/
    ├── hashcheck/
    ├── jsonpeek/
    ├── jwtpeek/
    ├── kv/
    ├── minesweep/
    ├── snapsort/
    ├── sortlines/
    ├── todo-lens/
    └── whenkit/
```
