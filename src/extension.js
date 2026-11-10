const vscode = require('vscode');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  function replaceSelection(transformFn) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const document = editor.document;
    editor.edit(editBuilder => {
      editor.selections.forEach(sel => {
        const text = sel.isEmpty ? document.getText() : document.getText(sel);
        const transformed = transformFn(text);
        if (sel.isEmpty) {
          const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
          );
          editBuilder.replace(fullRange, transformed);
        } else {
          editBuilder.replace(sel, transformed);
        }
      });
    });
  }

  // 1. Sortlines
  const sortlines = {
    sort: () => replaceSelection(text => text.split(/\r?\n/).sort((a,b) => a.localeCompare(b)).join('\n')),
    sortInsensitive: () => replaceSelection(text => text.split(/\r?\n/).sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase())).join('\n')),
    sortNatural: () => replaceSelection(text => text.split(/\r?\n/).sort((a,b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })).join('\n')),
    sortDescending: () => replaceSelection(text => text.split(/\r?\n/).sort((a,b) => b.localeCompare(a)).join('\n')),
    unique: () => replaceSelection(text => Array.from(new Set(text.split(/\r?\n/))).join('\n')),
    reverse: () => replaceSelection(text => text.split(/\r?\n/).reverse().join('\n')),
    shuffle: () => replaceSelection(text => {
      const arr = text.split(/\r?\n/);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr.join('\n');
    })
  };

  context.subscriptions.push(
    vscode.commands.registerCommand('toolbox.sortlines.sort', sortlines.sort),
    vscode.commands.registerCommand('toolbox.sortlines.sortInsensitive', sortlines.sortInsensitive),
    vscode.commands.registerCommand('toolbox.sortlines.sortNatural', sortlines.sortNatural),
    vscode.commands.registerCommand('toolbox.sortlines.sortDescending', sortlines.sortDescending),
    vscode.commands.registerCommand('toolbox.sortlines.unique', sortlines.unique),
    vscode.commands.registerCommand('toolbox.sortlines.reverse', sortlines.reverse),
    vscode.commands.registerCommand('toolbox.sortlines.shuffle', sortlines.shuffle)
  );

  // 2. Casewrench
  function words(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1 $2')
              .replace(/[^a-zA-Z0-9]+/g, ' ')
              .trim()
              .split(/\s+/)
              .filter(Boolean);
  }

  const casewrench = {
    camel: () => replaceSelection(t => words(t).map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')),
    pascal: () => replaceSelection(t => words(t).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')),
    snake: () => replaceSelection(t => words(t).map(w => w.toLowerCase()).join('_')),
    kebab: () => replaceSelection(t => words(t).map(w => w.toLowerCase()).join('-')),
    constant: () => replaceSelection(t => words(t).map(w => w.toUpperCase()).join('_')),
    title: () => replaceSelection(t => words(t).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')),
    dot: () => replaceSelection(t => words(t).map(w => w.toLowerCase()).join('.'))
  };

  context.subscriptions.push(
    vscode.commands.registerCommand('toolbox.case.camel', casewrench.camel),
    vscode.commands.registerCommand('toolbox.case.pascal', casewrench.pascal),
    vscode.commands.registerCommand('toolbox.case.snake', casewrench.snake),
    vscode.commands.registerCommand('toolbox.case.kebab', casewrench.kebab),
    vscode.commands.registerCommand('toolbox.case.constant', casewrench.constant),
    vscode.commands.registerCommand('toolbox.case.title', casewrench.title),
    vscode.commands.registerCommand('toolbox.case.dot', casewrench.dot)
  );

  // 3. JWT Peek
  context.subscriptions.push(
    vscode.commands.registerCommand('toolbox.jwt.decode', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const text = editor.document.getText(editor.selection).trim();
      const parts = text.split('.');
      if (parts.length < 2) {
        vscode.window.showErrorMessage('Invalid JWT token (expected dot-separated parts).');
        return;
      }
      try {
        const header = Buffer.from(parts[0], 'base64').toString('utf8');
        const payload = Buffer.from(parts[1], 'base64').toString('utf8');
        const formatted = '// HEADER:\n' + JSON.stringify(JSON.parse(header), null, 2) + '\n\n// PAYLOAD:\n' + JSON.stringify(JSON.parse(payload), null, 2);
        vscode.workspace.openTextDocument({ content: formatted, language: 'json' }).then(doc => vscode.window.showTextDocument(doc));
      } catch(e) {
        vscode.window.showErrorMessage('Failed to decode JWT: ' + e.message);
      }
    })
  );

  // 4. Hash Check
  context.subscriptions.push(
    vscode.commands.registerCommand('toolbox.hash.check', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const text = editor.document.getText(editor.selection);
      if (!text) {
        vscode.window.showWarningMessage('Please select text to calculate hash.');
        return;
      }
      const md5 = crypto.createHash('md5').update(text).digest('hex');
      const sha1 = crypto.createHash('sha1').update(text).digest('hex');
      const sha256 = crypto.createHash('sha256').update(text).digest('hex');
      vscode.window.showQuickPick([
        { label: 'SHA-256', description: sha256 },
        { label: 'MD5', description: md5 },
        { label: 'SHA-1', description: sha1 }
      ], { placeHolder: 'Select hash to copy' }).then(item => {
        if (item) {
          vscode.env.clipboard.writeText(item.description);
          vscode.window.showInformationMessage(`Copied ${item.label} to clipboard!`);
        }
      });
    })
  );

  // 5. Colormate
  context.subscriptions.push(
    vscode.commands.registerCommand('toolbox.color.convert', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const text = editor.document.getText(editor.selection).trim();
      if (/^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(text)) {
        const hex = text.replace('#', '');
        const r = parseInt(hex.length === 3 ? hex[0]+hex[0] : hex.slice(0, 2), 16);
        const g = parseInt(hex.length === 3 ? hex[1]+hex[1] : hex.slice(2, 4), 16);
        const b = parseInt(hex.length === 3 ? hex[2]+hex[2] : hex.slice(4, 6), 16);
        replaceSelection(() => `rgb(${r}, ${g}, ${b})`);
      } else {
        vscode.window.showInformationMessage('Select a HEX color code (e.g. #3b82f6) to convert.');
      }
    })
  );

  // 6. Minesweeper Webview
  context.subscriptions.push(
    vscode.commands.registerCommand('toolbox.minesweep.play', () => {
      const panel = vscode.window.createWebviewPanel(
        'minesweep',
        'Minesweeper 💣',
        vscode.ViewColumn.One,
        { enableScripts: true }
      );
      const gameHtmlPath = path.join(context.extensionPath, 'tools', 'minesweep', 'index.html');
      if (fs.existsSync(gameHtmlPath)) {
        panel.webview.html = fs.readFileSync(gameHtmlPath, 'utf8');
      } else {
        panel.webview.html = '<h2>Minesweeper Game</h2>';
      }
    })
  );

  console.log('Developer Toolbox (vscode-toolbox) active!');
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
