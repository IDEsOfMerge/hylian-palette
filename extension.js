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
const PICK_SIMILAR_COMMAND_ID = 'hylianPalette.pickSimilarTheme';
const RANDOM_COMMAND_ID = 'hylianPalette.randomTheme';
const RANDOM_SAME_MODE_COMMAND_ID = 'hylianPalette.randomThemeSameMode';
const SYNC_OS_PAIR_COMMAND_ID = 'hylianPalette.syncOsThemePair';
const EXPLORER_COMMAND_ID = 'hylianPalette.openExplorer';

function findByLabel(label) {
  return themeMetadata.find((t) => t.label === label);
}

function findBySlug(slug) {
  return themeMetadata.find((t) => t.slug === slug);
}

function findSibling(entry) {
  if (!entry || typeof entry.slug !== 'string') return undefined;

  let currentMode;
  if (entry.mode !== undefined) {
    if (entry.mode !== 'light' && entry.mode !== 'dark') return undefined;
    currentMode = entry.mode;
  } else {
    const modeMatch = entry.slug.match(/-(light|dark)$/);
    if (!modeMatch) return undefined;
    currentMode = modeMatch[1];
  }

  const otherMode = currentMode === 'light' ? 'dark' : 'light';
  const gameSlug = entry.slug.replace(/-(light|dark)$/, '');
  return themeMetadata.find(
    (t) => t.slug !== entry.slug && t.slug.replace(/-(light|dark)$/, '') === gameSlug && t.mode === otherMode
  );
}

