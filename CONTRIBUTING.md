# Contributing to Hylian Palette

Thank you for your interest in **Hylian Palette**! Whether you are refining a game's palette fidelity, improving VS Code / Positron workbench token coverage, proposing a new *Legend of Zelda* title, or strengthening our color-science tooling and test suite, this guide explains how the project is structured and verified.

Want to propose a game or palette refinement without writing code? Open a **[Request a Zelda Game or Palette Refinement](.github/ISSUE_TEMPLATE/game-request.yml)** issue (you can preview all 36 Light & Dark themes first in the **[Live Interactive Workbench & Colorimetry Explorer](https://idesofmerge.github.io/hylian-palette/)**).

---

## Architecture & Source of Truth

Hylian Palette ships with **zero runtime `npm` dependencies** and generates all extension themes, metadata, and interactive Explorer bundles deterministically from compact per-game story palettes covering all **18 mainline *Legend of Zelda* games (36 Light & Dark themes)**:

```text
palettes/*.js                     (~45 named story tokens + 16 ANSI colors + game metadata)
scripts/color-science.js          (OKLCH synthesis, WCAG 2.1, APCA-W3, CIEDE2000, Machado 2009 CVD)
        │
        ▼   npm run build
        ├── themes/<slug>-color-theme.json    (447 workbench & Positron colors + TextMate/semantic rules)
        ├── package.json                      (contributes.themes catalog)
        ├── theme-metadata.json               (era, timeline branch & top-6 ΔE₀₀ neighbors for extension.js)
        ├── site/                             (GitHub Pages Interactive Explorer + og-preview.png)
        └── assets/explorer/explorer.html     (offline VS Code / Positron Webview Explorer)
```

> **Important:** Never hand-edit `themes/*.json`, `theme-metadata.json`, `site/index.html`, `site/og-preview.png`, or `assets/explorer/explorer.html`. Edit the source modules in `palettes/` or generator scripts in `scripts/` and run `npm run build`. CI enforces a clean `git diff` across all generated outputs on every pull request.

---

## Perceptual Quality Gates

Every palette is synthesized in **OKLCH** perceptual color space and must pass automated multi-gate auditing in `scripts/color-science.js` and `scripts/validate.js` before a build or pull request can pass:

- **WCAG 2.1 AA contrast (`≥ 4.5:1`)** — all **20 foreground & syntax roles** (`720 / 720` across 36 themes) must achieve `≥ 4.5:1` on `editor.background` (`bg`) and `≥ 3.8:1` on `editor.lineHighlightBackground` (`bgLine`). Primary body text (`fg` on `bg`) requires `≥ 7.0:1` (`≥ 5.8:1` for `linksawakening-dark`, the authentic 1993 Game Boy DMG-01 olive LCD monochrome tribute), `fg` on `bgSidebar` requires `≥ 4.5:1`, and `fgSecondary` on `bgActivity` requires `≥ 3.5:1`.
- **ANSI terminal contrast & hue fidelity** — all **16 ANSI terminal colors** (`576 / 576` tokens) are verified for contrast (`≥ 4.2:1`, `brightBlack ≥ 3.5:1`) while staying within canonical OKLCH hue bands on polychromatic themes so red errors, green diffs, and cyan/blue diagnostics remain semantically recognizable.
- **APCA-W3 spatial contrast & figure–ground hierarchy** — primary body text (`fg` on `bg`) clears `|Lc| ≥ 70` (`≥ 55` for `linksawakening-dark`), while comments (`fgComment`) clear WCAG AA (`≥ 4.5:1`) yet remain perceptually subordinate (`commentBg ≤ fgBg − 2.0`) so documentation never competes with active code.
- **CIEDE2000 distinctness (`ΔE₀₀ ≥ 8.5`)** — adjacent semantic syntax pairs must stay `≥ 8.5 ΔE₀₀` apart in normal vision with zero duplicate hexes across paired roles.
- **Machado et al. (2009) CVD resilience (`≥ 10 ΔE*ab`)** — critical adjacent syntax pairs (`keyword`, `storage`, `string`, `function`, `type`, `number`, `error`) are simulated under protanopia, deuteranopia, and tritanopia. Severe collisions (`< 5 ΔE*ab`) fail the build; all 35 polychromatic themes stagger OKLCH lightness (`L`) alongside hue to hold `≥ 10 ΔE*ab` across all three cone deficiencies with zero warnings (`linksawakening-dark` is the sole documented DMG-01 monochrome exception).
- **Verified `positron*` key provenance** — all **152 confirmed upstream `positron*` workbench color keys** (`5,472` usages across 36 themes) are checked against Positron's source registry (`src/vs/workbench/common/theme.ts` in `posit-dev/positron`). Unrecognized `positron*` keys fail validation.
- **Zero-CDN Content Security Policy** — both `site/index.html` and `assets/explorer/explorer.html` must be 100% self-contained with zero external HTTP(S) scripts, stylesheets, or images, and `assets/explorer/explorer.html` must preserve the `{{CSP_META}}` and `{{CSP_NONCE}}` placeholders injected by `extension.js`.

---

## Development Commands

Requires **Node.js 22+** (no `npm install` needed — zero runtime or dev `npm` dependencies):

```sh
npm run build      # Regenerate themes/*.json, package.json, theme-metadata.json & Explorer bundles
npm run validate   # Audit all 36 themes, perceptual gates, Explorer CSP & 152 confirmed positron* keys
npm test           # Run zero-dependency node:test suite (node --test test/*.test.js)
npm run swatches   # Regenerate local swatch PNGs in assets/swatches/
npm run package    # Build a local .vsix package via @vscode/vsce
```

To test your changes interactively in an Extension Development Host without packaging:

```sh
code --extensionDevelopmentPath="$PWD"
# or in Positron:
positron --extensionDevelopmentPath="$PWD"
```

### Optional Visual & Analytical Scripts (Python 3 / R)

When tuning palettes, adding a game, or refreshing analytical figures and README media:

```sh
node scripts/generate-readme-catalog.js           # Refresh the README catalog swatch table
node scripts/export-color-data.js                 # Export OKLCH + WCAG + APCA CSV to analysis/data/colors.csv
python3 scripts/generate-color-science-assets.py  # Regenerate color-science plots, MDS CSV & metro map
python3 scripts/generate-icon.py                  # Regenerate extension icon (icon.png)
python3 scripts/generate-banner.py                # Regenerate Dark/Light README banners
python3 scripts/generate-diagrams.py              # Regenerate Dark/Light timeline & pipeline diagrams
python3 scripts/generate-showcase-gif.py          # Regenerate animated IDE showcase GIF

# Pure-R analytical reproductions:
Rscript --vanilla analysis/color_science.R
Rscript --vanilla analysis/theme_similarity.R
Rscript --vanilla analysis/timeline_metro.R
```

---

## Tuning or Adding a Game Palette

1. **Edit or author** a matched Light and Dark pair in `palettes/` (use `palettes/ocarina-light.js` and `palettes/ocarina-dark.js` as a reference for metadata and token keys). Each module defines ~45 story tokens, which `scripts/generate-themes.js` expands deterministically into all **447** VS Code & Positron workbench color keys.
   - **Filename vs. slug note:** Always discover palettes by scanning `palettes/*.js` and keying on each module's exported `slug` rather than assuming `palettes/<slug>.js` (for example, `palettes/majoras-mask-dark.js` exports `slug: 'majora-dark'`, pairing with `palettes/majora-light.js`).
2. If you are adding a **brand-new game** (expanding beyond 18 games / 36 themes), also register it in `ERA_BY_GAME`, `TIMELINE_BY_GAME`, and `GAME_CHRONO_ORDER` in `scripts/generate-themes.js`, update `EXPECTED_THEME_COUNT` in `scripts/validate.js`, add it to `ERAS` in `scripts/generate-diagrams.py` and `scripts/generate-readme-catalog.js`, and refresh the README catalog table via `node scripts/generate-readme-catalog.js`.
3. Run `npm run build`, `npm run swatches`, `npm run validate`, and `npm test`, verifying zero errors, zero CVD warnings across polychromatic themes, and 100% passing unit tests.
4. Preview both themes in the Extension Development Host and inside the Interactive Explorer across Light, Dark, and Protanopia / Deuteranopia / Tritanopia views.
5. Open a pull request describing the game's art direction, display/hardware color sources, and any perceptual trade-offs.

---

## IP & Trademark Hygiene

Hylian Palette is an **independent, unofficial fan tribute** to *The Legend of Zelda* and is not affiliated with or endorsed by Nintendo.

- Draw inspiration **strictly from color language, display hardware, and environmental atmosphere** — palettes, lighting moods, and era display characteristics (NES/SNES CRT, DMG-01 LCD, Game Boy Color/Advance, N64/GameCube, DS, Wii, 3DS, Switch).
- **Never** include, trace, or link copyrighted assets: **zero** Nintendo logos, game logos, brand wordmarks, sprites, character artwork, box art, or trademarks anywhere in code, themes, documentation, issues, or pull requests.
- Every visual asset in this repository (icon, banners, swatches, diagrams, showcase GIF, metro map, and color-science plots) must remain algorithmically generated from hex coordinates and clean geometric primitives.
