#!/usr/bin/env python3
"""
Programmatically renders the Hylian Palette README Retro ASCII banners
(`assets/banner/banner-dark.png` and `assets/banner/banner-light.png`,
1920x616 @ 2x Retina) from pure geometric SVG vectors:
  - Double-line Unicode box-drawing terminal frame
  - Dithered Hyrule (gold) / Lorule (inverted obsidian-violet) mirrored Triforce
  - 5x5 pixel-block ANSI-Shadow lettering for HYLIAN / PALETTE
  - 40th Anniversary Tribute (1986-2026) & OKLCH colorimetry footer

Rendered as 2x PNGs rather than inline Markdown text or raw SVGs so that:
  1. Android / mobile monospace font fallback never misaligns Unicode block glyphs
  2. Portrait mobile screens scale cleanly to 100% width without horizontal scroll
  3. `@vscode/vsce package` (which disallows non-badge local SVGs in README.md) passes cleanly

Run with: python3 scripts/generate-banner.py
"""

import os
import subprocess
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "assets", "banner")

BLOCK_FONT = {
    "H": ["10001", "10001", "11111", "10001", "10001"],
    "Y": ["10001", "10001", "01110", "00100", "00100"],
    "L": ["10000", "10000", "10000", "10000", "11111"],
    "I": ["111",   "010",   "010",   "010",   "111"],
    "A": ["01110", "10001", "11111", "10001", "10001"],
    "N": ["10001", "11001", "10101", "10011", "10001"],
    "P": ["11110", "10001", "11110", "10000", "10000"],
    "E": ["11111", "10000", "11110", "10000", "11111"],
    "T": ["11111", "00100", "00100", "00100", "00100"],
}


def render_ansi_word(word, x_center, y_top, cell_w, cell_h, fill, shadow_stroke):
    """Render ANSI-Shadow pixel-block letters with geometric right/bottom shadow edges."""
    gap = 1.6
    widths = [len(BLOCK_FONT[ch][0]) for ch in word]
    total_units = sum(widths) + gap * (len(word) - 1)
    start_x = x_center - (total_units * cell_w) / 2.0

    rects = []
    shadows = []
    cursor_u = 0.0
    for ch in word:
        grid = BLOCK_FONT[ch]
        rows, cols = len(grid), len(grid[0])
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == "1":
                    rx = start_x + (cursor_u + c) * cell_w
                    ry = y_top + r * cell_h
                    # +0.45 overlap avoids sub-pixel hairline seams inside solid strokes
                    rects.append(
                        f'    <rect x="{rx:.1f}" y="{ry:.1f}" '
                        f'width="{cell_w + 0.45:.2f}" height="{cell_h + 0.45:.2f}" fill="{fill}"/>'
                    )
                    right_empty = (c + 1 == cols) or (grid[r][c + 1] == "0")
                    bot_empty = (r + 1 == rows) or (grid[r + 1][c] == "0")
                    if right_empty:
                        shadows.append(
                            f'    <line x1="{rx + cell_w + 2.6:.1f}" y1="{ry + 1.5:.1f}" '
                            f'x2="{rx + cell_w + 2.6:.1f}" y2="{ry + cell_h + 2.6:.1f}" '
                            f'stroke="{shadow_stroke}" stroke-width="1.6"/>'
                        )
                    if bot_empty:
                        shadows.append(
                            f'    <line x1="{rx + 1.5:.1f}" y1="{ry + cell_h + 2.6:.1f}" '
                            f'x2="{rx + cell_w + 2.6:.1f}" y2="{ry + cell_h + 2.6:.1f}" '
                            f'stroke="{shadow_stroke}" stroke-width="1.6"/>'
                        )
        cursor_u += cols + gap
    return "\n".join(shadows + rects)


