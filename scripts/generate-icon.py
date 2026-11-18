#!/usr/bin/env python3
"""
Programmatically renders the original Hylian Palette extension icon (`icon.png`,
256x256 RGBA, 4x supersampled from 1024x1024) as two vertically mirrored,
3D-beveled geometric Sierpinski triangles:
  - Upper upright triad: luminous burnished gold (Hyrule / Light)
  - Lower inverted triad: deep faceted obsidian with subtle violet-slate rim
    highlights (Lorule / Dark) so it stays crisp on both Light and Dark IDE
    sidebars.

100% algorithmic geometry (NumPy + Pillow) — zero copied artwork or textures.
Run with: python3 scripts/generate-icon.py
"""

import math
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(ROOT, "icon.png")

SIZE = 1024
FINAL_SIZE = 256


def barycentric_masks(xs, ys, v0, v1, v2):
    x0, y0 = v0
    x1, y1 = v1
    x2, y2 = v2
    denom = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
    w0 = ((y1 - y2) * (xs - x2) + (x2 - x1) * (ys - y2)) / denom
    w1 = ((y2 - y0) * (xs - x2) + (x0 - x2) * (ys - y2)) / denom
    w2 = 1.0 - w0 - w1
    inside = (w0 >= 0.0) & (w1 >= 0.0) & (w2 >= 0.0)
    return inside, w0, w1, w2


def point_to_segment_dist(xs, ys, a, b):
    ax, ay = a
    bx, by = b
    vx, vy = bx - ax, by - ay
    seg_len2 = vx * vx + vy * vy
    t = np.clip(((xs - ax) * vx + (ys - ay) * vy) / seg_len2, 0.0, 1.0)
    px = ax + t * vx
    py = ay + t * vy
    return np.hypot(xs - px, ys - py)


def draw_beveled_triangle(canvas, xs, ys, verts, palette, noise_field, light_dir=(-0.62, -0.78)):
    """
    Renders a single metallic 3D-beveled equilateral triangle onto RGBA float
    `canvas` (H, W, 4) in [0, 1]. Each of the 3 edges gets a crisp chamfered
    bevel angled by the edge's outward normal against `light_dir`, plus subtle
    brushed-metal gradient and micro-grain across the flat face.
    """
    v0, v1, v2 = verts
    inside, w0, w1, w2 = barycentric_masks(xs, ys, v0, v1, v2)
    if not np.any(inside):
        return

    # Bounding box slice for speed
    ys_idx, xs_idx = np.where(inside)
    y_min, y_max = ys_idx.min(), ys_idx.max() + 1
    x_min, x_max = xs_idx.min(), xs_idx.max() + 1

    sub_x = xs[y_min:y_max, x_min:x_max]
    sub_y = ys[y_min:y_max, x_min:x_max]
    sub_in = inside[y_min:y_max, x_min:x_max]
    sub_noise = noise_field[y_min:y_max, x_min:x_max]

    cx = (v0[0] + v1[0] + v2[0]) / 3.0
    cy = (v0[1] + v1[1] + v2[1]) / 3.0

    # Compute distance to each edge and outward unit normal for each edge
    edges = [(v0, v1), (v1, v2), (v2, v0)]
    dists = []
    normals = []
    for a, b in edges:
        d = point_to_segment_dist(sub_x, sub_y, a, b)
        dists.append(d)
        ex, ey = b[0] - a[0], b[1] - a[1]
        # Candidate normal perpendicular to edge; ensure it points away from centroid
        nx, ny = -ey, ex
        midx, midy = (a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5
        if nx * (midx - cx) + ny * (midy - cy) < 0:
            nx, ny = -nx, -ny
        nlen = math.hypot(nx, ny)
        normals.append((nx / nlen, ny / nlen))

    d_stack = np.stack(dists, axis=0)  # (3, h, w)
    nearest_edge = np.argmin(d_stack, axis=0)
    min_dist = np.min(d_stack, axis=0)

    # Normalize directional gradient across the triangle face (top-left -> bottom-right)
    side_len = math.hypot(v1[0] - v0[0], v1[1] - v0[1])
    bevel_w = side_len * 0.088

    lx, ly = light_dir
    proj = ((sub_x - cx) * lx + (sub_y - cy) * ly) / (side_len * 0.58)
    proj = np.clip(proj * 0.5 + 0.5, 0.0, 1.0)  # 1 = sunlit top-left, 0 = shaded bottom-right

    # Base metallic face color interpolated from shadow -> mid -> highlight
    c_shadow = np.array(palette["shadow"], dtype=np.float32)
    c_mid = np.array(palette["mid"], dtype=np.float32)
    c_high = np.array(palette["high"], dtype=np.float32)
    c_spec = np.array(palette["spec"], dtype=np.float32)
    c_rim_dark = np.array(palette["rim_dark"], dtype=np.float32)

    t_low = np.clip(proj * 2.0, 0.0, 1.0)[..., None]
    t_hi = np.clip((proj - 0.5) * 2.0, 0.0, 1.0)[..., None]
    face_rgb = np.where(
        proj[..., None] < 0.5,
        c_shadow * (1.0 - t_low) + c_mid * t_low,
        c_mid * (1.0 - t_hi) + c_high * t_hi,
    )

    # Add subtle diagonal brushed specular band + tactile grain
    face_rgb = face_rgb + (sub_noise[..., None] - 0.5) * palette["grain"]

    # Bevel lighting per nearest edge
    edge_dot = np.zeros_like(min_dist, dtype=np.float32)
    for idx, (nx, ny) in enumerate(normals):
        dot = nx * lx + ny * ly  # [-1, 1]
        edge_dot = np.where(nearest_edge == idx, dot, edge_dot)

    bevel_t = np.clip(edge_dot * 0.5 + 0.5, 0.0, 1.0)[..., None]
    # Stronger contrast on chamfered bevels
    bevel_rgb = np.where(
        bevel_t > 0.55,
        c_high * (1.0 - (bevel_t - 0.55) / 0.45) + c_spec * ((bevel_t - 0.55) / 0.45),
        c_rim_dark * (1.0 - bevel_t / 0.55) + c_mid * (bevel_t / 0.55),
    )
    bevel_rgb = bevel_rgb + (sub_noise[..., None] - 0.5) * (palette["grain"] * 0.7)

    # Blend chamfer into flat face with crisp inner ridge highlight
    in_bevel = min_dist < bevel_w
    ridge = np.exp(-((min_dist - bevel_w) / (bevel_w * 0.14)) ** 2) * (0.14 if palette["is_light"] else 0.16)
    rgb = np.where(in_bevel[..., None], bevel_rgb, face_rgb)
    rgb = rgb + ridge[..., None] * (bevel_t - 0.32)

    # Subtle outer hairline rim for clean silhouette separation on any background
    outer_rim = min_dist < (side_len * 0.015)
    rim_mix = np.where(
        (edge_dot > 0.1)[..., None],
        c_spec * 0.78 + c_high * 0.22,
        c_rim_dark * 0.92,
    )
    rgb = np.where(outer_rim[..., None], rgb * 0.35 + rim_mix * 0.65, rgb)

    rgb = np.clip(rgb, 0.0, 1.0)

    target = canvas[y_min:y_max, x_min:x_max]
    target[sub_in, :3] = rgb[sub_in]
    target[sub_in, 3] = 1.0


def build_icon():
    cx = SIZE / 2.0
    cy = SIZE / 2.0

    # True equilateral geometry: two mirrored triangles meeting at y = cy.
    # Total height = 936px (44px vertical margin), base width W = 936 / sqrt(3) ~ 540.4px.
    # Slightly widened (0.935 * sqrt(3)) so the diamond feels balanced inside a square badge.
    half_h = 468.0
    half_w = 292.0  # total width = 584px, height = 936px (crisp diamond presence at 42px)
    seam_gap = 6.0  # tiny horizon gap separating Light & Dark worlds

    # Upper upright Triforce vertices (base at cy - seam_gap/2, apex at cy - seam_gap/2 - half_h)
    y_top_base = cy - seam_gap * 0.5
    y_top_apex = y_top_base - half_h
    y_top_mid = (y_top_base + y_top_apex) * 0.5

    top_triangles = [
        # Top peak
        [(cx, y_top_apex), (cx - half_w * 0.5, y_top_mid), (cx + half_w * 0.5, y_top_mid)],
        # Bottom-left
        [(cx - half_w * 0.5, y_top_mid), (cx - half_w, y_top_base), (cx, y_top_base)],
        # Bottom-right
        [(cx + half_w * 0.5, y_top_mid), (cx, y_top_base), (cx + half_w, y_top_base)],
    ]

    # Lower inverted Lorule Triforce vertices (base at cy + seam_gap/2, apex at cy + seam_gap/2 + half_h)
    y_bot_base = cy + seam_gap * 0.5
    y_bot_apex = y_bot_base + half_h
    y_bot_mid = (y_bot_base + y_bot_apex) * 0.5

    bot_triangles = [
        # Top-left (inverted)
        [(cx - half_w, y_bot_base), (cx, y_bot_base), (cx - half_w * 0.5, y_bot_mid)],
        # Top-right (inverted)
        [(cx, y_bot_base), (cx + half_w, y_bot_base), (cx + half_w * 0.5, y_bot_mid)],
        # Bottom peak (inverted)
        [(cx - half_w * 0.5, y_bot_mid), (cx + half_w * 0.5, y_bot_mid), (cx, y_bot_apex)],
    ]

    # Subtle deterministic micro-grain (metallic luster)
    rng = np.random.default_rng(1986)
    coarse = rng.random((SIZE // 4, SIZE // 4), dtype=np.float32)
    fine = rng.random((SIZE, SIZE), dtype=np.float32)
    coarse_up = np.array(
        Image.fromarray((coarse * 255).astype(np.uint8)).resize((SIZE, SIZE), Image.Resampling.BILINEAR),
        dtype=np.float32,
    ) / 255.0
    noise = coarse_up * 0.65 + fine * 0.35

    ys, xs = np.mgrid[0:SIZE, 0:SIZE].astype(np.float32)
    canvas = np.zeros((SIZE, SIZE, 4), dtype=np.float32)

    gold_palette = {
        "is_light": True,
        "spec": (1.00, 0.96, 0.72),      # sunlit gold glint (#FFF5B8)
        "high": (0.98, 0.82, 0.24),      # radiant Triforce gold (#FAD13D)
        "mid": (0.87, 0.63, 0.11),       # burnished gold (#DEA11C)
        "shadow": (0.64, 0.38, 0.04),    # warm bronze shadow (#A3610A)
        "rim_dark": (0.40, 0.21, 0.02),  # deep antique bronze edge (#663605)
        "grain": 0.075,
    }

    # Deep Lorule obsidian with a subtle violet-slate metallic sheen so it
    # reads unmistakably as dark stone/obsidian yet retains crisp facet
    # readability on dark VS Code / Positron sidebars.
    lorule_palette = {
        "is_light": False,
        "spec": (0.58, 0.52, 0.72),      # cool lavender-steel rim highlight (#9485B8)
        "high": (0.31, 0.27, 0.40),      # lit obsidian-violet facet (#4F4566)
        "mid": (0.17, 0.14, 0.23),       # Lorule obsidian core (#2B243B)
        "shadow": (0.09, 0.07, 0.13),    # deep twilight basalt (#171221)
        "rim_dark": (0.05, 0.04, 0.08),  # darkest crevice (#0D0A14)
        "grain": 0.085,
    }

    for tri in top_triangles:
        draw_beveled_triangle(canvas, xs, ys, tri, gold_palette, noise)

    for tri in bot_triangles:
        draw_beveled_triangle(canvas, xs, ys, tri, lorule_palette, noise)

    # Convert to PIL RGBA and add a gentle dark drop-halo behind the diamond so
    # it separates cleanly against bright light themes without muddying dark ones.
    fg_img = Image.fromarray((np.clip(canvas, 0.0, 1.0) * 255).astype(np.uint8), mode="RGBA")

    # Subtle ambient contact shadow (very tight, alpha <= 55)
    alpha = fg_img.split()[3]
    shadow_alpha = alpha.filter(ImageFilter.GaussianBlur(radius=14))
    shadow_arr = np.array(shadow_alpha, dtype=np.float32) * 0.26
    shadow_rgba = np.zeros((SIZE, SIZE, 4), dtype=np.uint8)
    shadow_rgba[..., 0] = 12
    shadow_rgba[..., 1] = 10
    shadow_rgba[..., 2] = 20
    shadow_rgba[..., 3] = np.clip(shadow_arr, 0, 255).astype(np.uint8)
    shadow_img = Image.fromarray(shadow_rgba, mode="RGBA")

    composed = Image.alpha_composite(shadow_img, fg_img)
    final = composed.resize((FINAL_SIZE, FINAL_SIZE), Image.Resampling.LANCZOS)
    final.save(OUT_PATH, optimize=True)
    print(f"Generated {OUT_PATH} ({FINAL_SIZE}x{FINAL_SIZE}, {os.path.getsize(OUT_PATH)} bytes)")


if __name__ == "__main__":
    build_icon()
