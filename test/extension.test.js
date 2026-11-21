'use strict';

const { describe, it, afterEach, after } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const EXTENSION_MODULE_PATH = require.resolve(path.join(REPO_ROOT, 'extension.js'));
const themeMetadata = require(path.join(REPO_ROOT, 'theme-metadata.json'));

const ORIGINAL_MODULE_LOAD = Module._load;

function createVscodeMock(initialSettings = {}) {
  const settings = new Map(
    Object.entries({
      'workbench.colorTheme': 'Wind Waker Light',
      'hylianPalette.showStatusBarItem': 'always',
      ...initialSettings,
    })
  );

  const configListeners = [];
  const commands = new Map();
  const updateCalls = [];
  const statusBarItems = [];
  const quickPicks = [];
  const webviewPanels = [];
  const infoMessages = [];
  const errorMessages = [];
  const statusBarMessages = [];
  const showQuickPickCalls = [];
  const clipboardWrites = [];
  let nextQuickPickResult = undefined;
  let failOnUpdate = null;
  let failOnClipboard = null;

  function makeConfigChangeEvent(changedKeys) {
    const keys = Array.isArray(changedKeys) ? changedKeys : [changedKeys];
    return {
      affectsConfiguration(section) {
        return keys.some(
          (k) => k === section || k.startsWith(`${section}.`) || section.startsWith(`${k}.`)
        );
      },
    };
  }

  function fireConfigChange(changedKeys) {
    const event = makeConfigChangeEvent(changedKeys);
    for (const listener of [...configListeners]) {
      listener(event);
    }
  }

  function setSetting(fullKey, value, { fireEvent = true } = {}) {
    settings.set(fullKey, value);
    if (fireEvent) {
      fireConfigChange(fullKey);
    }
  }

  function registerCommand(id, handler) {
    commands.set(id, handler);
    return {
      dispose() {
        if (commands.get(id) === handler) {
          commands.delete(id);
        }
      },
    };
  }

  const StatusBarAlignment = { Left: 1, Right: 2 };
  const ConfigurationTarget = { Global: 1, Workspace: 2, WorkspaceFolder: 3 };
  const ViewColumn = { Active: -1, Beside: -2, One: 1, Two: 2 };
  const QuickPickItemKind = { Separator: -1, Default: 0 };

  const Uri = {
    file(fsPath) {
      return {
        fsPath,
        path: fsPath,
        scheme: 'file',
        toString() {
          return `file://${fsPath}`;
        },
      };
    },
    joinPath(base, ...segments) {
      const basePath = (base && (base.fsPath || base.path)) || String(base || '');
      const joined = path.join(basePath, ...segments);
      return Uri.file(joined);
    },
  };

  const vscode = {
    StatusBarAlignment,
    ConfigurationTarget,
    ViewColumn,
    QuickPickItemKind,
    Uri,
    workspace: {
      getConfiguration(section) {
        const resolveKey = (key) => (section ? `${section}.${key}` : key);
        return {
          get(key, defaultValue) {
            const fullKey = resolveKey(key);
            if (settings.has(fullKey) && settings.get(fullKey) !== undefined) {
              return settings.get(fullKey);
            }
            return defaultValue;
          },
          has(key) {
            return settings.has(resolveKey(key));
          },
          update(key, value, target) {
            if (failOnUpdate) {
              return Promise.reject(failOnUpdate);
            }
            const fullKey = resolveKey(key);
            updateCalls.push({ section: section || '', key, fullKey, value, target });
            settings.set(fullKey, value);
            fireConfigChange(fullKey);
            return Promise.resolve();
          },
        };
      },
      onDidChangeConfiguration(listener, thisArgs, disposables) {
        const bound = thisArgs ? listener.bind(thisArgs) : listener;
        configListeners.push(bound);
        const disposable = {
          dispose() {
            const idx = configListeners.indexOf(bound);
            if (idx >= 0) configListeners.splice(idx, 1);
          },
        };
        if (Array.isArray(disposables)) disposables.push(disposable);
        return disposable;
      },
    },
    commands: {
      registerCommand,
      async executeCommand(id, ...args) {
        const handler = commands.get(id);
        if (!handler) {
          throw new Error(`Command not registered: ${id}`);
        }
        return handler(...args);
      },
    },
    window: {
      registerCommand,
      createStatusBarItem(...args) {
        let id;
        let alignment;
        let priority;
        if (typeof args[0] === 'string') {
          [id, alignment, priority] = args;
        } else {
          [alignment, priority] = args;
        }
        const item = {
          id,
          alignment,
          priority,
          text: '',
          command: undefined,
          tooltip: undefined,
          visible: false,
          disposed: false,
          show() {
            this.visible = true;
          },
          hide() {
            this.visible = false;
          },
          dispose() {
            this.disposed = true;
            this.visible = false;
          },
        };
        statusBarItems.push(item);
        return item;
      },
      createQuickPick() {
        const activeListeners = [];
        const acceptListeners = [];
        const hideListeners = [];
        let hideFired = false;

        const qp = {
          title: '',
          placeholder: '',
          matchOnDescription: false,
          matchOnDetail: false,
          items: [],
          activeItems: [],
          selectedItems: [],
          shown: false,
          hidden: false,
          disposed: false,
          onDidChangeActive(cb) {
            activeListeners.push(cb);
            return { dispose() {} };
          },
          onDidAccept(cb) {
            acceptListeners.push(cb);
            return { dispose() {} };
          },
          onDidHide(cb) {
            hideListeners.push(cb);
            return { dispose() {} };
          },
          show() {
            this.shown = true;
            this.hidden = false;
            hideFired = false;
          },
          hide() {
            if (hideFired) return;
            hideFired = true;
            this.hidden = true;
            for (const cb of [...hideListeners]) {
              cb();
            }
          },
          dispose() {
            this.disposed = true;
          },
          async _emitDidChangeActive(items) {
            this.activeItems = items;
            for (const cb of [...activeListeners]) {
              await cb(items);
            }
            await Promise.resolve();
          },
          async _emitDidAccept(selectedItems) {
            if (selectedItems !== undefined) {
              this.selectedItems = selectedItems;
              this.activeItems = selectedItems;
            }
            for (const cb of [...acceptListeners]) {
              await cb();
            }
            await Promise.resolve();
          },
          async _emitDidHide() {
            if (hideFired) return;
            hideFired = true;
            this.hidden = true;
            for (const cb of [...hideListeners]) {
              await cb();
            }
            await Promise.resolve();
          },
        };
        quickPicks.push(qp);
        return qp;
      },
      createWebviewPanel(viewType, title, showOptions, options) {
        const messageListeners = [];
        const disposeListeners = [];
        const webview = {
          cspSource: 'https://vscode-resource.mock',
          html: '',
          postedMessages: [],
          postMessage(msg) {
            this.postedMessages.push(msg);
            return Promise.resolve(true);
          },
          onDidReceiveMessage(cb, thisArgs, disposables) {
            const bound = thisArgs ? cb.bind(thisArgs) : cb;
            messageListeners.push(bound);
            const disp = { dispose() {} };
            if (Array.isArray(disposables)) disposables.push(disp);
            return disp;
          },
          async _emitDidReceiveMessage(msg) {
            for (const cb of [...messageListeners]) {
              await cb(msg);
            }
          },
        };
        const panel = {
          viewType,
          title,
          showOptions,
          options,
          iconPath: undefined,
          webview,
          revealCount: 0,
          disposed: false,
          reveal() {
            this.revealCount += 1;
          },
          onDidDispose(cb, thisArgs, disposables) {
            const bound = thisArgs ? cb.bind(thisArgs) : cb;
            disposeListeners.push(bound);
            const disp = { dispose() {} };
            if (Array.isArray(disposables)) disposables.push(disp);
            return disp;
          },
          dispose() {
            if (this.disposed) return;
            this.disposed = true;
            for (const cb of [...disposeListeners]) {
              cb();
            }
          },
        };
        webviewPanels.push(panel);
        return panel;
      },
      showInformationMessage(msg, ...items) {
        infoMessages.push({ msg, items });
        return Promise.resolve(undefined);
      },
      showErrorMessage(msg, ...items) {
        errorMessages.push({ msg, items });
        return Promise.resolve(undefined);
      },
      setStatusBarMessage(text, timeout) {
        statusBarMessages.push({ text, timeout });
        return { dispose() {} };
      },
      showQuickPick(items, options) {
        showQuickPickCalls.push({ items, options });
        const result =
          typeof nextQuickPickResult === 'function'
            ? nextQuickPickResult(items, options)
            : nextQuickPickResult;
        return Promise.resolve(result);
      },
    },
    env: {
      clipboard: {
        writeText(text) {
          if (failOnClipboard) {
            return Promise.reject(failOnClipboard);
          }
          clipboardWrites.push(text);
          return Promise.resolve();
        },
      },
    },
  };

  return {
    vscode,
    settings,
    commands,
    updateCalls,
    statusBarItems,
    quickPicks,
    webviewPanels,
    infoMessages,
    errorMessages,
    statusBarMessages,
    showQuickPickCalls,
    clipboardWrites,
    setSetting,
    fireConfigChange,
    setNextQuickPickResult(val) {
      nextQuickPickResult = val;
    },
    setFailOnUpdate(err) {
      failOnUpdate = err;
    },
    setFailOnClipboard(err) {
      failOnClipboard = err;
    },
  };
}

