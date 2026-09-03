'use strict';

const vscode = require('vscode');

const WIND_WAKER_LIGHT = 'Wind Waker Light';
const MAJORAS_MASK_DARK = "Majora's Mask Dark";
const TOGGLE_COMMAND_ID = 'windwakerMajora.toggleTheme';

function activate(context) {
  const disposable = vscode.commands.registerCommand(TOGGLE_COMMAND_ID, async () => {
    try {
      const workbenchConfig = vscode.workspace.getConfiguration('workbench');
      const currentTheme = workbenchConfig.get('colorTheme');

      let nextTheme;
      if (currentTheme === WIND_WAKER_LIGHT) {
        nextTheme = MAJORAS_MASK_DARK;
      } else if (currentTheme === MAJORAS_MASK_DARK) {
        nextTheme = WIND_WAKER_LIGHT;
      } else {
        // Some other theme (or none) is active — default to Wind Waker Light.
        nextTheme = WIND_WAKER_LIGHT;
      }

      // Only workbench.colorTheme is touched, via the standard configuration API.
      await workbenchConfig.update('colorTheme', nextTheme, vscode.ConfigurationTarget.Global);

      vscode.window.setStatusBarMessage(`Theme switched to "${nextTheme}"`, 3000);
    } catch (err) {
      vscode.window.showErrorMessage(
        `Wind Waker × Majora: failed to toggle theme — ${err instanceof Error ? err.message : String(err)}`
      );
    }
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };
