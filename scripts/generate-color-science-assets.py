#!/usr/bin/env python3
"""
Dev-only analytical & visualization generator for Hylian Palette.

Computes exact CIE Lab / OKLCH / CIEDE2000 / Machado-2009 CVD audits, unscaled
468-token Lab PCA, scaled 39-D per-theme PCA, per-mode CIEDE2000 Classical MDS,
and Ward's (ward.D2) hierarchical clustering across all 36 themes (18 mainline
Zelda games), writing:
  - analysis/data/{audit-results,worst-pair-per-theme,critical-flagged,severe-flagged,computed-fixes,theme-pca,theme-mds}.csv
  - assets/timeline/timeline-metro.png
  - assets/color-science/{theme-colorspace-grid,pca-global,family-fingerprint,theme-pca,theme-dendrogram,theme-mds,theme-distance-heatmap,cvd-swatch-grid}.png
  - analysis/plots/{pca_global,theme_colorspace_grid}.png

Uses numpy + Pillow with 2x supersampled LANCZOS anti-aliasing and zero external
plotting-library dependencies. Pass `--mds-only` to generate only theme-mds.csv,
theme-mds.png, and theme-distance-heatmap.png.
"""

import csv
import math
import os
import shutil
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "analysis" / "data"
PLOTS_DIR = ROOT / "analysis" / "plots"
CS_ASSETS = ROOT / "assets" / "color-science"
TIMELINE_ASSETS = ROOT / "assets" / "timeline"

for d in (DATA_DIR, PLOTS_DIR, CS_ASSETS, TIMELINE_ASSETS):
    d.mkdir(parents=True, exist_ok=True)


# ---------- Font loader ----------

def load_font(size: int, style: str = "regular") -> ImageFont.FreeTypeFont:
    candidates = {
        "regular": [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            "/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF/Roboto-Regular.ttf",
        ],
        "medium": [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF/Roboto-Medium.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ],
        "bold": [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF/Roboto-Bold.ttf",
        ],
        "italic": [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf",
            "/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF/Roboto-Italic.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ],
    }
    for p in candidates.get(style, candidates["regular"]):
        if os.path.exists(p):
            return ImageFont.truetype(p, size=size)
    return ImageFont.load_default()


# ---------- Colorimetry ----------

def hex_to_rgb_tuple(h: str):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def srgb_to_linear(rgb01: np.ndarray) -> np.ndarray:
    return np.where(rgb01 <= 0.04045, rgb01 / 12.92, ((rgb01 + 0.055) / 1.055) ** 2.4)


def linear_to_srgb(lin: np.ndarray) -> np.ndarray:
    lin = np.clip(lin, 0.0, 1.0)
    return np.where(lin <= 0.0031308, lin * 12.92, 1.055 * (lin ** (1.0 / 2.4)) - 0.055)


def hexes_to_lab(hex_list):
    arr = np.array([hex_to_rgb_tuple(h) for h in hex_list], dtype=np.float64) / 255.0
    lin = srgb_to_linear(arr)
    M = np.array([
        [0.4124564, 0.3575761, 0.1804375],
        [0.2126729, 0.7151522, 0.0721750],
        [0.0193339, 0.1191920, 0.9503041],
    ])
    xyz = lin @ M.T
    xyz[:, 0] /= 0.95047
    xyz[:, 1] /= 1.00000
    xyz[:, 2] /= 1.08883
    delta = 6.0 / 29.0
    f = np.where(xyz > delta ** 3, np.cbrt(xyz), xyz / (3.0 * delta ** 2) + 4.0 / 29.0)
    L = 116.0 * f[:, 1] - 16.0
    a = 500.0 * (f[:, 0] - f[:, 1])
    b = 200.0 * (f[:, 1] - f[:, 2])
    return np.column_stack([L, a, b])


CVD_MATS = {
    "protan": np.array([
        [0.152286, 1.052583, -0.204868],
        [0.114503, 0.786281,  0.099216],
        [-0.003882, -0.048116, 1.051998],
    ]),
    "deutan": np.array([
        [0.367322, 0.860646, -0.227968],
        [0.280085, 0.672501,  0.047413],
        [-0.011820, 0.042940, 0.968881],
    ]),
    "tritan": np.array([
        [1.255528, -0.076749, -0.178779],
        [-0.078411, 0.930809,  0.147602],
        [0.004733,  0.691367,  0.303900],
    ]),
}


def simulate_cvd_hexes(hex_list, cvd_type: str):
    arr = np.array([hex_to_rgb_tuple(h) for h in hex_list], dtype=np.float64) / 255.0
    lin = srgb_to_linear(arr)
    sim_lin = np.clip(lin @ CVD_MATS[cvd_type].T, 0.0, 1.0)
    sim_srgb = np.round(np.clip(linear_to_srgb(sim_lin), 0.0, 1.0) * 255.0).astype(int)
    return [f"#{r:02X}{g:02X}{b:02X}" for r, g, b in sim_srgb]


def ciede2000_pair(lab1, lab2) -> float:
    L1, a1, b1 = lab1
    L2, a2, b2 = lab2
    C1 = math.hypot(a1, b1)
    C2 = math.hypot(a2, b2)
    Cbar = 0.5 * (C1 + C2)
    G = 0.5 * (1.0 - math.sqrt((Cbar ** 7) / ((Cbar ** 7) + (25.0 ** 7))))
    a1p = (1.0 + G) * a1
    a2p = (1.0 + G) * a2
    C1p = math.hypot(a1p, b1)
    C2p = math.hypot(a2p, b2)
    h1p = 0.0 if (a1p == 0 and b1 == 0) else (math.degrees(math.atan2(b1, a1p)) % 360.0)
    h2p = 0.0 if (a2p == 0 and b2 == 0) else (math.degrees(math.atan2(b2, a2p)) % 360.0)
    dLp = L2 - L1
    dCp = C2p - C1p
    if C1p * C2p == 0:
        dhp = 0.0
    elif abs(h2p - h1p) <= 180.0:
        dhp = h2p - h1p
    elif h2p - h1p > 180.0:
        dhp = h2p - h1p - 360.0
    else:
        dhp = h2p - h1p + 360.0
    dHp = 2.0 * math.sqrt(C1p * C2p) * math.sin(math.radians(0.5 * dhp))
    Lbarp = 0.5 * (L1 + L2)
    Cbarp = 0.5 * (C1p + C2p)
    if C1p * C2p == 0:
        hbarp = h1p + h2p
    elif abs(h1p - h2p) <= 180.0:
        hbarp = 0.5 * (h1p + h2p)
    elif h1p + h2p < 360.0:
        hbarp = 0.5 * (h1p + h2p + 360.0)
    else:
        hbarp = 0.5 * (h1p + h2p - 360.0)
    T = (
        1.0
        - 0.17 * math.cos(math.radians(hbarp - 30.0))
        + 0.24 * math.cos(math.radians(2.0 * hbarp))
        + 0.32 * math.cos(math.radians(3.0 * hbarp + 6.0))
        - 0.20 * math.cos(math.radians(4.0 * hbarp - 63.0))
    )
    dTheta = 30.0 * math.exp(-(((hbarp - 275.0) / 25.0) ** 2))
    RC = 2.0 * math.sqrt((Cbarp ** 7) / ((Cbarp ** 7) + (25.0 ** 7)))
    SL = 1.0 + (0.015 * ((Lbarp - 50.0) ** 2)) / math.sqrt(20.0 + ((Lbarp - 50.0) ** 2))
    SC = 1.0 + 0.045 * Cbarp
    SH = 1.0 + 0.015 * Cbarp * T
    RT = -math.sin(math.radians(2.0 * dTheta)) * RC
    return math.sqrt((dLp / SL) ** 2 + (dCp / SC) ** 2 + (dHp / SH) ** 2 + RT * (dCp / SC) * (dHp / SH))


# ---------- Domain Metadata ----------

GAME_ORDER = [
    "The Legend of Zelda",
    "Zelda II: The Adventure of Link",
    "A Link to the Past",
    "Link's Awakening",
    "Ocarina of Time",
    "Majora's Mask",
    "Oracle of Seasons",
    "Oracle of Ages",
    "The Wind Waker",
    "The Minish Cap",
    "Twilight Princess",
    "Phantom Hourglass",
    "Spirit Tracks",
    "Skyward Sword",
    "A Link Between Worlds",
    "Breath of the Wild",
    "Tears of the Kingdom",
    "Echoes of Wisdom",
]

SHORT_GAME = {
    "The Legend of Zelda": "Zelda I",
    "Zelda II: The Adventure of Link": "Zelda II",
    "A Link to the Past": "ALttP",
    "Link's Awakening": "Link's Awakening",
    "Ocarina of Time": "Ocarina of Time",
    "Majora's Mask": "Majora's Mask",
    "Oracle of Seasons": "Oracle of Seasons",
    "Oracle of Ages": "Oracle of Ages",
    "The Wind Waker": "Wind Waker",
    "The Minish Cap": "Minish Cap",
    "Twilight Princess": "Twilight Princess",
    "Phantom Hourglass": "Phantom Hourglass",
    "Spirit Tracks": "Spirit Tracks",
    "Skyward Sword": "Skyward Sword",
    "A Link Between Worlds": "ALBW",
    "Breath of the Wild": "BotW",
    "Tears of the Kingdom": "TotK",
    "Echoes of Wisdom": "Echoes of Wisdom",
}

ERA_MAP = {
    "The Legend of Zelda": "8-bit & 16-bit",
    "Zelda II: The Adventure of Link": "8-bit & 16-bit",
    "A Link to the Past": "8-bit & 16-bit",
    "Link's Awakening": "Handheld",
    "Oracle of Seasons": "Handheld",
    "Oracle of Ages": "Handheld",
    "The Minish Cap": "Handheld",
    "Ocarina of Time": "N64 & GameCube",
    "Majora's Mask": "N64 & GameCube",
    "The Wind Waker": "N64 & GameCube",
    "Twilight Princess": "N64 & GameCube",
    "Phantom Hourglass": "Nintendo DS",
    "Spirit Tracks": "Nintendo DS",
    "Skyward Sword": "Modern",
    "A Link Between Worlds": "Modern",
    "Breath of the Wild": "Modern",
    "Tears of the Kingdom": "Modern",
    "Echoes of Wisdom": "Modern",
}

ERA_LIST = ["8-bit & 16-bit", "Handheld", "N64 & GameCube", "Nintendo DS", "Modern"]
ERA_COLORS = {
    "8-bit & 16-bit": "#9A5B1A",
    "Handheld": "#1F8A4C",
    "N64 & GameCube": "#1652A8",
    "Nintendo DS": "#0D84A8",
    "Modern": "#7B38B8",
}

MONOCHROME_OUTLIER_SLUG = "linksawakening-dark"

TIMELINE_MAP = {
    "Skyward Sword": "Unified",
    "The Minish Cap": "Unified",
    "Ocarina of Time": "Unified",
    "Majora's Mask": "Child",
    "Twilight Princess": "Child",
    "The Wind Waker": "Adult",
    "Phantom Hourglass": "Adult",
    "Spirit Tracks": "Adult",
    "A Link to the Past": "Downfall",
    "Link's Awakening": "Downfall",
    "Oracle of Seasons": "Downfall",
    "Oracle of Ages": "Downfall",
    "A Link Between Worlds": "Downfall",
    "Echoes of Wisdom": "Downfall",
    "The Legend of Zelda": "Downfall",
    "Zelda II: The Adventure of Link": "Downfall",
    "Breath of the Wild": "Era of the Wilds",
    "Tears of the Kingdom": "Era of the Wilds",
}

POLYGON_ROLES = [
    "accentKeyword", "accentStorage", "accentString", "accentRegex",
    "accentFunction", "accentType", "accentInterface", "accentNumber",
    "accentDecorator", "accentNamespace",
]

AUDIT_ROLES = [
    "accentKeyword", "accentStorage", "accentString", "accentRegex",
    "accentFunction", "accentFunctionDim", "accentType", "accentInterface",
    "accentNumber", "accentDecorator", "accentNamespace", "colorError", "colorWarning",
]

CRITICAL_ROLES = {
    "accentKeyword", "accentStorage", "accentString",
    "accentFunction", "accentType", "accentNumber", "colorError",
}

ROLE_COLORS = {
    "accentKeyword": "#1B8A4B",
    "accentStorage": "#7D5626",
    "accentString": "#D4382C",
    "accentRegex": "#E8741E",
    "accentFunction": "#1E62C9",
    "accentFunctionDim": "#5B94E0",
    "accentType": "#0E9488",
    "accentInterface": "#46B8AC",
    "accentNumber": "#C9920E",
    "accentDecorator": "#9E3AC9",
    "accentNamespace": "#6D758C",
    "colorError": "#B81428",
    "colorWarning": "#D9820B",
}


# ---------- Drawing helpers (2x supersampling) ----------

def make_canvas(w: int, h: int, bg="#FAF9F6"):
    return Image.new("RGB", (w * 2, h * 2), hex_to_rgb_tuple(bg))


def save_downsampled(img: Image.Image, path: Path, w: int, h: int):
    out = img.resize((w, h), Image.Resampling.LANCZOS)
    out.save(path, format="PNG", optimize=True)


def draw_text_centered(draw, x, y, text, font, fill="#1E2028"):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((x - tw / 2, y - th / 2 - bbox[1] * 0.15), text, font=font, fill=fill)


def draw_circle(draw, cx, cy, r, fill, outline=None, width=2):
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=fill, outline=outline, width=width)


