# Hylian Palette -- color science analysis
#
# Quantifies the 34 themes' palettes: a global PCA of the whole family's
# color space, per-theme colorspace diagrams (dots + connecting lines in
# the CIE a*-b* chroma/hue plane), and a color-vision-deficiency (CVD)
# distinguishability audit -- flagging any theme where two syntax-adjacent
# roles (e.g. keyword vs. string) become too close together to tell apart
# under simulated color blindness, even if they're fine for normal vision.
#
# Uses hand-implemented Lab conversion / CVD simulation (analysis/color_math.R)
# rather than the `colorspace`/`farver` packages -- both segfault
# reproducibly on this machine at any real scale, even freshly recompiled
# from source against the exact running R build. See color_math.R's header
# for the validation done against known reference values.
#
# Run from the repo root with: Rscript --vanilla analysis/color_science.R

source("analysis/color_math.R")
library(dplyr)
library(tidyr)
library(ggplot2)

dir.create("analysis/plots", showWarnings = FALSE, recursive = TRUE)
dir.create("assets/color-science", showWarnings = FALSE, recursive = TRUE)

ERA_ORDER <- c(
  "The Legend of Zelda", "Zelda II: The Adventure of Link", "A Link to the Past",
  "Link's Awakening", "Oracle of Seasons", "Oracle of Ages", "The Minish Cap",
  "Ocarina of Time", "Majora's Mask", "The Wind Waker", "Twilight Princess",
  "Phantom Hourglass", "Spirit Tracks",
  "Skyward Sword", "A Link Between Worlds", "Breath of the Wild", "Tears of the Kingdom", "Echoes of Wisdom"
)
ERA_LABEL <- c(
  "The Legend of Zelda" = "8-bit & 16-bit", "Zelda II: The Adventure of Link" = "8-bit & 16-bit", "A Link to the Past" = "8-bit & 16-bit",
  "Link's Awakening" = "Handheld", "Oracle of Seasons" = "Handheld", "Oracle of Ages" = "Handheld", "The Minish Cap" = "Handheld",
  "Ocarina of Time" = "N64 & GameCube", "Majora's Mask" = "N64 & GameCube", "The Wind Waker" = "N64 & GameCube", "Twilight Princess" = "N64 & GameCube",
  "Phantom Hourglass" = "Nintendo DS", "Spirit Tracks" = "Nintendo DS",
  "Skyward Sword" = "Modern", "A Link Between Worlds" = "Modern", "Breath of the Wild" = "Modern", "Tears of the Kingdom" = "Modern", "Echoes of Wisdom" = "Modern"
)
ERA_COLORS <- c(
  "8-bit & 16-bit" = "#8A5A24", "Handheld" = "#2E8B4A", "N64 & GameCube" = "#023E8A",
  "Nintendo DS" = "#1B6CA8", "Modern" = "#7A3EA8"
)

POLYGON_ROLES <- c(
  "accentKeyword", "accentStorage", "accentString", "accentRegex",
  "accentFunction", "accentType", "accentInterface", "accentNumber",
  "accentDecorator", "accentNamespace"
)
AUDIT_ROLES <- c(
  "accentKeyword", "accentStorage", "accentString", "accentRegex",
  "accentFunction", "accentFunctionDim", "accentType", "accentInterface",
  "accentNumber", "accentDecorator", "accentNamespace", "colorError", "colorWarning"
)

# ---------- load + convert ----------

raw <- read.csv("analysis/data/colors.csv", stringsAsFactors = FALSE)
lab <- srgb_to_lab(raw$hex)
data <- bind_cols(raw, lab[, c("L", "a", "b")]) %>%
  mutate(
    era = ERA_LABEL[game],
    game = factor(game, levels = ERA_ORDER)
  )

cat(sprintf("Loaded %d color rows across %d themes.\n", nrow(data), length(unique(data$theme_slug))))

# ---------- 1. Global PCA ----------