function setupExtension(initialSettings = {}, { extensionPath = REPO_ROOT } = {}) {
  const mock = createVscodeMock(initialSettings);

  Module._load = function mockedLoad(request, parent, isMain) {
    if (request === 'vscode') {
      return mock.vscode;
    }
    return ORIGINAL_MODULE_LOAD.call(this, request, parent, isMain);
  };

  delete require.cache[EXTENSION_MODULE_PATH];
  const ext = require(EXTENSION_MODULE_PATH);

  const context = {
    extensionPath,
    extensionUri: mock.vscode.Uri.file(extensionPath),
    subscriptions: [],
  };

  ext.activate(context);

  return {
    ext,
    mock,
    context,
    invokeCommand: (id, ...args) => mock.vscode.commands.executeCommand(id, ...args),
  };
}

afterEach(() => {
  Module._load = ORIGINAL_MODULE_LOAD;
  delete require.cache[EXTENSION_MODULE_PATH];
});

after(() => {
  Module._load = ORIGINAL_MODULE_LOAD;
});

describe('extension: activation & command registration', () => {
  it('registers all 8 commands (7 hylianPalette.* + hidden legacy windwakerMajora.toggleTheme), 10 initial subscriptions, and displays the status bar badge', () => {
    const { mock, context } = setupExtension({ 'workbench.colorTheme': 'Wind Waker Light' });

    const expectedCommands = [
      'hylianPalette.toggleTheme',
      'windwakerMajora.toggleTheme',
      'hylianPalette.pickTheme',
      'hylianPalette.pickSimilarTheme',
      'hylianPalette.randomTheme',
      'hylianPalette.randomThemeSameMode',
      'hylianPalette.syncOsThemePair',
      'hylianPalette.openExplorer',
    ];

    assert.equal(mock.commands.size, 8);
    for (const id of expectedCommands) {
      assert.equal(typeof mock.commands.get(id), 'function', `Expected command "${id}" to be registered`);
    }

    assert.equal(context.subscriptions.length, 10);
    assert.equal(mock.statusBarItems.length, 1);
    const badge = mock.statusBarItems[0];
    assert.equal(badge.visible, true);
    assert.equal(badge.command, 'hylianPalette.pickTheme');
    assert.equal(badge.text, '$(symbol-color) Wind Waker Light');
    assert.equal(badge.tooltip, 'Hylian Palette: pick a Zelda theme (live preview)');
  });
});

