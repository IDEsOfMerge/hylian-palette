# Changelog

All notable changes to the "Hylian Palette" extension are documented here.

## [0.4.0] - 2026-09-04

- Added a status-bar item showing the active theme, clickable to open the same quick-pick as **Hylian Palette: Pick Zelda Theme**.
- Added **Hylian Palette: Random Theme**, jumping to a random one of the 34 themes.
- Added a default keybinding for **Hylian Palette: Toggle Theme** (`Ctrl+K Ctrl+Z` / `Cmd+K Cmd+Z`, rebindable like any other command).
- Added a first-run "Welcome to Hylian Palette" walkthrough (`contributes.walkthroughs`) covering theme selection, toggling, the identity-color design pattern, and the color-science write-up.
- Added Marketplace-publishing readiness: `galleryBanner`, a CI-status badge, a manual (`workflow_dispatch`-only) `.github/workflows/publish.yml`, and a "Installing from the Marketplace" README section — actual publishing is gated on the maintainer's own Marketplace/Open VSX publisher account and is not done by this release.
- Ran a second, more careful pass over the color-vision-deficiency audit's remaining 13 severe cases (from 0.3.0's first pass) — this time checking each candidate fix against every neighboring role's actual color, not just the pair being fixed, after the first pass's batch approach turned out to have traded a couple of collisions for new ones. Brought severe cases from 13 down to 3, all three in Link's Awakening Dark and left deliberately unfixed as a disclosed, permanent trade-off (they come from using the real 4-shade DMG Game Boy green ramp, which has almost no hue variation to work with). See the README's Color science section for the full account.

## [0.3.0] - 2026-09-04

- Added an original extension icon (`icon.png`) — an abstract gold/violet gem, echoing the Hyrule/Lorule light-vs-dark-mirror-world duality through color language only, deliberately not a Triforce or any other game-specific silhouette.
- Added `.github/workflows/build.yml`: regenerates and validates every theme (WCAG contrast, JSON strictness, `positron*` key provenance, generated-output-matches-committed check) and packages the extension on every push/PR.
- Added `scripts/validate.js`, consolidating the JSON-strictness and `positron*`-key-provenance checks used throughout development into one reusable script.
- Added a rigorous color-science pass (`analysis/color_science.R`, hand-implemented in pure R after `colorspace`/`farver` proved unstable in this environment): a global PCA of all 34 themes' syntax colors, per-theme CIE a\*-b\* colorspace diagrams, and a color-vision-deficiency audit across 2,652 role-pairs. Found and fixed 20 palette token adjustments (mostly `accentStorage`, which was frequently too close to `accentKeyword`/`accentString`/`colorError` under red-green color blindness) across 19 themes, cutting severe CVD collisions from 35 to 13. See the README's "Color science" section.
- Added a per-theme similarity analysis (`analysis/theme_similarity.R`): each theme's 13 syntax colors become one 39-dimensional feature vector (Lab per role), then a scaled PCA and a Ward's-method dendrogram show which *themes* — not just which roles — are most alike. Surfaced two genuine findings: Link's Awakening Dark is a dramatic outlier (confirming its near-monochrome design), and Majora's Mask Light/Dark cluster with each other rather than their light/dark neighbors — an unplanned empirical confirmation of the "keep identity colors constant across a pair" design rule.

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