def build_retro_banner_svg(mode: str) -> str:
    is_dark = mode == "dark"
    bg        = "#0D1117" if is_dark else "#F6F8FA"
    frame_c   = "#5A6780" if is_dark else "#6E7781"
    inner_c   = "#3B4559" if is_dark else "#959DA8"
    hyrule_fg = "#EAB938" if is_dark else "#9E6A03"
    hyrule_sh = "#9B7416" if is_dark else "#C99A2E"
    lorule_fg = "#A68CEB" if is_dark else "#5B3FA6"
    lorule_sh = "#5B4A8A" if is_dark else "#917CC8"
    word_top  = "#F0E6CC" if is_dark else "#1F2328"
    word_sh1  = "#C9A227" if is_dark else "#B08515"
    word_bot  = "#D6CCEE" if is_dark else "#2B2440"
    word_sh2  = "#7C5CC9" if is_dark else "#7A64B8"
    text_c    = "#C9D1D9" if is_dark else "#24292F"
    muted_c   = "#8B949E" if is_dark else "#57606A"

    L, T, R, B = 16, 14, 944, 294
    DIV_X = 216
    MID_Y = 132
    BOT_Y = 242
    D = 4
    cx = (L + DIV_X) / 2.0  # 116.0

    def tri_pair(v_top, v_bl, v_br, solid_col, pat_id, stroke_col):
        mx = (v_bl[0] + v_br[0]) / 2.0
        my = (v_bl[1] + v_br[1]) / 2.0
        left_half = f"{v_top[0]:.1f},{v_top[1]:.1f} {v_bl[0]:.1f},{v_bl[1]:.1f} {mx:.1f},{my:.1f}"
        right_half = f"{v_top[0]:.1f},{v_top[1]:.1f} {mx:.1f},{my:.1f} {v_br[0]:.1f},{v_br[1]:.1f}"
        outline = f"{v_top[0]:.1f},{v_top[1]:.1f} {v_bl[0]:.1f},{v_bl[1]:.1f} {v_br[0]:.1f},{v_br[1]:.1f}"
        return (
            f'    <polygon points="{left_half}" fill="{solid_col}"/>\n'
            f'    <polygon points="{right_half}" fill="url(#{pat_id})"/>\n'
            f'    <polygon points="{outline}" fill="none" stroke="{stroke_col}" stroke-width="1.3"/>'
        )

    def inv_tri_pair(v_tl, v_tr, v_bot, left_pat, right_pat, stroke_col):
        mx = (v_tl[0] + v_tr[0]) / 2.0
        my = (v_tl[1] + v_tr[1]) / 2.0
        left_half = f"{v_tl[0]:.1f},{v_tl[1]:.1f} {mx:.1f},{my:.1f} {v_bot[0]:.1f},{v_bot[1]:.1f}"
        right_half = f"{mx:.1f},{my:.1f} {v_tr[0]:.1f},{v_tr[1]:.1f} {v_bot[0]:.1f},{v_bot[1]:.1f}"
        outline = f"{v_tl[0]:.1f},{v_tl[1]:.1f} {v_tr[0]:.1f},{v_tr[1]:.1f} {v_bot[0]:.1f},{v_bot[1]:.1f}"
        return (
            f'    <polygon points="{left_half}" fill="url(#{left_pat})"/>\n'
            f'    <polygon points="{right_half}" fill="url(#{right_pat})"/>\n'
            f'    <polygon points="{outline}" fill="none" stroke="{stroke_col}" stroke-width="1.3"/>'
        )

    hh, hw = 78.0, 56.0
    hy_b = 122.0
    hy_t = hy_b - hh
    hy_m = (hy_b + hy_t) / 2.0
    hy_svg = "\n".join([
        tri_pair((cx, hy_t), (cx - hw / 2, hy_m), (cx + hw / 2, hy_m), hyrule_fg, f"dith-med-{mode}", hyrule_fg),
        tri_pair((cx - hw / 2, hy_m), (cx - hw, hy_b), (cx, hy_b), hyrule_fg, f"dith-med-{mode}", hyrule_fg),
        tri_pair((cx + hw / 2, hy_m), (cx, hy_b), (cx + hw, hy_b), hyrule_fg, f"dith-med-{mode}", hyrule_fg),
    ])

    lo_t = 142.0
    lo_b = lo_t + hh
    lo_m = (lo_t + lo_b) / 2.0
    lo_svg = "\n".join([
        inv_tri_pair((cx - hw, lo_t), (cx, lo_t), (cx - hw / 2, lo_m), f"dith-lor1-{mode}", f"dith-lor2-{mode}", lorule_fg),
        inv_tri_pair((cx, lo_t), (cx + hw, lo_t), (cx + hw / 2, lo_m), f"dith-lor1-{mode}", f"dith-lor2-{mode}", lorule_fg),
        inv_tri_pair((cx - hw / 2, lo_m), (cx + hw / 2, lo_m), (cx, lo_b), f"dith-lor1-{mode}", f"dith-lor2-{mode}", lorule_fg),
    ])

    right_cx = (DIV_X + R) / 2.0
    word_hylian = render_ansi_word("HYLIAN", right_cx, 54, 14.5, 11.5, word_top, word_sh1)
    word_palette = render_ansi_word("PALETTE", right_cx, 154, 14.5, 11.5, word_bot, word_sh2)

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 308" width="960" height="308">
  <defs>
    <pattern id="dith-med-{mode}" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="3" height="3" fill="{hyrule_sh}"/>
      <rect x="3" y="3" width="3" height="3" fill="{hyrule_sh}"/>
    </pattern>
    <pattern id="dith-lor1-{mode}" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="3" height="3" fill="{lorule_fg}"/>
      <rect x="3" y="3" width="3" height="3" fill="{lorule_fg}"/>
    </pattern>
    <pattern id="dith-lor2-{mode}" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="2" height="2" fill="{lorule_sh}"/>
      <rect x="3" y="3" width="2" height="2" fill="{lorule_sh}"/>
    </pattern>
  </defs>

  <rect width="960" height="308" rx="10" fill="{bg}"/>

  <g fill="none">
    <rect x="{L}" y="{T}" width="{R - L}" height="{B - T}" stroke="{frame_c}" stroke-width="1.6"/>
    <rect x="{L + D}" y="{T + D}" width="{R - L - 2*D}" height="{B - T - 2*D}" stroke="{frame_c}" stroke-width="1.6"/>
    <line x1="{DIV_X}" y1="{T + D}" x2="{DIV_X}" y2="{BOT_Y}" stroke="{inner_c}" stroke-width="1.5"/>
    <line x1="{L + D}" y1="{MID_Y}" x2="{R - D}" y2="{MID_Y}" stroke="{inner_c}" stroke-width="1.5"/>
    <line x1="{L + D}" y1="{BOT_Y}" x2="{R - D}" y2="{BOT_Y}" stroke="{frame_c}" stroke-width="1.6"/>
    <line x1="{L + D}" y1="{BOT_Y + D}" x2="{R - D}" y2="{BOT_Y + D}" stroke="{frame_c}" stroke-width="1.6"/>
  </g>

  <text x="{cx}" y="36" text-anchor="middle" font-family="'DejaVu Sans Mono', ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" font-weight="700" letter-spacing="1.6" fill="{hyrule_fg}">── HYRULE ──</text>
  <g>
{hy_svg}
  </g>
  <g>
{lo_svg}
  </g>
  <text x="{cx}" y="234" text-anchor="middle" font-family="'DejaVu Sans Mono', ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" font-weight="700" letter-spacing="1.6" fill="{lorule_fg}">── LORULE ──</text>

  <text x="{right_cx}" y="36" text-anchor="middle" font-family="'DejaVu Sans Mono', ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12.5" font-weight="700" letter-spacing="1.8" fill="{hyrule_fg}">──── 40TH ANNIVERSARY TRIBUTE · 1986–2026 ────</text>
  <g>
{word_hylian}
  </g>
  <g>
{word_palette}
  </g>

  <text x="480" y="264" text-anchor="middle" font-family="'DejaVu Sans Mono', ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12.5" font-weight="600" letter-spacing="1.2" fill="{text_c}">18 MAINLINE ZELDA GAMES  ·  36 LIGHT &amp; DARK THEMES  ·  VS CODE / POSITRON</text>
  <text x="480" y="282" text-anchor="middle" font-family="'DejaVu Sans Mono', ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" font-weight="500" letter-spacing="1.2" fill="{muted_c}">OKLCH COLORIMETRY  ·  100% WCAG AA  ·  APCA-W3  ·  CIEDE2000  ·  CVD SAFE</text>
</svg>
'''


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmpdir:
        for mode in ("dark", "light"):
            svg_path = os.path.join(tmpdir, f"banner-{mode}.svg")
            png_path = os.path.join(OUT_DIR, f"banner-{mode}.png")
            with open(svg_path, "w", encoding="utf-8") as f:
                f.write(build_retro_banner_svg(mode))
            subprocess.run(
                ["rsvg-convert", "-w", "1920", "-h", "616", svg_path, "-o", png_path],
                check=True,
            )
            size_kb = os.path.getsize(png_path) / 1024.0
            print(f"Generated {os.path.relpath(png_path, ROOT)} ({size_kb:.1f} KB, 1920x616)")


if __name__ == "__main__":
    main()