describe('extension: pickSimilarTheme', () => {
  it('lists 6 ascending CIEDE2000 neighbors, paired Light/Dark sibling, and farthest polychromatic theme with live preview + Esc rollback', async () => {
    const { mock, invokeCommand } = setupExtension({ 'workbench.colorTheme': 'Wind Waker Dark' });

    await invokeCommand('hylianPalette.pickSimilarTheme');
    assert.equal(mock.quickPicks.length, 1);
    const qp = mock.quickPicks[0];
    assert.equal(qp.shown, true);
    assert.equal(qp.title, 'Similar to Wind Waker Dark (CIEDE2000 ΔE₀₀)');
    assert.equal(qp.items.length, 11);

    const separators = qp.items.filter((i) => i.kind === mock.vscode.QuickPickItemKind.Separator);
    assert.equal(separators.length, 3);
    assert.equal(separators[0].label, 'Nearest Chromatic Siblings to Wind Waker Dark (CIEDE2000 ΔE₀₀)');
    assert.equal(separators[1].label, 'Paired Light / Dark Variant');
    assert.equal(separators[2].label, 'Maximum Chromatic Contrast (Farthest Polychromatic)');

    const selectable = qp.items.filter((i) => i.themeLabel);
    assert.equal(selectable.length, 8);
    const neighborItems = selectable.slice(0, 6);
    assert.equal(neighborItems[0].themeLabel, 'Phantom Hourglass Dark');
    assert.equal(neighborItems[0].deltaE00, 2.3);
    assert.ok(neighborItems[0].description.includes('ΔE₀₀ 2.3 · Dark · 2007 · Nintendo DS · Adult'));
    for (let i = 1; i < neighborItems.length; i++) {
      assert.ok(neighborItems[i].deltaE00 >= neighborItems[i - 1].deltaE00);
    }

    assert.equal(selectable[6].themeLabel, 'Wind Waker Light');
    assert.ok(selectable[6].description.includes('Light sibling · 2002 · N64 & GameCube · Adult'));

    assert.equal(selectable[7].themeLabel, 'Zelda II Dark');
    assert.notEqual(selectable[7].themeLabel, "Link's Awakening Dark");
    assert.equal(selectable[7].deltaE00, 28.5);
    assert.ok(selectable[7].description.includes('ΔE₀₀ 28.5 · Dark · 1987 · 8-bit & 16-bit · Downfall'));

    // Live preview + Esc rollback
    await qp._emitDidChangeActive([neighborItems[0]]);
    assert.equal(mock.settings.get('workbench.colorTheme'), 'Phantom Hourglass Dark');
    await qp._emitDidHide();
    assert.equal(qp.disposed, true);
    assert.equal(mock.settings.get('workbench.colorTheme'), 'Wind Waker Dark');

    // Highlighting a separator and pressing Esc without previewing emits zero config writes
    const updatesBeforeSep = mock.updateCalls.length;
    await invokeCommand('hylianPalette.pickSimilarTheme');
    const qpSep = mock.quickPicks[1];
    const sepItem = qpSep.items.find((i) => i.kind === mock.vscode.QuickPickItemKind.Separator);
    assert.ok(sepItem);
    await qpSep._emitDidChangeActive([sepItem]);
    await qpSep._emitDidHide();
    assert.equal(qpSep.disposed, true);
    assert.equal(mock.updateCalls.length, updatesBeforeSep);
    assert.equal(mock.settings.get('workbench.colorTheme'), 'Wind Waker Dark');
  });

  it("commits accepted similar theme, handles Link's Awakening Dark outlier isolation, and falls back to pickTheme on external themes", async () => {
    const { ext, mock, invokeCommand } = setupExtension({ 'workbench.colorTheme': 'Ocarina of Time Light' });

    await invokeCommand('hylianPalette.pickSimilarTheme');
    const qp = mock.quickPicks[0];
    const firstNeighbor = qp.items.find((i) => i.themeLabel);
    assert.equal(firstNeighbor.themeLabel, 'The Minish Cap Light');
    await qp._emitDidChangeActive([firstNeighbor]);
    await qp._emitDidAccept([firstNeighbor]);
    assert.equal(mock.settings.get('workbench.colorTheme'), 'The Minish Cap Light');

    // Link's Awakening Dark monochrome outlier isolation
    mock.setSetting('workbench.colorTheme', "Link's Awakening Dark");
    await invokeCommand('hylianPalette.pickSimilarTheme');
    const dmgQp = mock.quickPicks[1];
    const dmgSelectable = dmgQp.items.filter((i) => i.themeLabel);
    assert.equal(dmgSelectable.length, 8);
    assert.equal(dmgSelectable[0].themeLabel, 'Twilight Princess Dark');
    assert.equal(dmgSelectable[0].deltaE00, 31.8);
    assert.equal(dmgSelectable[6].themeLabel, "Link's Awakening Light");
    assert.equal(dmgSelectable[7].themeLabel, 'Zelda II Dark');
    assert.equal(dmgSelectable[7].deltaE00, 45.3);

    // None of the 17 polychromatic Dark themes ever list Link's Awakening Dark as farthest
    for (const entry of themeMetadata.filter((t) => t.mode === 'dark' && t.slug !== 'linksawakening-dark')) {
      const items = ext.buildSimilarQuickPickItems(entry.label, mock.vscode.QuickPickItemKind.Separator);
      const selectable = items.filter((i) => i.themeLabel);
      assert.notEqual(
        selectable[selectable.length - 1].themeLabel,
        "Link's Awakening Dark",
        `${entry.label} farthest must be polychromatic`
      );
    }

    // External theme falls back to pickTheme with an info message
    mock.setSetting('workbench.colorTheme', 'Default Dark+');
    await invokeCommand('hylianPalette.pickSimilarTheme');
    assert.ok(mock.infoMessages.some((m) => String(m.msg).includes('activate any Hylian Palette theme')));
    assert.equal(mock.quickPicks.length, 3);
    assert.equal(mock.quickPicks[2].title, 'Hylian Palette — 18 Mainline Games · 36 Themes');
  });

  it('contains async apply errors in pickSimilarTheme onDidAccept without unhandled rejections (D3)', async () => {
    const { mock, invokeCommand } = setupExtension({ 'workbench.colorTheme': 'Wind Waker Dark' });

    await invokeCommand('hylianPalette.pickSimilarTheme');
    const qp = mock.quickPicks[0];
    const firstNeighbor = qp.items.find((i) => i.themeLabel);

    mock.setFailOnUpdate(new Error('disk readonly'));
    await qp._emitDidAccept([firstNeighbor]);

    assert.equal(mock.errorMessages.length, 1);
    assert.ok(
      mock.errorMessages[0].msg.includes('Hylian Palette: failed to apply theme -- disk readonly'),
      `Unexpected error message: ${mock.errorMessages[0].msg}`
    );
  });
});