function findPairForGame(gameOrEntry) {
  if (!gameOrEntry) return null;
  let gameName = null;
  let gameSlug = null;

  if (typeof gameOrEntry === 'object') {
    gameName = gameOrEntry.game || null;
    if (typeof gameOrEntry.slug === 'string') {
      gameSlug = gameOrEntry.slug.replace(/-(light|dark)$/, '');
    }
    if (!gameName && !gameSlug && typeof gameOrEntry.label === 'string') {
      const byLabel = findByLabel(gameOrEntry.label);
      if (byLabel) {
        gameName = byLabel.game;
        gameSlug = byLabel.slug.replace(/-(light|dark)$/, '');
      }
    }
  } else if (typeof gameOrEntry === 'string') {
    const byLabel = findByLabel(gameOrEntry) || findByLabel(`${gameOrEntry} Light`);
    if (byLabel) {
      gameName = byLabel.game;
      gameSlug = byLabel.slug.replace(/-(light|dark)$/, '');
    } else {
      gameName = gameOrEntry;
      gameSlug = gameOrEntry.replace(/-(light|dark)$/, '');
    }
  } else {
    return null;
  }

  const matches = themeMetadata.filter(
    (t) =>
      (gameName && t.game === gameName) ||
      (gameSlug && t.slug.replace(/-(light|dark)$/, '') === gameSlug)
  );
  const light = matches.find((t) => t.mode === 'light');
  const dark = matches.find((t) => t.mode === 'dark');
  if (!light || !dark) return null;
  return { light, dark };
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

function shouldShowStatusBar(visibilitySetting, isHylianThemeActive) {
  if (visibilitySetting === 'never') return false;
  if (visibilitySetting === 'whenActive') return Boolean(isHylianThemeActive);
  return true;
}

function buildQuickPickItems(currentThemeLabel, separatorKind) {
  const sepKind =
    separatorKind !== undefined
      ? separatorKind
      : vscode && vscode.QuickPickItemKind && vscode.QuickPickItemKind.Separator !== undefined
        ? vscode.QuickPickItemKind.Separator
        : -1;

  // Group by game, preserving the chronological (release-year) order
  // baked into theme-metadata.json by the generator.
  const games = [];
  for (const entry of themeMetadata) {
    let bucket = games.find((g) => g.game === entry.game);
    if (!bucket) {
      bucket = { game: entry.game, year: entry.year, era: entry.era, timeline: entry.timeline, entries: [] };
      games.push(bucket);
    }
    bucket.entries.push(entry);
  }

  const items = [];
  for (const bucket of games) {
    items.push({
      label: `${bucket.game} (${bucket.year} · ${bucket.era} · ${bucket.timeline})`,
      kind: sepKind,
    });
    const light = bucket.entries.find((e) => e.mode === 'light');
    const dark = bucket.entries.find((e) => e.mode === 'dark');
    for (const entry of [light, dark]) {
      if (!entry) continue;
      const isCurrent = entry.label === currentThemeLabel;
      const modeLabel = entry.mode === 'light' ? 'Light' : 'Dark';
      const meta = `${modeLabel} · ${entry.year} · ${entry.era} · ${entry.timeline}`;
      items.push({
        label: entry.label,
        description: isCurrent ? `${meta}  $(check) Active` : meta,
        detail: entry.subtitle || undefined,
        themeLabel: entry.label,
      });
    }
  }

  return items;
}

function buildSimilarQuickPickItems(currentThemeLabel, separatorKind) {
  const sepKind =
    separatorKind !== undefined
      ? separatorKind
      : vscode && vscode.QuickPickItemKind && vscode.QuickPickItemKind.Separator !== undefined
        ? vscode.QuickPickItemKind.Separator
        : -1;

  const current = findByLabel(currentThemeLabel);
  if (!current) return [];

  const items = [];
  const neighbors = Array.isArray(current.neighbors) ? current.neighbors : [];
  if (neighbors.length > 0) {
    items.push({
      label: `Nearest Chromatic Siblings to ${current.label} (CIEDE2000 ΔE₀₀)`,
      kind: sepKind,
    });
    for (const nb of neighbors) {
      const target = findBySlug(nb.slug);
      if (!target) continue;
      const modeLabel = target.mode === 'light' ? 'Light' : 'Dark';
      items.push({
        label: target.label,
        description: `ΔE₀₀ ${Number(nb.de).toFixed(1)} · ${modeLabel} · ${target.year} · ${target.era} · ${target.timeline}`,
        detail: target.subtitle || undefined,
        themeLabel: target.label,
        deltaE00: nb.de,
      });
    }
  }

  const sib = findSibling(current);
  if (sib) {
    items.push({
      label: 'Paired Light / Dark Variant',
      kind: sepKind,
    });
    items.push({
      label: sib.label,
      description: `${sib.mode === 'light' ? 'Light' : 'Dark'} sibling · ${sib.year} · ${sib.era} · ${sib.timeline}`,
      detail: sib.subtitle || undefined,
      themeLabel: sib.label,
    });
  }

  if (current.farthest) {
    const far = findBySlug(current.farthest.slug);
    if (far) {
      items.push({
        label: 'Maximum Chromatic Contrast (Farthest Polychromatic)',
        kind: sepKind,
      });
      items.push({
        label: far.label,
        description: `ΔE₀₀ ${Number(current.farthest.de).toFixed(1)} · ${far.mode === 'light' ? 'Light' : 'Dark'} · ${far.year} · ${far.era} · ${far.timeline}`,
        detail: far.subtitle || undefined,
        themeLabel: far.label,
        deltaE00: current.farthest.de,
      });
    }
  }

  return items;
}

function pickRandomTheme(currentLabel, options = {}) {
  const sameMode = typeof options === 'boolean' ? options : Boolean(options && options.sameMode);
  const rng = options && typeof options.rng === 'function' ? options.rng : Math.random;

  const currentEntry = findByLabel(currentLabel);
  let pool = themeMetadata;
  if (sameMode && currentEntry) {
    pool = themeMetadata.filter((t) => t.mode === currentEntry.mode);
  }
  const choices = pool.filter((t) => t.label !== currentLabel);
  const candidates = choices.length > 0 ? choices : pool;
  const rawRng = Number(rng());
  const safeRng = Number.isFinite(rawRng) ? rawRng : 0;
  const idx = Math.floor(safeRng * candidates.length);
  return candidates[Math.min(Math.max(idx, 0), candidates.length - 1)];
}

function buildWebviewHtmlFromSource(rawHtml, cspSource, nonce, initialThemeLabel) {
  const safeCspSource = escapeHtmlAttr(String(cspSource || '').replace(/[';,\x00-\x1f\x7f]/g, ''));
  const safeNonce = escapeHtmlAttr(String(nonce || '').replace(/[';,\s\x00-\x1f\x7f]/g, ''));
  const safeInitialTheme = escapeHtmlAttr(initialThemeLabel);
  const cspMeta = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${safeCspSource} data:; style-src 'unsafe-inline'; script-src 'nonce-${safeNonce}';" />`;

  let replacedCspMeta = false;
  let replacedInitialTheme = false;

  return String(rawHtml).replace(
    /\{\{CSP_META\}\}|\{\{CSP_NONCE\}\}|data-initial-theme=""/g,
    (match) => {
      if (match === '{{CSP_META}}') {
        if (replacedCspMeta) return match;
        replacedCspMeta = true;
        return cspMeta;
      }
      if (match === '{{CSP_NONCE}}') {
        return safeNonce;
      }
      if (match === 'data-initial-theme=""') {
        if (replacedInitialTheme) return match;
        replacedInitialTheme = true;
        return `data-initial-theme="${safeInitialTheme}"`;
      }
      return match;
    }
  );
}

function buildWebviewHtml(context, webview, initialThemeLabel) {
  const htmlPath = path.join(context.extensionPath, 'assets', 'explorer', 'explorer.html');
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const nonce = crypto.randomBytes(16).toString('base64');
  return buildWebviewHtmlFromSource(rawHtml, webview.cspSource, nonce, initialThemeLabel);
}

function activate(context) {
  let explorerPanel = null;

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = PICK_COMMAND_ID;
  statusBarItem.tooltip = 'Hylian Palette: pick a Zelda theme (live preview)';

  function updateStatusBarItem() {
    const currentLabel = vscode.workspace.getConfiguration('workbench').get('colorTheme');
    const entry = findByLabel(currentLabel);
    const visibility = vscode.workspace
      .getConfiguration('hylianPalette')
      .get('showStatusBarItem', 'always');

    statusBarItem.text = entry ? `$(symbol-color) ${entry.label}` : '$(symbol-color) Hylian Palette';
    if (shouldShowStatusBar(visibility, Boolean(entry))) {
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  }
  updateStatusBarItem();

  const configListener = vscode.workspace.onDidChangeConfiguration((e) => {
    const themeChanged = e.affectsConfiguration('workbench.colorTheme');
    const statusBarChanged = e.affectsConfiguration('hylianPalette.showStatusBarItem');
    if (themeChanged || statusBarChanged) {
      updateStatusBarItem();
    }
    if (themeChanged && explorerPanel) {
      const rawLabel = vscode.workspace.getConfiguration('workbench').get('colorTheme');
      const currentLabel = typeof rawLabel === 'string' ? rawLabel : '';
      explorerPanel.webview
        .postMessage({ type: 'activeThemeChanged', label: currentLabel })
        .then(undefined, () => {});
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
      const items = buildQuickPickItems(originalTheme, vscode.QuickPickItemKind.Separator);
      const activeItem = items.find((item) => item.themeLabel === originalTheme) || null;

      const qp = vscode.window.createQuickPick();
      qp.title = 'Hylian Palette — 18 Mainline Games · 36 Themes';
      qp.placeholder = 'Filter by game, era, timeline, or year · Arrow for live preview · Enter to keep · Esc to restore';
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
        try {
          const selected = qp.selectedItems && qp.selectedItems[0];
          if (selected && selected.themeLabel) {
            accepted = true;
            qp.hide();
            await setTheme(selected.themeLabel);
          }
        } catch (err) {
          vscode.window.showErrorMessage(
            `Hylian Palette: failed to apply theme -- ${err instanceof Error ? err.message : String(err)}`
          );
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

  const pickSimilarDisposable = vscode.commands.registerCommand(PICK_SIMILAR_COMMAND_ID, async () => {
    try {
      const originalTheme = vscode.workspace.getConfiguration('workbench').get('colorTheme');
      const currentEntry = findByLabel(originalTheme);
      if (!currentEntry) {
        vscode.window.showInformationMessage(
          'Hylian Palette: activate any Hylian Palette theme first to browse its nearest CIEDE2000 neighbors.'
        );
        await vscode.commands.executeCommand(PICK_COMMAND_ID);
        return;
      }

      const items = buildSimilarQuickPickItems(originalTheme, vscode.QuickPickItemKind.Separator);
      const firstSelectable = items.find((item) => item.themeLabel) || null;

      const qp = vscode.window.createQuickPick();
      qp.title = `Similar to ${currentEntry.label} (CIEDE2000 ΔE₀₀)`;
      qp.placeholder = 'Arrow for live preview · Enter to keep · Esc to restore';
      qp.matchOnDescription = true;
      qp.matchOnDetail = true;
      qp.items = items;
      if (firstSelectable) qp.activeItems = [firstSelectable];

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
        try {
          const selected = qp.selectedItems && qp.selectedItems[0];
          if (selected && selected.themeLabel) {
            accepted = true;
            qp.hide();
            await setTheme(selected.themeLabel);
          }
        } catch (err) {
          vscode.window.showErrorMessage(
            `Hylian Palette: failed to apply theme -- ${err instanceof Error ? err.message : String(err)}`
          );
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
        `Hylian Palette: failed to open similar-theme picker -- ${err instanceof Error ? err.message : String(err)}`
      );
    }
  });

  const randomDisposable = vscode.commands.registerCommand(RANDOM_COMMAND_ID, async () => {
    try {
      const currentLabel = vscode.workspace.getConfiguration('workbench').get('colorTheme');
      const pick = pickRandomTheme(currentLabel);
      await setTheme(pick.label);
      vscode.window.setStatusBarMessage(`Random theme: "${pick.label}"`, 3000);
    } catch (err) {
      vscode.window.showErrorMessage(
        `Hylian Palette: failed to pick a random theme -- ${err instanceof Error ? err.message : String(err)}`
      );
    }
  });

  const randomSameModeDisposable = vscode.commands.registerCommand(RANDOM_SAME_MODE_COMMAND_ID, async () => {
    try {
      const currentLabel = vscode.workspace.getConfiguration('workbench').get('colorTheme');
      const pick = pickRandomTheme(currentLabel, { sameMode: true });
      await setTheme(pick.label);
      vscode.window.setStatusBarMessage(`Random ${pick.mode} theme: "${pick.label}"`, 3000);
    } catch (err) {
      vscode.window.showErrorMessage(
        `Hylian Palette: failed to pick a random theme -- ${err instanceof Error ? err.message : String(err)}`
      );
    }
  });

  const syncOsPairDisposable = vscode.commands.registerCommand(SYNC_OS_PAIR_COMMAND_ID, async () => {
    try {
      const currentLabel = vscode.workspace.getConfiguration('workbench').get('colorTheme');
      const currentEntry = findByLabel(currentLabel);
      let pair = currentEntry ? findPairForGame(currentEntry) : null;

      if (!pair) {
        const gameItems = [];
        const seen = new Set();
        for (const entry of themeMetadata) {
          if (seen.has(entry.game)) continue;
          seen.add(entry.game);
          const candidatePair = findPairForGame(entry.game);
          if (!candidatePair) continue;
          gameItems.push({
            label: entry.game,
            description: `${entry.year} · ${entry.era} · ${entry.timeline}`,
            detail: `${candidatePair.light.label} ↔ ${candidatePair.dark.label}`,
            gameName: entry.game,
          });
        }

        const chosen = await vscode.window.showQuickPick(gameItems, {
          title: 'Hylian Palette — Sync OS Light/Dark Pair',
          placeHolder: 'Choose a Zelda game whose Light & Dark themes will follow your OS appearance',
          matchOnDescription: true,
          matchOnDetail: true,
        });
        if (!chosen) return;
        pair = findPairForGame(chosen.gameName || chosen.label);
      }

      if (!pair) {
        vscode.window.showErrorMessage('Hylian Palette: could not find both Light and Dark themes for that game.');
        return;
      }

      const workbenchConfig = vscode.workspace.getConfiguration('workbench');
      const windowConfig = vscode.workspace.getConfiguration('window');
      await workbenchConfig.update(
        'preferredLightColorTheme',
        pair.light.label,
        vscode.ConfigurationTarget.Global
      );
      await workbenchConfig.update(
        'preferredDarkColorTheme',
        pair.dark.label,
        vscode.ConfigurationTarget.Global
      );
      await windowConfig.update('autoDetectColorScheme', true, vscode.ConfigurationTarget.Global);

      vscode.window.showInformationMessage(
        `Hylian Palette: OS Light/Dark auto-switching synced to "${pair.light.label}" ↔ "${pair.dark.label}".`
      );
    } catch (err) {
      vscode.window.showErrorMessage(
        `Hylian Palette: failed to sync OS Light/Dark pair -- ${err instanceof Error ? err.message : String(err)}`
      );
    }
  });

  const explorerDisposable = vscode.commands.registerCommand(EXPLORER_COMMAND_ID, () => {
    let panel = null;
    try {
      const rawLabel = vscode.workspace.getConfiguration('workbench').get('colorTheme');
      const currentLabel = typeof rawLabel === 'string' ? rawLabel : '';
      if (explorerPanel) {
        explorerPanel.reveal(vscode.ViewColumn.Active);
        explorerPanel.webview.postMessage({ type: 'activeThemeChanged', label: currentLabel }).then(undefined, () => {});
        return;
      }

      panel = vscode.window.createWebviewPanel(
        'hylianPalette.explorer',
        'Hylian Palette Explorer',
        vscode.ViewColumn.Active,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'assets', 'explorer')],
        }
      );

      panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'icon.png');
      panel.webview.html = buildWebviewHtml(context, panel.webview, currentLabel);

      panel.webview.onDidReceiveMessage(
        async (msg) => {
          try {
            if (!msg || typeof msg !== 'object') return;
            if (msg.type === 'applyTheme' && typeof msg.label === 'string' && findByLabel(msg.label)) {
              await setTheme(msg.label);
            } else if (msg.type === 'copyText' && typeof msg.text === 'string') {
              await vscode.env.clipboard.writeText(msg.text);
            }
          } catch (err) {
            vscode.window.showErrorMessage(
              `Hylian Palette: failed to handle Explorer action -- ${err instanceof Error ? err.message : String(err)}`
            );
          }
        },
        undefined,
        context.subscriptions
      );

      panel.onDidDispose(
        () => {
          if (explorerPanel === panel) {
            explorerPanel = null;
          }
        },
        undefined,
        context.subscriptions
      );

      explorerPanel = panel;
    } catch (err) {
      if (panel && !explorerPanel) {
        try {
          panel.dispose();
        } catch {
          // Ignore secondary dispose errors during cleanup of a failed panel.
        }
      }
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
    pickSimilarDisposable,
    randomDisposable,
    randomSameModeDisposable,
    syncOsPairDisposable,
    explorerDisposable
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
  findByLabel,
  findBySlug,
  findSibling,
  findPairForGame,
  escapeHtmlAttr,
  shouldShowStatusBar,
  buildQuickPickItems,
  buildSimilarQuickPickItems,
  pickRandomTheme,
  buildWebviewHtmlFromSource,
};
