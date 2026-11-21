# Hylian Palette -- per-theme similarity
#
# The PCA in color_science.R has one point per (theme, role) -- it answers
# "where do keyword colors sit vs. string colors, across the whole family."
# This script answers a different question: "which THEMES look like each
# other overall." Each of the 36 themes becomes a single point, built from
# its 13 syntax-role colors (the ones that sit next to each other in real
# code) in CIE Lab space, producing:
#   - 39-dimensional scaled per-theme PCA (theme-pca.csv, theme-pca.png)
#   - Ward.D2 hierarchical clustering dendrogram (theme-dendrogram.png)
#   - Per-mode CIEDE2000 Classical MDS (theme-mds.csv, theme-mds.png)
#   - Ward-ordered 18x18 split-triangle distance matrix (theme-distance-heatmap.png)
#
# Run from the repo root with: Rscript --vanilla analysis/theme_similarity.R

source("analysis/color_math.R")
library(dplyr)
library(tidyr)
library(ggplot2)
library(ggrepel)
library(dendextend)

dir.create("analysis/data", showWarnings = FALSE, recursive = TRUE)
dir.create("assets/color-science", showWarnings = FALSE, recursive = TRUE)

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

GAME_ORDER <- c(
  "The Legend of Zelda", "Zelda II: The Adventure of Link", "A Link to the Past",
  "Link's Awakening", "Ocarina of Time", "Majora's Mask",
  "Oracle of Seasons", "Oracle of Ages", "The Wind Waker", "The Minish Cap",
  "Twilight Princess", "Phantom Hourglass", "Spirit Tracks", "Skyward Sword",
  "A Link Between Worlds", "Breath of the Wild", "Tears of the Kingdom",
  "Echoes of Wisdom"
)

TIMELINE_LABEL <- c(
  "Skyward Sword" = "Unified", "The Minish Cap" = "Unified", "Ocarina of Time" = "Unified",
  "Majora's Mask" = "Child", "Twilight Princess" = "Child",
  "The Wind Waker" = "Adult", "Phantom Hourglass" = "Adult", "Spirit Tracks" = "Adult",
  "A Link to the Past" = "Downfall", "Link's Awakening" = "Downfall",
  "Oracle of Seasons" = "Downfall", "Oracle of Ages" = "Downfall",
  "A Link Between Worlds" = "Downfall", "Echoes of Wisdom" = "Downfall",
  "The Legend of Zelda" = "Downfall", "Zelda II: The Adventure of Link" = "Downfall",
  "Breath of the Wild" = "Era of the Wilds", "Tears of the Kingdom" = "Era of the Wilds"
)

MONOCHROME_OUTLIER_SLUG <- "linksawakening-dark"
MONOCHROME_OUTLIER_GAME <- "Link's Awakening"

ROLE_ORDER <- c(
  "accentKeyword", "accentStorage", "accentString", "accentRegex",
  "accentFunction", "accentFunctionDim", "accentType", "accentInterface",
  "accentNumber", "accentDecorator", "accentNamespace", "colorError", "colorWarning"
)

raw <- read.csv("analysis/data/colors.csv", stringsAsFactors = FALSE) %>%
  filter(role %in% ROLE_ORDER)
lab <- srgb_to_lab(raw$hex)
data <- bind_cols(raw, lab[, c("L", "a", "b")])

# One 39-dim feature vector per theme: role order fixed by ROLE_ORDER so
# column N always means the same (role, channel) for every theme.
wide <- data %>%
  select(theme_slug, game, mode, year, role, L, a, b) %>%
  pivot_wider(names_from = role, values_from = c(L, a, b), names_glue = "{role}_{.value}")

feature_cols <- as.vector(t(outer(ROLE_ORDER, c("L", "a", "b"), paste, sep = "_")))
stopifnot(all(feature_cols %in% names(wide)))
feature_matrix <- as.matrix(wide[, feature_cols])
rownames(feature_matrix) <- wide$theme_slug

cat(sprintf("Built a %d theme x %d feature matrix (13 syntax roles x L/a/b).\n", nrow(feature_matrix), ncol(feature_matrix)))

