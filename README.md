<!-- markdownlint-disable MD033 MD041 -->
```text
       /\
      /  \
     /    \
    /------\
   /\      /\
  /  \    /  \
 /    \  /    \
/------\/------\
```

<div align="center">

# Hylian Palette

**A Light and Dark color theme for every mainline Legend of Zelda game.**
17 games · 34 themes · one VS Code / Positron extension.

[![build](https://github.com/karlmakepeace/positron-hylian-palette/actions/workflows/build.yml/badge.svg)](https://github.com/karlmakepeace/positron-hylian-palette/actions/workflows/build.yml)
![themes](https://img.shields.io/badge/themes-34-7209B7?style=flat-square)
![games](https://img.shields.io/badge/games-17-00A896?style=flat-square)
![contrast](https://img.shields.io/badge/WCAG-%E2%89%A54.5%3A1-2A5F25?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

</div>

---

Each pair has its own rationale-backed palette drawn from that game's actual art direction, not a generic reskin: Ocarina of Time's syntax colors *are* the three Spiritual Stones, Twilight Princess Dark deliberately desaturates everything except Midna's orange (matching what the game itself does), Link's Awakening Dark uses the real 4-shade Game Boy green ramp. Design inspiration comes entirely from **color language and atmosphere** — no game artwork, logos, or copyrighted assets are included or referenced anywhere in this repo.

Named "Hylian" rather than "Hyrule" on purpose: several of these games aren't set in Hyrule at all (Termina, Koholint, Lorule). "Hylian" — Link's own heritage, his shield's crest, the invented script that shows up even in those other worlds — is the one thread that runs through the whole series.

## The 17 games, by release date

```mermaid
timeline
    title The Legend of Zelda — 17 Mainline Games
    section 8-bit & 16-bit
        1986 : The Legend of Zelda
        1987 : Zelda II
        1991 : A Link to the Past
    section Handheld
        1993 : Link's Awakening
        2001 : Oracle of Seasons : Oracle of Ages
        2004 : The Minish Cap
    section N64 & GameCube
        1998 : Ocarina of Time
        2000 : Majora's Mask
        2002 : The Wind Waker
        2006 : Twilight Princess
    section Nintendo DS
        2007 : Phantom Hourglass
        2009 : Spirit Tracks
    section Modern
        2011 : Skyward Sword
        2013 : A Link Between Worlds
        2017 : Breath of the Wild
        2023 : Tears of the Kingdom
```

## ...and by in-universe story chronology

This is the other timeline — the one every Zelda fan actually means by "the timeline." Per Nintendo's official Hyrule Historia chronology, the story splits into three branches after Ocarina of Time, and (this is the famous twist) the original The Legend of Zelda and Zelda II turn out to sit in the *far future* of one of them, not the past. Rendered from scratch in this project's own style and colors, not copied from any published chart.

<img src="assets/timeline/timeline-metro.png" alt="Zelda in-universe story chronology as a metro map: a trunk (Skyward Sword, Minish Cap, Four Swords, Ocarina of Time) splits at Ocarina of Time into the Child Timeline (Majora's Mask, Twilight Princess), Adult Timeline (Wind Waker, Phantom Hourglass, Spirit Tracks), and Downfall Timeline (A Link to the Past, Link's Awakening, the Oracle games, A Link Between Worlds, then a large time skip to The Legend of Zelda and Zelda II), reconverging into Breath of the Wild and Tears of the Kingdom" width="900">

```sh
Rscript --vanilla analysis/timeline_metro.R  # regenerate assets/timeline/timeline-metro.png
```

## Every pair tells a story

Three examples of how a Light/Dark pair is built — one signature "identity" color kept constant across both variants, everything else shifting with the light:

### Ocarina of Time — the three Spiritual Stones

|  | Light | Dark |
|---|---|---|
| Background | ![](assets/swatches/DEDCC6.png) `#DEDCC6` carved Temple of Time sandstone | ![](assets/swatches/0A0E1C.png) `#0A0E1C` midnight Hyrule Field |
| Keywords | ![](assets/swatches/1B7A4D.png) `#1B7A4D` Kokiri **Emerald** | ![](assets/swatches/3DBE82.png) `#3DBE82` brightened for dungeon torchlight |
| Strings | ![](assets/swatches/B5231A.png) `#B5231A` Goron **Ruby** | ![](assets/swatches/E8534A.png) `#E8534A` glows like lava at night |
| Functions | ![](assets/swatches/0F5E9C.png) `#0F5E9C` Zora **Sapphire** | ![](assets/swatches/4FA8E8.png) `#4FA8E8` glowing sapphire blue |
| Types | ![](assets/swatches/1E7A6E.png) `#1E7A6E` the Ocarina's own teal | ![](assets/swatches/3ECBB8.png) `#3ECBB8` brightened |
| **Identity accent** | ![](assets/swatches/C9A227.png) `#C9A227` **Triforce gold** | ![](assets/swatches/C9A227.png) `#C9A227` same gold, unchanged |

### The Wind Waker — the Great Sea by day and by night

|  | Light | Dark |
|---|---|---|
| Background | ![](assets/swatches/F4EAD4.png) `#F4EAD4` warm parchment sea-chart | ![](assets/swatches/06121C.png) `#06121C` night ocean |
| Keywords | ![](assets/swatches/2A5F25.png) `#2A5F25` Hero's green tunic | ![](assets/swatches/4FB050.png) `#4FB050` glows under starlight |
| Strings | ![](assets/swatches/9E1B1B.png) `#9E1B1B` King of Red Lions' crimson sail | ![](assets/swatches/E8433A.png) `#E8433A` brightened against the dark |
| Functions | ![](assets/swatches/023E8A.png) `#023E8A` ocean blue | ![](assets/swatches/3D8FE8.png) `#3D8FE8` glowing ocean blue |
| Types | ![](assets/swatches/00695C.png) `#00695C` Great Sea teal | ![](assets/swatches/2AD9C2.png) `#2AD9C2` vivid glowing turquoise — the box-art color |
| **Identity accent** | ![](assets/swatches/D62828.png) `#D62828` **King of Red Lions crimson** | ![](assets/swatches/E8433A.png) `#E8433A` same crimson, brightened |

### Majora's Mask — dread by night, and dread by day

|  | Light | Dark |
|---|---|---|
| Background | ![](assets/swatches/F2E4D8.png) `#F2E4D8` Carnival of Time dawn | ![](assets/swatches/0D0714.png) `#0D0714` cosmic void |
| Keywords | ![](assets/swatches/C22368.png) `#C22368` Majora magenta, deepened | ![](assets/swatches/FF4D8D.png) `#FF4D8D` Majora magenta |
| Strings | ![](assets/swatches/C2650F.png) `#C2650F` dawn-of-the-final-day orange | ![](assets/swatches/FFB347.png) `#FFB347` Termina/Moon orange |
| Functions | ![](assets/swatches/7A3EA8.png) `#7A3EA8` Woodfall purple, deepened | ![](assets/swatches/B47EE5.png) `#B47EE5` Woodfall purple |
| Types | ![](assets/swatches/0A8A78.png) `#0A8A78` Fierce Deity cyan, deepened | ![](assets/swatches/00F5D4.png) `#00F5D4` Fierce Deity cyan |
| **Identity accent** | ![](assets/swatches/C22368.png) `#C22368` **Majora magenta** doubles as cursor | ![](assets/swatches/00F5D4.png) `#00F5D4` **Fierce Deity cyan** doubles as cursor |

*(The mask's menace doesn't go away just because the sun is out — so unlike the other two pairs, Majora's Mask keeps its keyword color as the identity accent in Light mode, rather than a separate "focus" color.)*

## The full catalog

<details>
<summary><strong>All 34 themes, era by era — click to expand</strong></summary>

Each swatch strip reads left to right: **background · keywords · strings · functions · types**.

<!-- CATALOG:START -->

**8-bit & 16-bit Classics**

| Game | Light (bg · keyword · string · function · type) | Dark (bg · keyword · string · function · type) |
|---|---|---|
| **The Legend of Zelda** (1986) | ![](assets/swatches/E7D9A0.png) ![](assets/swatches/2F6B1F.png) ![](assets/swatches/A8241A.png) ![](assets/swatches/1B5EA8.png) ![](assets/swatches/1D7A72.png) | ![](assets/swatches/120D08.png) ![](assets/swatches/4FA637.png) ![](assets/swatches/E0453A.png) ![](assets/swatches/4F9EE0.png) ![](assets/swatches/3ECBBE.png) |
| **Zelda II: The Adventure of Link** (1987) | ![](assets/swatches/CFE0A0.png) ![](assets/swatches/2E6B1E.png) ![](assets/swatches/A8241A.png) ![](assets/swatches/1B5EA8.png) ![](assets/swatches/17847A.png) | ![](assets/swatches/170817.png) ![](assets/swatches/4FA637.png) ![](assets/swatches/E0453A.png) ![](assets/swatches/4F9EE0.png) ![](assets/swatches/E0449A.png) |
| **A Link to the Past** (1991) | ![](assets/swatches/D3E8C0.png) ![](assets/swatches/1E7A3A.png) ![](assets/swatches/B8241A.png) ![](assets/swatches/1B5EA8.png) ![](assets/swatches/1E7A6E.png) | ![](assets/swatches/1B1030.png) ![](assets/swatches/3FA060.png) ![](assets/swatches/E0453A.png) ![](assets/swatches/4F9EE0.png) ![](assets/swatches/C060E0.png) |

**Handheld (Game Boy / Color / Advance)**

| Game | Light (bg · keyword · string · function · type) | Dark (bg · keyword · string · function · type) |
|---|---|---|
| **Link's Awakening** (1993) | ![](assets/swatches/DCEEE6.png) ![](assets/swatches/2E9E4F.png) ![](assets/swatches/D9432E.png) ![](assets/swatches/2E7FC4.png) ![](assets/swatches/D9A62E.png) | ![](assets/swatches/0F380F.png) ![](assets/swatches/6FCB2A.png) ![](assets/swatches/A9CB3A.png) ![](assets/swatches/7FE04A.png) ![](assets/swatches/8FE070.png) |
| **Oracle of Seasons** (2001) | ![](assets/swatches/F0DCE0.png) ![](assets/swatches/2E8B3D.png) ![](assets/swatches/D9587A.png) ![](assets/swatches/2E8FC4.png) ![](assets/swatches/D9A62E.png) | ![](assets/swatches/220E0A.png) ![](assets/swatches/4AA8D9.png) ![](assets/swatches/D9642E.png) ![](assets/swatches/4FB8E8.png) ![](assets/swatches/7FE0D8.png) |
| **Oracle of Ages** (2001) | ![](assets/swatches/D8E4C8.png) ![](assets/swatches/2E8050.png) ![](assets/swatches/C4763A.png) ![](assets/swatches/3E6FB0.png) ![](assets/swatches/B8862E.png) | ![](assets/swatches/131417.png) ![](assets/swatches/7A6AE0.png) ![](assets/swatches/E8A23D.png) ![](assets/swatches/4FC4E0.png) ![](assets/swatches/E0B23D.png) |
| **The Minish Cap** (2004) | ![](assets/swatches/DAE1F2.png) ![](assets/swatches/2E8B4A.png) ![](assets/swatches/D9542E.png) ![](assets/swatches/2E8FD9.png) ![](assets/swatches/D9A62E.png) | ![](assets/swatches/1C0A18.png) ![](assets/swatches/7A5AD9.png) ![](assets/swatches/E8703D.png) ![](assets/swatches/5FC4D9.png) ![](assets/swatches/E0B23D.png) |

**N64 & GameCube**

| Game | Light (bg · keyword · string · function · type) | Dark (bg · keyword · string · function · type) |
|---|---|---|
| **Ocarina of Time** (1998) | ![](assets/swatches/DEDCC6.png) ![](assets/swatches/1B7A4D.png) ![](assets/swatches/B5231A.png) ![](assets/swatches/0F5E9C.png) ![](assets/swatches/1E7A6E.png) | ![](assets/swatches/0A0E1C.png) ![](assets/swatches/3DBE82.png) ![](assets/swatches/E8534A.png) ![](assets/swatches/4FA8E8.png) ![](assets/swatches/3ECBB8.png) |
| **Majora's Mask** (2000) | ![](assets/swatches/F2E4D8.png) ![](assets/swatches/C22368.png) ![](assets/swatches/C2650F.png) ![](assets/swatches/7A3EA8.png) ![](assets/swatches/0A8A78.png) | ![](assets/swatches/0D0714.png) ![](assets/swatches/FF4D8D.png) ![](assets/swatches/FFB347.png) ![](assets/swatches/B47EE5.png) ![](assets/swatches/00F5D4.png) |
| **The Wind Waker** (2002) | ![](assets/swatches/F4EAD4.png) ![](assets/swatches/2A5F25.png) ![](assets/swatches/9E1B1B.png) ![](assets/swatches/023E8A.png) ![](assets/swatches/00695C.png) | ![](assets/swatches/06121C.png) ![](assets/swatches/4FB050.png) ![](assets/swatches/E8433A.png) ![](assets/swatches/3D8FE8.png) ![](assets/swatches/2AD9C2.png) |
| **Twilight Princess** (2006) | ![](assets/swatches/E8E0CC.png) ![](assets/swatches/4A6E2E.png) ![](assets/swatches/A0281C.png) ![](assets/swatches/2A5E8A.png) ![](assets/swatches/8A5A24.png) | ![](assets/swatches/14100C.png) ![](assets/swatches/5A7048.png) ![](assets/swatches/A0402E.png) ![](assets/swatches/3E5E78.png) ![](assets/swatches/B0824A.png) |

**Nintendo DS**

| Game | Light (bg · keyword · string · function · type) | Dark (bg · keyword · string · function · type) |
|---|---|---|
| **Phantom Hourglass** (2007) | ![](assets/swatches/D2ECEF.png) ![](assets/swatches/1F7A45.png) ![](assets/swatches/C23B2E.png) ![](assets/swatches/1B5FA8.png) ![](assets/swatches/0E7A6E.png) | ![](assets/swatches/11151B.png) ![](assets/swatches/3FBE70.png) ![](assets/swatches/FF6B55.png) ![](assets/swatches/4FA0E0.png) ![](assets/swatches/3ECBB8.png) |
| **Spirit Tracks** (2009) | ![](assets/swatches/D8E6BC.png) ![](assets/swatches/2E7D32.png) ![](assets/swatches/C23574.png) ![](assets/swatches/2A6E9E.png) ![](assets/swatches/5A7A8A.png) | ![](assets/swatches/1C0A16.png) ![](assets/swatches/4A9E50.png) ![](assets/swatches/E858A0.png) ![](assets/swatches/4A9EE0.png) ![](assets/swatches/8FB4C4.png) |

**Modern (Wii / 3DS / Switch)**

| Game | Light (bg · keyword · string · function · type) | Dark (bg · keyword · string · function · type) |
|---|---|---|
| **Skyward Sword** (2011) | ![](assets/swatches/F0E0B8.png) ![](assets/swatches/2E8F52.png) ![](assets/swatches/B8342A.png) ![](assets/swatches/1C6FB0.png) ![](assets/swatches/2E9C8F.png) | ![](assets/swatches/1C0C05.png) ![](assets/swatches/4FBF7A.png) ![](assets/swatches/E85A3A.png) ![](assets/swatches/3E9FDB.png) ![](assets/swatches/3ED9C4.png) |
| **A Link Between Worlds** (2013) | ![](assets/swatches/E2EAC8.png) ![](assets/swatches/1E8A4A.png) ![](assets/swatches/BB4530.png) ![](assets/swatches/1D7EC2.png) ![](assets/swatches/1E8A82.png) | ![](assets/swatches/1D0A1A.png) ![](assets/swatches/5ECB78.png) ![](assets/swatches/E85A9E.png) ![](assets/swatches/5FA8E0.png) ![](assets/swatches/3ECBB0.png) |
| **Breath of the Wild** (2017) | ![](assets/swatches/DCE6DC.png) ![](assets/swatches/2E8F4A.png) ![](assets/swatches/B8492E.png) ![](assets/swatches/128F94.png) ![](assets/swatches/1E7A9C.png) | ![](assets/swatches/180608.png) ![](assets/swatches/4FA860.png) ![](assets/swatches/C858B0.png) ![](assets/swatches/1FBFB8.png) ![](assets/swatches/3ED9D4.png) |
| **Tears of the Kingdom** (2023) | ![](assets/swatches/E9E8D8.png) ![](assets/swatches/C08A2E.png) ![](assets/swatches/C2632E.png) ![](assets/swatches/2A85C4.png) ![](assets/swatches/3E6FA8.png) | ![](assets/swatches/0A0909.png) ![](assets/swatches/5ECB7E.png) ![](assets/swatches/C060D0.png) ![](assets/swatches/4FC0DC.png) ![](assets/swatches/2EA89C.png) |

<!-- CATALOG:END -->

*(Swatch PNGs are generated locally by `scripts/generate-swatches.js` — no third-party badge service, no network dependency for viewers, nothing to go stale.)*

</details>

## Installing from the Marketplace

Search for **Hylian Palette** in the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`) in VS Code, Positron, or any VS Code-compatible editor, or install from the command line:

```sh
code --install-extension karlmakepeace.positron-hylian-palette
```

*(Not yet listed — the [Publish workflow](.github/workflows/publish.yml) and Marketplace/Open VSX accounts are set up, pending the first release. Until then, install manually below.)*

## Installing locally in Positron

From this folder:

```sh
npx --yes @vscode/vsce package
positron --install-extension positron-hylian-palette-0.4.0.vsix
```

Or, for iterating without repackaging each time, launch an Extension Development Host:

```sh
positron --extensionDevelopmentPath="<full path to this folder>"
```

## Selecting a theme

A few ways:

- Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) → **Preferences: Color Theme** → pick any of the 34 themes (alphabetical, VS Code's standard picker).
- Or run **Hylian Palette: Pick Zelda Theme** — a quick-pick grouped by game in release order, showing Light/Dark side by side per game.
- Or click the theme name in the status bar (bottom right) to open the same quick-pick.
- Or run **Hylian Palette: Random Theme** to jump to a random one of the 34 — a quick way to browse the whole catalog.
- A guided **Welcome: Welcome to Hylian Palette** walkthrough (Command Palette → **Welcome: Open Walkthrough**) covers all of the above the first time you install.

## Toggling between Light and Dark

Run **Hylian Palette: Toggle Theme** from the Command Palette, or press `Ctrl+K Ctrl+Z` (`Cmd+K Cmd+Z` on Mac — rebindable in Keyboard Shortcuts like any other command). It's a *smart, per-game* toggle: it flips between the Light and Dark variant of whichever game's theme is currently active (e.g. "Ocarina of Time Light" → "Ocarina of Time Dark"). If some other, unrelated theme is active, it defaults to Wind Waker Light. Only the standard `workbench.colorTheme` User setting is read or written — no other settings are touched.

## How the themes are built

```mermaid
graph LR
    P["palettes/*.js: 34 files, about 40 story tokens plus rationale each"] --> G["scripts/generate-themes.js"]
    G --> T["themes/*.json: 34 full theme files"]
    G --> K["package.json: contributes.themes"]
    G --> M["theme-metadata.json: game, mode, slug, year"]
    G --> C{"WCAG contrast check"}
    C -->|"pass, 4.5 to 1 or better"| OK["build succeeds"]
    C -->|"fail"| X["build fails, fix the palette"]
    M -.-> E["extension.js: smart toggle plus quick pick"]
```

Hand-authoring ~300 color keys × 34 themes doesn't scale, so `scripts/generate-themes.js` (a dev-only build tool, not shipped as a runtime dependency) expands a compact ~40-token "story palette" per game/mode — defined in `palettes/*.js`, each with inline rationale comments — into the full theme JSON, and runs an automated contrast check across all of them. See the comment header in any `palettes/*.js` file for that game's specific design story.

```sh
node scripts/generate-themes.js    # regenerate themes/*.json + package.json + theme-metadata.json
node scripts/generate-swatches.js  # regenerate assets/swatches/*.png for this README
```

## Accessibility

Every theme is checked automatically (WCAG 2.1 relative-luminance formula) before it's allowed to build: editor text, comments, and sidebar text must all clear **4.5:1** contrast against their background. Most clear it by a wide margin — editor-text ratios across the family run roughly 6:1 to 15:1. A few notable ones:

| Theme | Editor text / bg | Comment / bg |
|---|---|---|
| Tears of the Kingdom Dark | 15.36:1 | 9.01:1 |
| Wind Waker Dark | 14.59:1 | 5.64:1 |
| Link's Awakening Dark *(the near-monochrome DMG-green theme)* | 6.02:1 | 5.03:1 — the tightest margin in the family, still comfortably clear |

## Color science

Beyond WCAG contrast, every theme's syntax-relevant colors (the 13 roles that actually sit next to each other in real code: keyword, storage, string, regex, function, function-dim, type, interface, number, decorator, namespace, error, warning) are analyzed in CIE Lab space — `analysis/color_science.R`, a from-scratch pure-R implementation (standard sRGB→Lab conversion and the published Machado/Oliveira/Fernandes (2009) color-vision-deficiency model, the same one `colorspace`'s CVD functions are based on — hand-implemented after `colorspace`/`farver` proved to segfault reproducibly on the dev machine at any real scale, even freshly recompiled from source; validated against textbook Lab reference values for pure red/green/blue before use).

<img src="assets/color-science/theme-colorspace-grid.png" alt="Each theme's syntax colors plotted in the CIE a*-b* plane, connected keyword→storage→string→regex→function→type→interface→number→decorator→namespace" width="900">

Each theme's 10 core syntax colors plotted in the CIE a\*-b\* (chroma/hue) plane and connected in a fixed order — the shape each theme traces is itself informative: Link's Awakening Dark's polygon collapses to a tiny cluster near the origin (the near-monochrome Game Boy palette), while e.g. Majora's Mask Dark's sprawls across the whole plane.

<img src="assets/color-science/pca-global.png" alt="Global PCA of all 34 themes' syntax colors in Lab space, colored by role" width="700">

A global PCA (all 34 themes' syntax colors at once, unscaled Lab coordinates) shows the roles are largely separable across the *whole family*, not just within any one theme — keywords (green) and functions (orange) each occupy fairly consistent regions of color space regardless of which game's theme they're from.

### Which themes look like each other

The plot above has one point per (theme, role) — 442 points, answering "where do keyword colors sit vs. string colors." This one flips it: one point per **theme**. Each theme's 13 syntax-role colors are converted to Lab and concatenated in a fixed role order into a single 39-dimensional feature vector (`analysis/theme_similarity.R`) — two themes are "close" exactly when their syntax colors, role for role, are close in perceptual color space. A scaled PCA (unlike the unscaled one above — here each of the 39 columns is a different semantic channel, so scaling keeps any one role from dominating just because it has a larger raw range) projects that down to 2D:

<img src="assets/color-science/theme-pca.png" alt="Per-theme PCA: each of the 34 themes as a single point in a 2D projection of its 39-dimensional syntax-color feature vector, colored by era and shaped by mode" width="900">

Link's Awakening Dark is a dramatic outlier (bottom-right, far from every other point) — exactly what you'd expect from the one deliberately near-monochrome theme in the family, and a nice quantitative confirmation of that design choice. A 2D projection compresses everything else together, though, so the same 39-dimensional feature vectors also feed a hierarchical clustering (Ward's method) as a complementary, more precise "nearest neighbor" view:

<img src="assets/color-science/theme-dendrogram.png" alt="Hierarchical clustering dendrogram of all 34 themes based on the same 39-dimensional syntax-color feature vector, colored by era" width="900">

Two things stand out. First, the broad top-level split is mostly light-vs-dark — expected, since a theme's whole syntax palette is tuned as one coherent unit against its own background. Second, and more interesting: **Majora's Mask Light and Majora's Mask Dark cluster with *each other*** rather than with their respective light/dark neighbors — the one pair in the family that breaks the light/dark split. That's a direct, unplanned empirical confirmation of this project's own design rule (keep 1-2 identity colors constant across a game's Light/Dark pair): Majora's Mask keeps *more* of its palette constant between modes than any other game, and the clustering picks that up on its own.

### Color-vision-deficiency audit

Every syntax-role pair within every theme was checked for CIE76 (ΔE\*ab) distance under simulated protanopia, deuteranopia, and tritanopia. 2,652 role-pairs were checked across all 34 themes; a pair is flagged when it's safely distinguishable under normal vision (≥15 ΔE) but collapses to under 10 ΔE under some CVD type — a real, meaningful loss, not noise.

<img src="assets/color-science/cvd-swatch-grid.png" alt="Grid of every theme's syntax colors under normal vision and simulated protanopia, deuteranopia, and tritanopia" width="500">

The dominant, systematic finding: `accentStorage` was frequently placed too close to `accentKeyword`, `accentString`, or `colorError` along the exact axis protanopia/deuteranopia collapses — visually distinct to normal vision (many pairs 30-100+ ΔE apart), but landing under 5 ΔE apart for red-green color blindness in the worst cases. This is a standard, well-known failure mode (categorical colors that differ mainly by hue, not lightness, are exactly what CVD removes) — the fix is increasing **lightness** separation, since luminance survives all three deficiency types even when hue collapses.

35 severe cases (near-total collapse, <5 ΔE under some CVD type) were found across 19 themes; 20 palette token adjustments (`accentStorage` in most cases, `accentType` for a recurring green-vs-teal tritanopia collision in 5 light themes) brought that down to 13 remaining. A second, more careful pass targeted those 13 directly — this time checking each candidate fix against *every* neighboring role's actual Lab position first (not just the one pair being fixed), since the first pass's batch approach had occasionally traded one collision for a new one. That pass brought 13 down to **3**, all three in Link's Awakening Dark (`accentKeyword`/`accentString`, `accentFunction`/`accentType`, `accentString`/`accentFunction`) — left deliberately unfixed, because they come from that theme's whole point: the real 4-shade DMG Game Boy green ramp (`#0F380F #306230 #8BAC0F #9BBC0F`), which has almost no hue variation to begin with. Forcing more CVD separation there would mean abandoning the hardware-accurate palette that theme exists to showcase, so this is a permanent, disclosed trade-off rather than an open bug. Every fix (both passes) stayed within readable-brightness bounds and was re-verified against the WCAG contrast gate afterward — see `analysis/data/computed-fixes.csv` and `analysis/data/severe-flagged.csv` for the full before/after record.

```sh
node scripts/export-color-data.js   # regenerate analysis/data/colors.csv from palettes/*.js
Rscript --vanilla analysis/color_science.R     # regenerate the per-color plots + CVD audit CSVs
Rscript --vanilla analysis/theme_similarity.R  # regenerate the per-theme PCA + dendrogram
```

## Notes

- `publisher` in `package.json` is a placeholder (`karlmakepeace`) — it only needs to be a syntactically valid identifier for local packaging/installation and does not need to be registered on the Marketplace unless you later publish it.
- No game artwork, logos, or copyrighted assets are included anywhere in this repo — every visual here (the icon, the swatch PNGs, the color-science plots) is generated from plain hex color data or hand-drawn geometry, never copied imagery.

## License

MIT — see the LICENSE file included with this extension.