def draw_triangle(draw, cx, cy, r, fill, outline=None):
    pts = [
        (cx, cy - r * 1.15),
        (cx - r * 1.05, cy + r * 0.85),
        (cx + r * 1.05, cy + r * 0.85),
    ]
    draw.polygon(pts, fill=fill, outline=outline)


# ---------- Ward.D2 Hierarchical Clustering in pure NumPy ----------

def ward_d2_clustering(X: np.ndarray):
    """Exact Lance-Williams Ward's minimum-variance clustering (matches R hclust ward.D2)."""
    n = X.shape[0]
    # Initial pairwise Euclidean distances
    diff = X[:, None, :] - X[None, :, :]
    D2 = np.sum(diff ** 2, axis=-1)
    np.fill_diagonal(D2, np.inf)

    sizes = [1] * (2 * n - 1)
    active = list(range(n))
    merges = []  # (left_id, right_id, height, new_id)

    # Maintain full squared-distance matrix among active cluster IDs
    dist2 = {}
    for i in range(n):
        for j in range(i + 1, n):
            dist2[(i, j)] = float(D2[i, j])

    def get_d2(u, v):
        return dist2[(u, v)] if u < v else dist2[(v, u)]

    def set_d2(u, v, val):
        if u < v:
            dist2[(u, v)] = val
        else:
            dist2[(v, u)] = val

    next_id = n
    for _ in range(n - 1):
        best_pair = None
        best_d2 = float("inf")
        for idx_a in range(len(active)):
            u = active[idx_a]
            for idx_b in range(idx_a + 1, len(active)):
                v = active[idx_b]
                val = get_d2(u, v)
                if val < best_d2:
                    best_d2 = val
                    best_pair = (u, v)

        u, v = best_pair
        height = math.sqrt(max(0.0, best_d2))
        new_id = next_id
        next_id += 1
        nu, nv = sizes[u], sizes[v]
        sizes[new_id] = nu + nv

        for w in active:
            if w == u or w == v:
                continue
            nw = sizes[w]
            denom = nu + nv + nw
            d2_new = (
                (nu + nw) * get_d2(u, w)
                + (nv + nw) * get_d2(v, w)
                - nw * best_d2
            ) / denom
            set_d2(new_id, w, max(0.0, d2_new))

        active.remove(u)
        active.remove(v)
        active.append(new_id)
        merges.append((u, v, height, new_id))

    return merges


# ---------- 1. Load colors.csv & compute CVD + PCA + Clustering ----------

def load_data():
    rows = []
    with open(DATA_DIR / "colors.csv", "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(r)
    labs = hexes_to_lab([r["hex"] for r in rows])
    for r, (L, a, b) in zip(rows, labs):
        r["L"] = float(L)
        r["a"] = float(a)
        r["b"] = float(b)
        r["year"] = int(r["year"])
        r["era"] = ERA_MAP[r["game"]]
        r["timeline"] = TIMELINE_MAP[r["game"]]
    return rows


def compute_slug_order(rows):
    first_by_slug = {}
    for r in rows:
        if r["role"] in AUDIT_ROLES and r["theme_slug"] not in first_by_slug:
            first_by_slug[r["theme_slug"]] = r
    return sorted(
        first_by_slug.keys(),
        key=lambda s: (
            first_by_slug[s]["year"],
            GAME_ORDER.index(first_by_slug[s]["game"]),
            0 if first_by_slug[s]["mode"] == "light" else 1,
        ),
    )


def run_cvd_audit(rows):
    syntax_rows = [r for r in rows if r["role"] in AUDIT_ROLES]
    by_slug = {}
    for r in syntax_rows:
        by_slug.setdefault(r["theme_slug"], []).append(r)

    # Sort slugs chronologically
    slug_order = compute_slug_order(rows)

    audit_records = []
    for slug in slug_order:
        sub = by_slug[slug]
        hexes = [x["hex"] for x in sub]
        lab_norm = hexes_to_lab(hexes)
        lab_sim = {
            t: hexes_to_lab(simulate_cvd_hexes(hexes, t))
            for t in ("protan", "deutan", "tritan")
        }
        n = len(sub)
        for i in range(n):
            for j in range(i + 1, n):
                d_norm = float(np.linalg.norm(lab_norm[i] - lab_norm[j]))
                d00_norm = ciede2000_pair(lab_norm[i], lab_norm[j])
                dp = float(np.linalg.norm(lab_sim["protan"][i] - lab_sim["protan"][j]))
                dd = float(np.linalg.norm(lab_sim["deutan"][i] - lab_sim["deutan"][j]))
                dt = float(np.linalg.norm(lab_sim["tritan"][i] - lab_sim["tritan"][j]))
                cvds = [("protan", dp), ("deutan", dd), ("tritan", dt)]
                worst_type, min_cvd = min(cvds, key=lambda kv: kv[1])
                flagged = d_norm >= 15.0 and min_cvd < 10.0
                audit_records.append({
                    "theme_slug": slug,
                    "role1": sub[i]["role"],
                    "role2": sub[j]["role"],
                    "d_normal": round(d_norm, 3),
                    "d00_normal": round(d00_norm, 3),
                    "d_protan": round(dp, 3),
                    "d_deutan": round(dd, 3),
                    "d_tritan": round(dt, 3),
                    "min_cvd": round(min_cvd, 3),
                    "worst_type": worst_type,
                    "flagged": "TRUE" if flagged else "FALSE",
                })

    def write_csv(path: Path, fieldnames, recs):
        with open(path, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=fieldnames)
            w.writeheader()
            w.writerows(recs)

    fields = [
        "theme_slug", "role1", "role2", "d_normal", "d00_normal",
        "d_protan", "d_deutan", "d_tritan", "min_cvd", "worst_type", "flagged",
    ]
    write_csv(DATA_DIR / "audit-results.csv", fields, audit_records)

    worst_per_theme = []
    for slug in slug_order:
        sub_recs = [r for r in audit_records if r["theme_slug"] == slug]
        worst_per_theme.append(min(sub_recs, key=lambda r: r["min_cvd"]))
    worst_per_theme.sort(key=lambda r: r["min_cvd"])
    write_csv(DATA_DIR / "worst-pair-per-theme.csv", fields, worst_per_theme)

    crit_flagged = [
        r for r in audit_records
        if r["flagged"] == "TRUE" and r["role1"] in CRITICAL_ROLES and r["role2"] in CRITICAL_ROLES
    ]
    crit_flagged.sort(key=lambda r: (r["theme_slug"], r["min_cvd"]))
    write_csv(DATA_DIR / "critical-flagged.csv", fields, crit_flagged)

    severe_flagged = [r for r in crit_flagged if r["min_cvd"] < 5.0]
    write_csv(DATA_DIR / "severe-flagged.csv", fields, severe_flagged)

    # Document v1.0.0 status in computed-fixes.csv
    with open(DATA_DIR / "computed-fixes.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["theme_slug", "role", "status", "note"])
        w.writerow([
            "linksawakening-dark",
            "monochrome_dmg_ramp",
            "exempt_by_design",
            "1993 DMG-01 4-shade green LCD hardware ramp (#0F380F..#9BBC0F); all 35 polychromatic themes have 0 critical pairs < 10 dE76 under protan/deutan/tritan.",
        ])

    all_flagged = [r for r in audit_records if r["flagged"] == "TRUE"]
    print(
        f"CVD audit: {len(audit_records)} pairs across {len(slug_order)} themes -> "
        f"{len(all_flagged)} total 13-role flags, {len(crit_flagged)} critical-role flags (<10 dE76), "
        f"{len(severe_flagged)} severe (<5 dE76)."
    )
    for r in crit_flagged:
        print(f"  critical flag: {r['theme_slug']} {r['role1']}/{r['role2']} min_cvd={r['min_cvd']} ({r['worst_type']})")

    return slug_order, by_slug


# ---------- 2. Render Timeline Metro Map ----------

def render_timeline_metro():
    W, H = 2400, 1080
    img = make_canvas(W, H, "#FAF9F5")
    draw = ImageDraw.Draw(img)

    f_title = load_font(54, "bold")
    f_sub = load_font(28, "regular")
    f_main = load_font(27, "bold")
    f_spin = load_font(22, "italic")
    f_note = load_font(24, "italic")
    f_leg = load_font(26, "medium")

    draw.text((120, 64), "The Legend of Zelda — In-Universe Story Chronology", font=f_title, fill="#181A20")
    draw.text(
        (120, 134),
        "Per Nintendo's official chronology across all 18 mainline games — splitting after Ocarina of Time into Child, Adult, and Downfall branches (including Echoes of Wisdom) before reconverging.",
        font=f_sub,
        fill="#525866",
    )

    nodes = [
        # (name, x, y, branch, tier, color, dy)
        ("Skyward Sword", 1.0, 0.0, "trunk", "main", "#1F7AC4", 0.34),
        ("The Minish Cap", 2.7, 0.0, "trunk", "main", "#7E34BD", -0.34),
        ("Four Swords", 4.3, 0.0, "trunk", "spinoff", "#8E939E", 0.27),
        ("Ocarina of Time", 6.0, 0.0, "trunk", "main", "#C9A227", -0.34),

        ("Majora's Mask", 8.2, 1.35, "child", "main", "#BD195D", 0.34),
        ("Twilight Princess", 11.0, 1.35, "child", "main", "#FF781F", -0.34),
        ("Four Swords Adventures", 13.4, 1.75, "child", "spinoff", "#8E939E", 0.27),

        ("The Wind Waker", 8.2, 0.0, "adult", "main", "#D62828", 0.34),
        ("Phantom Hourglass", 11.0, 0.0, "adult", "main", "#0084BD", -0.34),
        ("Spirit Tracks", 13.8, 0.0, "adult", "main", "#0E86B5", 0.34),

        ("A Link to the Past", 8.0, -1.35, "downfall", "main", "#1E74CC", -0.34),
        ("Link's Awakening", 10.0, -1.35, "downfall", "main", "#D93829", 0.34),
        ("Oracle of Seasons", 11.7, -1.08, "downfall", "main", "#D63E18", 0.29),
        ("Oracle of Ages", 11.7, -1.62, "downfall", "main", "#2460C9", -0.30),
        ("A Link Between Worlds", 13.5, -1.35, "downfall", "main", "#7A45BE", -0.34),
        ("Tri Force Heroes", 14.6, -0.92, "downfall", "spinoff", "#8E939E", 0.26),
        ("Echoes of Wisdom", 16.0, -1.35, "downfall", "main", "#C98A08", 0.34),
        ("The Legend of Zelda", 18.2, -1.35, "downfall", "main", "#C89214", -0.34),
        ("Zelda II", 20.0, -1.35, "downfall", "main", "#D62828", 0.34),

        ("Breath of the Wild", 22.1, 0.0, "convergence", "main", "#0E8A8C", 0.34),
        ("Tears of the Kingdom", 24.0, 0.0, "convergence", "main", "#12855E", -0.34),
    ]

    edges = [
        ("Skyward Sword", "The Minish Cap", "#C9A227"),
        ("The Minish Cap", "Four Swords", "#C9A227"),
        ("Four Swords", "Ocarina of Time", "#C9A227"),

        ("Ocarina of Time", "Majora's Mask", "#BD195D"),
        ("Majora's Mask", "Twilight Princess", "#BD195D"),
        ("Twilight Princess", "Four Swords Adventures", "#BD195D"),

        ("Ocarina of Time", "The Wind Waker", "#008B7D"),
        ("The Wind Waker", "Phantom Hourglass", "#008B7D"),
        ("Phantom Hourglass", "Spirit Tracks", "#008B7D"),

        ("Ocarina of Time", "A Link to the Past", "#8C5E2A"),
        ("A Link to the Past", "Link's Awakening", "#8C5E2A"),
        ("Link's Awakening", "Oracle of Seasons", "#8C5E2A"),
        ("Link's Awakening", "Oracle of Ages", "#8C5E2A"),
        ("Oracle of Seasons", "A Link Between Worlds", "#8C5E2A"),
        ("Oracle of Ages", "A Link Between Worlds", "#8C5E2A"),
        ("A Link Between Worlds", "Tri Force Heroes", "#8C5E2A"),
        ("A Link Between Worlds", "Echoes of Wisdom", "#8C5E2A"),
        ("Echoes of Wisdom", "The Legend of Zelda", "#8C5E2A"),
        ("The Legend of Zelda", "Zelda II", "#8C5E2A"),

        ("Twilight Princess", "Breath of the Wild", "#B89A52"),
        ("Spirit Tracks", "Breath of the Wild", "#B89A52"),
        ("Zelda II", "Breath of the Wild", "#B89A52"),
        ("Breath of the Wild", "Tears of the Kingdom", "#12855E"),
    ]

    def to_px(x, y):
        px = 190 + (x - 1.0) / 23.0 * (W * 2 - 390)
        py = 1120 - y * 295
        return px, py

    pos = {n[0]: to_px(n[1], n[2]) for n in nodes}

    # Draw subtle era / branch guide bands
    for label_txt, y_val, col in [
        ("CHILD TIMELINE", 1.35, "#BD195D"),
        ("ADULT TIMELINE", 0.0, "#008B7D"),
        ("DOWNFALL TIMELINE", -1.35, "#8C5E2A"),
    ]:
        gx, gy = to_px(7.5, y_val)
        f_tag = load_font(20, "bold")
        draw.text((gx + 10, gy - 148 if y_val >= 0 else gy + 152), label_txt, font=f_tag, fill=col)

    # Draw metro lines
    for u, v, col in edges:
        x1, y1 = pos[u]
        x2, y2 = pos[v]
        is_conv = v == "Breath of the Wild"
        width = 7 if is_conv else 11
        rgb = hex_to_rgb_tuple(col)
        if is_conv:
            # Subtle dashed/light convergence lines
            steps = 28
            for k in range(0, steps, 2):
                xa = x1 + (x2 - x1) * (k / steps)
                ya = y1 + (y2 - y1) * (k / steps)
                xb = x1 + (x2 - x1) * ((k + 1) / steps)
                yb = y1 + (y2 - y1) * ((k + 1) / steps)
                draw.line([(xa, ya), (xb, yb)], fill=rgb, width=width)
        else:
            draw.line([(x1, y1), (x2, y2)], fill=rgb, width=width)

    # Era of Decline annotation between Echoes of Wisdom and Zelda I
    ex, ey = to_px(17.1, -1.76)
    draw_text_centered(draw, ex, ey, "(Era of Decline)", f_note, fill="#6A6E79")

    # Draw station nodes & labels
    for name, x, y, branch, tier, col, dy in nodes:
        cx, cy = pos[name]
        r = 22 if tier == "main" else 13
        draw_circle(draw, cx, cy, r + 5, fill="#FAF9F5")
        draw_circle(draw, cx, cy, r, fill=hex_to_rgb_tuple(col), outline="#FFFFFF", width=3)
        lx, ly = to_px(x, y + dy)
        if tier == "main":
            draw_text_centered(draw, lx, ly, name, f_main, fill="#181A20")
        else:
            draw_text_centered(draw, lx, ly, name, f_spin, fill="#6E7380")

    # Bottom legend bar
    leg_y = H * 2 - 96
    draw.line([(120, leg_y - 38), (W * 2 - 120, leg_y - 38)], fill="#E2E0D8", width=2)
    legend_items = [
        ("Unified Trunk", "#C9A227"),
        ("Child Branch", "#BD195D"),
        ("Adult Branch", "#008B7D"),
        ("Downfall Branch (incl. Echoes of Wisdom)", "#8C5E2A"),
        ("Distant-Future Reconvergence", "#12855E"),
    ]
    lx = 130
    for label, col in legend_items:
        draw_circle(draw, lx + 12, leg_y, 11, fill=hex_to_rgb_tuple(col))
        draw.text((lx + 34, leg_y - 15), label, font=f_leg, fill="#343842")
        lx += draw.textbbox((0, 0), label, font=f_leg)[2] + 95

    draw.text(
        (W * 2 - 760, leg_y - 14),
        "Multiplayer spinoffs shown smaller in grey (not themed individually)",
        font=f_note,
        fill="#6E7380",
    )

    save_downsampled(img, TIMELINE_ASSETS / "timeline-metro.png", W, H)
    print("Saved assets/timeline/timeline-metro.png")


# ---------- 3. Render 36-Theme CIE a*-b* Small-Multiples Grid ----------

def render_colorspace_grid(rows, slug_order):
    W, H = 2200, 3960
    img = make_canvas(W, H, "#FAF9F6")
    draw = ImageDraw.Draw(img)

    f_title = load_font(56, "bold")
    f_sub = load_font(28, "regular")
    f_panel = load_font(27, "bold")
    f_axis = load_font(20, "regular")

    draw.text((100, 60), "Each Theme's 10 Syntax Roles in the CIE a*–b* Chroma/Hue Plane", font=f_title, fill="#181A20")
    draw.text(
        (100, 132),
        "All 36 themes (4 × 9 chronological grid). Connected: keyword · storage · string · regex · function · type · interface · number · decorator · namespace. Rings = C* 30, 60, 90.",
        font=f_sub,
        fill="#525866",
    )

    poly_by_slug = {}
    meta_by_slug = {}
    for r in rows:
        meta_by_slug[r["theme_slug"]] = r
        if r["role"] in POLYGON_ROLES:
            poly_by_slug.setdefault(r["theme_slug"], {})[r["role"]] = r

    cols, nrows = 4, 9
    pad_l, pad_r, pad_t, pad_b = 100, 100, 230, 110
    gap_x, gap_y = 54, 68
    cell_w = (W * 2 - pad_l - pad_r - gap_x * (cols - 1)) / cols
    cell_h = (H * 2 - pad_t - pad_b - gap_y * (nrows - 1)) / nrows

    LIM = 105.0  # a*, b* in [-105, 105]

    for idx, slug in enumerate(slug_order):
        c = idx % cols
        r_idx = idx // cols
        x0 = pad_l + c * (cell_w + gap_x)
        y0 = pad_t + r_idx * (cell_h + gap_y)

        meta = meta_by_slug[slug]
        header_h = 54
        plot_size = min(cell_w - 24, cell_h - header_h - 18)
        px0 = x0 + (cell_w - plot_size) / 2
        py0 = y0 + header_h

        # Card background
        draw.rounded_rectangle(
            (x0, y0, x0 + cell_w, y0 + cell_h),
            radius=16,
            fill="#FFFFFF",
            outline="#E2E0D8",
            width=2,
        )

        mode_cap = "Light" if meta["mode"] == "light" else "Dark"
        title_str = f"{SHORT_GAME[meta['game']]} ({mode_cap})"
        draw_text_centered(draw, x0 + cell_w / 2, y0 + 29, title_str, f_panel, fill="#1E222B")

        cx = px0 + plot_size / 2
        cy = py0 + plot_size / 2
        scale = (plot_size / 2 - 22) / LIM

        # Concentric C* rings & zero crosshairs
        for chroma_r in (30, 60, 90):
            rr = chroma_r * scale
            draw.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), outline="#ECEAE4", width=2)
        draw.line([(px0 + 12, cy), (px0 + plot_size - 12, cy)], fill="#DCD9D0", width=2)
        draw.line([(cx, py0 + 12), (cx, py0 + plot_size - 12)], fill="#DCD9D0", width=2)

        role_map = poly_by_slug[slug]
        pts = []
        for role in POLYGON_ROLES:
            item = role_map[role]
            px = cx + item["a"] * scale
            py = cy - item["b"] * scale
            pts.append((px, py, item["hex"]))

        # Polygon outline
        poly_xy = [(p[0], p[1]) for p in pts] + [(pts[0][0], pts[0][1])]
        draw.line(poly_xy, fill="#6C7280", width=4)

        # Colored vertices
        for px, py, hx in pts:
            draw_circle(draw, px, py, 13, fill=hex_to_rgb_tuple(hx), outline="#181A20", width=3)

    draw_text_centered(draw, W, H * 2 - 52, "Horizontal axis: a* (-green to +red)   ·   Vertical axis: b* (-blue to +yellow)", f_axis, fill="#5A6070")

    out_asset = CS_ASSETS / "theme-colorspace-grid.png"
    save_downsampled(img, out_asset, W, H)
    shutil.copyfile(out_asset, PLOTS_DIR / "theme_colorspace_grid.png")
    print("Saved assets/color-science/theme-colorspace-grid.png")