meta <- wide %>%
  select(theme_slug, game, mode, year) %>%
  mutate(
    era = factor(unname(ERA_LABEL[game]), levels = names(ERA_COLORS)),
    timeline = unname(TIMELINE_LABEL[game]),
    label = paste(game, mode)
  )
stopifnot(!anyNA(meta$era), !anyNA(meta$timeline), nrow(meta) == 36L)

# ---------- Per-theme PCA ----------
# Scaled (unlike the per-color PCA in color_science.R) because here each of
# the 39 columns is a DIFFERENT semantic channel (keyword-L vs string-a vs
# number-b, ...) -- scaling keeps any one role/channel from dominating just
# because it happens to have a larger raw range in this palette family.
pca <- prcomp(feature_matrix, center = TRUE, scale. = TRUE)
var_explained <- round(100 * pca$sdev^2 / sum(pca$sdev^2), 1)

pca_df <- bind_cols(meta, as.data.frame(pca$x[, 1:4]))
write.csv(pca_df %>% select(theme_slug, game, mode, era, PC1, PC2, PC3, PC4), "analysis/data/theme-pca.csv", row.names = FALSE)

p_pca <- ggplot(pca_df, aes(PC1, PC2, color = era, shape = mode, label = label)) +
  geom_hline(yintercept = 0, color = "grey85") +
  geom_vline(xintercept = 0, color = "grey85") +
  geom_point(size = 3.2) +
  scale_color_manual(values = ERA_COLORS) +
  scale_shape_manual(values = c(light = 16, dark = 17)) +
  ggrepel::geom_text_repel(size = 2.9, max.overlaps = 30, seed = 1, segment.size = 0.3, segment.color = "grey70") +
  labs(
    title = "Which themes look like each other? A per-theme PCA",
    subtitle = sprintf("Each point is one theme's full syntax palette (13 roles x Lab, scaled) -- PC1 %.1f%%, PC2 %.1f%% of variance. Distance on this plot = overall color-palette similarity.", var_explained[1], var_explained[2]),
    x = sprintf("PC1 (%.1f%%)", var_explained[1]), y = sprintf("PC2 (%.1f%%)", var_explained[2]),
    color = "Era", shape = "Mode"
  ) +
  theme_minimal(base_size = 12) +
  theme(legend.position = "right", plot.subtitle = element_text(size = 9, color = "grey30"))

ggsave("assets/color-science/theme-pca.png", p_pca, width = 12, height = 9, dpi = 150)
cat("Saved assets/color-science/theme-pca.png\n")

# ---------- Hierarchical clustering, as a complementary "nearest neighbor" view ----------
# The PCA plot only shows 2 of 39 dimensions; a dendrogram on the full
# scaled feature matrix answers "which theme is THIS theme's closest
# relative" more precisely than eyeballing a 2D scatter.
scaled <- scale(feature_matrix)
d <- dist(scaled, method = "euclidean")
hc <- hclust(d, method = "ward.D2")

labels_ordered <- meta$label[match(hc$labels, meta$theme_slug)]
eras_ordered <- as.character(meta$era[match(hc$labels, meta$theme_slug)])

dend <- as.dendrogram(hc)
labels(dend) <- labels_ordered[order.dendrogram(dend)]
dend_colors <- ERA_COLORS[eras_ordered[order.dendrogram(dend)]]
labels_colors(dend) <- dend_colors
dend <- dend %>% set("labels_cex", 0.65) %>% set("branches_lwd", 1.1)

png("assets/color-science/theme-dendrogram.png", width = 1900, height = 1000, res = 150)
par(mar = c(11, 3, 3, 1))
plot(dend, main = "Theme similarity, hierarchical clustering (Ward's method on the same 39-dim syntax-color profile)")
legend("topright", legend = names(ERA_COLORS), fill = ERA_COLORS, cex = 0.7, bty = "n")
dev.off()
cat("Saved assets/color-science/theme-dendrogram.png\n")

# ---------- Per-Mode CIEDE2000 Classical MDS & Split-Triangle Heatmap ----------

