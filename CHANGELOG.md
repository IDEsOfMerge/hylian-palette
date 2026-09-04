# Changelog

All notable changes to the "Hylian Palette" extension are documented here.

## [0.2.0] - 2026-09-03

Renamed to **Hylian Palette** and expanded to cover every mainline Legend of Zelda game.

- Added Light and Dark themes for all 17 mainline games (34 themes total): The Legend of Zelda, Zelda II, A Link to the Past, Link's Awakening, Ocarina of Time, Majora's Mask, Oracle of Seasons, Oracle of Ages, The Wind Waker, The Minish Cap, Twilight Princess, Phantom Hourglass, Spirit Tracks, Skyward Sword, A Link Between Worlds, Breath of the Wild, and Tears of the Kingdom.
- Added Wind Waker Dark and Majora's Mask Light, completing those two games' pairs.
- Introduced a token-driven theme generator (`scripts/generate-themes.js`) so every theme shares the same well-tested structural formula while each game's ~40 "story" colors carry its own in-universe rationale; every theme passes an automated WCAG contrast check.
- Retitled the toggle command to `Hylian Palette: Toggle Theme` and made it a *smart* per-game toggle (flips Light↔Dark within whichever game is active, rather than only Wind Waker/Majora's Mask).
- Added `Hylian Palette: Pick Zelda Theme`, a quick-pick grouped by game in release order.

## [0.1.0] - 2026-09-03

Initial release.

- Added **Wind Waker Light** — a warm, nautical light theme (parchment/map background, Great Sea turquoise, ocean blue, Hero's green, King of Red Lions crimson, rupee orange).
- Added **Majora's Mask Dark** — a cosmic, neon-on-void dark theme (Majora magenta, Fierce Deity cyan, Woodfall purple, Termina/Moon orange, Garo gray).
- Comprehensive TextMate `tokenColors` and `semanticTokenColors` covering comments, keywords, storage, strings, numbers, booleans, constants, functions, methods, variables, properties, parameters, classes, types, interfaces, namespaces, decorators, operators, punctuation, tags, regex, and documentation comments.
- Full Positron-specific theming: Console, Variables, Plots, Data Explorer/Grid, Packages, Notebooks, action bars, modal dialogs, context menus, dropdowns, checkboxes, tooltips, and runtime state icons.
- Added `Wind Waker × Majora: Toggle Theme` command to switch between the two themes via the Command Palette.