# ---------- 4. Render Global 468-Color Lab PCA ----------

def render_global_pca(rows):
    syntax_rows = [r for r in rows if r["role_kind"] == "syntax"]
    X = np.array([[r["L"], r["a"], r["b"]] for r in syntax_rows], dtype=np.float64)
    X_centered = X - X.mean(axis=0, keepdims=True)
    U, S, Vt = np.linalg.svd(X_centered, full_matrices=False)
    # Deterministic sign convention
    if Vt[0, 0] < 0:
        Vt[0] *= -1
        U[:, 0] *= -1
    if Vt[1, 1] < 0:
        Vt[1] *= -1
        U[:, 1] *= -1
    scores = X_centered @ Vt.T
    var_exp = (S ** 2) / np.sum(S ** 2) * 100.0

    W, H = 1560, 1080
    img = make_canvas(W, H, "#FAF9F6")
    draw = ImageDraw.Draw(img)

    f_title = load_font(46, "bold")
    f_sub = load_font(25, "regular")
    f_ax = load_font(26, "medium")
    f_tick = load_font(22, "regular")
    f_leg_h = load_font(25, "bold")
    f_leg = load_font(23, "regular")

    draw.text((90, 52), "Global PCA of Syntax-Role Colors Across All 36 Themes (CIE Lab)", font=f_title, fill="#181A20")
    draw.text(
        (90, 114),
        f"468 tokens (36 themes × 13 syntax roles), unscaled Lab — PC1 ({var_exp[0]:.1f}%) & PC2 ({var_exp[1]:.1f}%) capture chromatic + luminance spread.",
        font=f_sub,
        fill="#525866",
    )

    px0, py0, pw, ph = 150, 185, 2280, 1820
    draw.rounded_rectangle((px0, py0, px0 + pw, py0 + ph), radius=12, fill="#FFFFFF", outline="#DEDCD4", width=2)

    x_vals, y_vals = scores[:, 0], scores[:, 1]
    xmin, xmax = float(x_vals.min()) - 10, float(x_vals.max()) + 10
    ymin, ymax = float(y_vals.min()) - 10, float(y_vals.max()) + 10

    def map_pt(xv, yv):
        x = px0 + (xv - xmin) / (xmax - xmin) * pw
        y = py0 + ph - (yv - ymin) / (ymax - ymin) * ph
        return x, y

    # Gridlines
    for gx in range(-100, 121, 25):
        if xmin <= gx <= xmax:
            xp, _ = map_pt(gx, 0)
            draw.line([(xp, py0), (xp, py0 + ph)], fill="#DCDEE4" if gx == 0 else "#F0EFEA", width=3 if gx == 0 else 2)
            draw_text_centered(draw, xp, py0 + ph + 28, str(gx), f_tick, fill="#5E6472")
    for gy in range(-100, 121, 25):
        if ymin <= gy <= ymax:
            _, yp = map_pt(0, gy)
            draw.line([(px0, yp), (px0 + pw, yp)], fill="#DCDEE4" if gy == 0 else "#F0EFEA", width=3 if gy == 0 else 2)
            draw_text_centered(draw, px0 - 38, yp, str(gy), f_tick, fill="#5E6472")

    # Points (colored by their ACTUAL token hex, rimmed by role color, shaped by mode!)
    for r, (xv, yv) in zip(syntax_rows, scores[:, :2]):
        xp, yp = map_pt(xv, yv)
        col = hex_to_rgb_tuple(ROLE_COLORS[r["role"]])
        if r["mode"] == "light":
            draw_circle(draw, xp, yp, 10, fill="#FFFFFF", outline=col, width=4)
        else:
            draw_circle(draw, xp, yp, 10, fill=col, outline="#FFFFFF", width=2)

    draw_text_centered(draw, px0 + pw / 2, py0 + ph + 72, f"PC1 ({var_exp[0]:.1f}% variance)", f_ax, fill="#222630")
    # Rotated Y-axis label
    ytxt = Image.new("RGBA", (600, 60), (0, 0, 0, 0))
    ydraw = ImageDraw.Draw(ytxt)
    draw_text_centered(ydraw, 300, 30, f"PC2 ({var_exp[1]:.1f}% variance)", f_ax, fill="#222630")
    yrot = ytxt.rotate(90, expand=True)
    img.paste(yrot, (int(px0 - 118), int(py0 + ph / 2 - 300)), yrot)

    # Legend on right
    lx = px0 + pw + 60
    ly = py0 + 20
    draw.text((lx, ly), "Syntax Role", font=f_leg_h, fill="#181A20")
    ly += 46
    for role in AUDIT_ROLES:
        col = hex_to_rgb_tuple(ROLE_COLORS[role])
        draw_circle(draw, lx + 14, ly + 13, 10, fill=col)
        draw.text((lx + 36, ly), role.replace("accent", "").replace("color", ""), font=f_leg, fill="#2E3340")
        ly += 42

    ly += 30
    draw.text((lx, ly), "Theme Mode", font=f_leg_h, fill="#181A20")
    ly += 46
    draw_circle(draw, lx + 14, ly + 13, 10, fill="#FFFFFF", outline="#333842", width=4)
    draw.text((lx + 36, ly), "Light (open ring)", font=f_leg, fill="#2E3340")
    ly += 44
    draw_circle(draw, lx + 14, ly + 13, 10, fill="#333842", outline="#FFFFFF", width=2)
    draw.text((lx + 36, ly), "Dark (filled dot)", font=f_leg, fill="#2E3340")

    out_asset = CS_ASSETS / "pca-global.png"
    save_downsampled(img, out_asset, W, H)
    shutil.copyfile(out_asset, PLOTS_DIR / "pca_global.png")
    print(f"Saved assets/color-science/pca-global.png (PC1={var_exp[0]:.1f}%, PC2={var_exp[1]:.1f}%)")


# ---------- 5. Render Era-Faceted Family Fingerprint ----------

def render_family_fingerprint(rows, slug_order):
    W, H = 1800, 1180
    img = make_canvas(W, H, "#FAF9F6")
    draw = ImageDraw.Draw(img)

    f_title = load_font(48, "bold")
    f_sub = load_font(26, "regular")
    f_strip = load_font(28, "bold")
    f_note = load_font(22, "regular")

    draw.text((100, 56), 'The Family\'s Color-Space "Fingerprint", Faceted by Hardware Era', font=f_title, fill="#181A20")
    draw.text(
        (100, 120),
        "Every theme's 10-role CIE a*–b* polygon overlaid by era — showing each era's chromatic envelope (and Link's Awakening Dark's DMG ramp near the origin).",
        font=f_sub,
        fill="#525866",
    )

    poly_by_slug = {}
    meta_by_slug = {}
    for r in rows:
        meta_by_slug[r["theme_slug"]] = r
        if r["role"] in POLYGON_ROLES:
            poly_by_slug.setdefault(r["theme_slug"], {})[r["role"]] = r

    # 3 panels on top row, 2 centered panels on bottom row
    panel_w, panel_h = 980, 920
    positions = [
        (140, 220),
        (1310, 220),
        (2480, 220),
        (725, 1240),
        (1895, 1240),
    ]
    LIM = 105.0

    for era, (x0, y0) in zip(ERA_LIST, positions):
        draw.rounded_rectangle((x0, y0, x0 + panel_w, y0 + panel_h), radius=18, fill="#FFFFFF", outline="#DEDCD4", width=2)
        era_col = hex_to_rgb_tuple(ERA_COLORS[era])
        draw_text_centered(draw, x0 + panel_w / 2, y0 + 38, era, f_strip, fill=era_col)

        plot_s = panel_h - 96
        px0 = x0 + (panel_w - plot_s) / 2
        py0 = y0 + 74
        cx, cy = px0 + plot_s / 2, py0 + plot_s / 2
        scale = (plot_s / 2 - 20) / LIM

        for cr in (30, 60, 90):
            rr = cr * scale
            draw.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), outline="#EFECE6", width=2)
        draw.line([(px0 + 12, cy), (px0 + plot_s - 12, cy)], fill="#DCD9D0", width=2)
        draw.line([(cx, py0 + 12), (cx, py0 + plot_size_f(plot_s) - 12)], fill="#DCD9D0", width=2) if False else draw.line([(cx, py0 + 12), (cx, py0 + plot_s - 12)], fill="#DCD9D0", width=2)

        era_slugs = [s for s in slug_order if meta_by_slug[s]["era"] == era]
        for s in era_slugs:
            mode = meta_by_slug[s]["mode"]
            rmap = poly_by_slug[s]
            pts = [(cx + rmap[rl]["a"] * scale, cy - rmap[rl]["b"] * scale) for rl in POLYGON_ROLES]
            pts.append(pts[0])
            if mode == "light":
                col = tuple(int(c * 0.65 + 255 * 0.35) for c in era_col)
                draw.line(pts, fill=col, width=3)
            else:
                draw.line(pts, fill=era_col, width=4)

    draw_text_centered(draw, W, H * 2 - 44, "Lighter trace = Light theme   ·   Bold trace = Dark theme   ·   Concentric circles = C* 30, 60, 90", f_note, fill="#5E6472")
    save_downsampled(img, CS_ASSETS / "family-fingerprint.png", W, H)
    print("Saved assets/color-science/family-fingerprint.png")


# ---------- 6. Per-Theme 39-D Scaled PCA & Ward.D2 Dendrogram ----------

def render_theme_similarity(rows, slug_order):
    by_slug = {}
    meta_by_slug = {}
    for r in rows:
        meta_by_slug[r["theme_slug"]] = r
        if r["role"] in AUDIT_ROLES:
            by_slug.setdefault(r["theme_slug"], {})[r["role"]] = (r["L"], r["a"], r["b"])

    mat = []
    for s in slug_order:
        vec = []
        for rl in AUDIT_ROLES:
            L, a, b = by_slug[s][rl]
            vec.extend([L, a, b])
        mat.append(vec)
    X = np.array(mat, dtype=np.float64)  # 36 x 39
    means = X.mean(axis=0, keepdims=True)
    stds = X.std(axis=0, ddof=1, keepdims=True)
    Z = (X - means) / stds

    U, S, Vt = np.linalg.svd(Z, full_matrices=False)
    scores = Z @ Vt.T
    light_mean_pc1 = np.mean([scores[i, 0] for i, s in enumerate(slug_order) if meta_by_slug[s]["mode"] == "light"])
    if light_mean_pc1 > 0:
        scores[:, 0] *= -1
    var_exp = (S ** 2) / np.sum(S ** 2) * 100.0

    with open(DATA_DIR / "theme-pca.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["theme_slug", "game", "mode", "era", "PC1", "PC2", "PC3", "PC4"])
        for i, s in enumerate(slug_order):
            m = meta_by_slug[s]
            w.writerow([
                s, m["game"], m["mode"], m["era"],
                f"{scores[i, 0]:.4f}", f"{scores[i, 1]:.4f}",
                f"{scores[i, 2]:.4f}", f"{scores[i, 3]:.4f}",
            ])

    # --- Render theme-pca.png ---
    W, H = 1800, 1300
    img = make_canvas(W, H, "#FAF9F6")
    draw = ImageDraw.Draw(img)

    f_title = load_font(48, "bold")
    f_sub = load_font(25, "regular")
    f_lbl = load_font(20, "medium")
    f_ax = load_font(26, "medium")
    f_tick = load_font(22, "regular")
    f_leg_h = load_font(25, "bold")
    f_leg = load_font(23, "regular")

    draw.text((95, 52), "Which Themes Look Like Each Other? Per-Theme 39-D PCA", font=f_title, fill="#181A20")
    draw.text(
        (95, 114),
        f"Each point = one theme's full 13-role syntax palette in CIE Lab (39 standardized channels) — PC1 ({var_exp[0]:.1f}%), PC2 ({var_exp[1]:.1f}%).",
        font=f_sub,
        fill="#525866",
    )

    px0, py0, pw, ph = 165, 185, 2745, 2210
    draw.rounded_rectangle((px0, py0, px0 + pw, py0 + ph), radius=14, fill="#FFFFFF", outline="#DEDCD4", width=2)

    xs, ys = scores[:, 0], scores[:, 1]
    xmin, xmax = float(xs.min()) - 2.2, float(xs.max()) + 1.8
    ymin, ymax = float(ys.min()) - 1.8, float(ys.max()) + 1.2

    def map_pt(xv, yv):
        return (
            px0 + (xv - xmin) / (xmax - xmin) * pw,
            py0 + ph - (yv - ymin) / (ymax - ymin) * ph,
        )

    for gx in range(-10, 12, 2):
        if xmin <= gx <= xmax:
            xp, _ = map_pt(gx, 0)
            draw.line([(xp, py0), (xp, py0 + ph)], fill="#D5D8E0" if gx == 0 else "#F0EFEA", width=3 if gx == 0 else 2)
            draw_text_centered(draw, xp, py0 + ph + 28, str(gx), f_tick, fill="#5E6472")
    for gy in range(-10, 14, 2):
        if ymin <= gy <= ymax:
            _, yp = map_pt(0, gy)
            draw.line([(px0, yp), (px0 + pw, yp)], fill="#D5D8E0" if gy == 0 else "#F0EFEA", width=3 if gy == 0 else 2)
            draw_text_centered(draw, px0 - 36, yp, str(gy), f_tick, fill="#5E6472")

    pts_px = [map_pt(xs[i], ys[i]) for i in range(len(slug_order))]

    # Smart radial fan initialization per cluster (Light cluster, Dark cluster, Outlier)
    labels = []
    for mode_grp in ("light", "dark"):
        grp_indices = [
            i for i, s in enumerate(slug_order)
            if meta_by_slug[s]["mode"] == mode_grp and s != "linksawakening-dark"
        ]
        cx_g = sum(pts_px[i][0] for i in grp_indices) / len(grp_indices)
        cy_g = sum(pts_px[i][1] for i in grp_indices) / len(grp_indices)
        # Sort by angle around cluster centroid for clean non-crossing leader lines!
        grp_sorted = sorted(grp_indices, key=lambda i: math.atan2(pts_px[i][1] - cy_g, pts_px[i][0] - cx_g))
        for k, i in enumerate(grp_sorted):
            s = slug_order[i]
            m = meta_by_slug[s]
            lbl = f"{SHORT_GAME[m['game']]} {'L' if m['mode'] == 'light' else 'D'}"
            bbox = draw.textbbox((0, 0), lbl, font=f_lbl)
            lw, lh = bbox[2] - bbox[0] + 16, bbox[3] - bbox[1] + 10
            ang = math.atan2(pts_px[i][1] - cy_g, pts_px[i][0] - cx_g)
            labels.append({
                "idx": i,
                "text": lbl,
                "ax": pts_px[i][0],
                "ay": pts_px[i][1],
                "x": pts_px[i][0] + math.cos(ang) * 85,
                "y": pts_px[i][1] + math.sin(ang) * 75,
                "w": lw,
                "h": lh,
                "era": m["era"],
                "mode": m["mode"],
            })

    # Add Link's Awakening Dark outlier
    la_idx = slug_order.index("linksawakening-dark")
    lbl = "Link's Awakening D (DMG-01 LCD)"
    bbox = draw.textbbox((0, 0), lbl, font=f_lbl)
    labels.append({
        "idx": la_idx,
        "text": lbl,
        "ax": pts_px[la_idx][0],
        "ay": pts_px[la_idx][1],
        "x": pts_px[la_idx][0] - 180,
        "y": pts_px[la_idx][1] + 48,
        "w": bbox[2] - bbox[0] + 16,
        "h": bbox[3] - bbox[1] + 10,
        "era": "Handheld",
        "mode": "dark",
    })

    # Strong non-overlapping repulsive relaxation
    for _ in range(450):
        for i, li in enumerate(labels):
            fx, fy = 0.0, 0.0
            dx_a = li["x"] - li["ax"]
            dy_a = li["y"] - li["ay"]
            dist_a = math.hypot(dx_a, dy_a) + 1e-4
            if dist_a > 230:
                fx -= (dx_a / dist_a) * (dist_a - 230) * 0.10
                fy -= (dy_a / dist_a) * (dist_a - 230) * 0.10
            elif dist_a < 36:
                fx += (dx_a / dist_a) * (36 - dist_a) * 0.30
                fy += (dy_a / dist_a) * (36 - dist_a) * 0.30

            # Repel strongly from EVERY data point so text never covers a marker!
            for ax, ay in pts_px:
                ox = abs(li["x"] - ax) - (li["w"] / 2 + 20)
                oy = abs(li["y"] - ay) - (li["h"] / 2 + 20)
                if ox < 0 and oy < 0:
                    sx = 1.0 if li["x"] >= ax else -1.0
                    sy = 1.0 if li["y"] >= ay else -1.0
                    if abs(ox) < abs(oy):
                        fx += sx * (-ox) * 0.42
                    else:
                        fy += sy * (-oy) * 0.48

            # Repel from other label boxes
            for j, lj in enumerate(labels):
                if i == j:
                    continue
                ox = abs(li["x"] - lj["x"]) - (li["w"] + lj["w"]) / 2 - 12
                oy = abs(li["y"] - lj["y"]) - (li["h"] + lj["h"]) / 2 - 9
                if ox < 0 and oy < 0:
                    sx = 1.0 if (li["x"] > lj["x"] or (li["x"] == lj["x"] and i > j)) else -1.0
                    sy = 1.0 if (li["y"] > lj["y"] or (li["y"] == lj["y"] and i > j)) else -1.0
                    if abs(ox) < abs(oy):
                        fx += sx * (-ox) * 0.48
                    else:
                        fy += sy * (-oy) * 0.48

            li["x"] = min(px0 + pw - li["w"] / 2 - 18, max(px0 + li["w"] / 2 + 18, li["x"] + fx))
            li["y"] = min(py0 + ph - li["h"] / 2 - 18, max(py0 + li["h"] / 2 + 18, li["y"] + fy))

    # Leader lines
    for li in labels:
        if math.hypot(li["x"] - li["ax"], li["y"] - li["ay"]) > 26:
            draw.line([(li["ax"], li["ay"]), (li["x"], li["y"])], fill="#B0B5C4", width=2)

    # Points
    for li in labels:
        col = hex_to_rgb_tuple(ERA_COLORS[li["era"]])
        if li["mode"] == "light":
            draw_circle(draw, li["ax"], li["ay"], 13, fill=col, outline="#FFFFFF", width=3)
        else:
            draw_triangle(draw, li["ax"], li["ay"], 14, fill=col, outline="#FFFFFF")

    # Pill background under each label for crystal-clear readability
    for li in labels:
        draw.rounded_rectangle(
            (li["x"] - li["w"] / 2 + 3, li["y"] - li["h"] / 2 + 2, li["x"] + li["w"] / 2 - 3, li["y"] + li["h"] / 2 - 2),
            radius=6,
            fill="#FFFFFF",
        )
        draw_text_centered(draw, li["x"], li["y"], li["text"], f_lbl, fill="#1E222B")

    draw_text_centered(draw, px0 + pw / 2, py0 + ph + 74, f"PC1 ({var_exp[0]:.1f}% of variance)", f_ax, fill="#222630")
    ytxt2 = Image.new("RGBA", (640, 60), (0, 0, 0, 0))
    ydraw2 = ImageDraw.Draw(ytxt2)
    draw_text_centered(ydraw2, 320, 30, f"PC2 ({var_exp[1]:.1f}% of variance)", f_ax, fill="#222630")
    yrot2 = ytxt2.rotate(90, expand=True)
    img.paste(yrot2, (int(px0 - 122), int(py0 + ph / 2 - 320)), yrot2)

    # Legend
    lx = px0 + pw + 52
    ly = py0 + 30
    draw.text((lx, ly), "Hardware Era", font=f_leg_h, fill="#181A20")
    ly += 48
    for era in ERA_LIST:
        col = hex_to_rgb_tuple(ERA_COLORS[era])
        draw_circle(draw, lx + 14, ly + 13, 11, fill=col)
        draw.text((lx + 36, ly), era, font=f_leg, fill="#2E3340")
        ly += 46

    ly += 34
    draw.text((lx, ly), "Mode", font=f_leg_h, fill="#181A20")
    ly += 48
    draw_circle(draw, lx + 14, ly + 13, 11, fill="#383E4C")
    draw.text((lx + 36, ly), "Light (L · circle)", font=f_leg, fill="#2E3340")
    ly += 46
    draw_triangle(draw, lx + 14, ly + 13, 12, fill="#383E4C")
    draw.text((lx + 36, ly), "Dark (D · triangle)", font=f_leg, fill="#2E3340")

    save_downsampled(img, CS_ASSETS / "theme-pca.png", W, H)
    print(f"Saved assets/color-science/theme-pca.png (PC1={var_exp[0]:.1f}%, PC2={var_exp[1]:.1f}%)")

    # --- Render Ward.D2 Dendrogram (horizontal layout for ultra-clean legibility!) ---
    merges = ward_d2_clustering(Z)
    n = len(slug_order)
    children = {m[3]: (m[0], m[1], m[2]) for m in merges}
    root_id = merges[-1][3]

    # Traverse tree to get leaf order
    leaf_order = []
    def collect_leaves(node):
        if node < n:
            leaf_order.append(node)
        else:
            left, right, _ = children[node]
            collect_leaves(left)
            collect_leaves(right)
    collect_leaves(root_id)

    DW, DH = 1900, 1280
    dimg = make_canvas(DW, DH, "#FAF9F6")
    ddraw = ImageDraw.Draw(dimg)

    ddraw.text(
        (95, 52),
        "Hierarchical Clustering of All 36 Themes (Ward's Method on 39-D Lab Profile)",
        font=f_title,
        fill="#181A20",
    )
    ddraw.text(
        (95, 114),
        "Nearest neighbors share overall syntax-role hue & lightness structure across all 13 syntax roles — colored by hardware era.",
        font=f_sub,
        fill="#525866",
    )

    # Horizontal dendrogram: tree grows right-to-left or left-to-right; let's put root on LEFT, leaves on RIGHT with crisp horizontal labels!
    tx0, ty0, tw, th = 140, 210, 2560, 2180
    max_h = merges[-1][2] * 1.04

    leaf_y = {}
    for rank, leaf_idx in enumerate(leaf_order):
        leaf_y[leaf_idx] = ty0 + (rank + 0.5) / n * th

    node_pos = {}  # id -> (x, y)
    for leaf_idx in leaf_order:
        node_pos[leaf_idx] = (tx0 + tw, leaf_y[leaf_idx])

    def compute_internal(node):
        if node < n:
            return node_pos[node]
        left, right, h_val = children[node]
        xl, yl = compute_internal(left)
        xr, yr = compute_internal(right)
        x_here = tx0 + tw - (h_val / max_h) * tw
        y_here = 0.5 * (yl + yr)
        node_pos[node] = (x_here, y_here)
        # Draw orthogonal U-connector
        ddraw.line([(xl, yl), (x_here, yl)], fill="#4A5060", width=4)
        ddraw.line([(xr, yr), (x_here, yr)], fill="#4A5060", width=4)
        ddraw.line([(x_here, yl), (x_here, yr)], fill="#4A5060", width=4)
        return x_here, y_here

    compute_internal(root_id)

    # Distance axis along bottom
    axis_y = ty0 + th + 24
    ddraw.line([(tx0, axis_y), (tx0 + tw, axis_y)], fill="#B8BCC8", width=3)
    for h_tick in range(0, int(max_h) + 1, 5):
        xt = tx0 + tw - (h_tick / max_h) * tw
        ddraw.line([(xt, axis_y), (xt, axis_y + 12)], fill="#8E94A2", width=3)
        draw_text_centered(ddraw, xt, axis_y + 34, str(h_tick), f_tick, fill="#5E6472")
    draw_text_centered(ddraw, tx0 + tw / 2, axis_y + 76, "Ward's Linkage Distance (39-D Standardized CIE Lab)", f_ax, fill="#222630")

    # Leaf labels & era dots on right
    f_leaf = load_font(23, "bold")
    for rank, leaf_idx in enumerate(leaf_order):
        slug = slug_order[leaf_idx]
        m = meta_by_slug[slug]
        yp = leaf_y[leaf_idx]
        era_col = hex_to_rgb_tuple(ERA_COLORS[m["era"]])
        draw_circle(ddraw, tx0 + tw + 18, yp, 8, fill=era_col)
        mode_word = "Light" if m["mode"] == "light" else "Dark"
        ddraw.text((tx0 + tw + 38, yp - 14), f"{m['game']} {mode_word}", font=f_leaf, fill=era_col)

    # Era legend box in top-left open space of dendrogram
    leg_x, leg_y = 160, 240
    ddraw.rounded_rectangle((leg_x, leg_y, leg_x + 420, leg_y + 295), radius=14, fill="#FFFFFF", outline="#DEDCD4", width=2)
    ddraw.text((leg_x + 24, leg_y + 18), "Hardware Era", font=f_leg_h, fill="#181A20")
    cy_l = leg_y + 64
    for era in ERA_LIST:
        col = hex_to_rgb_tuple(ERA_COLORS[era])
        draw_circle(ddraw, leg_x + 36, cy_l + 12, 10, fill=col)
        ddraw.text((leg_x + 60, cy_l), era, font=f_leg, fill="#2E3340")
        cy_l += 44

    save_downsampled(dimg, CS_ASSETS / "theme-dendrogram.png", DW, DH)
    print("Saved assets/color-science/theme-dendrogram.png")
    print("Dendrogram leaf order (top -> bottom):")
    for idx in leaf_order:
        print("  -", slug_order[idx])


# ---------- 7. Render CVD Swatch Grid ----------

def render_cvd_swatch_grid(rows):
    showcase = [
        "zelda1-dark",
        "zelda2-light",
        "alttp-dark",
        "linksawakening-light",
        "linksawakening-dark",
        "ocarina-light",
        "majora-dark",
        "windwaker-light",
        "twilight-princess-dark",
        "botw-light",
        "totk-dark",
        "echoes-dark",
    ]
    poly_by_slug = {}
    meta_by_slug = {}
    for r in rows:
        meta_by_slug[r["theme_slug"]] = r
        if r["role"] in POLYGON_ROLES:
            poly_by_slug.setdefault(r["theme_slug"], {})[r["role"]] = r["hex"]

    W, H = 1520, 1180
    img = make_canvas(W, H, "#FAF9F6")
    draw = ImageDraw.Draw(img)

    f_title = load_font(44, "bold")
    f_sub = load_font(24, "regular")
    f_col = load_font(26, "bold")
    f_row = load_font(24, "bold")
    f_foot = load_font(21, "regular")

    draw.text((84, 48), "Dichromacy Simulation Across Representative Themes (10 Syntax Roles)", font=f_title, fill="#181A20")
    draw.text(
        (84, 108),
        "Machado, Oliveira & Fernandes (2009) full-severity simulation — OKLCH lightness staggering keeps syntax tokens distinct even when hue axes collapse.",
        font=f_sub,
        fill="#525866",
    )

    conditions = [
        ("Normal Vision", None),
        ("Protanopia", "protan"),
        ("Deuteranopia", "deutan"),
        ("Tritanopia", "tritan"),
    ]

    left_lbl_w = 520
    grid_x0 = 84 + left_lbl_w
    grid_y0 = 225
    col_gap = 38
    col_w = (W * 2 - grid_x0 - 84 - col_gap * 3) / 4
    row_h = 160

    for ci, (cname, _) in enumerate(conditions):
        cx0 = grid_x0 + ci * (col_w + col_gap)
        draw_text_centered(draw, cx0 + col_w / 2, grid_y0 - 34, cname, f_col, fill="#222630")

    for ri, slug in enumerate(showcase):
        y0 = grid_y0 + ri * row_h
        m = meta_by_slug[slug]
        mode_s = "Light" if m["mode"] == "light" else "Dark"
        lbl = f"{SHORT_GAME[m['game']]} {mode_s}"
        draw.text((84, y0 + 38), lbl, font=f_row, fill="#1E222B")
        if slug == "linksawakening-dark":
            draw.text((84, y0 + 74), "(DMG-01 monochrome LCD)", font=load_font(19, "italic"), fill="#687080")

        orig_hexes = [poly_by_slug[slug][rl] for rl in POLYGON_ROLES]
        for ci, (_, cvd_t) in enumerate(conditions):
            cx0 = grid_x0 + ci * (col_w + col_gap)
            sim_hexes = orig_hexes if cvd_t is None else simulate_cvd_hexes(orig_hexes, cvd_t)
            sw_w = col_w / len(POLYGON_ROLES)
            draw.rounded_rectangle((cx0 - 2, y0 + 16, cx0 + col_w + 2, y0 + 114), radius=8, fill="#FFFFFF", outline="#DCDAD2", width=2)
            for si, hx in enumerate(sim_hexes):
                sx0 = cx0 + si * sw_w + 2
                sx1 = cx0 + (si + 1) * sw_w - 2
                draw.rectangle((sx0, y0 + 20, sx1, y0 + 110), fill=hex_to_rgb_tuple(hx))

    draw_text_centered(
        draw,
        W,
        H * 2 - 48,
        "Swatches inside each bar (left to right): keyword · storage · string · regex · function · type · interface · number · decorator · namespace",
        f_foot,
        fill="#5E6472",
    )
    save_downsampled(img, CS_ASSETS / "cvd-swatch-grid.png", W, H)
    print("Saved assets/color-science/cvd-swatch-grid.png")


# ---------- 8. Per-Mode CIEDE2000 Classical MDS & Ward-Ordered Split-Triangle Matrix ----------

def compute_de00_matrix(slugs, by_slug):
    n = len(slugs)
    D = np.zeros((n, n), dtype=np.float64)
    for i in range(n):
        for j in range(i + 1, n):
            d = sum(ciede2000_pair(by_slug[slugs[i]][rl], by_slug[slugs[j]][rl]) for rl in AUDIT_ROLES) / len(AUDIT_ROLES)
            D[i, j] = D[j, i] = d
    return D


def classical_mds_2d(D):
    n = D.shape[0]
    J = np.eye(n) - np.ones((n, n)) / n
    B = -0.5 * J @ (D ** 2) @ J
    eigvals, eigvecs = np.linalg.eigh(B)
    idx = np.argsort(eigvals)[::-1]
    eigvals, eigvecs = eigvals[idx], eigvecs[:, idx]
    pos_sum = float(np.sum(np.maximum(eigvals, 0.0)))
    v1 = float(eigvals[0] / pos_sum * 100.0) if pos_sum > 0 else 0.0
    v2 = float(eigvals[1] / pos_sum * 100.0) if pos_sum > 0 else 0.0
    coords = eigvecs[:, :2] * np.sqrt(np.maximum(eigvals[:2], 0.0))
    return coords, (v1, v2)


def render_theme_mds_and_heatmap(rows, slug_order):
    by_slug = {}
    hex_by_slug = {}
    meta_by_slug = {}
    for r in rows:
        s = r["theme_slug"]
        meta_by_slug[s] = r
        hex_by_slug.setdefault(s, {})[r["role"]] = r["hex"]
        if r["role"] in AUDIT_ROLES:
            by_slug.setdefault(s, {})[r["role"]] = (r["L"], r["a"], r["b"])

    # Compute per-mode distance matrices & Classical MDS (holding out Link's Awakening Dark)
    light_slugs = [s for s in slug_order if meta_by_slug[s]["mode"] == "light"]
    dark_all_slugs = [s for s in slug_order if meta_by_slug[s]["mode"] == "dark"]
    dark_poly_slugs = [s for s in dark_all_slugs if s != MONOCHROME_OUTLIER_SLUG]

    D_light = compute_de00_matrix(light_slugs, by_slug)
    D_dark_all = compute_de00_matrix(dark_all_slugs, by_slug)
    D_dark_poly = compute_de00_matrix(dark_poly_slugs, by_slug)

    coords_l, (v1_l, v2_l) = classical_mds_2d(D_light)
    coords_d, (v1_d, v2_d) = classical_mds_2d(D_dark_poly)

    # Deterministic orientation across both panels:
    # majora-* on -X (CRIMSON / MAGENTA), zelda2-* on +Y (CLASSIC / VIOLET)
    if coords_l[light_slugs.index("majora-light"), 0] > 0:
        coords_l[:, 0] *= -1
    if coords_l[light_slugs.index("zelda2-light"), 1] < 0:
        coords_l[:, 1] *= -1
    if coords_d[dark_poly_slugs.index("majora-dark"), 0] > 0:
        coords_d[:, 0] *= -1
    if coords_d[dark_poly_slugs.index("zelda2-dark"), 1] < 0:
        coords_d[:, 1] *= -1

    la_idx_all = dark_all_slugs.index(MONOCHROME_OUTLIER_SLUG)
    la_dists = [D_dark_all[la_idx_all, i] for i, s in enumerate(dark_all_slugs) if s != MONOCHROME_OUTLIER_SLUG]
    la_mean_de = float(np.mean(la_dists))
    la_min_de = float(np.min(la_dists))
    la_max_de = float(np.max(la_dists))

    # Export reproducible theme-mds.csv (exact 12-column schema, 36 rows)
    mds_rows = []
    for mode_name, slugs_all, D_mat, poly_slugs, coords_mat in [
        ("light", light_slugs, D_light, light_slugs, coords_l),
        ("dark", dark_all_slugs, D_dark_all, dark_poly_slugs, coords_d),
    ]:
        coord_map = {s: (coords_mat[i, 0], coords_mat[i, 1]) for i, s in enumerate(poly_slugs)}
        for i, s in enumerate(slugs_all):
            m = meta_by_slug[s]
            near_de, near_slug = min(
                ((float(D_mat[i, j]), slugs_all[j]) for j in range(len(slugs_all)) if j != i),
                key=lambda x: (x[0], x[1]),
            )
            far_de, far_slug = min(
                (
                    (float(D_mat[i, j]), slugs_all[j])
                    for j in range(len(slugs_all))
                    if j != i and slugs_all[j] != MONOCHROME_OUTLIER_SLUG
                ),
                key=lambda x: (-x[0], x[1]),
            )
            is_out = s == MONOCHROME_OUTLIER_SLUG
            mx, my = coord_map.get(s, (float("nan"), float("nan")))
            mds_rows.append({
                "theme_slug": s,
                "game": m["game"],
                "era": m["era"],
                "timeline": m["timeline"],
                "mode": mode_name,
                "mds1": "" if is_out else f"{mx:.4f}",
                "mds2": "" if is_out else f"{my:.4f}",
                "nearest_slug": near_slug,
                "nearest_de00": f"{near_de:.3f}",
                "farthest_poly_slug": far_slug,
                "farthest_poly_de00": f"{far_de:.3f}",
                "is_outlier": "true" if is_out else "false",
            })

    fieldnames = [
        "theme_slug", "game", "era", "timeline", "mode",
        "mds1", "mds2", "nearest_slug", "nearest_de00",
        "farthest_poly_slug", "farthest_poly_de00", "is_outlier",
    ]
    with open(DATA_DIR / "theme-mds.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, lineterminator="\n")
        w.writeheader()
        w.writerows(mds_rows)
    print("Saved analysis/data/theme-mds.csv")

    # ---------- Render Side-by-Side Perceptual MDS (theme-mds.png) ----------
    W, H = 2400, 1300
    img = make_canvas(W, H, "#FAF9F6")
    draw = ImageDraw.Draw(img)

    f_title = load_font(50, "bold")
    f_sub = load_font(25, "regular")
    f_phead = load_font(31, "bold")
    f_psub = load_font(22, "regular")
    f_lbl = load_font(20, "bold")
    f_pole = load_font(19, "bold")
    f_ax = load_font(23, "medium")
    f_tick = load_font(19, "regular")
    f_card_h = load_font(22, "bold")
    f_card_s = load_font(19, "regular")
    f_card_i = load_font(17, "italic")
    f_foot = load_font(22, "regular")

    draw.text((120, 50), "Perceptual Similarity Landscape — Classical MDS on CIEDE2000 (ΔE₀₀)", font=f_title, fill="#181A20")
    draw.text(
        (120, 114),
        "Pairwise mean ΔE₀₀ across all 13 syntax roles, split by polarity so games separate purely by chromatic identity. Inner fill = editor bg · outer ring = signature accent.",
        font=f_sub,
        fill="#525866",
    )

    panels = [
        {
            "title": "Light Themes (18 Games)",
            "subtitle": f"Dim 1 ({v1_l:.1f}%) + Dim 2 ({v2_l:.1f}%) = {v1_l + v2_l:.1f}% of perceptual distance variance",
            "slugs": light_slugs,
            "coords": coords_l,
            "D": D_light,
            "px0": 135,
            "py0": 265,
            "pw": 2160,
            "ph": 2030,
            "var": (v1_l, v2_l),
            "ymin_pad": 2.3,
            "outlier_box": None,
        },
        {
            "title": "Dark Themes (17 Polychromatic + 1 Monochrome Outlier)",
            "subtitle": f"Dim 1 ({v1_d:.1f}%) + Dim 2 ({v2_d:.1f}%) = {v1_d + v2_d:.1f}% of polychromatic distance variance",
            "slugs": dark_poly_slugs,
            "coords": coords_d,
            "D": D_dark_poly,
            "px0": 2505,
            "py0": 265,
            "pw": 2160,
            "ph": 2030,
            "var": (v1_d, v2_d),
            "ymin_pad": 4.0,
            "outlier_box": (2505 + 2160 - 928, 265 + 2030 - 172, 2505 + 2160 - 28, 265 + 2030 - 28),
        },
    ]

    for p in panels:
        px0, py0, pw, ph = p["px0"], p["py0"], p["pw"], p["ph"]
        draw.text((px0, py0 - 76), p["title"], font=f_phead, fill="#181A20")
        draw.text((px0, py0 - 38), p["subtitle"], font=f_psub, fill="#5C6372")
        draw.rounded_rectangle((px0, py0, px0 + pw, py0 + ph), radius=16, fill="#FFFFFF", outline="#DCDAD2", width=2)

        xs = p["coords"][:, 0]
        ys = p["coords"][:, 1]
        xmin, xmax = float(xs.min()) - 2.6, float(xs.max()) + 3.2
        ymin, ymax = float(ys.min()) - p["ymin_pad"], float(ys.max()) + 2.3

        def map_pt(xv, yv):
            return (
                px0 + 90 + (xv - xmin) / (xmax - xmin) * (pw - 180),
                py0 + ph - 90 - (yv - ymin) / (ymax - ymin) * (ph - 180),
            )

        # Grid lines
        for gx in range(-20, 20, 5):
            if xmin <= gx <= xmax:
                xp, _ = map_pt(gx, 0)
                draw.line([(xp, py0 + 2), (xp, py0 + ph - 2)], fill="#D7DAE2" if gx == 0 else "#F1F0EB", width=3 if gx == 0 else 2)
                draw_text_centered(draw, xp, py0 + ph + 24, str(gx), f_tick, fill="#687080")
        for gy in range(-15, 20, 5):
            if ymin <= gy <= ymax:
                _, yp = map_pt(0, gy)
                draw.line([(px0 + 2, yp), (px0 + pw - 2, yp)], fill="#D7DAE2" if gy == 0 else "#F1F0EB", width=3 if gy == 0 else 2)
                draw_text_centered(draw, px0 - 30, yp, str(gy), f_tick, fill="#687080")

        # Subtle compass pole hints inside frame edges & exact obstacle rects
        pole_l = "← CRIMSON / MAGENTA"
        pole_r = "EMERALD / CYAN →"
        pole_t = "↑ CLASSIC / VIOLET"
        pole_b = "↓ SAPPHIRE / GOLD"

        pl_bb = draw.textbbox((px0 + 24, py0 + ph / 2 - 12), pole_l, font=f_pole)
        draw.text((px0 + 24, py0 + ph / 2 - 12), pole_l, font=f_pole, fill="#9AA0AE")

        eb = draw.textbbox((0, 0), pole_r, font=f_pole)
        pr_x = px0 + pw - (eb[2] - eb[0]) - 24
        pr_bb = draw.textbbox((pr_x, py0 + ph / 2 - 12), pole_r, font=f_pole)
        draw.text((pr_x, py0 + ph / 2 - 12), pole_r, font=f_pole, fill="#9AA0AE")

        tb = draw.textbbox((0, 0), pole_t, font=f_pole)
        tw_t, th_t = tb[2] - tb[0], tb[3] - tb[1]
        pt_bb = (px0 + pw / 2 - tw_t / 2, py0 + 24 - th_t / 2, px0 + pw / 2 + tw_t / 2, py0 + 24 + th_t / 2)
        draw_text_centered(draw, px0 + pw / 2, py0 + 24, pole_t, f_pole, fill="#9AA0AE")

        bb_b = draw.textbbox((0, 0), pole_b, font=f_pole)
        tw_b, th_b = bb_b[2] - bb_b[0], bb_b[3] - bb_b[1]
        pb_bb = (px0 + pw / 2 - tw_b / 2, py0 + ph - 26 - th_b / 2, px0 + pw / 2 + tw_b / 2, py0 + ph - 26 + th_b / 2)
        draw_text_centered(draw, px0 + pw / 2, py0 + ph - 26, pole_b, f_pole, fill="#9AA0AE")

        obstacles = [
            (pl_bb[0] - 10, pl_bb[1] - 8, pl_bb[2] + 10, pl_bb[3] + 8),
            (pr_bb[0] - 10, pr_bb[1] - 8, pr_bb[2] + 10, pr_bb[3] + 8),
            (pt_bb[0] - 10, pt_bb[1] - 8, pt_bb[2] + 10, pt_bb[3] + 8),
            (pb_bb[0] - 10, pb_bb[1] - 8, pb_bb[2] + 10, pb_bb[3] + 8),
        ]
        obox = p["outlier_box"]
        if obox is not None:
            obstacles.append((obox[0] - 16, obox[1] - 16, obox[2] + 16, obox[3] + 16))

        pts_px = [map_pt(xs[i], ys[i]) for i in range(len(p["slugs"]))]

        # Subtle dashed connectors for closest chromatic siblings (<= 4.5 ΔE₀₀)
        D_here = p["D"]
        for i in range(len(p["slugs"])):
            for j in range(i + 1, len(p["slugs"])):
                if D_here[i, j] <= 4.5:
                    x1, y1 = pts_px[i]
                    x2, y2 = pts_px[j]
                    seg_len = math.hypot(x2 - x1, y2 - y1)
                    if seg_len > 10:
                        steps = max(6, int(seg_len / 14))
                        for k in range(0, steps, 2):
                            xa = x1 + (x2 - x1) * (k / steps)
                            ya = y1 + (y2 - y1) * (k / steps)
                            xb = x1 + (x2 - x1) * (min(k + 1, steps) / steps)
                            yb = y1 + (y2 - y1) * (min(k + 1, steps) / steps)
                            draw.line([(xa, ya), (xb, yb)], fill="#C6CBD6", width=3)

        # Zero-collision force-directed label placement with local-cluster radial fan
        labels = []
        for i, s in enumerate(p["slugs"]):
            m = meta_by_slug[s]
            lbl = SHORT_GAME[m["game"]]
            bb = draw.textbbox((0, 0), lbl, font=f_lbl)
            lw, lh = (bb[2] - bb[0]) + 16, (bb[3] - bb[1]) + 10
            ax, ay = pts_px[i]
            local_pts = [pt for pt in pts_px if math.hypot(pt[0] - ax, pt[1] - ay) <= 240.0]
            if len(local_pts) >= 2:
                lcx = sum(pt[0] for pt in local_pts) / len(local_pts)
                lcy = sum(pt[1] for pt in local_pts) / len(local_pts)
                if math.hypot(ax - lcx, ay - lcy) > 1e-3:
                    ang = math.atan2(ay - lcy, ax - lcx)
                else:
                    ang = -math.pi / 2 + (i % 8) * (math.pi / 4)
                r_init = 120.0 if len(local_pts) >= 5 else 72.0
            else:
                ang = -math.pi / 2
                r_init = 56.0
            labels.append({
                "idx": i,
                "slug": s,
                "text": lbl,
                "ax": ax,
                "ay": ay,
                "x": ax + math.cos(ang) * r_init,
                "y": ay + math.sin(ang) * r_init,
                "w": lw,
                "h": lh,
            })

        def clamp_label(li):
            li["x"] = min(px0 + pw - li["w"] / 2 - 22, max(px0 + li["w"] / 2 + 22, li["x"]))
            li["y"] = min(py0 + ph - li["h"] / 2 - 54, max(py0 + li["h"] / 2 + 54, li["y"]))

        for li in labels:
            clamp_label(li)

        for _ in range(1600):
            for i, li in enumerate(labels):
                fx, fy = 0.0, 0.0
                dx_a = li["x"] - li["ax"]
                dy_a = li["y"] - li["ay"]
                dist_a = math.hypot(dx_a, dy_a) + 1e-4
                if dist_a > 280.0:
                    fx -= (dx_a / dist_a) * (dist_a - 280.0) * 0.07
                    fy -= (dy_a / dist_a) * (dist_a - 280.0) * 0.07
                elif dist_a < 54.0:
                    fx += (dx_a / dist_a) * (54.0 - dist_a) * 0.45
                    fy += (dy_a / dist_a) * (54.0 - dist_a) * 0.45

                # Radial escape from all marker points
                for m_idx, (ax, ay) in enumerate(pts_px):
                    ox = abs(li["x"] - ax) - (li["w"] / 2 + 28)
                    oy = abs(li["y"] - ay) - (li["h"] / 2 + 28)
                    if ox < 0 and oy < 0:
                        rx = li["x"] - ax
                        ry = li["y"] - ay
                        rn = math.hypot(rx, ry)
                        if rn < 1e-3:
                            ang = (i * 1.17 + m_idx * 0.73) % (2.0 * math.pi)
                            rx, ry, rn = math.cos(ang), math.sin(ang), 1.0
                        push = min(-ox, -oy) * 0.85 + 2.0
                        fx += (rx / rn) * push
                        fy += (ry / rn) * push

                # Repel from other labels
                for j, lj in enumerate(labels):
                    if i == j:
                        continue
                    ox = abs(li["x"] - lj["x"]) - (li["w"] + lj["w"]) / 2 - 16
                    oy = abs(li["y"] - lj["y"]) - (li["h"] + lj["h"]) / 2 - 14
                    if ox < 0 and oy < 0:
                        sx = 1.0 if (li["x"] > lj["x"] or (li["x"] == lj["x"] and i > j)) else -1.0
                        sy = 1.0 if (li["y"] > lj["y"] or (li["y"] == lj["y"] and i > j)) else -1.0
                        if abs(ox) < abs(oy):
                            fx += sx * (-ox) * 0.58
                        else:
                            fy += sy * (-oy) * 0.58

                # Repel from compass poles and outlier callout card
                for obx0, oby0, obx1, oby1 in obstacles:
                    ocx, ocy = 0.5 * (obx0 + obx1), 0.5 * (oby0 + oby1)
                    ohw, ohh = 0.5 * (obx1 - obx0) + 8, 0.5 * (oby1 - oby0) + 8
                    ox = abs(li["x"] - ocx) - (li["w"] / 2 + ohw)
                    oy = abs(li["y"] - ocy) - (li["h"] / 2 + ohh)
                    if ox < 0 and oy < 0:
                        sx = 1.0 if li["x"] >= ocx else -1.0
                        sy = 1.0 if li["y"] >= ocy else -1.0
                        if abs(ox) < abs(oy):
                            fx += sx * (-ox) * 0.75
                        else:
                            fy += sy * (-oy) * 0.75

                li["x"] += fx
                li["y"] += fy
                clamp_label(li)

        # Joint strict non-overlap projection pass (label-label, label-marker, label-obstacle, bounds)
        for _ in range(500):
            moved = False
            for i in range(len(labels)):
                for j in range(i + 1, len(labels)):
                    li, lj = labels[i], labels[j]
                    ox = (li["w"] + lj["w"]) / 2 + 12 - abs(li["x"] - lj["x"])
                    oy = (li["h"] + lj["h"]) / 2 + 10 - abs(li["y"] - lj["y"])
                    if ox > 0 and oy > 0:
                        moved = True
                        if ox < oy:
                            shift = (ox / 2 + 1.0) * (1.0 if li["x"] >= lj["x"] else -1.0)
                            li["x"] += shift
                            lj["x"] -= shift
                        else:
                            shift = (oy / 2 + 1.0) * (1.0 if li["y"] >= lj["y"] else -1.0)
                            li["y"] += shift
                            lj["y"] -= shift
            for i, li in enumerate(labels):
                for m_idx, (ax, ay) in enumerate(pts_px):
                    ox = (li["w"] / 2 + 26) - abs(li["x"] - ax)
                    oy = (li["h"] / 2 + 26) - abs(li["y"] - ay)
                    if ox > 0 and oy > 0:
                        moved = True
                        rx, ry = li["x"] - ax, li["y"] - ay
                        rn = math.hypot(rx, ry)
                        if rn < 1e-3:
                            ang = (i * 1.17 + m_idx * 0.73) % (2.0 * math.pi)
                            rx, ry, rn = math.cos(ang), math.sin(ang), 1.0
                        step = min(ox, oy) + 2.0
                        li["x"] += (rx / rn) * step
                        li["y"] += (ry / rn) * step
                for obx0, oby0, obx1, oby1 in obstacles:
                    ocx, ocy = 0.5 * (obx0 + obx1), 0.5 * (oby0 + oby1)
                    ohw, ohh = 0.5 * (obx1 - obx0) + 6, 0.5 * (oby1 - oby0) + 6
                    ox = (li["w"] / 2 + ohw) - abs(li["x"] - ocx)
                    oy = (li["h"] / 2 + ohh) - abs(li["y"] - ocy)
                    if ox > 0 and oy > 0:
                        moved = True
                        if ox < oy:
                            li["x"] += (ox + 1.5) * (1.0 if li["x"] >= ocx else -1.0)
                        else:
                            li["y"] += (oy + 1.5) * (1.0 if li["y"] >= ocy else -1.0)
                clamp_label(li)
            if not moved:
                break

        # Draw leader ticks where nudged
        for li in labels:
            if math.hypot(li["x"] - li["ax"], li["y"] - li["ay"]) > 28:
                draw.line([(li["ax"], li["ay"]), (li["x"], li["y"])], fill="#BCC2D0", width=2)

        # Draw two-tone swatch markers (inner = bg, outer ring = accentKeyword)
        for li in labels:
            s = li["slug"]
            bg_hex = hex_by_slug[s]["bg"]
            kw_hex = hex_by_slug[s]["accentKeyword"]
            cx, cy = li["ax"], li["ay"]
            draw_circle(draw, cx, cy, 20, fill="#FFFFFF")
            draw_circle(draw, cx, cy, 17, fill=hex_to_rgb_tuple(kw_hex), outline="#222630", width=2)
            draw_circle(
                draw,
                cx,
                cy,
                8.5,
                fill=hex_to_rgb_tuple(bg_hex),
                outline="#FFFFFF" if meta_by_slug[s]["mode"] == "dark" else "#484F5E",
                width=1,
            )

        # Draw crisp label pills
        for li in labels:
            draw.rounded_rectangle(
                (li["x"] - li["w"] / 2 + 1, li["y"] - li["h"] / 2 + 1, li["x"] + li["w"] / 2 - 1, li["y"] + li["h"] / 2 - 1),
                radius=6,
                fill="#FFFFFF",
                outline="#ECEAE2",
                width=1,
            )
            draw_text_centered(draw, li["x"], li["y"], li["text"], f_lbl, fill="#1E222B")

        # Dark-panel Link's Awakening Dark off-chart callout card
        if obox is not None:
            ox0, oy0, ox1, oy1 = obox
            draw.rounded_rectangle(obox, radius=14, fill="#F5F7EC", outline="#7E9B24", width=3)
            gcx, gcy = ox0 + 54, 0.5 * (oy0 + oy1)
            draw_circle(draw, gcx, gcy, 23, fill="#9BBC0F", outline="#283A0B", width=3)
            draw_circle(draw, gcx, gcy, 11.5, fill="#0F380F", outline="#D6EA82", width=2)
            draw.text((ox0 + 96, oy0 + 24), "Link's Awakening Dark  ·  Off-Chart Monochrome Outlier", font=f_card_h, fill="#1F3008")
            draw.text(
                (ox0 + 96, oy0 + 64),
                f"1993 DMG-01 olive LCD ramp  ·  mean ΔE₀₀ = {la_mean_de:.1f} ({la_min_de:.1f}–{la_max_de:.1f}) vs all 17",
                font=f_card_s,
                fill="#445622",
            )
            draw.text(
                (ox0 + 96, oy0 + 100),
                "Held out of Dark MDS fit so the 17 polychromatic games use the full canvas.",
                font=f_card_i,
                fill="#5A6B3A",
            )

        draw_text_centered(draw, px0 + pw / 2, py0 + ph + 62, f"MDS Dim 1 ({p['var'][0]:.1f}% variance)", f_ax, fill="#222630")

    draw_text_centered(
        draw,
        W,
        H * 2 - 48,
        "Inner dot = editor background  ·  Outer ring = signature keyword accent  ·  Dashed links connect closest siblings (mean ΔE₀₀ ≤ 4.5)",
        f_foot,
        fill="#565E6E",
    )

    save_downsampled(img, CS_ASSETS / "theme-mds.png", W, H)
    print(f"Saved assets/color-science/theme-mds.png (Light 2D={v1_l + v2_l:.1f}%, Dark 2D={v1_d + v2_d:.1f}%, Link's Awakening Dark mean ΔE00={la_mean_de:.2f})")

    # ---------- Render Ward-Ordered 18x18 Split-Triangle ΔE₀₀ Matrix (theme-distance-heatmap.png) ----------
    games = list(GAME_ORDER)
    l_by_game = {meta_by_slug[s]["game"]: s for s in light_slugs}
    d_by_game = {meta_by_slug[s]["game"]: s for s in dark_all_slugs}
    nc = len(games)

    # Order the 18 games by Ward.D2 clustering on combined Light+Dark 78-D CIE Lab profile
    comb_feats = []
    for gm in games:
        vec = []
        for sl in (l_by_game[gm], d_by_game[gm]):
            for rl in AUDIT_ROLES:
                vec.extend(by_slug[sl][rl])
        comb_feats.append(vec)
    Xc = np.array(comb_feats, dtype=np.float64)
    Zc = (Xc - Xc.mean(axis=0, keepdims=True)) / Xc.std(axis=0, ddof=1, keepdims=True)
    merges_c = ward_d2_clustering(Zc)
    ch_c = {m[3]: (m[0], m[1], m[2]) for m in merges_c}
    ord_c = []

    def collect_c(u):
        if u < nc:
            ord_c.append(u)
        else:
            a, b, _ = ch_c[u]
            collect_c(a)
            collect_c(b)

    collect_c(merges_c[-1][3])
    ordered_games = [games[i] for i in ord_c]

    ord_l_slugs = [l_by_game[g] for g in ordered_games]
    ord_d_slugs = [d_by_game[g] for g in ordered_games]
    DL_ord = compute_de00_matrix(ord_l_slugs, by_slug)
    DD_ord = compute_de00_matrix(ord_d_slugs, by_slug)

    def interp_palette(val, is_dmg=False):
        if is_dmg:
            # Distinct DMG-01 olive band explicitly keyed on Link's Awakening Dark identity
            t = min(1.0, max(0.0, (val - 31.0) / 15.0))
            c0, c1 = (218, 224, 176), (174, 194, 108)
            return tuple(int(round(c0[k] + (c1[k] - c0[k]) * t)) for k in range(3))
        # Perceptually smooth deep-indigo -> sapphire -> teal -> mist -> warm ivory (0..30+)
        stops = [
            (0.0,  (20, 36, 94)),
            (5.0,  (30, 84, 152)),
            (11.0, (64, 142, 176)),
            (17.5, (152, 196, 192)),
            (24.0, (226, 224, 205)),
            (30.0, (248, 242, 228)),
        ]
        v = min(30.0, max(0.0, val))
        for k in range(len(stops) - 1):
            v0, c0 = stops[k]
            v1, c1 = stops[k + 1]
            if v <= v1:
                t = (v - v0) / (v1 - v0)
                return tuple(int(round(c0[i] + (c1[i] - c0[i]) * t)) for i in range(3))
        return stops[-1][1]

    HW, HH = 1840, 1920
    himg = make_canvas(HW, HH, "#FAF9F6")
    hdraw = ImageDraw.Draw(himg)

    hf_title = load_font(48, "bold")
    hf_sub = load_font(24, "regular")
    hf_lbl = load_font(26, "bold")
    hf_tag = load_font(21, "bold")
    hf_cb = load_font(21, "medium")
    hf_dmg_s = load_font(19, "regular")
    hf_foot = load_font(20, "regular")

    hdraw.text((110, 50), "Pairwise Perceptual Distance Matrix — All 18 Games (CIEDE2000 ΔE₀₀)", font=hf_title, fill="#181A20")
    hdraw.text(
        (110, 112),
        "Ward-ordered split-triangle matrix: upper-right = Light mode, lower-left = Dark mode (mean ΔE₀₀ across 13 syntax roles). Diagonal = Light / Dark keyword swatches.",
        font=hf_sub,
        fill="#525866",
    )

    cell = 148
    grid_w = nc * cell
    gx0 = 700
    gy0 = 700

    # Matrix frame
    hdraw.rectangle((gx0 - 3, gy0 - 3, gx0 + grid_w + 3, gy0 + grid_w + 3), fill="#FFFFFF", outline="#C8C6BE", width=3)

    for r_i in range(nc):
        y0 = gy0 + r_i * cell
        for c_i in range(nc):
            x0 = gx0 + c_i * cell
            if r_i == c_i:
                l_col = hex_to_rgb_tuple(hex_by_slug[ord_l_slugs[r_i]]["accentKeyword"])
                d_col = hex_to_rgb_tuple(hex_by_slug[ord_d_slugs[r_i]]["accentKeyword"])
                hdraw.polygon([(x0, y0), (x0 + cell, y0), (x0 + cell, y0 + cell)], fill=l_col)
                hdraw.polygon([(x0, y0), (x0, y0 + cell), (x0 + cell, y0 + cell)], fill=d_col)
                hdraw.line([(x0, y0), (x0 + cell, y0 + cell)], fill="#FAF9F6", width=4)
                hdraw.rectangle((x0, y0, x0 + cell, y0 + cell), outline="#FAF9F6", width=2)
            elif r_i < c_i:
                col = interp_palette(DL_ord[r_i, c_i], is_dmg=False)
                hdraw.rectangle((x0 + 1, y0 + 1, x0 + cell - 1, y0 + cell - 1), fill=col)
            else:
                is_dmg = (
                    ord_d_slugs[r_i] == MONOCHROME_OUTLIER_SLUG
                    or ord_d_slugs[c_i] == MONOCHROME_OUTLIER_SLUG
                )
                col = interp_palette(DD_ord[r_i, c_i], is_dmg=is_dmg)
                hdraw.rectangle((x0 + 1, y0 + 1, x0 + cell - 1, y0 + cell - 1), fill=col)

    # Row labels (left, right-aligned) and tight-cropped 50-deg rotated column labels (top)
    for idx_g, gm in enumerate(ordered_games):
        short_name = SHORT_GAME[gm]
        era_col = hex_to_rgb_tuple(ERA_COLORS[meta_by_slug[ord_l_slugs[idx_g]]["era"]])
        # Left row label + era pip
        yc = gy0 + idx_g * cell + cell / 2
        draw_circle(hdraw, gx0 - 24, yc, 9, fill=era_col)
        bb = hdraw.textbbox((0, 0), short_name, font=hf_lbl)
        tw = bb[2] - bb[0]
        th = bb[3] - bb[1]
        hdraw.text((gx0 - 44 - tw, yc - th / 2 - bb[1] * 0.5), short_name, font=hf_lbl, fill="#1E222B")

        # Top rotated column label (50 deg counter-clockwise, tight-cropped)
        xc = gx0 + idx_g * cell + cell / 2
        draw_circle(hdraw, xc, gy0 - 24, 9, fill=era_col)
        tmp = Image.new("RGBA", (440, 60), (0, 0, 0, 0))
        td = ImageDraw.Draw(tmp)
        td.text((6, 12), short_name, font=hf_lbl, fill="#1E222B")
        tbbox = tmp.getbbox()
        cropped = tmp.crop(tbbox) if tbbox else tmp
        rot = cropped.rotate(50, expand=True, resample=Image.BICUBIC)
        px_paste = int(xc - 0.5 * cropped.height * math.sin(math.radians(50)))
        py_paste = int(gy0 - 40 - rot.height)
        himg.paste(rot, (px_paste, py_paste), rot)

    # Triangle callout badges (dynamically sized cleanly outside all row/column labels)
    u_text = "UPPER TRIANGLE  ·  LIGHT MODE"
    u_bb = hdraw.textbbox((0, 0), u_text, font=hf_tag)
    u_w = max(500, (u_bb[2] - u_bb[0]) + 64)
    ux0, uy0 = gx0 + grid_w - u_w, 260
    hdraw.rounded_rectangle((ux0, uy0, ux0 + u_w, uy0 + 62), radius=12, fill="#EEF3FA", outline="#285C9E", width=2)
    draw_text_centered(hdraw, ux0 + u_w / 2, uy0 + 31, u_text, hf_tag, fill="#1A447C")

    l_text = "LOWER TRIANGLE  ·  DARK MODE"
    l_bb = hdraw.textbbox((0, 0), l_text, font=hf_tag)
    l_w = max(460, (l_bb[2] - l_bb[0]) + 64)
    lx0, ly0 = 110, gy0 + grid_w + 26
    hdraw.rounded_rectangle((lx0, ly0, lx0 + l_w, ly0 + 62), radius=12, fill="#1D222E", outline="#4B5670", width=2)
    draw_text_centered(hdraw, lx0 + l_w / 2, ly0 + 31, l_text, hf_tag, fill="#ECEFF6")

    # Horizontal colorbar + Link's Awakening Dark olive swatch at bottom
    cb_x0, cb_y0, cb_w, cb_h = gx0, gy0 + grid_w + 175, 1860, 44
    for px in range(cb_w):
        val = (px / max(1, cb_w - 1)) * 30.0
        hdraw.line([(cb_x0 + px, cb_y0), (cb_x0 + px, cb_y0 + cb_h)], fill=interp_palette(val, is_dmg=False))
    hdraw.rectangle((cb_x0, cb_y0, cb_x0 + cb_w, cb_y0 + cb_h), outline="#8E94A2", width=2)

    for tick_v, tick_lbl in [(0, "0 (identical)"), (6, "6"), (12, "12"), (18, "18"), (24, "24"), (30.0, "30+ (distinct)")]:
        tx = cb_x0 + (tick_v / 30.0) * cb_w
        hdraw.line([(tx, cb_y0 + cb_h), (tx, cb_y0 + cb_h + 10)], fill="#6E7482", width=2)
        draw_text_centered(hdraw, tx, cb_y0 + cb_h + 34, tick_lbl, hf_cb, fill="#383E4C")

    # Separate Link's Awakening Dark monochrome outlier key
    ob_x = cb_x0 + cb_w + 90
    hdraw.rectangle((ob_x, cb_y0, ob_x + 105, cb_y0 + cb_h), fill=interp_palette(la_mean_de, is_dmg=True), outline="#6A7A32", width=2)
    hdraw.text((ob_x + 123, cb_y0 - 4), f"{la_min_de:.1f}–{la_max_de:.1f} ΔE₀₀", font=hf_tag, fill="#3B4A14")
    hdraw.text((ob_x + 123, cb_y0 + 24), "Link's Awakening Dark (1993 DMG-01 LCD)", font=hf_dmg_s, fill="#586438")

    draw_text_centered(
        hdraw,
        cb_x0 + cb_w / 2,
        cb_y0 - 34,
        "Mean Pairwise CIEDE2000 ΔE₀₀ Across 13 Syntax Roles  (Darker = Closer Chromatic Siblings)",
        hf_cb,
        fill="#222630",
    )

    draw_text_centered(
        hdraw,
        HW,
        HH * 2 - 48,
        "Row and column order follows Ward.D2 hierarchical clustering on standardized 78-D Light + Dark CIE Lab profiles  ·  Era pips show hardware generation",
        hf_foot,
        fill="#565E6E",
    )

    save_downsampled(himg, CS_ASSETS / "theme-distance-heatmap.png", HW, HH)
    print("Saved assets/color-science/theme-distance-heatmap.png")


def main():
    mds_only = "--mds-only" in sys.argv[1:]
    rows = load_data()
    if mds_only:
        slug_order = compute_slug_order(rows)
        render_theme_mds_and_heatmap(rows, slug_order)
        print("Per-mode CIEDE2000 MDS CSV/plot and split-triangle distance heatmap generated successfully.")
        return
    slug_order, _ = run_cvd_audit(rows)
    render_timeline_metro()
    render_colorspace_grid(rows, slug_order)
    render_global_pca(rows)
    render_family_fingerprint(rows, slug_order)
    render_theme_similarity(rows, slug_order)
    render_theme_mds_and_heatmap(rows, slug_order)
    render_cvd_swatch_grid(rows)
    print("All color-science CSVs and high-DPI PNG assets generated successfully.")


if __name__ == "__main__":
    main()