compute_de00_matrix <- function(slugs, df_lab) {
  n <- length(slugs)
  D <- matrix(0, nrow = n, ncol = n, dimnames = list(slugs, slugs))
  split_lab <- lapply(slugs, function(s) {
    sub <- df_lab[df_lab$theme_slug == s, ]
    idx <- match(ROLE_ORDER, sub$role)
    stopifnot(!anyNA(idx))
    sub[idx, c("L", "a", "b")]
  })
  if (n >= 2L) {
    for (i in seq_len(n - 1L)) {
      for (j in seq.int(i + 1L, n)) {
        d <- mean(delta_e00(split_lab[[i]], split_lab[[j]]))
        D[i, j] <- d
        D[j, i] <- d
      }
    }
  }
  D
}

mds_results <- list()
for (mode_name in c("light", "dark")) {
  mode_meta <- meta %>%
    filter(mode == mode_name) %>%
    arrange(match(game, GAME_ORDER))
  all_slugs <- mode_meta$theme_slug
  poly_slugs <- setdiff(all_slugs, MONOCHROME_OUTLIER_SLUG)

  D_all <- compute_de00_matrix(all_slugs, data)
  D_poly <- D_all[poly_slugs, poly_slugs, drop = FALSE]
  fit <- cmdscale(D_poly, k = 2, eig = TRUE)
  pos_sum <- sum(pmax(fit$eig, 0))
  v1 <- round(100 * fit$eig[1] / pos_sum, 1)
  v2 <- round(100 * fit$eig[2] / pos_sum, 1)
  pts <- fit$points
  rownames(pts) <- poly_slugs

  # Deterministic orientation: majora-* on -X (< 0), zelda2-* on +Y (> 0)
  if (pts[paste0("majora-", mode_name), 1] > 0) pts[, 1] <- -pts[, 1]
  if (pts[paste0("zelda2-", mode_name), 2] < 0) pts[, 2] <- -pts[, 2]

  n_all <- length(all_slugs)
  nearest_slug <- character(n_all)
  nearest_de00 <- numeric(n_all)
  farthest_poly_slug <- character(n_all)
  farthest_poly_de00 <- numeric(n_all)
  for (i in seq_len(n_all)) {
    s <- all_slugs[i]
    other_idx <- which(all_slugs != s)
    other_slugs <- all_slugs[other_idx]
    d_vec <- unname(D_all[i, other_idx])
    ord_near <- order(d_vec, other_slugs)
    nearest_slug[i] <- other_slugs[ord_near[1]]
    nearest_de00[i] <- d_vec[ord_near[1]]

    poly_mask <- other_slugs != MONOCHROME_OUTLIER_SLUG
    poly_other_slugs <- other_slugs[poly_mask]
    poly_d_vec <- d_vec[poly_mask]
    ord_far <- order(-poly_d_vec, poly_other_slugs)
    farthest_poly_slug[i] <- poly_other_slugs[ord_far[1]]
    farthest_poly_de00[i] <- poly_d_vec[ord_far[1]]
  }

  idx_poly <- match(all_slugs, poly_slugs)
  panel_lbl <- if (mode_name == "light") {
    sprintf("Light Themes (18 Games -- Dim 1 %.1f%% + Dim 2 %.1f%% = %.1f%%)", v1, v2, v1 + v2)
  } else {
    sprintf("Dark Themes (17 Polychromatic + 1 Monochrome -- Dim 1 %.1f%% + Dim 2 %.1f%% = %.1f%%)", v1, v2, v1 + v2)
  }

  mds_df <- mode_meta %>%
    mutate(
      mds1 = ifelse(is.na(idx_poly), NA_real_, unname(pts[idx_poly, 1])),
      mds2 = ifelse(is.na(idx_poly), NA_real_, unname(pts[idx_poly, 2])),
      nearest_slug = nearest_slug,
      nearest_de00 = nearest_de00,
      farthest_poly_slug = farthest_poly_slug,
      farthest_poly_de00 = farthest_poly_de00,
      is_outlier = theme_slug == MONOCHROME_OUTLIER_SLUG,
      panel_label = panel_lbl
    )

  seg_rows <- list()
  n_poly <- length(poly_slugs)
  if (n_poly >= 2L) {
    for (i in seq_len(n_poly - 1L)) {
      for (j in seq.int(i + 1L, n_poly)) {
        if (D_poly[i, j] <= 4.5) {
          seg_rows[[length(seg_rows) + 1L]] <- data.frame(
            x = unname(pts[i, 1]),
            y = unname(pts[i, 2]),
            xend = unname(pts[j, 1]),
            yend = unname(pts[j, 2]),
            panel_label = panel_lbl,
            stringsAsFactors = FALSE
          )
        }
      }
    }
  }
  seg_df <- if (length(seg_rows) > 0L) {
    bind_rows(seg_rows)
  } else {
    data.frame(
      x = numeric(0), y = numeric(0), xend = numeric(0), yend = numeric(0),
      panel_label = character(0), stringsAsFactors = FALSE
    )
  }

  mds_results[[mode_name]] <- list(
    df = mds_df, D_all = D_all, seg_df = seg_df,
    v1 = v1, v2 = v2, panel_label = panel_lbl
  )
}