describe('extension: toggleTheme & legacy windwakerMajora.toggleTheme', () => {
  it("flips Ocarina of Time, Majora's Mask, Zelda II, and Link's Awakening Light <-> Dark pairs", async () => {
    const { mock, invokeCommand } = setupExtension({ 'workbench.colorTheme': 'Ocarina of Time Light' });

    const pairs = [
      ['Ocarina of Time Light', 'Ocarina of Time Dark'],
      ["Majora's Mask Dark", "Majora's Mask Light"],
      ['Zelda II Light', 'Zelda II Dark'],
      ["Link's Awakening Dark", "Link's Awakening Light"],
    ];

    for (const [start, toggled] of pairs) {
      mock.setSetting('workbench.colorTheme', start);
      await invokeCommand('hylianPalette.toggleTheme');
      assert.equal(mock.settings.get('workbench.colorTheme'), toggled);
      await invokeCommand('hylianPalette.toggleTheme');
      assert.equal(mock.settings.get('workbench.colorTheme'), start);
    }
  });

  it('supports hidden legacy windwakerMajora.toggleTheme command identically to hylianPalette.toggleTheme', async () => {
    const { mock, invokeCommand } = setupExtension({ 'workbench.colorTheme': 'Wind Waker Light' });

    await invokeCommand('windwakerMajora.toggleTheme');
    assert.equal(mock.settings.get('workbench.colorTheme'), 'Wind Waker Dark');
    assert.ok(
      mock.statusBarMessages.some(
        (m) => m.text === 'Theme switched to "Wind Waker Dark"' && m.timeout === 3000
      )
    );

    await invokeCommand('windwakerMajora.toggleTheme');
    assert.equal(mock.settings.get('workbench.colorTheme'), 'Wind Waker Light');

    mock.setSetting('workbench.colorTheme', "Majora's Mask Dark");
    await invokeCommand('windwakerMajora.toggleTheme');
    assert.equal(mock.settings.get('workbench.colorTheme'), "Majora's Mask Light");
  });

  it('falls back to Wind Waker Light when active theme is external', async () => {
    const { mock, invokeCommand } = setupExtension({ 'workbench.colorTheme': 'Default Dark+' });

    await invokeCommand('hylianPalette.toggleTheme');
    assert.equal(mock.settings.get('workbench.colorTheme'), 'Wind Waker Light');
    assert.equal(mock.errorMessages.length, 0);

    mock.setSetting('workbench.colorTheme', 'Default Light+');
    await invokeCommand('windwakerMajora.toggleTheme');
    assert.equal(mock.settings.get('workbench.colorTheme'), 'Wind Waker Light');
    assert.equal(mock.errorMessages.length, 0);

    // Async config write failure is contained with an error toast (no unhandled rejection)
    mock.setFailOnUpdate(new Error('toggle write blocked'));
    await invokeCommand('hylianPalette.toggleTheme');
    assert.ok(
      mock.errorMessages.some((m) =>
        m.msg.includes('Hylian Palette: failed to toggle theme -- toggle write blocked')
      )
    );
  });
});

describe('extension: showStatusBarItem setting', () => {
  it('shows badge for "always" even when an external theme is active', () => {
    const { mock } = setupExtension({
      'workbench.colorTheme': 'Default Dark+',
      'hylianPalette.showStatusBarItem': 'always',
    });

    const badge = mock.statusBarItems[0];
    assert.equal(badge.visible, true);
    assert.equal(badge.text, '$(symbol-color) Hylian Palette');
  });

  it('hides badge for "whenActive" on external themes and shows it when a Hylian Palette theme is active', () => {
    const { mock } = setupExtension({
      'workbench.colorTheme': 'Default Dark+',
      'hylianPalette.showStatusBarItem': 'whenActive',
    });

    const badge = mock.statusBarItems[0];
    assert.equal(badge.visible, false);

    mock.setSetting('workbench.colorTheme', 'Tears of the Kingdom Dark');
    assert.equal(badge.visible, true);
    assert.ok(badge.text.includes('Tears of the Kingdom Dark'));

    mock.setSetting('workbench.colorTheme', 'Default Light+');
    assert.equal(badge.visible, false);
  });

  it('always hides badge for "never", responds to live config changes, and emits zero spurious activeThemeChanged webview messages', async () => {
    const { mock, invokeCommand } = setupExtension({
      'workbench.colorTheme': 'Wind Waker Light',
      'hylianPalette.showStatusBarItem': 'never',
    });

    const badge = mock.statusBarItems[0];
    assert.equal(badge.visible, false);

    await invokeCommand('hylianPalette.openExplorer');
    const panel = mock.webviewPanels[0];

    mock.setSetting('hylianPalette.showStatusBarItem', 'always');
    assert.equal(badge.visible, true);
    mock.setSetting('hylianPalette.showStatusBarItem', 'never');
    assert.equal(badge.visible, false);
    mock.setSetting('hylianPalette.showStatusBarItem', 'always');
    assert.equal(badge.visible, true);

    assert.equal(panel.webview.postedMessages.length, 0);

    mock.setSetting('workbench.colorTheme', 'Echoes of Wisdom Dark');
    mock.setSetting('workbench.colorTheme', undefined);
    mock.setSetting('workbench.colorTheme', null);
    assert.deepEqual(panel.webview.postedMessages, [
      { type: 'activeThemeChanged', label: 'Echoes of Wisdom Dark' },
      { type: 'activeThemeChanged', label: '' },
      { type: 'activeThemeChanged', label: '' },
    ]);

    // Reveal with non-string workbench.colorTheme also normalizes strictly to ''
    mock.setSetting('workbench.colorTheme', 123, { fireEvent: false });
    await invokeCommand('hylianPalette.openExplorer');
    assert.deepEqual(panel.webview.postedMessages[panel.webview.postedMessages.length - 1], {
      type: 'activeThemeChanged',
      label: '',
    });
  });
});

describe('extension: pickTheme', () => {
  it('builds 54 items (18 chronological game separators + 36 Light-before-Dark themes) from The Legend of Zelda Light to Echoes of Wisdom Dark with year, era & timeline descriptions', async () => {
    const { mock, invokeCommand } = setupExtension({ 'workbench.colorTheme': 'Wind Waker Light' });

    await invokeCommand('hylianPalette.pickTheme');
    assert.equal(mock.quickPicks.length, 1);

    const qp = mock.quickPicks[0];
    assert.equal(qp.shown, true);
    assert.equal(qp.title, 'Hylian Palette — 18 Mainline Games · 36 Themes');
    assert.equal(qp.matchOnDescription, true);
    assert.equal(qp.matchOnDetail, true);

    const separators = qp.items.filter((i) => i.kind === mock.vscode.QuickPickItemKind.Separator);
    const themeItems = qp.items.filter((i) => i.kind !== mock.vscode.QuickPickItemKind.Separator);

    assert.equal(separators.length, 18);
    assert.equal(themeItems.length, 36);
    assert.equal(qp.items.length, 54);

    const metaByLabel = new Map(themeMetadata.map((m) => [m.label, m]));
    let prevYear = 0;
    for (let i = 0; i < themeItems.length; i += 2) {
      const lightItem = themeItems[i];
      const darkItem = themeItems[i + 1];
      const lightMeta = metaByLabel.get(lightItem.themeLabel);
      const darkMeta = metaByLabel.get(darkItem.themeLabel);

      assert.ok(lightMeta && darkMeta);
      assert.equal(lightMeta.mode, 'light');
      assert.equal(darkMeta.mode, 'dark');
      assert.equal(lightMeta.game, darkMeta.game);
      assert.ok(lightMeta.year >= prevYear, `Non-chronological order: ${lightMeta.game} (${lightMeta.year}) after ${prevYear}`);
      prevYear = lightMeta.year;

      for (const [item, entry] of [
        [lightItem, lightMeta],
        [darkItem, darkMeta],
      ]) {
        assert.ok(item.description.includes(String(entry.year)), `Missing year in "${item.description}"`);
        assert.ok(item.description.includes(entry.era), `Missing era in "${item.description}"`);
        assert.ok(item.description.includes(entry.timeline), `Missing timeline in "${item.description}"`);
      }
    }

    assert.equal(themeItems[0].themeLabel, 'The Legend of Zelda Light');
    assert.equal(themeItems[35].themeLabel, 'Echoes of Wisdom Dark');
    assert.equal(qp.activeItems[0].themeLabel, 'Wind Waker Light');
    assert.ok(qp.activeItems[0].description.includes('$(check) Active'));
  });

  it('live-previews highlighted themes on onDidChangeActive and rolls back on Esc (onDidHide without accept)', async () => {
    const { mock, invokeCommand } = setupExtension({ 'workbench.colorTheme': 'Wind Waker Light' });

    await invokeCommand('hylianPalette.pickTheme');
    const qp = mock.quickPicks[0];

    const previewTarget = qp.items.find((i) => i.themeLabel === 'Tears of the Kingdom Dark');
    assert.ok(previewTarget);

    await qp._emitDidChangeActive([previewTarget]);
    assert.equal(mock.settings.get('workbench.colorTheme'), 'Tears of the Kingdom Dark');

    await qp._emitDidHide();
    assert.equal(qp.disposed, true);
    assert.equal(mock.settings.get('workbench.colorTheme'), 'Wind Waker Light');

    // Highlighting a separator and pressing Esc without previewing emits zero config writes
    const updatesBeforeNoOp = mock.updateCalls.length;
    await invokeCommand('hylianPalette.pickTheme');
    const qpNoOp = mock.quickPicks[1];
    const firstSep = qpNoOp.items.find((i) => i.kind === mock.vscode.QuickPickItemKind.Separator);
    assert.ok(firstSep);
    await qpNoOp._emitDidChangeActive([firstSep]);
    await qpNoOp._emitDidHide();
    assert.equal(qpNoOp.disposed, true);
    assert.equal(mock.updateCalls.length, updatesBeforeNoOp);
  });

  it('commits the accepted theme on onDidAccept without rolling back on hide', async () => {
    const { mock, invokeCommand } = setupExtension({ 'workbench.colorTheme': 'Wind Waker Light' });

    await invokeCommand('hylianPalette.pickTheme');
    const qp = mock.quickPicks[0];

    const chosen = qp.items.find((i) => i.themeLabel === 'Twilight Princess Dark');
    assert.ok(chosen);

    await qp._emitDidChangeActive([chosen]);
    await qp._emitDidAccept([chosen]);
    assert.equal(qp.disposed, true);
    assert.equal(mock.settings.get('workbench.colorTheme'), 'Twilight Princess Dark');
  });

  it('contains async apply errors in pickTheme onDidAccept without unhandled rejections (D3)', async () => {
    const { mock, invokeCommand } = setupExtension({ 'workbench.colorTheme': 'Wind Waker Light' });

    await invokeCommand('hylianPalette.pickTheme');
    const qp = mock.quickPicks[0];
    const chosen = qp.items.find((i) => i.themeLabel === 'Twilight Princess Dark');

    mock.setFailOnUpdate(new Error('settings locked'));
    await qp._emitDidAccept([chosen]);

    assert.equal(mock.errorMessages.length, 1);
    assert.ok(
      mock.errorMessages[0].msg.includes('Hylian Palette: failed to apply theme -- settings locked'),
      `Unexpected error message: ${mock.errorMessages[0].msg}`
    );
  });
});

