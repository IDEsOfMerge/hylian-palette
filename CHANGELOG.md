# Changelog

All notable changes to the "Hylian Palette" extension are documented here.

## [1.1.0] — 2026-11-21

### Added
- **42 Modern VS Code & Positron UI Tokens (`scripts/generate-themes.js`, `themes/*.json`)**: added full styling for Command Center (`8` `commandCenter.*`), Terminal Sticky Scroll & Command Decorations (`6` `terminalStickyScroll.*` / `terminalCommandDecoration.*`), AI Chat & Inline Chat (`17` `chat.*` / `inlineChat*`), and Test Explorer (`11` `testing.*`), bringing every theme to **`447` `colors` keys** while preserving all **`152` confirmed `positron*` keys** (`5,472` verified usages across 36 themes) and 100% WCAG 2.1 AA contrast (`720 / 720` foreground/syntax, `576 / 576` ANSI).
- **New Extension Commands, Setting & Enriched Metadata (`extension.js`, `package.json`, `theme-metadata.json`)**:
  - **`Hylian Palette: Pick Similar Theme (CIEDE2000)`** (`hylianPalette.pickSimilarTheme`): live-preview QuickPick powered by precomputed 13-role `ΔE₀₀` similarity metadata in `theme-metadata.json` — grouped into **Nearest Chromatic Siblings** (top 6 same-mode themes sorted by ascending `ΔE₀₀`), **Paired Light / Dark Variant**, and **Maximum Chromatic Contrast (Farthest Polychromatic)**, with `Esc` rollback and external-theme fallback.
  - **`Hylian Palette: Sync Current Game with OS Light/Dark`** (`hylianPalette.syncOsThemePair`): sets Global `workbench.preferredLightColorTheme`, `workbench.preferredDarkColorTheme`, and `window.autoDetectColorScheme = true` for the active game (or via a chronological 18-game QuickPick when an external theme is active).
  - **`Hylian Palette: Random Theme (Same Mode)`** (`hylianPalette.randomThemeSameMode`): picks a non-repeating random theme locked to the active Light or Dark polarity with a 3-second status bar confirmation.
  - **`hylianPalette.showStatusBarItem` setting** (`"always" | "whenActive" | "never"`, default `"always"`) with live configuration and active-theme listeners.
  - Enriched `theme-metadata.json` with canonical 5 Hardware Eras (`era`), 5 Official Zelda Timeline Branches (`timeline`), top-6 same-mode `neighbors`, and polychromatic `farthest` (isolating `linksawakening-dark`), enhancing `Hylian Palette: Pick Zelda Theme` for era, timeline, and year filtering.
  - Added 7 standard `npm` scripts (`build`, `themes`, `explorer`, `swatches`, `validate`, `test`, `package`) while keeping zero runtime or dev `npm` dependencies.
- **Interactive Workbench & Colorimetry Explorer Overhaul (`scripts/generate-explorer.js`, `site/`, `assets/explorer/explorer.html`)**:
  - **Live Search (`/`) + 6 Zelda Timeline Branch Filter Chips** (`All · Unified · Child · Adult · Downfall · Era of the Wilds`) with multi-token search, collision-free fan-abbreviation aliases (`oot`, `mm`, `ww`, `tp`, `botw`, `totk`, `alttp`, `albw`, `eow`, etc.), 5 chronological Hardware Era rail blocks, and empty-state reset.
  - **Interactive Perceptual Similarity Map (`M`)**: zero-dependency 2D Classical MDS scatter plot (`Light (18)` `58.0%` variance / `Dark (17 polychromatic + 1 outlier)` `52.1%` variance) with **Link's Awakening Dark** (`1993 DMG-01 LCD`, mean `38.5 ΔE₀₀`) isolated in an interactive off-chart outlier card, **Theme Swatch / Hardware Era / Timeline Branch** coloring, dotted top-3 sibling tethers, and live hover/focus `ΔE₀₀` distance inspection.
  - **Nearest Chromatic Neighbors (`ΔE₀₀`)** chip bar beneath every game's story (`click` to jump, `⇄` / `Shift+Click` to compare).
  - **Side-by-Side Compare (`C`)** with mini R/Python/TypeScript/Quarto+SQL syntax previews, WCAG/APCA/min-ΔE readouts, 6 clickable swatches, Swap A ↔ B, and dual OKLab chromaticity polygons.
  - **8 Terminal & IDE Export Formats**: **VS Code** (`settings.json`), **Ghostty**, **WezTerm** (TOML), **Alacritty** (TOML), **Windows Terminal** (JSON), **Kitty** (`.conf`), **iTerm2** (`.itermcolors` XML plist), and **CSS Variables** (`--hp-*`).
  - **Stateful URL hash permalinks** (`#<slug>[&compare=<slug>][&cvd=<protan|deutan|tritan>][&map=<1|light|dark>]` via **Share Link**), OpenGraph social card (`site/og-preview.png`, `1920×616`), and responsive mobile layout (`0px` horizontal overflow across `360px`–`1440px`) under strict zero-CDN CSP.
