'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vscode = require('vscode');
const themeMetadata = require('./theme-metadata.json');

const DEFAULT_THEME = 'Wind Waker Light';
const TOGGLE_COMMAND_ID = 'hylianPalette.toggleTheme';
const LEGACY_TOGGLE_COMMAND_ID = 'windwakerMajora.toggleTheme';
const PICK_COMMAND_ID = 'hylianPalette.pickTheme';
const RANDOM_COMMAND_ID = 'hylianPalette.randomTheme';
const EXPLORER_COMMAND_ID = 'hylianPalette.openExplorer';

function findByLabel(label) {
  return themeMetadata.find((t) => t.label === label);
}

function findSibling(entry) {
  const otherMode = entry.mode === 'light' ? 'dark' : 'light';
  const gameSlug = entry.slug.replace(/-(light|dark)$/, '');
  return themeMetadata.find((t) => t.slug.replace(/-(light|dark)$/, '') === gameSlug && t.mode === otherMode);
}

async function setTheme(label) {
  await vscode.workspace.getConfiguration('workbench').update('colorTheme', label, vscode.ConfigurationTarget.Global);
}

function escapeHtmlAttr(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildWebviewHtml(context, webview, initialThemeLabel) {
  const htmlPath = path.join(context.extensionPath, 'assets', 'explorer', 'explorer.html');
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const nonce = crypto.randomBytes(16).toString('base64');
  const cspMeta = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';" />`;

  return rawHtml
    .replace('{{CSP_META}}', cspMeta)
    .replace('{{CSP_NONCE}}', nonce)
    .replace('data-initial-theme=""', `data-initial-theme="${escapeHtmlAttr(initialThemeLabel)}"`);
}

function activate(context) {
  let explorerPanel = null;

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = PICK_COMMAND_ID;
  statusBarItem.tooltip = 'Hylian Palette: pick a Zelda theme (live preview)';

  function updateStatusBarItem() {
    const currentLabel = vscode.workspace.getConfiguration('workbench').get('colorTheme');
    const entry = findByLabel(currentLabel);
    statusBarItem.text = entry ? `$(symbol-color) ${entry.label}` : '$(symbol-color) Hylian Palette';
    statusBarItem.show();
  }
  updateStatusBarItem();

  const configListener = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('workbench.colorTheme')) {
      updateStatusBarItem();
      if (explorerPanel) {
        const currentLabel = vscode.workspace.getConfiguration('workbench').get('colorTheme');
        explorerPanel.webview.postMessage({ type: 'activeThemeChanged', label: currentLabel }).then(undefined, () => {});
      }
    }
  });

  async function handleToggle() {
    try {
      const currentLabel = vscode.workspace.getConfiguration('workbench').get('colorTheme');
      const currentEntry = findByLabel(currentLabel);
      const sibling = currentEntry ? findSibling(currentEntry) : undefined;
      const nextLabel = sibling ? sibling.label : DEFAULT_THEME;

      // Only workbench.colorTheme is touched, via the standard configuration API.
      await setTheme(nextLabel);
      vscode.window.setStatusBarMessage(`Theme switched to "${nextLabel}"`, 3000);
    } catch (err) {
      vscode.window.showErrorMessage(
        `Hylian Palette: failed to toggle theme -- ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  const toggleDisposable = vscode.commands.registerCommand(TOGGLE_COMMAND_ID, handleToggle);
  // Backward-compatible alias so existing user keybindings referencing windwakerMajora.toggleTheme keep working.
  const legacyToggleDisposable = vscode.commands.registerCommand(LEGACY_TOGGLE_COMMAND_ID, handleToggle);

  const pickDisposable = vscode.commands.registerCommand(PICK_COMMAND_ID, async () => {
    try {
      const originalTheme = vscode.workspace.getConfiguration('workbench').get('colorTheme');

      // Group by game, preserving the chronological (release-year) order
      // already baked into theme-metadata.json by the generator.
      const games = [];
      for (const entry of themeMetadata) {
        let bucket = games.find((g) => g.game === entry.game);
        if (!bucket) {
          bucket = { game: entry.game, year: entry.year, entries: [] };
          games.push(bucket);
        }
        bucket.entries.push(entry);
      }

      const items = [];
      let activeItem = null;
      for (const bucket of games) {
        items.push({ label: `${bucket.game} (${bucket.year})`, kind: vscode.QuickPickItemKind.Separator });
        const light = bucket.entries.find((e) => e.mode === 'light');
        const dark = bucket.entries.find((e) => e.mode === 'dark');
        for (const entry of [light, dark]) {
          if (!entry) continue;
          const isCurrent = entry.label === originalTheme;
          const modeLabel = entry.mode === 'light' ? 'Light' : 'Dark';
          const item = {
            label: entry.label,
            description: isCurrent ? `${modeLabel}  $(check) Active` : modeLabel,
            detail: entry.subtitle || undefined,
            themeLabel: entry.label,
          };
          items.push(item);
          if (isCurrent) activeItem = item;
        }
      }

      const qp = vscode.window.createQuickPick();
      qp.title = 'Hylian Palette — 18 Mainline Games · 36 Themes';
      qp.placeholder = 'Arrow through themes for live preview · Enter to keep · Esc to restore';
      qp.matchOnDescription = true;
      qp.matchOnDetail = true;
      qp.items = items;
      if (activeItem) qp.activeItems = [activeItem];

      let accepted = false;
      let lastPreviewed = originalTheme;

      qp.onDidChangeActive((active) => {
        const candidate = active && active[0] && active[0].themeLabel;
        if (candidate && candidate !== lastPreviewed) {
          lastPreviewed = candidate;
          setTheme(candidate).catch(() => {});
        }
      });

      qp.onDidAccept(async () => {
        const selected = qp.selectedItems && qp.selectedItems[0];
        if (selected && selected.themeLabel) {
          accepted = true;
          qp.hide();
          await setTheme(selected.themeLabel);
        }
      });

      qp.onDidHide(async () => {
        qp.dispose();
        if (!accepted && originalTheme && lastPreviewed !== originalTheme) {
          await setTheme(originalTheme).catch(() => {});
        }
      });

      qp.show();
    } catch (err) {
      vscode.window.showErrorMessage(
        `Hylian Palette: failed to open theme picker -- ${err instanceof Error ? err.message : String(err)}`
      );
    }
  });

  const randomDisposable = vscode.commands.registerCommand(RANDOM_COMMAND_ID, async () => {
    try {
      const currentLabel = vscode.workspace.getConfiguration('workbench').get('colorTheme');
      const choices = themeMetadata.filter((t) => t.label !== currentLabel);
      const pick = choices[Math.floor(Math.random() * choices.length)];
      await setTheme(pick.label);
      vscode.window.setStatusBarMessage(`Random theme: "${pick.label}"`, 3000);
    } catch (err) {
      vscode.window.showErrorMessage(
        `Hylian Palette: failed to pick a random theme -- ${err instanceof Error ? err.message : String(err)}`
      );
    }
  });

  const explorerDisposable = vscode.commands.registerCommand(EXPLORER_COMMAND_ID, () => {
    try {
      const currentLabel = vscode.workspace.getConfiguration('workbench').get('colorTheme') || '';
      if (explorerPanel) {
        explorerPanel.reveal(vscode.ViewColumn.Active);
        explorerPanel.webview.postMessage({ type: 'activeThemeChanged', label: currentLabel }).then(undefined, () => {});
        return;
      }

      explorerPanel = vscode.window.createWebviewPanel(
        'hylianPalette.explorer',
        'Hylian Palette Explorer',
        vscode.ViewColumn.Active,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'assets', 'explorer')],
        }
      );

      explorerPanel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'icon.png');
      explorerPanel.webview.html = buildWebviewHtml(context, explorerPanel.webview, currentLabel);

      explorerPanel.webview.onDidReceiveMessage(
        async (msg) => {
          if (!msg || typeof msg !== 'object') return;
          if (msg.type === 'applyTheme' && typeof msg.label === 'string' && findByLabel(msg.label)) {
            await setTheme(msg.label);
          } else if (msg.type === 'copyText' && typeof msg.text === 'string') {
            await vscode.env.clipboard.writeText(msg.text);
          }
        },
        undefined,
        context.subscriptions
      );

      explorerPanel.onDidDispose(
        () => {
          explorerPanel = null;
        },
        undefined,
        context.subscriptions
      );
    } catch (err) {
      vscode.window.showErrorMessage(
        `Hylian Palette: failed to open Explorer -- ${err instanceof Error ? err.message : String(err)}`
      );
    }
  });

  context.subscriptions.push(
    statusBarItem,
    configListener,
    toggleDisposable,
    legacyToggleDisposable,
    pickDisposable,
    randomDisposable,
    explorerDisposable
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
