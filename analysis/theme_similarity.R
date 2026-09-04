# Hylian Palette -- per-theme similarity
#
# The PCA in color_science.R has one point per (theme, role) -- it answers
# "where do keyword colors sit vs. string colors, across the whole family."
# This script answers a different question: "which THEMES look like each
# other overall." Each of the 34 themes becomes a single point, built by
# taking its ~13 syntax-role colors (the ones that actually sit next to
# each other in real code), converting each to CIE Lab, and concatenating
# them in a fixed role order into one 39-dimensional feature vector per
# theme -- keyword-L, keyword-a, keyword-b, storage-L, storage-a, ...and so
# on. That's the "continuous, vectorizable" representation: two themes are
# "close" exactly when their syntax colors, role for role, are close in
# perceptual color space.
#
# Run from the repo root with: Rscript --vanilla analysis/theme_similarity.R

source("analysis/color_math.R")
library(dplyr)
library(tidyr)
library(ggplot2)
library(ggrepel)
library(dendextend)

dir.create("assets/color-science", showWarnings = FALSE, recursive = TRUE)

ERA_LABEL <- c(
  "The Legend of Zelda" = "8-bit & 16-bit", "Zelda II: The Adventure of Link" = "8-bit & 16-bit", "A Link to the Past" = "8-bit & 16-bit",
  "Link's Awakening" = "Handheld", "Oracle of Seasons" = "Handheld", "Oracle of Ages" = "Handheld", "The Minish Cap" = "Handheld",
  "Ocarina of Time" = "N64 & GameCube", "Majora's Mask" = "N64 & GameCube", "The Wind Waker" = "N64 & GameCube", "Twilight Princess" = "N64 & GameCube",
  "Phantom Hourglass" = "Nintendo DS", "Spirit Tracks" = "Nintendo DS",
  "Skyward Sword" = "Modern", "A Link Between Worlds" = "Modern", "Breath of the Wild" = "Modern", "Tears of the Kingdom" = "Modern"
)
ERA_COLORS <- c(
  "8-bit & 16-bit" = "#8A5A24", "Handheld" = "#2E8B4A", "N64 & GameCube" = "#023E8A",
  "Nintendo DS" = "#1B6CA8", "Modern" = "#7A3EA8"
)

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

meta <- wide %>% select(theme_slug, game, mode, year) %>%
  mutate(era = factor(ERA_LABEL[game], levels = names(ERA_COLORS)), label = paste(game, mode))

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

cat("\nDone.\n")