- **Per-Mode CIEDE2000 MDS & Split-Triangle Distance Matrix (`scripts/generate-color-science-assets.py`, `analysis/theme_similarity.R`, `analysis/data/theme-mds.csv`)**:
  - Added **`assets/color-science/theme-mds.png`** (`2400×1300`, 2× supersampled) — side-by-side Light (18 games, `58.0%` variance) and Dark (17 polychromatic games, `52.1%` variance + *Link's Awakening Dark* off-chart DMG-01 callout at mean `38.5 ΔE₀₀`, range `31.8–45.3`).
  - Added **`assets/color-science/theme-distance-heatmap.png`** (`1840×1920`, 2× supersampled) — Ward-ordered 18×18 split-triangle pairwise `ΔE₀₀` matrix (upper-right Light, lower-left Dark, split keyword diagonal, dedicated DMG-01 olive band explicitly keyed on `linksawakening-dark`).
  - Exported `analysis/data/theme-mds.csv` and synchronized pure-R reproductions in `analysis/theme_similarity.R`.
- **Zero-Dependency Unit Test Suite & Contributor Docs (`test/*.test.js`, `CONTRIBUTING.md`, `.github/ISSUE_TEMPLATE/`)**:
  - Added `60` zero-dependency `node:test` tests across `test/color-science.test.js`, `test/explorer.test.js`, and `test/extension.test.js` covering OKLCH/WCAG/APCA/CIEDE2000/CVD math, Jacobi eigendecomposition, Classical MDS parity, all 8 export formats, and `extension.js` commands, settings, legacy compatibility, and webview CSP3 hardening.
  - Added **`CONTRIBUTING.md`** and GitHub issue templates (`.github/ISSUE_TEMPLATE/config.yml`, `.github/ISSUE_TEMPLATE/game-request.yml`).

### Changed
- **Massive `.vsix` Package Slimdown (`.vscodeignore`, `package.json`)**: excluded README-only media (`assets/{banner,color-science,diagrams,showcase,swatches,timeline}/**`), `test/**`, and `CONTRIBUTING.md` from `.vsix` packaging and consolidated walkthrough step images to `icon.png`, reducing the packaged `.vsix` by ~95% from ~6.3 MB down to **46 files (~312 KB)**.
- **Tightened CVD Gate & Upgraded Validator (`scripts/color-science.js`, `scripts/validate.js`)**: raised the moderate CVD warning threshold from `< 8.0` to **`< 10.0 ΔE*ab`** (`0` errors and `0` warnings across all 35 polychromatic themes; minimum polychromatic critical separation is `12.12 ΔE*ab`), and expanded `scripts/validate.js` to verify `contributes.commands`, `contributes.configuration`, `theme-metadata.json` similarity fields, `site/og-preview.png`, and Explorer CSP compliance.
- **Webview CSP3 Hardening & Runtime Resilience (`extension.js`)**: preserved backward-compatible legacy toggle alias `windwakerMajora.toggleTheme`, hardened `buildWebviewHtmlFromSource` with single-pass callback placeholder replacement and pre-entity CSP3 delimiter stripping, added `try/catch` error containment on async QuickPick/webview handlers, and ensured clean panel disposal on initialization failure.
- **Modernized CI Workflows (`.github/workflows/{build,pages,release,publish}.yml`)**: upgraded all 4 workflows from Node 20 and `@v4`/`@v3` actions to **Node 22** with `actions/checkout@v7`, `actions/setup-node@v7`, `actions/upload-artifact@v7`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`, and `actions/deploy-pages@v5`, running `node --test test/*.test.js` in CI and diff-checking the entire `site/` output.
- **Updated Diagrams, Walkthroughs & Documentation (`scripts/generate-diagrams.py`, `assets/diagrams/build-pipeline-{dark,light}.png`, `assets/walkthrough/color-science.md`, `README.md`)**: updated the build-pipeline diagrams with the 5-item `AUDIT GATE` (including `60` unit tests), added the verified `576 / 576` ANSI count to the color-science walkthrough, fixed stale `34` → `36` comment headers in `analysis/{color_science,theme_similarity}.R`, and updated `README.md` with current v1.1.0 features, MDS & distance-heatmap visuals, exact theme labels (`Wind Waker Light`), and accurate settings scope.

## [1.0.0] - 2026-11-18

First stable `1.0.0` release — a ground-up scientific and artistic overhaul tuning all **18 mainline Legend of Zelda games (36 Light & Dark themes)** in perceptual **OKLCH** color space.

### Added
- **Echoes of Wisdom Light & Dark (2024)**: completes the 18-game, 36-theme mainline catalog — sunlit tilt-shift Castle Town craft stone paired with Princess Zelda's royal indigo cloak, Null rift magenta, and Tri Rod gold in Light mode; fractured Still World indigo-violet rift lit by Tri's golden triangles, Swordfighter cyan, and suspended canopy emerald in Dark mode. Placed on the Downfall Timeline in `assets/timeline/timeline-metro.png`.
- **Perceptual Colorimetry Engine (`scripts/color-science.js`)**: full IEC 61966-2-1 sRGB ↔ Linear RGB, Björn Ottosson **OKLab & OKLCH** synthesis with binary-search gamut mapping, **WCAG 2.1**, **APCA-W3 (`Lc`)**, **CIEDE2000 ($\Delta E_{00}$)**, and **Machado, Oliveira & Fernandes (2009)** protanopia/deuteranopia/tritanopia simulation enforced directly in the build and validation pipeline.
- **Interactive Palette & Colorimetry Explorer (`scripts/generate-explorer.js`, `extension.js`, `.github/workflows/pages.yml`)**: dual-target zero-CDN interactive workbench and perceptual colorimetry studio generated directly from `palettes/*.js` — available both **inside VS Code / Positron** via **Hylian Palette: Open Palette & Colorimetry Explorer** (`hylianPalette.openExplorer`, with strict nonce CSP and two-way live workbench theme sync) and **on the web via GitHub Pages** (`site/index.html`, URL hash deep-linking, `settings.json` copy, and automated `actions/deploy-pages` CI workflow).
- **Live-preview Theme Picker (`extension.js`)**: upgraded **Hylian Palette: Pick Zelda Theme** to `vscode.window.createQuickPick()` with instant live theme preview on highlight, per-theme art-direction subtitles, an `$(check) Active` indicator, and clean `Esc` rollback to the previously active theme.
- **Expanded Workbench, Editor & Language Scope Coverage (`scripts/generate-themes.js`)**: added cohesive styling for sticky scroll, inlay hints, inline ghost-text completions, minimap/overview ruler, gutter folding & diff markers, breadcrumbs, peek/hover/suggest widgets, 3-way merge editors, notebooks, charts, luminance-aware status bar hover states, and dedicated R, Python, Quarto/Markdown, Diff, YAML/TOML, and CSS/HTML TextMate rules alongside `5,472` verified Positron IDE color keys.

### Changed
- **True Per-Game Art-Direction Tuning Across All 36 Palettes (`palettes/*.js`)**: eliminated all shared template hexes across games (`36 / 36` unique primary colors in every core slot) and aligned syntax-role hues with each game's authentic visual language and hardware era — e.g., *Ocarina of Time*'s three Spiritual Stones + royal-indigo Ocarina, *Zelda II*'s Palace brick-crimson & Parapa amber, *Oracle of Ages*'s Nayru sapphire & Ambi violet, *Breath of the Wild*'s Sheikah Slate cyan-blue & Malice magenta, *Twilight Princess Dark*'s atmospheric desaturated Twilight Realm with Midna's `#FF781F` flame accent, and *Link's Awakening Dark*'s hardware-faithful 1993 DMG-01 4-shade green LCD ramp.
- **100% WCAG 2.1 AA + Zero Polychromatic Critical CVD Collisions**:
  - `720 / 720` foreground and syntax tokens across all 36 themes pass WCAG AA `4.5:1` on `editor.background` (`4.62:1`–`14.36:1`; primary `fg/bg` `|Lc| = 79.4–93.7` across all 35 polychromatic themes) and `>= 3.8:1` on `editor.lineHighlightBackground`.
  - `576 / 576` integrated terminal / Positron console ANSI colors pass contrast gates while preserving canonical ANSI hue bands.
  - Across all **35 polychromatic themes (`735` critical adjacent syntax pairs)**, **0 pairs** fall below `10 ΔE*ab` under protanopia, deuteranopia, or tritanopia (`0` severe, `0` moderate), achieved by staggering adjacent syntax roles across OKLCH lightness. Only monochrome `linksawakening-dark` retains 3 intentional single-hue DMG-01 pairs `< 10 ΔE*ab`.
- **Startup Status Bar & Command IDs**: switched extension activation to `onStartupFinished` so the status bar theme indicator appears immediately on startup with near-zero overhead; standardized primary toggle command ID to `hylianPalette.toggleTheme` while keeping `windwakerMajora.toggleTheme` registered as a backward-compatible alias.
- **Refreshed Analytical Plots, Swatches & Walkthroughs**: regenerated all 345 swatch PNGs, 540-row `analysis/data/colors.csv`, high-DPI color-science figures (`assets/color-science/*.png`), in-universe chronology metro map (`assets/timeline/timeline-metro.png`), and first-run walkthrough guides.

## [0.4.0] - 2026-09-04

- Added a status-bar item showing the active theme, clickable to open the same quick-pick as **Hylian Palette: Pick Zelda Theme**.
- Added **Hylian Palette: Random Theme**, jumping to a random one of the 34 themes.
- Added a default keybinding for **Hylian Palette: Toggle Theme** (`Ctrl+K Ctrl+Z` / `Cmd+K Ctrl+Z`, rebindable like any other command).
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
