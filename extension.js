'use strict';

const vscode = require('vscode');
const themeMetadata = require('./theme-metadata.json');

const DEFAULT_THEME = 'Wind Waker Light';
const TOGGLE_COMMAND_ID = 'windwakerMajora.toggleTheme';
const PICK_COMMAND_ID = 'hylianPalette.pickTheme';

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

function activate(context) {
  const toggleDisposable = vscode.commands.registerCommand(TOGGLE_COMMAND_ID, async () => {
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
  });

  const pickDisposable = vscode.commands.registerCommand(PICK_COMMAND_ID, async () => {
    try {
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
      for (const bucket of games) {
        items.push({ label: `${bucket.game} (${bucket.year})`, kind: vscode.QuickPickItemKind.Separator });
        const light = bucket.entries.find((e) => e.mode === 'light');
        const dark = bucket.entries.find((e) => e.mode === 'dark');
        if (light) items.push({ label: light.label, description: 'Light' });
        if (dark) items.push({ label: dark.label, description: 'Dark' });
      }

      const picked = await vscode.window.showQuickPick(items, {
        placeHolder: 'Pick a Zelda theme',
        matchOnDescription: true,
      });
      if (picked && picked.label) {
        await setTheme(picked.label);
      }
    } catch (err) {
      vscode.window.showErrorMessage(
        `Hylian Palette: failed to open theme picker -- ${err instanceof Error ? err.message : String(err)}`
      );
    }
  });

  context.subscriptions.push(toggleDisposable, pickDisposable);
}

function deactivate() {}

module.exports = { activate, deactivate };