panel_levels <- c(mds_results$light$panel_label, mds_results$dark$panel_label)

mds_all_df <- bind_rows(mds_results$light$df, mds_results$dark$df) %>%
  mutate(panel_label = factor(panel_label, levels = panel_levels)) %>%
  left_join(
    data %>% filter(role == "accentKeyword") %>% select(theme_slug, kw_hex = hex),
    by = "theme_slug"
  )

# Export exact 12-column schema matching scripts/generate-color-science-assets.py
mds_csv_df <- mds_all_df %>%
  transmute(
    theme_slug = theme_slug,
    game = game,
    era = as.character(era),
    timeline = timeline,
    mode = mode,
    mds1 = round(mds1, 4),
    mds2 = round(mds2, 4),
    nearest_slug = nearest_slug,
    nearest_de00 = round(nearest_de00, 3),
    farthest_poly_slug = farthest_poly_slug,
    farthest_poly_de00 = round(farthest_poly_de00, 3),
    is_outlier = ifelse(is_outlier, "true", "false")
  )
write.csv(mds_csv_df, "analysis/data/theme-mds.csv", row.names = FALSE, na = "")
cat("Saved analysis/data/theme-mds.csv\n")

la_dists <- mds_results$dark$D_all[
  MONOCHROME_OUTLIER_SLUG,
  setdiff(colnames(mds_results$dark$D_all), MONOCHROME_OUTLIER_SLUG)
]
la_mean <- mean(la_dists)
la_min <- min(la_dists)
la_max <- max(la_dists)

mds_seg_df <- bind_rows(mds_results$light$seg_df, mds_results$dark$seg_df) %>%
  mutate(panel_label = factor(panel_label, levels = panel_levels))

p_mds <- ggplot(mds_all_df %>% filter(!is_outlier), aes(mds1, mds2, label = game)) +
  geom_hline(yintercept = 0, color = "grey85", linetype = "dashed") +
  geom_vline(xintercept = 0, color = "grey85", linetype = "dashed") +
  geom_segment(
    data = mds_seg_df,
    aes(x = x, y = y, xend = xend, yend = yend),
    inherit.aes = FALSE,
    color = "grey78",
    linetype = "dashed",
    linewidth = 0.45
  ) +
  geom_point(aes(color = kw_hex), size = 3.4) +
  scale_color_identity() +
  ggrepel::geom_text_repel(size = 2.9, max.overlaps = 30, seed = 1, segment.color = "grey75") +
  facet_wrap(~panel_label, scales = "free") +
  labs(
    title = "Perceptual Similarity Landscape -- Classical MDS on CIEDE2000 (dE00)",
    subtitle = "Pairwise mean dE00 across 13 syntax roles, split by polarity. Dashed links connect closest siblings (dE00 <= 4.5).",
    caption = sprintf(
      "Off-chart monochrome outlier: Link's Awakening Dark (1993 DMG-01 LCD ramp) -- mean %.1f dE00 (range %.1f-%.1f) vs. all 17 polychromatic dark themes.",
      la_mean, la_min, la_max
    ),
    x = "MDS Dim 1", y = "MDS Dim 2"
  ) +
  theme_minimal(base_size = 12) +
  theme(strip.text = element_text(face = "bold"))

