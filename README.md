# Hylian Palette — Every Mainline Zelda Game

A Light and Dark color theme for **every mainline Legend of Zelda game** — 17 games, 34 themes — for **VS Code** and **Positron**. Each pair has its own rationale-backed palette drawn from that game's actual art direction, not a generic reskin: Ocarina of Time's syntax colors are the three Spiritual Stones, Twilight Princess Dark deliberately desaturates everything except Midna's orange (matching the game's real in-game effect), Link's Awakening Dark uses the genuine 4-shade Game Boy green ramp, and so on. Design inspiration comes entirely from **color language and atmosphere** — no game artwork, logos, or copyrighted assets are included or referenced.

Named "Hylian" rather than "Hyrule" deliberately: several of these games aren't set in Hyrule at all (Termina, Koholint, Lorule), but "Hylian" — Link's own heritage, his shield's crest, the invented Hylian script that shows up even in those other worlds — is the one thread that runs through the whole series.

## The 17 games

| Era | Games |
|---|---|
| 8-bit/16-bit classics | The Legend of Zelda (1986), Zelda II: The Adventure of Link (1987), A Link to the Past (1991) |
| Handheld (GB/GBC/GBA) | Link's Awakening (1993), Oracle of Seasons (2001), Oracle of Ages (2001), The Minish Cap (2004) |
| N64/GameCube 3D | Ocarina of Time (1998), Majora's Mask (2000), The Wind Waker (2002), Twilight Princess (2006) |
| Nintendo DS | Phantom Hourglass (2007), Spirit Tracks (2009) |
| Modern | Skyward Sword (2011), A Link Between Worlds (2013), Breath of the Wild (2017), Tears of the Kingdom (2023) |

Each theme covers the full editor and workbench (tabs, sidebars, status bar, activity bar, panels, terminal with full 16-color ANSI, notifications, diff/git decorations, find/replace, minimap, bracket matching, and more), comprehensive syntax highlighting via TextMate scopes and semantic tokens (tuned for R, Python, Quarto, Markdown, YAML, JSON, SQL, and shell), and Positron-specific panels (Console, Variables, Plots, Data Explorer, Packages, Notebooks, modal dialogs, and more) using Positron's own theme color keys. Every theme passes an automated WCAG contrast check (editor text, comments, and sidebar text all ≥4.5:1 against their background).

## Installing locally in Positron

From this folder:

```sh
npx --yes @vscode/vsce package
positron --install-extension positron-hylian-palette-0.2.0.vsix
```

Or, for iterating without repackaging each time, launch an Extension Development Host:

```sh
positron --extensionDevelopmentPath="<full path to this folder>"
```

## Selecting a theme

Two ways:

- Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) → **Preferences: Color Theme** → pick any of the 34 themes (alphabetical, VS Code's standard picker).
- Or run **Hylian Palette: Pick Zelda Theme** — a quick-pick grouped by game in release order, showing Light/Dark side by side per game, easier to browse than hunting through 34 alphabetical entries.

## Toggling between Light and Dark

Run **Hylian Palette: Toggle Theme** from the Command Palette. It's a *smart, per-game* toggle: it flips between the Light and Dark variant of whichever game's theme is currently active (e.g. "Ocarina of Time Light" → "Ocarina of Time Dark"). If some other, unrelated theme is active, it defaults to Wind Waker Light. Only the standard `workbench.colorTheme` User setting is read or written — no other settings are touched.

## How the themes are built

Hand-authoring ~300 color keys × 34 themes doesn't scale, so `scripts/generate-themes.js` (a dev-only build tool, not shipped as a runtime dependency) expands a compact ~40-token "story palette" per game/mode — defined in `palettes/*.js`, each with inline rationale comments — into the full theme JSON, and runs an automated contrast check across all of them. See the comment header in any `palettes/*.js` file for that game's specific design story. Re-run `node scripts/generate-themes.js` after editing a palette file to regenerate `themes/*.json` and `package.json`'s theme list.

## Notes

- `publisher` in `package.json` is a placeholder (`karlmakepeace`) — it only needs to be a syntactically valid identifier for local packaging/installation and does not need to be registered on the Marketplace unless you later publish it.
- No icon is bundled, to keep things simple and avoid any risk of resembling copyrighted game assets.

## License

MIT — see the LICENSE file included with this extension.