describe('extension: randomTheme & randomThemeSameMode', () => {
  it('randomTheme never selects the currently active theme', async () => {
    const { mock, invokeCommand } = setupExtension({ 'workbench.colorTheme': 'Wind Waker Light' });
    const validLabels = new Set(themeMetadata.map((t) => t.label));

    for (let i = 0; i < 30; i++) {
      const before = mock.settings.get('workbench.colorTheme');
      await invokeCommand('hylianPalette.randomTheme');
      const afterTheme = mock.settings.get('workbench.colorTheme');
      assert.ok(validLabels.has(afterTheme), `Expected valid theme label, got "${afterTheme}"`);
      assert.notEqual(afterTheme, before, 'randomTheme should never re-select the active theme');
      const lastToast = mock.statusBarMessages[mock.statusBarMessages.length - 1];
      assert.equal(lastToast.text, `Random theme: "${afterTheme}"`);
      assert.equal(lastToast.timeout, 3000);
    }

    mock.setFailOnUpdate(new Error('random write blocked'));
    await invokeCommand('hylianPalette.randomTheme');
    assert.ok(
      mock.errorMessages.some((m) =>
        m.msg.includes('Hylian Palette: failed to pick a random theme -- random write blocked')
      )
    );
  });

  it('randomThemeSameMode preserves polarity on dark/light themes and falls back cleanly on external themes', async () => {
    const { mock, invokeCommand } = setupExtension({ 'workbench.colorTheme': 'Tears of the Kingdom Dark' });
    const metaByLabel = new Map(themeMetadata.map((t) => [t.label, t]));

    for (let i = 0; i < 20; i++) {
      const before = mock.settings.get('workbench.colorTheme');
      await invokeCommand('hylianPalette.randomThemeSameMode');
      const next = mock.settings.get('workbench.colorTheme');
      const entry = metaByLabel.get(next);
      assert.ok(entry, `Expected valid Hylian Palette theme, got "${next}"`);
      assert.equal(entry.mode, 'dark', `Expected dark theme, got "${next}" (${entry.mode})`);
      assert.notEqual(next, before);
      const lastToast = mock.statusBarMessages[mock.statusBarMessages.length - 1];
      assert.equal(lastToast.text, `Random ${entry.mode} theme: "${next}"`);
      assert.equal(lastToast.timeout, 3000);
    }

    mock.setSetting('workbench.colorTheme', 'Ocarina of Time Light');
    for (let i = 0; i < 20; i++) {
      const before = mock.settings.get('workbench.colorTheme');
      await invokeCommand('hylianPalette.randomThemeSameMode');
      const next = mock.settings.get('workbench.colorTheme');
      const entry = metaByLabel.get(next);
      assert.ok(entry, `Expected valid Hylian Palette theme, got "${next}"`);
      assert.equal(entry.mode, 'light', `Expected light theme, got "${next}" (${entry.mode})`);
      assert.notEqual(next, before);
      const lastToast = mock.statusBarMessages[mock.statusBarMessages.length - 1];
      assert.equal(lastToast.text, `Random ${entry.mode} theme: "${next}"`);
      assert.equal(lastToast.timeout, 3000);
    }

    // External theme falls back to full 36-theme pool cleanly
    mock.setSetting('workbench.colorTheme', 'Default Dark+');
    await invokeCommand('hylianPalette.randomThemeSameMode');
    const fallbackPick = mock.settings.get('workbench.colorTheme');
    assert.ok(metaByLabel.has(fallbackPick));
    assert.equal(mock.errorMessages.length, 0);

    mock.setFailOnUpdate(new Error('same-mode write blocked'));
    await invokeCommand('hylianPalette.randomThemeSameMode');
    assert.ok(
      mock.errorMessages.some((m) =>
        m.msg.includes('Hylian Palette: failed to pick a random theme -- same-mode write blocked')
      )
    );
  });

  it('pickRandomTheme guards non-finite RNG values safely (N1)', () => {
    const { ext } = setupExtension();
    for (const val of [NaN, Infinity, -Infinity, -10, 999]) {
      const pick = ext.pickRandomTheme('Wind Waker Light', { rng: () => val });
      assert.ok(pick && typeof pick.label === 'string');
      assert.notEqual(pick.label, 'Wind Waker Light');
    }

    // Boolean shorthand for sameMode preserves polarity without repeating current theme
    for (let i = 0; i < 25; i++) {
      const pick = ext.pickRandomTheme('Wind Waker Light', true);
      assert.ok(pick && typeof pick.label === 'string');
      assert.equal(pick.mode, 'light');
      assert.notEqual(pick.label, 'Wind Waker Light');
    }
  });
});

describe('extension: syncOsThemePair', () => {
  it('syncs preferredLightColorTheme, preferredDarkColorTheme, and autoDetectColorScheme globally including Wind Waker & Zelda II label-vs-game resolution', async () => {
    const { mock, invokeCommand } = setupExtension({
      'workbench.colorTheme': 'Tears of the Kingdom Dark',
    });

    await invokeCommand('hylianPalette.syncOsThemePair');

    assert.equal(mock.settings.get('workbench.preferredLightColorTheme'), 'Tears of the Kingdom Light');
    assert.equal(mock.settings.get('workbench.preferredDarkColorTheme'), 'Tears of the Kingdom Dark');
    assert.equal(mock.settings.get('window.autoDetectColorScheme'), true);

    const lightUpdate = mock.updateCalls.find((c) => c.fullKey === 'workbench.preferredLightColorTheme');
    const darkUpdate = mock.updateCalls.find((c) => c.fullKey === 'workbench.preferredDarkColorTheme');
    const autoUpdate = mock.updateCalls.find((c) => c.fullKey === 'window.autoDetectColorScheme');
    assert.equal(lightUpdate.target, mock.vscode.ConfigurationTarget.Global);
    assert.equal(darkUpdate.target, mock.vscode.ConfigurationTarget.Global);
    assert.equal(autoUpdate.target, mock.vscode.ConfigurationTarget.Global);
    assert.equal(mock.infoMessages.length, 1);
    assert.equal(mock.errorMessages.length, 0);

    // Wind Waker Dark (game: "The Wind Waker")
    mock.setSetting('workbench.colorTheme', 'Wind Waker Dark');
    await invokeCommand('hylianPalette.syncOsThemePair');
    assert.equal(mock.settings.get('workbench.preferredLightColorTheme'), 'Wind Waker Light');
    assert.equal(mock.settings.get('workbench.preferredDarkColorTheme'), 'Wind Waker Dark');

    // Zelda II Dark (game: "Zelda II: The Adventure of Link")
    mock.setSetting('workbench.colorTheme', 'Zelda II Dark');
    await invokeCommand('hylianPalette.syncOsThemePair');
    assert.equal(mock.settings.get('workbench.preferredLightColorTheme'), 'Zelda II Light');
    assert.equal(mock.settings.get('workbench.preferredDarkColorTheme'), 'Zelda II Dark');

    // Async config write failure is contained cleanly without unhandled rejection
    mock.setFailOnUpdate(new Error('sync write blocked'));
    await invokeCommand('hylianPalette.syncOsThemePair');
    assert.ok(
      mock.errorMessages.some((m) =>
        m.msg.includes('Hylian Palette: failed to sync OS Light/Dark pair -- sync write blocked')
      )
    );
  });

  it('prompts via 18-game chronological QuickPick when active theme is external and syncs chosen game pair', async () => {
    const { mock, invokeCommand } = setupExtension({
      'workbench.colorTheme': 'Default Dark+',
    });

    mock.setNextQuickPickResult((items) => items.find((i) => i.label === 'Zelda II: The Adventure of Link'));
    await invokeCommand('hylianPalette.syncOsThemePair');

    assert.equal(mock.showQuickPickCalls.length, 1);
    const items = mock.showQuickPickCalls[0].items;
    assert.equal(items.length, 18);
    assert.equal(items[0].label, 'The Legend of Zelda');
    assert.equal(items[items.length - 1].label, 'Echoes of Wisdom');

    assert.equal(mock.settings.get('workbench.preferredLightColorTheme'), 'Zelda II Light');
    assert.equal(mock.settings.get('workbench.preferredDarkColorTheme'), 'Zelda II Dark');
    assert.equal(mock.settings.get('window.autoDetectColorScheme'), true);
  });

  it('exits silently without modifying settings when external game QuickPick is canceled', async () => {
    const { mock, invokeCommand } = setupExtension({
      'workbench.colorTheme': 'Default Dark+',
    });

    mock.setNextQuickPickResult(undefined);
    await invokeCommand('hylianPalette.syncOsThemePair');

    assert.equal(mock.updateCalls.length, 0);
    assert.equal(mock.infoMessages.length, 0);
    assert.equal(mock.errorMessages.length, 0);
  });
});