ggsave("assets/color-science/theme-mds.png", p_mds, width = 16, height = 8.5, dpi = 150)
cat("Saved assets/color-science/theme-mds.png\n")

# Ward-ordered 18x18 split-triangle distance matrix (upper = Light, lower = Dark)
games <- GAME_ORDER
l_map <- setNames(meta$theme_slug[meta$mode == "light"], meta$game[meta$mode == "light"])
d_map <- setNames(meta$theme_slug[meta$mode == "dark"], meta$game[meta$mode == "dark"])
comb_mat <- do.call(rbind, lapply(games, function(g) {
  c(feature_matrix[l_map[[g]], ], feature_matrix[d_map[[g]], ])
}))
rownames(comb_mat) <- games
hc_game <- hclust(dist(scale(comb_mat)), method = "ward.D2")
ord_games <- games[hc_game$order]

DL <- mds_results$light$D_all[unname(l_map[ord_games]), unname(l_map[ord_games])]
DD <- mds_results$dark$D_all[unname(d_map[ord_games]), unname(d_map[ord_games])]
ng <- length(ord_games)
hm_df <- expand.grid(row_i = seq_len(ng), col_i = seq_len(ng)) %>%
  mutate(
    row_name = ord_games[row_i],
    col_name = ord_games[col_i],
    row_game = factor(row_name, levels = rev(ord_games)),
    col_game = factor(col_name, levels = ord_games),
    tri = ifelse(row_i == col_i, "Diag", ifelse(row_i < col_i, "Light", "Dark")),
    de = ifelse(row_i == col_i, NA_real_, ifelse(row_i < col_i, DL[cbind(row_i, col_i)], DD[cbind(row_i, col_i)])),
    is_dmg = (tri == "Dark") & (row_name == MONOCHROME_OUTLIER_GAME | col_name == MONOCHROME_OUTLIER_GAME),
    de_poly = ifelse(is_dmg, NA_real_, pmin(de, 30))
  )
stopifnot(sum(hm_df$is_dmg) == 17L)

p_hm <- ggplot(hm_df, aes(col_game, row_game)) +
  geom_tile(data = hm_df[!hm_df$is_dmg, ], aes(fill = de_poly), color = "white", linewidth = 0.25) +
  geom_tile(data = hm_df[hm_df$is_dmg, ], fill = "#C6D38C", color = "white", linewidth = 0.25) +
  scale_fill_gradientn(
    colors = c("#14245E", "#1E5498", "#408EB0", "#98C4C0", "#E2E0CD", "#F8F2E4"),
    limits = c(0, 30),
    na.value = "#D8D6CE",
    name = "Mean dE00\n(capped 30)"
  ) +
  coord_equal() +
  labs(
    title = "Pairwise Perceptual Distance Matrix -- All 18 Zelda Games (CIEDE2000)",
    subtitle = "Ward-ordered split-triangle matrix: upper-right = Light mode, lower-left = Dark mode (mean dE00 across 13 syntax roles).",
    caption = sprintf(
      "Polychromatic ramp capped at 30 dE00; diagonal (grey) = self. Olive tiles (#C6D38C) = Link's Awakening Dark (1993 DMG-01 LCD, %.1f-%.1f dE00).",
      la_min, la_max
    ),
    x = NULL, y = NULL
  ) +
  theme_minimal(base_size = 10) +
  theme(axis.text.x = element_text(angle = 55, hjust = 1, vjust = 1), panel.grid = element_blank())

ggsave("assets/color-science/theme-distance-heatmap.png", p_hm, width = 12, height = 11.5, dpi = 150)
cat("Saved assets/color-science/theme-distance-heatmap.png\n")

cat("\nDone.\n")
