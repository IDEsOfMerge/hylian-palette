# Wind Waker × Majora — Zelda Color Themes

Two cohesive color themes for **VS Code** and **Positron**, built as members of the same visual family:

- **Wind Waker Light** — warm parchment and nautical-chart tones, Great Sea turquoise, ocean blue, Hero's green, King of Red Lions crimson, rupee orange. Cheerful, clean, sunny daytime coding.
- **Majora's Mask Dark** — deep cosmic violet-black with neon Majora magenta, Fierce Deity cyan, Woodfall purple, Termina/Moon orange, and muted Garo gray. Nocturnal, mysterious, saturated, dramatic — but still highly readable.

Design inspiration comes entirely from the **color language and atmosphere** of *The Legend of Zelda: The Wind Waker* and *The Legend of Zelda: Majora's Mask* — no game artwork, logos, or copyrighted assets are included or referenced.

Both themes cover the full editor and workbench (tabs, sidebars, status bar, activity bar, panels, terminal, notifications, diff/git decorations, find/replace, minimap, etc.), comprehensive syntax highlighting via TextMate scopes and semantic tokens (tuned for R, Python, Quarto, Markdown, YAML, JSON, SQL, and shell), and Positron-specific panels (Console, Variables, Plots, Data Explorer, Packages, Notebooks, modal dialogs, and more) using Positron's own theme color keys.

## Installing locally in Positron

From this folder:

```sh
npx --yes @vscode/vsce package
positron --install-extension wind-waker-majora-themes-0.1.0.vsix
```

Or, for iterating without repackaging each time, launch an Extension Development Host:

```sh
positron --extensionDevelopmentPath="<full path to this folder>"
```

## Selecting a theme

Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) → **Preferences: Color Theme** → choose **Wind Waker Light** or **Majora's Mask Dark**.

## Toggling between themes

Open the Command Palette and run:

```text
Wind Waker × Majora: Toggle Theme
```

This switches between the two themes (defaulting to Wind Waker Light if some other theme is currently active), and persists the choice the normal way — via the standard `workbench.colorTheme` User setting. No other settings are read or modified.

## Notes

- `publisher` in `package.json` is a placeholder (`karlmakepeace`) — it only needs to be a syntactically valid identifier for local packaging/installation and does not need to be registered on the Marketplace unless you later publish it.
- No `repository` field is set yet since this extension doesn't have a permanent home; add one if/when it does.
- No icon is bundled, to keep things simple and avoid any risk of resembling copyrighted game assets. A small original SVG/PNG mark (abstract wave/moon motif, not game artwork) could be added later via the `icon` field.

## License

MIT — see the LICENSE file included with this extension.