describe('extension: openExplorer', () => {
  it("injects strict nonce CSP3, preserves apostrophes on Link's Awakening Dark, escapes malicious labels, reveals existing panel, and rotates nonce on reopen", async () => {
    const { mock, invokeCommand } = setupExtension({
      'workbench.colorTheme': "Link's Awakening Dark",
    });

    await invokeCommand('hylianPalette.openExplorer');
    assert.equal(mock.webviewPanels.length, 1);

    const panel = mock.webviewPanels[0];
    assert.equal(panel.options.enableScripts, true);
    assert.equal(panel.options.retainContextWhenHidden, true);
    assert.equal(panel.options.localResourceRoots.length, 1);
    assert.ok(
      panel.options.localResourceRoots[0].fsPath.endsWith(path.join('assets', 'explorer')),
      `Unexpected localResourceRoots[0]: ${panel.options.localResourceRoots[0].fsPath}`
    );
    assert.ok(
      panel.iconPath && panel.iconPath.fsPath.endsWith('icon.png'),
      `Unexpected panel.iconPath: ${panel.iconPath && panel.iconPath.fsPath}`
    );

    const html = panel.webview.html;
    assert.ok(!html.includes('{{CSP_META}}'));
    assert.ok(!html.includes('{{CSP_NONCE}}'));
    assert.ok(html.includes('<meta http-equiv="Content-Security-Policy"'));
    assert.ok(html.includes("default-src 'none'"));

    const nonceMatch = html.match(/script-src 'nonce-([^']+)'/);
    assert.ok(nonceMatch && nonceMatch[1].length >= 16, 'Expected non-empty random CSP nonce');
    const firstNonce = nonceMatch[1];
    assert.ok(html.includes(`<script nonce="${firstNonce}">`));
    assert.ok(
      html.includes('data-initial-theme="Link\'s Awakening Dark"'),
      'Expected literal apostrophe to be preserved in data-initial-theme'
    );

    // Second invocation while open reveals existing panel and posts activeThemeChanged
    await invokeCommand('hylianPalette.openExplorer');
    assert.equal(mock.webviewPanels.length, 1);
    assert.equal(panel.revealCount, 1);
    assert.deepEqual(panel.webview.postedMessages, [
      { type: 'activeThemeChanged', label: "Link's Awakening Dark" },
    ]);

    // Dispose and reopen with malicious label -> fresh panel, rotated nonce, HTML-escaped attribute
    panel.dispose();
    const maliciousLabel = 'Fake "Theme" <script>&</script>';
    mock.setSetting('workbench.colorTheme', maliciousLabel);
    await invokeCommand('hylianPalette.openExplorer');

    assert.equal(mock.webviewPanels.length, 2);
    const secondHtml = mock.webviewPanels[1].webview.html;
    const secondNonceMatch = secondHtml.match(/script-src 'nonce-([^']+)'/);
    assert.ok(secondNonceMatch && secondNonceMatch[1].length >= 16);
    assert.notEqual(secondNonceMatch[1], firstNonce);
    assert.ok(
      secondHtml.includes('data-initial-theme="Fake &quot;Theme&quot; &lt;script&gt;&amp;&lt;/script&gt;"')
    );
    assert.ok(!secondHtml.includes(`data-initial-theme="${maliciousLabel}"`));
  });

  it('handles applyTheme validation, copyText clipboard writes, and contains async message handler errors (D3)', async () => {
    const { mock, invokeCommand } = setupExtension({ 'workbench.colorTheme': 'Wind Waker Light' });

    await invokeCommand('hylianPalette.openExplorer');
    const panel = mock.webviewPanels[0];

    await panel.webview._emitDidReceiveMessage({ type: 'applyTheme', label: 'Ocarina of Time Dark' });
    assert.equal(mock.settings.get('workbench.colorTheme'), 'Ocarina of Time Dark');

    const updatesBefore = mock.updateCalls.length;
    await panel.webview._emitDidReceiveMessage({ type: 'applyTheme', label: 'Unknown Malicious Theme' });
    await panel.webview._emitDidReceiveMessage({ type: 'applyTheme', label: 12345 });
    await panel.webview._emitDidReceiveMessage({ type: 'applyTheme', label: 'toString' });
    await panel.webview._emitDidReceiveMessage(null);
    assert.equal(mock.updateCalls.length, updatesBefore);
    assert.equal(mock.settings.get('workbench.colorTheme'), 'Ocarina of Time Dark');

    await panel.webview._emitDidReceiveMessage({ type: 'copyText', text: '#C9A227' });
    await panel.webview._emitDidReceiveMessage({ type: 'copyText', text: 12345 });
    await panel.webview._emitDidReceiveMessage({ type: 'copyText' });
    assert.deepEqual(mock.clipboardWrites, ['#C9A227']);

    mock.setFailOnClipboard(new Error('clipboard unavailable'));
    await panel.webview._emitDidReceiveMessage({ type: 'copyText', text: '#C9A227' });
    assert.equal(mock.errorMessages.length, 1);
    assert.ok(
      mock.errorMessages[0].msg.includes(
        'Hylian Palette: failed to handle Explorer action -- clipboard unavailable'
      )
    );
  });

  it('disposes failed webview panel and leaves explorer state clean on HTML load error (D4)', async () => {
    const missingDir = path.join(REPO_ROOT, '__missing_explorer_dir__');
    const { mock, context, invokeCommand } = setupExtension(
      { 'workbench.colorTheme': 'Wind Waker Light' },
      { extensionPath: missingDir }
    );

    await invokeCommand('hylianPalette.openExplorer');
    assert.equal(mock.webviewPanels.length, 1);
    assert.equal(mock.webviewPanels[0].disposed, true);
    assert.equal(mock.errorMessages.length, 1);
    assert.ok(mock.errorMessages[0].msg.includes('Hylian Palette: failed to open Explorer -- '));

    // Restore valid extensionPath and verify Explorer opens cleanly in a fresh panel
    context.extensionPath = REPO_ROOT;
    await invokeCommand('hylianPalette.openExplorer');
    assert.equal(mock.webviewPanels.length, 2);
    assert.equal(mock.webviewPanels[1].disposed, false);
    assert.ok(mock.webviewPanels[1].webview.html.includes('id="map-strip"'));
  });
});

describe('extension: exported pure helpers', () => {
  it('exports exact 12 helpers and validates findByLabel, findBySlug, findPairForGame, escapeHtmlAttr, shouldShowStatusBar, D2 findSibling mode/self guards, and deactivate', () => {
    const { ext } = setupExtension();

    assert.deepEqual(Object.keys(ext).sort(), [
      'activate',
      'buildQuickPickItems',
      'buildSimilarQuickPickItems',
      'buildWebviewHtmlFromSource',
      'deactivate',
      'escapeHtmlAttr',
      'findByLabel',
      'findBySlug',
      'findPairForGame',
      'findSibling',
      'pickRandomTheme',
      'shouldShowStatusBar',
    ]);

    const ocarinaLight = ext.findByLabel('Ocarina of Time Light');
    assert.equal(ocarinaLight.slug, 'ocarina-light');
    assert.equal(ext.findByLabel('Not A Real Theme'), undefined);

    assert.equal(ext.findBySlug('majora-dark').label, "Majora's Mask Dark");
    assert.equal(ext.findBySlug('unknown'), undefined);

    // D2: findSibling mode validation and self-guard checks (symmetric light & dark)
    assert.equal(ext.findSibling(ocarinaLight).label, 'Ocarina of Time Dark');
    assert.equal(ext.findSibling({ slug: 'ocarina-light' }).label, 'Ocarina of Time Dark');
    assert.equal(ext.findSibling({ slug: 'ocarina-dark' }).label, 'Ocarina of Time Light');
    assert.equal(ext.findSibling({ slug: 'ocarina-light', mode: 'sepia' }), undefined);
    assert.equal(ext.findSibling({ slug: 'ocarina-dark', mode: 'sepia' }), undefined);
    assert.equal(ext.findSibling({ slug: 'ocarina-light', mode: 'dark' }), undefined);
    assert.equal(ext.findSibling({ slug: 'ocarina-dark', mode: 'light' }), undefined);
    assert.equal(ext.findSibling({ slug: 'ocarina' }), undefined);
    assert.equal(ext.findSibling(null), undefined);

    // findPairForGame resolution across full game names, short names, labels, string slugs, and entry objects
    for (const query of ['The Wind Waker', 'Wind Waker', 'Wind Waker Dark']) {
      const pair = ext.findPairForGame(query);
      assert.equal(pair.light.label, 'Wind Waker Light');
      assert.equal(pair.dark.label, 'Wind Waker Dark');
    }
    for (const query of ['Zelda II: The Adventure of Link', 'Zelda II', { label: 'Zelda II Light' }]) {
      const pair = ext.findPairForGame(query);
      assert.equal(pair.light.label, 'Zelda II Light');
      assert.equal(pair.dark.label, 'Zelda II Dark');
    }
    for (const query of ['majora-dark', { slug: 'majora-dark' }]) {
      const majoraPair = ext.findPairForGame(query);
      assert.equal(majoraPair.light.label, "Majora's Mask Light");
      assert.equal(majoraPair.dark.label, "Majora's Mask Dark");
    }
    assert.equal(ext.findPairForGame('Unknown Game'), null);
    assert.equal(ext.findPairForGame(null), null);
    assert.equal(ext.findPairForGame(123), null);

    assert.equal(ext.escapeHtmlAttr('a & "b" <c>'), 'a &amp; &quot;b&quot; &lt;c&gt;');
    assert.equal(ext.escapeHtmlAttr("Link's Awakening Dark"), "Link's Awakening Dark");
    assert.equal(ext.escapeHtmlAttr(''), '');

    assert.equal(ext.shouldShowStatusBar('always', false), true);
    assert.equal(ext.shouldShowStatusBar('whenActive', false), false);
    assert.equal(ext.shouldShowStatusBar('whenActive', true), true);
    assert.equal(ext.shouldShowStatusBar('never', true), false);
    assert.equal(ext.shouldShowStatusBar(undefined, false), true);
    assert.equal(ext.shouldShowStatusBar('unknown', false), true);

    assert.deepEqual(ext.buildSimilarQuickPickItems('Not A Real Theme'), []);
    assert.doesNotThrow(() => ext.deactivate());
  });

  it('hardens buildWebviewHtmlFromSource against CSP3 delimiter breakouts, XSS, $& expansion, and chained placeholder injection (D1-CSP)', () => {
    const { ext } = setupExtension();

    const rawHtml =
      '<html><head>{{CSP_META}}{{CSP_META}}</head><body data-initial-theme=""><div data-initial-theme=""></div><script nonce="{{CSP_NONCE}}"></script><script nonce="{{CSP_NONCE}}"></script></body></html>';
    const hostileCspSource =
      'https://csp.example" /><script>alert(1)&</script>; script-src \'unsafe-inline\',\r\n\x00';
    const hostileNonce = 'NONCE"><tag>&\' ;script-src, \t\nABC';
    const hostileInitialTheme = 'Link\'s Awakening & "Dark" $& $1 $$ {{CSP_NONCE}}';

    const rendered = ext.buildWebviewHtmlFromSource(
      rawHtml,
      hostileCspSource,
      hostileNonce,
      hostileInitialTheme
    );

    assert.equal(rendered.includes("; script-src 'unsafe-inline'"), false);
    assert.equal(rendered.includes('<script>alert(1)'), false);
    assert.equal(rendered.includes('<tag>'), false);
    assert.ok(
      rendered.includes(
        'img-src https://csp.example&quot; /&gt;&lt;script&gt;alert(1)&amp;&lt;/script&gt; script-src unsafe-inline data:'
      )
    );
    assert.ok(
      rendered.includes("script-src 'nonce-NONCE&quot;&gt;&lt;tag&gt;&amp;script-srcABC';")
    );

    const scriptNonceMatches =
      rendered.match(/<script nonce="NONCE&quot;&gt;&lt;tag&gt;&amp;script-srcABC"><\/script>/g) || [];
    assert.equal(scriptNonceMatches.length, 2);

    // Single-pass first-only replacement for {{CSP_META}} and data-initial-theme=""
    const cspMetaMatches = rendered.match(/<meta http-equiv="Content-Security-Policy"/g) || [];
    assert.equal(cspMetaMatches.length, 1);
    assert.ok(rendered.includes('/>{{CSP_META}}</head>'));
    assert.ok(rendered.includes('<div data-initial-theme=""></div>'));

    assert.ok(
      rendered.includes(
        'data-initial-theme="Link\'s Awakening &amp; &quot;Dark&quot; $&amp; $1 $$ {{CSP_NONCE}}"'
      )
    );
  });
});