pca_input <- data %>% filter(role_kind == "syntax")
pca <- prcomp(pca_input[, c("L", "a", "b")], center = TRUE, scale. = FALSE)
pca_df <- bind_cols(pca_input, as.data.frame(pca$x[, 1:2]))
var_explained <- round(100 * pca$sdev^2 / sum(pca$sdev^2), 1)

p_pca <- ggplot(pca_df, aes(PC1, PC2, color = role, shape = mode)) +
  geom_point(size = 2.2, alpha = 0.75) +
  scale_shape_manual(values = c(light = 21, dark = 19)) +
  labs(
    title = "Global PCA of syntax-role colors across all 36 themes (CIE Lab space)",
    subtitle = sprintf("PC1 explains %.1f%% of variance, PC2 %.1f%% -- unscaled, so PC1 tracks mostly lightness/chroma structure", var_explained[1], var_explained[2]),
    x = sprintf("PC1 (%.1f%%)", var_explained[1]), y = sprintf("PC2 (%.1f%%)", var_explained[2]),
    color = "Syntax role", shape = "Mode"
  ) +
  theme_minimal(base_size = 12) +
  theme(legend.position = "right")

ggsave("analysis/plots/pca_global.png", p_pca, width = 10, height = 7, dpi = 150)
cat("Saved analysis/plots/pca_global.png\n")

# ---------- 2. Per-theme colorspace diagrams (dots + connecting polygon) ----------

poly_data <- data %>%
  filter(role %in% POLYGON_ROLES) %>%
  mutate(role = factor(role, levels = POLYGON_ROLES)) %>%
  arrange(theme_slug, role)

# Close the polygon by repeating the first point per theme.
poly_closed <- poly_data %>%
  group_by(theme_slug) %>%
  group_modify(~ bind_rows(.x, .x[1, ])) %>%
  ungroup()

theme_labels <- data %>% distinct(theme_slug, game, mode, year) %>%
  mutate(label = paste0(game, " (", mode, ")")) %>%
  arrange(year, mode)
poly_closed$theme_slug <- factor(poly_closed$theme_slug, levels = theme_labels$theme_slug)
poly_data$theme_slug <- factor(poly_data$theme_slug, levels = theme_labels$theme_slug)

p_small_multiples <- ggplot() +
  geom_path(data = poly_closed, aes(a, b, group = theme_slug), color = "grey40", linewidth = 0.5) +
  geom_point(data = poly_data, aes(a, b, fill = hex), shape = 21, color = "black", size = 3, stroke = 0.35) +
  scale_fill_identity() +
  facet_wrap(~theme_slug, ncol = 4, labeller = as_labeller(setNames(theme_labels$label, theme_labels$theme_slug))) +
  coord_fixed() +
  labs(
    title = "Each theme's syntax-role colors in the CIE a*-b* (chroma/hue) plane",
    subtitle = "Points connected keyword -> storage -> string -> regex -> function -> type -> interface -> number -> decorator -> namespace -> (closes back to keyword). Point fill = the color itself.",
    x = "a* (green-red axis)", y = "b* (blue-yellow axis)"
  ) +
  theme_minimal(base_size = 11) +
  theme(strip.text = element_text(size = 9.5, face = "bold"), axis.text = element_text(size = 7))

# 4 columns x 9 rows = 36 themes cleanly filling the grid.
ggsave("analysis/plots/theme_colorspace_grid.png", p_small_multiples, width = 16, height = 32, dpi = 150, limitsize = FALSE)
file.copy("analysis/plots/theme_colorspace_grid.png", "assets/color-science/theme-colorspace-grid.png", overwrite = TRUE)
cat("Saved analysis/plots/theme_colorspace_grid.png\n")

# One big overlay "family fingerprint" -- all 34 polygons on one set of axes, colored by era.
poly_closed_era <- poly_closed %>%
  mutate(era = factor(ERA_LABEL[as.character(game)], levels = names(ERA_COLORS)))

# Faceted by era rather than one giant overlay -- 34 polygons on one set of
# axes was an unreadable tangle; ~3-7 per panel actually shows the pattern
# (e.g. Link's Awakening Dark's polygon collapsed near the origin next to
# its much larger Handheld-era siblings).
p_fingerprint <- ggplot(poly_closed_era, aes(a, b, group = theme_slug, color = era)) +
  geom_path(alpha = 0.75, linewidth = 0.7) +
  scale_color_manual(values = ERA_COLORS, guide = "none") +
  coord_fixed() +
  facet_wrap(~era, nrow = 2) +
  labs(
    title = "The whole family's color-space \"fingerprint\", by era",
    subtitle = "Every theme's 10-role polygon, faceted by era -- shape/size shows how much of the chroma/hue plane each theme explores",
    x = "a* (green-red axis)", y = "b* (blue-yellow axis)"
  ) +
  theme_minimal(base_size = 11) +
  theme(strip.text = element_text(face = "bold"))

ggsave("assets/color-science/family-fingerprint.png", p_fingerprint, width = 12, height = 8, dpi = 150)
cat("Saved assets/color-science/family-fingerprint.png\n")

# ---------- 3. CVD distinguishability audit ----------

audit_data <- data %>% filter(role %in% AUDIT_ROLES)

audit_results <- list()
for (slug in unique(audit_data$theme_slug)) {
  sub <- audit_data %>% filter(theme_slug == slug)
  n <- nrow(sub)
  if (n < 2) next
  lab_normal <- sub[, c("L", "a", "b")]
  sim_hexes <- list(
    protan = simulate_cvd(sub$hex, "protan"),
    deutan = simulate_cvd(sub$hex, "deutan"),
    tritan = simulate_cvd(sub$hex, "tritan")
  )
  lab_sim <- lapply(sim_hexes, srgb_to_lab)

  pairs <- combn(n, 2)
  for (i in seq_len(ncol(pairs))) {
    i1 <- pairs[1, i]; i2 <- pairs[2, i]
    d_normal <- delta_e76(lab_normal[i1, ], lab_normal[i2, ])
    d_protan <- delta_e76(lab_sim$protan[i1, c("L", "a", "b")], lab_sim$protan[i2, c("L", "a", "b")])
    d_deutan <- delta_e76(lab_sim$deutan[i1, c("L", "a", "b")], lab_sim$deutan[i2, c("L", "a", "b")])
    d_tritan <- delta_e76(lab_sim$tritan[i1, c("L", "a", "b")], lab_sim$tritan[i2, c("L", "a", "b")])
    audit_results[[length(audit_results) + 1]] <- data.frame(
      theme_slug = slug, role1 = sub$role[i1], role2 = sub$role[i2],
      d_normal = d_normal, d_protan = d_protan, d_deutan = d_deutan, d_tritan = d_tritan
    )
  }
}
audit_df <- bind_rows(audit_results)

# Flag: normal-vision distance was safely distinguishable (>=15) but drops
# below 10 under some CVD simulation -- a real, meaningful loss.
audit_df <- audit_df %>%
  mutate(
    min_cvd = pmin(d_protan, d_deutan, d_tritan),
    worst_type = c("protan", "deutan", "tritan")[apply(cbind(d_protan, d_deutan, d_tritan), 1, which.min)],
    flagged = d_normal >= 15 & min_cvd < 10
  )

write.csv(audit_df, "analysis/data/audit-results.csv", row.names = FALSE)

flagged <- audit_df %>% filter(flagged) %>% arrange(theme_slug, min_cvd)
cat(sprintf("\nCVD audit: %d role-pairs checked across %d themes. %d flagged (normal-vision distinguishable, >=15 dE76, but drop below 10 dE76 under some CVD simulation):\n",
            nrow(audit_df), length(unique(audit_df$theme_slug)), nrow(flagged)))
if (nrow(flagged) > 0) {
  print(flagged %>% select(theme_slug, role1, role2, d_normal, worst_type, min_cvd))
} else {
  cat("(none)\n")
}

# Also report the single worst pair per theme regardless of flag status, for context.
worst_per_theme <- audit_df %>% group_by(theme_slug) %>% slice_min(min_cvd, n = 1) %>% ungroup() %>% arrange(min_cvd)
write.csv(worst_per_theme, "analysis/data/worst-pair-per-theme.csv", row.names = FALSE)
cat("\nSaved analysis/data/audit-results.csv and worst-pair-per-theme.csv\n")

# The full 13-role audit above is comprehensive but noisy -- most flagged
# pairs (e.g. accentDecorator vs accentNamespace) rarely sit directly next
# to each other in real code, so a flag there isn't very actionable. Narrow
# to the "big" roles that dominate everyday reading of syntax-highlighted
# code and actually do sit adjacent constantly, as the set worth acting on.
CRITICAL_ROLES <- c("accentKeyword", "accentStorage", "accentString", "accentFunction", "accentType", "accentNumber", "colorError")
critical_flagged <- audit_df %>%
  filter(role1 %in% CRITICAL_ROLES, role2 %in% CRITICAL_ROLES, flagged) %>%
  arrange(theme_slug, min_cvd)

write.csv(critical_flagged, "analysis/data/critical-flagged.csv", row.names = FALSE)
cat(sprintf("\nOf those, %d involve only the 'critical' roles (keyword/storage/string/function/type/number/error -- the ones that actually sit adjacent in real code):\n", nrow(critical_flagged)))

# Even within "critical", most of these are borderline (min_cvd 5-10 -- a
# real but modest loss). Prioritize the severe tier (min_cvd < 5 -- near-
# total collapse, e.g. two colors that were 50+ dE76 apart under normal
# vision landing under 2 dE76 apart under a CVD simulation) as the list
# actually worth hand-editing palettes for; document the rest.
severe <- critical_flagged %>% filter(min_cvd < 5) %>% arrange(theme_slug, min_cvd)
write.csv(severe, "analysis/data/severe-flagged.csv", row.names = FALSE)
cat(sprintf("\n%d are SEVERE (min_cvd < 5 -- near-total collapse under some CVD type) and worth fixing directly:\n", nrow(severe)))
print(severe %>% select(theme_slug, role1, role2, d_normal, worst_type, min_cvd))

# ---------- 4. CVD swatch-grid for representative themes ----------

showcase_slugs <- unique(c("ocarina-light", "ocarina-dark", "windwaker-light", "majora-dark", unique(flagged$theme_slug)))
showcase_slugs <- intersect(showcase_slugs, unique(audit_data$theme_slug))

swatch_rows <- list()
for (slug in showcase_slugs) {
  sub <- audit_data %>% filter(theme_slug == slug, role %in% POLYGON_ROLES) %>% arrange(match(role, POLYGON_ROLES))
  for (cond in c("normal", "protan", "deutan", "tritan")) {
    hexes <- if (cond == "normal") sub$hex else simulate_cvd(sub$hex, cond)
    swatch_rows[[length(swatch_rows) + 1]] <- data.frame(
      theme_slug = slug, condition = cond, x = seq_along(hexes), hex = hexes
    )
  }
}
swatch_df <- bind_rows(swatch_rows) %>%
  mutate(
    condition = factor(condition, levels = c("normal", "protan", "deutan", "tritan"),
                        labels = c("Normal vision", "Protanopia", "Deuteranopia", "Tritanopia")),
    theme_slug = factor(theme_slug, levels = showcase_slugs)
  )

p_cvd_grid <- ggplot(swatch_df, aes(x, 1, fill = hex)) +
  geom_tile(color = "white", linewidth = 0.5) +
  scale_fill_identity() +
  facet_grid(theme_slug ~ condition) +
  labs(title = "Color-vision-deficiency simulation of representative themes' syntax colors") +
  theme_void(base_size = 11) +
  theme(strip.text.y = element_text(angle = 0, hjust = 0), panel.spacing = unit(0.5, "lines"))

ggsave("assets/color-science/cvd-swatch-grid.png", p_cvd_grid, width = 10, height = 1.4 * length(showcase_slugs) + 1, dpi = 150)
cat("Saved assets/color-science/cvd-swatch-grid.png\n")

# Copy the PCA plot into the shipped assets folder too (referenced by README).
file.copy("analysis/plots/pca_global.png", "assets/color-science/pca-global.png", overwrite = TRUE)

cat("\nDone.\n")
