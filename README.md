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
18 games · 36 themes · one VS Code / Positron extension.

[![explorer](https://img.shields.io/badge/live_explorer-interactive_workbench-C9A227?style=flat-square)](https://karlmakepeace.github.io/positron-hylian-palette/)
[![build](https://github.com/karlmakepeace/positron-hylian-palette/actions/workflows/build.yml/badge.svg)](https://github.com/karlmakepeace/positron-hylian-palette/actions/workflows/build.yml)
![version](https://img.shields.io/badge/version-1.0.0-264EB5?style=flat-square)
![themes](https://img.shields.io/badge/themes-36-7209B7?style=flat-square)
![games](https://img.shields.io/badge/games-18-00A896?style=flat-square)
![contrast](https://img.shields.io/badge/WCAG_AA-100%25_(720%2F720)-2A5F25?style=flat-square)
![perceptual](https://img.shields.io/badge/OKLCH_%C2%B7_APCA_%C2%B7_CIEDE2000-verified-1B5EA8?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

**[Launch the Live Interactive Workbench & Colorimetry Explorer ↗](https://karlmakepeace.github.io/positron-hylian-palette/)**
*(Or run **`Hylian Palette: Open Palette & Colorimetry Explorer`** directly inside VS Code / Positron!)*

</div>

---

Every pair in **Hylian Palette** is individually authored from its game's actual art direction and display hardware — never a generic syntax template reskinned onto a new background:

- **Ocarina of Time** maps syntax roles directly to the three Spiritual Stones (Kokiri Emerald, Goron Ruby, Zora Sapphire) and the royal periwinkle-indigo Ocarina itself, anchored by unchanging `#C9A227` Triforce gold.
- **Zelda II**, **Majora's Mask**, **Breath of the Wild**, **Oracle of Ages**, and **Echoes of Wisdom** deliberately break out of traditional "green keyword" conventions when the game's visual identity calls for Palace brick-crimson, Carnival plum-magenta, Sheikah Slate cyan-blue, Nayru's Harp of Ages sapphire, or Zelda's royal traveling cloak and Tri Rod gold.
- **Twilight Princess Dark** desaturates its entire Twilight Realm syntax envelope into muted sage, dusk slate, and glowing cyan runes so Midna's `#FF781F` flame-orange cursor stands out exactly as she does on screen.
- **Link's Awakening Dark** honors the 1993 DMG-01 Game Boy's iconic 4-shade olive-green reflective LCD (`#0F380F`–`#9BBC0F`) with a perceptually monotonic OKLCH lightness ramp that still clears WCAG AA across every role.

Every palette is synthesized and verified in **OKLCH** perceptual color space against **WCAG 2.1**, **APCA-W3**, **CIEDE2000** ($\Delta E_{00}$), and **Machado et al. (2009)** dichromacy simulation. Design inspiration comes strictly from **color language and atmosphere** — no game artwork, logos, sprites, or copyrighted assets are included or referenced anywhere in this repository.

Named "Hylian" rather than "Hyrule" on purpose: several of these games aren't set in Hyrule at all (Termina, Koholint, Holodrum, Labrynna, the Great Sea, Lorule, the Still World). "Hylian" — the heritage, shield crest, and script that thread through every era — is the one name that spans the whole series.

## The 18 games, by release date

```mermaid
timeline
    title The Legend of Zelda — 18 Mainline Games (1986–2024)
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
        2024 : Echoes of Wisdom
```

## ...and by in-universe story chronology

This is the other timeline — the one every Zelda fan actually means by "the timeline." Per Nintendo's official chronology, the story splits into three branches after *Ocarina of Time* (Child, Adult, and Downfall — including *Echoes of Wisdom* between *Tri Force Heroes* and the Era of Decline's original *The Legend of Zelda* and *Zelda II*) before reconverging in the distant future with *Breath of the Wild* and *Tears of the Kingdom*. Rendered from scratch in this project's own style and colors:

<img src="assets/timeline/timeline-metro.png" alt="Zelda in-universe story chronology as a metro map across all 18 mainline games: a unified trunk (Skyward Sword, The Minish Cap, Four Swords, Ocarina of Time) splits at Ocarina of Time into the Child Timeline (Majora's Mask, Twilight Princess), Adult Timeline (The Wind Waker, Phantom Hourglass, Spirit Tracks), and Downfall Timeline (A Link to the Past, Link's Awakening, Oracle of Seasons/Ages, A Link Between Worlds, Echoes of Wisdom, The Legend of Zelda, Zelda II), reconverging into Breath of the Wild and Tears of the Kingdom" width="900">

```sh
Rscript --vanilla analysis/timeline_metro.R  # or: python3 scripts/generate-color-science-assets.py
```

## Every pair tells a story

Four examples of how a Light/Dark pair is built — anchored to each game's specific world, lighting, and signature identity color while maintaining perceptual contrast and OKLCH lightness separation:

### Ocarina of Time (1998) — the three Spiritual Stones & the royal-blue Ocarina

| Role | Light | Dark |
|---|---|---|
| Background | ![](assets/swatches/EDE9D6.png) `#EDE9D6` sunlit Temple of Time limestone | ![](assets/swatches/070E1D.png) `#070E1D` midnight Hyrule Field & Water Temple |
| Keywords | ![](assets/swatches/007345.png) `#007345` Kokiri **Emerald** | ![](assets/swatches/6BD798.png) `#6BD798` Kokiri Emerald lit by dungeon torchlight |
| Strings | ![](assets/swatches/B92B3E.png) `#B92B3E` Goron **Ruby** | ![](assets/swatches/FA6C3F.png) `#FA6C3F` volcanic Death Mountain ruby-ember |
| Functions | ![](assets/swatches/3662B7.png) `#3662B7` Zora **Sapphire** | ![](assets/swatches/4492D2.png) `#4492D2` luminous Zora Sapphire |
| Types | ![](assets/swatches/3D2E98.png) `#3D2E98` the royal periwinkle-indigo Ocarina | ![](assets/swatches/9E8EFF.png) `#9E8EFF` glowing Ocarina & Nocturne of Shadow |
| **Identity accent** | ![](assets/swatches/C9A227.png) `#C9A227` **Triforce gold** (cursor & focus) | ![](assets/swatches/C9A227.png) `#C9A227` byte-for-byte identical Triforce gold |

### The Wind Waker (2002) — cel-shaded Great Sea by day and by starlight

| Role | Light | Dark |
|---|---|---|
| Background | ![](assets/swatches/F7ECD6.png) `#F7ECD6` sun-bleached sea-chart parchment | ![](assets/swatches/001018.png) `#001018` abyssal midnight ocean |
| Keywords | ![](assets/swatches/003B1E.png) `#003B1E` Outset Island Hero's tunic green | ![](assets/swatches/8FF794.png) `#8FF794` Wind's Requiem seafoam-emerald |
| Strings | ![](assets/swatches/BD393B.png) `#BD393B` King of Red Lions' hull & crest | ![](assets/swatches/FF6645.png) `#FF6645` lantern-lit vermilion hull |
| Functions | ![](assets/swatches/00428A.png) `#00428A` crisp cel-shaded Great Sea ultramarine | ![](assets/swatches/4CABFD.png) `#4CABFD` moonlit cresting wave blue |
| Types | ![](assets/swatches/087573.png) `#087573` Wind Waker baton lagoon teal | ![](assets/swatches/00DACB.png) `#00DACB` bioluminescent Great Sea turquoise |
| **Identity accent** | ![](assets/swatches/D62828.png) `#D62828` **King of Red Lions crimson** | ![](assets/swatches/FA5247.png) `#FA5247` luminous crimson beacon |

### Majora's Mask (2000) — Carnival of Time fever-dream & Termina's Final Night

| Role | Light | Dark |
|---|---|---|
| Background | ![](assets/swatches/F9E6DA.png) `#F9E6DA` Dawn of the Final Day peach-parchment | ![](assets/swatches/10071B.png) `#10071B` Clock Tower midnight violet void |
| Keywords | ![](assets/swatches/64003D.png) `#64003D` Majora's Mask plum-magenta | ![](assets/swatches/FC4FA2.png) `#FC4FA2` neon Majora magenta |
| Strings | ![](assets/swatches/9E4F37.png) `#9E4F37` Termina sunset & Deku copper-orange | ![](assets/swatches/FD940B.png) `#FD940B` blazing falling-Moon amber |
| Functions | ![](assets/swatches/562694.png) `#562694` Woodfall & Skull Kid royal violet | ![](assets/swatches/B490FC.png) `#B490FC` astral Woodfall lavender-purple |
| Types | ![](assets/swatches/00736E.png) `#00736E` Fierce Deity & Great Bay deep teal | ![](assets/swatches/00FEED.png) `#00FEED` electric Fierce Deity cyan |
| **Identity accent** | ![](assets/swatches/BD195D.png) `#BD195D` **Majora magenta** cursor | ![](assets/swatches/1CEAD4.png) `#1CEAD4` **Fierce Deity cyan** cursor & focus |

### Echoes of Wisdom (2024) — toybox diorama Hyrule & the Still World rift

| Role | Light | Dark |
|---|---|---|
| Background | ![](assets/swatches/F5EEDE.png) `#F5EEDE` sunlit tilt-shift Castle Town craft stone | ![](assets/swatches/0F091F.png) `#0F091F` fractured Still World indigo-violet rift |
| Keywords | ![](assets/swatches/003CAF.png) `#003CAF` Princess Zelda's royal indigo cloak | ![](assets/swatches/FFC83C.png) `#FFC83C` **Tri's golden triangles** & Tri Rod glow |
| Strings | ![](assets/swatches/A9226E.png) `#A9226E` encroaching Null rift magenta | ![](assets/swatches/EB64C0.png) `#EB64C0` luminous Still World rift magenta-rose |
| Functions | ![](assets/swatches/004648.png) `#004648` Zora Cove & Bind-tether deep teal | ![](assets/swatches/3DF6FF.png) `#3DF6FF` Swordfighter-form energy cyan |
| Types | ![](assets/swatches/24793E.png) `#24793E` Faron Wetlands & toybox meadow green | ![](assets/swatches/4CD283.png) `#4CD283` suspended Still World canopy emerald |
| **Identity accent** | ![](assets/swatches/C98A08.png) `#C98A08` **Tri Rod gold** cursor | ![](assets/swatches/FFD147.png) `#FFD147` radiant Tri golden trail |

## The full catalog

<details>
<summary><strong>All 36 themes across 18 mainline games, era by era — click to expand</strong></summary>

Each swatch strip reads left to right: **background · keywords · strings · functions · types**. Every single theme has unique primary hexes — zero copy-pasted syntax templates across games.

<!-- CATALOG:START -->

**8-bit & 16-bit Classics**

| Game | Light (bg · keyword · string · function · type) | Dark (bg · keyword · string · function · type) |
|---|---|---|
| **The Legend of Zelda** (1986) | ![](assets/swatches/F4E4BE.png) ![](assets/swatches/1B5C1F.png) ![](assets/swatches/A73731.png) ![](assets/swatches/01489F.png) ![](assets/swatches/006F7F.png) | ![](assets/swatches/140D06.png) ![](assets/swatches/9AE849.png) ![](assets/swatches/F16F38.png) ![](assets/swatches/5DA7FF.png) ![](assets/swatches/0FD8DA.png) |
| **Zelda II: The Adventure of Link** (1987) | ![](assets/swatches/E4EDC9.png) ![](assets/swatches/A3212D.png) ![](assets/swatches/975106.png) ![](assets/swatches/00459A.png) ![](assets/swatches/077280.png) | ![](assets/swatches/150915.png) ![](assets/swatches/F15C86.png) ![](assets/swatches/FAA037.png) ![](assets/swatches/5CA9FC.png) ![](assets/swatches/C74AAE.png) |
| **A Link to the Past** (1991) | ![](assets/swatches/DCF0D9.png) ![](assets/swatches/1B7037.png) ![](assets/swatches/BE2138.png) ![](assets/swatches/044AA7.png) ![](assets/swatches/004B53.png) | ![](assets/swatches/150B25.png) ![](assets/swatches/A9CD6C.png) ![](assets/swatches/EF6ABA.png) ![](assets/swatches/ACD6FF.png) ![](assets/swatches/AD82FB.png) |

**Handheld (Game Boy / Color / Advance)**

| Game | Light (bg · keyword · string · function · type) | Dark (bg · keyword · string · function · type) |
|---|---|---|
| **Link's Awakening** (1993) | ![](assets/swatches/DFF3EC.png) ![](assets/swatches/12662B.png) ![](assets/swatches/B03B37.png) ![](assets/swatches/00355C.png) ![](assets/swatches/662785.png) | ![](assets/swatches/0F380F.png) ![](assets/swatches/9BBC0F.png) ![](assets/swatches/B6D63C.png) ![](assets/swatches/8CC42B.png) ![](assets/swatches/A6CF52.png) |
| **Oracle of Seasons** (2001) | ![](assets/swatches/FCE5E7.png) ![](assets/swatches/004425.png) ![](assets/swatches/88004F.png) ![](assets/swatches/174F86.png) ![](assets/swatches/067479.png) | ![](assets/swatches/1C0805.png) ![](assets/swatches/A6E6FF.png) ![](assets/swatches/FD731E.png) ![](assets/swatches/61A3FA.png) ![](assets/swatches/57E8B5.png) |
| **Oracle of Ages** (2001) | ![](assets/swatches/E5EEDC.png) ![](assets/swatches/00489F.png) ![](assets/swatches/B53C38.png) ![](assets/swatches/00464C.png) ![](assets/swatches/20763C.png) | ![](assets/swatches/0C1016.png) ![](assets/swatches/A386FF.png) ![](assets/swatches/FA943A.png) ![](assets/swatches/11B8E6.png) ![](assets/swatches/00FACF.png) |
| **The Minish Cap** (2004) | ![](assets/swatches/E2EDFC.png) ![](assets/swatches/227236.png) ![](assets/swatches/BA3435.png) ![](assets/swatches/105181.png) ![](assets/swatches/57228C.png) | ![](assets/swatches/170816.png) ![](assets/swatches/AB8EFF.png) ![](assets/swatches/FF8346.png) ![](assets/swatches/ADE4FF.png) ![](assets/swatches/FCCF3A.png) |

**N64 & GameCube**

| Game | Light (bg · keyword · string · function · type) | Dark (bg · keyword · string · function · type) |
|---|---|---|
| **Ocarina of Time** (1998) | ![](assets/swatches/EDE9D6.png) ![](assets/swatches/007345.png) ![](assets/swatches/B92B3E.png) ![](assets/swatches/3662B7.png) ![](assets/swatches/3D2E98.png) | ![](assets/swatches/070E1D.png) ![](assets/swatches/6BD798.png) ![](assets/swatches/FA6C3F.png) ![](assets/swatches/4492D2.png) ![](assets/swatches/9E8EFF.png) |
| **Majora's Mask** (2000) | ![](assets/swatches/F9E6DA.png) ![](assets/swatches/64003D.png) ![](assets/swatches/9E4F37.png) ![](assets/swatches/562694.png) ![](assets/swatches/00736E.png) | ![](assets/swatches/10071B.png) ![](assets/swatches/FC4FA2.png) ![](assets/swatches/FD940B.png) ![](assets/swatches/B490FC.png) ![](assets/swatches/00FEED.png) |
| **The Wind Waker** (2002) | ![](assets/swatches/F7ECD6.png) ![](assets/swatches/003B1E.png) ![](assets/swatches/BD393B.png) ![](assets/swatches/00428A.png) ![](assets/swatches/087573.png) | ![](assets/swatches/001018.png) ![](assets/swatches/8FF794.png) ![](assets/swatches/FF6645.png) ![](assets/swatches/4CABFD.png) ![](assets/swatches/00DACB.png) |
| **Twilight Princess** (2006) | ![](assets/swatches/EDE4D2.png) ![](assets/swatches/486C37.png) ![](assets/swatches/B22F30.png) ![](assets/swatches/004B79.png) ![](assets/swatches/106E70.png) | ![](assets/swatches/150F08.png) ![](assets/swatches/AED5A1.png) ![](assets/swatches/EC8E72.png) ![](assets/swatches/7AAFD4.png) ![](assets/swatches/37E2DD.png) |

**Nintendo DS**

| Game | Light (bg · keyword · string · function · type) | Dark (bg · keyword · string · function · type) |
|---|---|---|
| **Phantom Hourglass** (2007) | ![](assets/swatches/DAF3F5.png) ![](assets/swatches/32632D.png) ![](assets/swatches/B01A2D.png) ![](assets/swatches/003E7C.png) ![](assets/swatches/077578.png) | ![](assets/swatches/091117.png) ![](assets/swatches/9BF4A2.png) ![](assets/swatches/FF6E46.png) ![](assets/swatches/54AEFE.png) ![](assets/swatches/02DFDE.png) |
| **Spirit Tracks** (2009) | ![](assets/swatches/E8EED2.png) ![](assets/swatches/296524.png) ![](assets/swatches/951362.png) ![](assets/swatches/004C86.png) ![](assets/swatches/00747E.png) | ![](assets/swatches/190810.png) ![](assets/swatches/8DE69A.png) ![](assets/swatches/F56BBD.png) ![](assets/swatches/4EAFFD.png) ![](assets/swatches/00E3FD.png) |

**Modern (Wii / 3DS / Switch)**

| Game | Light (bg · keyword · string · function · type) | Dark (bg · keyword · string · function · type) |
|---|---|---|
| **Skyward Sword** (2011) | ![](assets/swatches/F6E9CD.png) ![](assets/swatches/003B20.png) ![](assets/swatches/B43E37.png) ![](assets/swatches/094C83.png) ![](assets/swatches/007275.png) | ![](assets/swatches/1A0904.png) ![](assets/swatches/73DF9A.png) ![](assets/swatches/F36633.png) ![](assets/swatches/49B0FC.png) ![](assets/swatches/00FEF4.png) |
| **A Link Between Worlds** (2013) | ![](assets/swatches/EAEED6.png) ![](assets/swatches/115D23.png) ![](assets/swatches/A82327.png) ![](assets/swatches/004982.png) ![](assets/swatches/067576.png) | ![](assets/swatches/180716.png) ![](assets/swatches/7EDB74.png) ![](assets/swatches/F167BC.png) ![](assets/swatches/3FA7FF.png) ![](assets/swatches/00FBEB.png) |
| **Breath of the Wild** (2017) | ![](assets/swatches/E3F0E6.png) ![](assets/swatches/005087.png) ![](assets/swatches/A84B35.png) ![](assets/swatches/007579.png) ![](assets/swatches/004427.png) | ![](assets/swatches/1A0607.png) ![](assets/swatches/1AE9EF.png) ![](assets/swatches/E866C8.png) ![](assets/swatches/2BA5FD.png) ![](assets/swatches/64D281.png) |
| **Tears of the Kingdom** (2023) | ![](assets/swatches/F2EFE0.png) ![](assets/swatches/006F4E.png) ![](assets/swatches/A65433.png) ![](assets/swatches/005087.png) ![](assets/swatches/845F00.png) | ![](assets/swatches/080D0D.png) ![](assets/swatches/50FEB7.png) ![](assets/swatches/F6597C.png) ![](assets/swatches/399FC8.png) ![](assets/swatches/FFC83E.png) |
| **Echoes of Wisdom** (2024) | ![](assets/swatches/F5EEDE.png) ![](assets/swatches/003CAF.png) ![](assets/swatches/A9226E.png) ![](assets/swatches/004648.png) ![](assets/swatches/24793E.png) | ![](assets/swatches/0F091F.png) ![](assets/swatches/FFC83C.png) ![](assets/swatches/EB64C0.png) ![](assets/swatches/3DF6FF.png) ![](assets/swatches/4CD283.png) |

<!-- CATALOG:END -->

*(Swatch PNGs are generated locally by `scripts/generate-swatches.js` — no third-party badge service, no network dependency for viewers, nothing to go stale.)*

</details>

## Installing from the Marketplace or Open VSX

Search for **Hylian Palette** in the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`) in VS Code, Positron, or any VS Code-compatible editor, or install from the command line:

```sh
code --install-extension karlmakepeace.positron-hylian-palette
# or in Positron:
positron --install-extension karlmakepeace.positron-hylian-palette
```

## Packaging & installing locally

From this repository root:

```sh
npx --yes @vscode/vsce package
positron --install-extension positron-hylian-palette-1.0.0.vsix
```

Or launch an Extension Development Host without packaging:

```sh
positron --extensionDevelopmentPath="<full path to this folder>"
```

## Selecting & previewing themes

- **Hylian Palette: Open Palette & Colorimetry Explorer** (Command Palette or Welcome walkthrough): opens a 100% offline interactive workbench & colorimetry studio directly inside VS Code / Positron — preview R, Python, TypeScript, and Quarto/SQL buffers across all 36 themes, inspect live OKLCH / WCAG 2.1 / APCA readouts and OKLab chromaticity polygons, simulate Protanopia / Deuteranopia / Tritanopia in real time, and click **Apply to Workbench** (or toggle **Live-sync IDE**) to switch your editor theme on the fly. The exact same explorer is also hosted on the web via **[GitHub Pages](https://karlmakepeace.github.io/positron-hylian-palette/)**.
- **Hylian Palette: Pick Zelda Theme** (Command Palette or click the active theme badge in the bottom-right status bar): opens a release-ordered quick-pick grouped by all 18 games with **live theme preview** as you arrow up/down, subtitle lore notes on every entry, an `Active` indicator on your current theme, and clean `Esc` rollback if you cancel.
- **Preferences: Color Theme** (`Ctrl+K Ctrl+T` / `Cmd+K Cmd+T`): standard alphabetical VS Code / Positron picker across all 36 themes.
- **Hylian Palette: Random Theme**: jumps to a random theme across the other 35 themes — great for touring the catalog.
- **Welcome: Open Walkthrough** → **Welcome to Hylian Palette**: interactive first-run walkthrough covering theme picking, per-game Light/Dark toggling, identity accents, and launching the interactive Explorer.

## Smart Light ↔ Dark per-game toggle

Run **Hylian Palette: Toggle Theme** from the Command Palette or press `Ctrl+K Ctrl+Z` (`Cmd+K Cmd+Z` on macOS). Unlike a generic light/dark switch, it flips between the Light and Dark variant of **whichever game you're currently using** (e.g. *Echoes of Wisdom Light* ↔ *Echoes of Wisdom Dark*, *Ocarina of Time Light* ↔ *Ocarina of Time Dark*). If a non-Hylian theme is active, it starts on *The Wind Waker Light*. Only the standard `workbench.colorTheme` User setting is read or written.

## How the themes are built

```mermaid
graph LR
    P["palettes/*.js: 36 bespoke game palettes"] --> G["scripts/generate-themes.js"]
    P --> X["scripts/generate-explorer.js"]
    CS["scripts/color-science.js: OKLCH + WCAG + APCA + CIEDE2000 + CVD"] --> G
    CS --> V["scripts/validate.js"]
    G --> T["themes/*.json: 36 full VS Code + Positron themes"]
    G --> K["package.json: contributes.themes"]
    G --> M["theme-metadata.json: game, mode, slug, year, subtitle"]
    X --> S["site/index.html: GitHub Pages Explorer"]
    X --> W["assets/explorer/explorer.html: Webview Explorer"]
    T --> V
    S --> V
    W --> V
    V -->|"720/720 AA + zero-CDN CSP + 5472 Positron keys"| OK["CI & vsce package succeed"]
    M -.-> E["extension.js: QuickPick + Webview Explorer + toggle + status bar"]
```

Hand-authoring ~350 workbench, TextMate, semantic-token, and Positron IDE keys across 36 themes doesn't scale by hand, so `scripts/generate-themes.js` expands each game's ~45-token story palette (`palettes/*.js`) using OKLCH perceptual mixing, `scripts/generate-explorer.js` compiles the self-contained GitHub Pages (`site/index.html`) and VS Code Webview (`assets/explorer/explorer.html`) interactive explorers from those same modules, and `scripts/validate.js` enforces multi-gate colorimetric and zero-CDN CSP verification on every build:

```sh
node scripts/generate-themes.js    # regenerate themes/*.json + package.json + theme-metadata.json
node scripts/generate-explorer.js  # regenerate site/index.html + assets/explorer/explorer.html
node scripts/generate-swatches.js  # regenerate 345 local swatch PNGs in assets/swatches/
node scripts/validate.js           # audit all 36 themes, Explorer CSP & Positron key provenance
```

## Accessibility & perceptual contrast

Every single theme must clear strict automated perceptual gates before `generate-themes.js` or `validate.js` will succeed:

- **100% WCAG 2.1 AA compliance (`720 / 720` foreground & syntax tokens)**: all 20 foreground/syntax tokens in all 36 themes clear **$\ge$ 4.5:1** on `editor.background` (actual range across the family: **`4.62:1` to `14.36:1`**) and **$\ge$ 3.8:1** on `editor.lineHighlightBackground`.
- **APCA-W3 spatial contrast**: primary body text (`fg` on `bg`) achieves **`|Lc| = 79.4` to `93.7`** (`12.68:1`–`14.36:1` WCAG) across all 35 polychromatic themes, tuned to prevent halation on dark OLED displays while keeping warm paper-like light themes crisp and glare-free.
- **Figure–ground hierarchy**: comments (`fgComment`) clear AA comfortably (`4.77:1`–`6.05:1`) while remaining perceptually subordinate to active code tokens so documentation never competes with control flow.
- **576 / 576 ANSI terminal tokens verified**: all 16 ANSI colors in every integrated terminal / Positron console clear contrast gates while preserving canonical terminal hue bands (so red errors stay red and green diffs stay green even when a theme's syntax keywords are gold or indigo).

| Representative Theme | Editor `fg` / `bg` (WCAG) | Editor `fg` / `bg` (`|Lc|` APCA) | Comment / `bg` | Tightest foreground/syntax role / `bg` |
|---|---|---|---|---|
| **Echoes of Wisdom Light** | `14.36:1` | `93.7` | `5.90:1` | `4.68:1` |
| **The Wind Waker Light** | `13.96:1` | `92.5` | `5.95:1` | `4.70:1` |
| **Tears of the Kingdom Dark** | `13.33:1` | `80.9` | `5.89:1` | `4.64:1` |
| **Majora's Mask Dark** | `13.21:1` | `80.0` | `5.89:1` | `5.05:1` |
| **Twilight Princess Dark** *(muted Twilight Realm)* | `12.79:1` | `79.8` | `5.94:1` | `4.70:1` |
| **Link's Awakening Dark** *(1993 DMG-01 LCD ramp)* | `8.74:1` | `74.2` | `4.77:1` | `4.66:1` |

## Color science

Every theme's 13 adjacent syntax-relevant roles (`keyword`, `storage`, `string`, `regex`, `function`, `function-dim`, `type`, `interface`, `number`, `decorator`, `namespace`, `error`, `warning` — **468 syntax tokens** across 36 themes) are synthesized in Björn Ottosson's **OKLCH** perceptual color space and audited in **CIE 1976 $L^*a^*b^*$** (`CIEDE2000` $\Delta E_{00}$ for normal-vision categorical distinctness and **Machado, Oliveira & Fernandes (2009)** physiological cone-matrix simulation for protanopia, deuteranopia, and tritanopia).

<img src="assets/color-science/theme-colorspace-grid.png" alt="All 36 themes' 10 core syntax colors plotted in the CIE a*-b* plane, connected in fixed semantic order" width="900">

Plotting each theme's 10 core syntax roles in the CIE $a^*$–$b^*$ chromaticity plane and connecting them in fixed role order reveals each game's chromatic "signature" at a glance: *Link's Awakening Dark* collapses into a tight olive-chartreuse needle near a single hue angle (authentic DMG-01 LCD), *Twilight Princess Dark* forms a restrained atmospheric envelope, and high-chroma worlds like *Majora's Mask Dark*, *Tears of the Kingdom Dark*, and *Echoes of Wisdom Dark* span wide, balanced polygons across all four quadrants.

<img src="assets/color-science/family-fingerprint.png" alt="Chromatic polygons of all 36 themes faceted across the 5 hardware eras" width="900">

<img src="assets/color-science/pca-global.png" alt="Global PCA of all 468 syntax tokens across 36 themes in CIE Lab space, colored by semantic role" width="750">

An unscaled global PCA across all **468 syntax tokens** (`PC1 = 50.1%`, `PC2 = 37.7%`, explaining **87.8%** of total perceptual variance in 2D) shows how semantic roles occupy structured, well-separated regions while intentionally allowing game-driven cross-hue expressive freedom where lore demands it.

### Which themes look like each other

Converting each theme's 13 syntax roles into a **39-dimensional CIE $L^*a^*b^*$ feature vector** (`analysis/theme_similarity.R`) lets us compare entire themes side-by-side via standardized PCA (`PC1 = 40.6%`, `PC2 = 15.4%`) and **Ward's minimum-variance hierarchical clustering**:

<img src="assets/color-science/theme-pca.png" alt="Per-theme 39-D standardized CIE Lab PCA across all 36 themes, colored by hardware era and shaped by Light/Dark mode" width="900">

<img src="assets/color-science/theme-dendrogram.png" alt="Ward's hierarchical clustering dendrogram of all 36 themes on 39-D standardized CIE Lab profiles" width="900">

Three empirical patterns emerge directly from the geometry without any manual grouping:

1. **Clean polarity separation + hardware-monochrome isolation**: Light and Dark themes separate cleanly along `PC1`, while **Link's Awakening Dark** branches off first from the entire Dark supercluster at Ward linkage distance `~19.5` (and sits isolated in the upper-right of `PC1`–`PC2`), quantitatively confirming its unique 1993 DMG-01 LCD profile.
2. **Art-direction subclusters within Light mode**: the three Light themes that replace traditional green keywords with royal/slate blue — **Echoes of Wisdom Light** (Zelda's indigo cloak), **Oracle of Ages Light** (Nayru's Harp of Ages), and **Breath of the Wild Light** (Sheikah Slate blue) — form their own cohesive branch, while **Zelda II Light** (Palace brick-crimson) and **Majora's Mask Light** (Carnival plum-magenta) pair directly together as the warm-crimson/magenta outliers.
3. **Direct lore sequels cluster as nearest neighbors**: **The Wind Waker Dark** + **Phantom Hourglass Dark** (cel-shaded nocturnal Great Sea sequels), **The Legend of Zelda Light** + **A Link to the Past Light**, and **Tears of the Kingdom Dark** + **Echoes of Wisdom Dark** (modern Switch subterranean/void dark worlds lit by gold, emerald, and cyan beacons) pair up naturally from color data alone.

### Color-vision-deficiency (CVD) resilience via OKLCH lightness staggering

Categorical syntax palettes that rely purely on hue (such as an isoluminant red string next to a green keyword) collapse under protanopia or deuteranopia. To prevent this scientifically, every Hylian Palette staggers adjacent syntax roles across **OKLCH perceptual lightness ($L$)** as well as hue — because luminance contrast survives all three cone deficiencies even when chromatic axes collapse.

<img src="assets/color-science/cvd-swatch-grid.png" alt="Dichromacy simulation across 12 representative themes showing 10 syntax roles under Normal Vision, Protanopia, Deuteranopia, and Tritanopia" width="850">

Across all **2,808 role-pairs** (`36 themes × 78 pairs`) and **756 critical adjacent syntax pairs** (`keyword`, `storage`, `string`, `function`, `type`, `number`, `error`):

- **35 polychromatic themes (`735` critical pairs)**: **0 severe collisions** (`< 5 ΔE*ab`) and **0 moderate collisions** (`< 10 ΔE*ab`) under simulated protanopia, deuteranopia, or tritanopia. Every critical syntax pair stays $\ge 10\,\Delta E^*_{ab}$ apart across all three CVD simulations.
- **Link's Awakening Dark (monochrome hardware tribute)**: accounts for the only **3** critical pairs below `10 ΔE*ab` in the entire 36-theme family (`accentStorage`/`colorError` at `2.04`, `accentKeyword`/`accentType` at `7.63`, and `accentKeyword`/`accentStorage` at `9.67`), preserved intentionally as a documented, faithful tribute to the 1993 Game Boy's single-hue olive LCD ramp while still clearing WCAG AA (`4.66:1`–`8.74:1`) on every token.

```sh
node scripts/export-color-data.js                  # export 540 token rows (Lab + OKLCH + WCAG + APCA) to analysis/data/colors.csv
python3 scripts/generate-color-science-assets.py   # regenerate all high-DPI PNG plots + audit CSVs
# Pure-R analytical scripts are also included:
Rscript --vanilla analysis/color_science.R
Rscript --vanilla analysis/theme_similarity.R
Rscript --vanilla analysis/timeline_metro.R
```

## Notes

- Zero runtime `npm` dependencies — `extension.js` uses only the built-in `vscode` API and static `theme-metadata.json`.
- Positron-specific workbench tokens (`positronConsole.*`, `positronVariables.*`, `positronPlots.*`, `positronDataExplorer.*`, etc.) are strictly validated against Positron's upstream color registry (`5,472` verified usages across 36 themes).
- No game artwork, logos, sprites, or copyrighted assets appear anywhere in this repository — every visual (extension icon, 345 swatch PNGs, timeline diagram, and color-science plots) is generated algorithmically from hex coordinates and geometric primitives.

## License

MIT — see [LICENSE](LICENSE).
