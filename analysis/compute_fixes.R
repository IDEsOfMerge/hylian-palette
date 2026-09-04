# Computes lightness-nudge fixes for the severe CVD-flagged pairs found by
# color_science.R. Standard colorblind-safe-design mitigation: CVD removes
# hue information but preserves luminance reasonably well across all three
# deficiency types, so increasing L* separation between two colors that are
# only distinguishable by hue restores distinguishability without needing
# to change which hue family a color belongs to (preserving each palette's
# established story/rationale).
#
# Strategy: for each theme with severe conflicts, identify ONE token to
# adjust (accentStorage if involved -- it's the dominant culprit and
# usually a secondary/derived token rather than a theme's primary
# "signature" color; else accentType for the keyword-vs-type tritanopia
# cases, since keyword is the more central identity color). Push that
# token's L* at least 25 units from every conflicting partner's L*, in
# whichever direction requires less displacement, clamped to [8, 92] to
# avoid pure black/white. a*/b* (hue/chroma) are left untouched, so the
# color's story/identity is preserved -- only its brightness shifts.
#
# Run from the repo root with: Rscript --vanilla analysis/compute_fixes.R

source("analysis/color_math.R")
library(dplyr)

severe <- read.csv("analysis/data/severe-flagged.csv", stringsAsFactors = FALSE)
colors <- read.csv("analysis/data/colors.csv", stringsAsFactors = FALSE)

lab_to_hex <- function(L, a, b) {
  delta <- 6 / 29
  fy <- (L + 16) / 116
  fx <- fy + a / 500
  fz <- fy - b / 200
  finv <- function(f) ifelse(f > delta, f^3, 3 * delta^2 * (f - 4 / 29))
  Xn <- 0.95047; Yn <- 1.00000; Zn <- 1.08883
  X <- Xn * finv(fx); Y <- Yn * finv(fy); Z <- Zn * finv(fz)
  M_inv <- matrix(c(
    3.2404542, -1.5371385, -0.4985314,
    -0.9692660,  1.8760108,  0.0415560,
    0.0556434, -0.2040259,  1.0572252
  ), nrow = 3, byrow = TRUE)
  lin <- c(X, Y, Z) %*% t(M_inv)
  lin <- pmin(pmax(lin, 0), 1)
  srgb <- ifelse(lin <= 0.0031308, lin * 12.92, 1.055 * lin^(1 / 2.4) - 0.055)
  srgb <- pmin(pmax(srgb, 0), 1)
  rgb(srgb[1], srgb[2], srgb[3])
}

# Pick which token to fix per theme.
fix_targets <- severe %>%
  mutate(target = case_when(
    role1 == "accentStorage" | role2 == "accentStorage" ~ "accentStorage",
    (role1 == "accentKeyword" & role2 == "accentType") | (role1 == "accentType" & role2 == "accentKeyword") ~ "accentType",
    TRUE ~ NA_character_
  )) %>%
  filter(!is.na(target)) %>%
  rowwise() %>%
  mutate(partner = if (role1 == target) role2 else role1) %>%
  ungroup()

cat(sprintf("Fix targets computed for %d (theme, target-role) combinations from %d severe pairs.\n",
            nrow(distinct(fix_targets, theme_slug, target)), nrow(fix_targets)))

results <- list()
for (grp in split(fix_targets, list(fix_targets$theme_slug, fix_targets$target), drop = TRUE)) {
  slug <- grp$theme_slug[1]
  target <- grp$target[1]
  target_hex <- colors %>% filter(theme_slug == slug, role == target) %>% pull(hex)
  partner_hexes <- unique(c(
    colors %>% filter(theme_slug == slug, role %in% grp$partner) %>% pull(hex)
  ))

  target_lab <- srgb_to_lab(target_hex)
  partner_labs <- srgb_to_lab(partner_hexes)

  L0 <- target_lab$L
  # Clamp to a "vivid accent" band (25-78) rather than letting colors crush
  # toward near-black/near-white -- an early attempt allowing the full
  # [8,92] range technically hit the CVD threshold but made every fixed
  # color look like muddy dark brown, which is a worse practical outcome
  # than the CVD issue it solved. Cap the shift too (max 22 L* units) so a
  # color's brightness doesn't change so much it stops looking like itself.
  # This won't always reach the full 25-unit separation target -- a
  # smaller, visually-reasonable improvement is the better trade.
  candidates <- seq(25, 78, by = 1)
  candidates <- candidates[abs(candidates - L0) <= 22]
  if (length(candidates) == 0) candidates <- c(max(25, min(78, L0)))
  seps <- sapply(candidates, function(L) min(abs(L - partner_labs$L)))
  best_idx <- which.max(seps)
  best <- list(L = candidates[best_idx], shift = abs(candidates[best_idx] - L0), achieved_sep = seps[best_idx])

  new_hex <- lab_to_hex(best$L, target_lab$a, target_lab$b)
  results[[length(results) + 1]] <- data.frame(
    theme_slug = slug, target = target, old_hex = target_hex, new_hex = new_hex,
    old_L = round(L0, 1), new_L = round(best$L, 1), achieved_L_sep = round(best$achieved_sep, 1),
    partners = paste(grp$partner, collapse = ",")
  )
}
fix_df <- bind_rows(results) %>% arrange(theme_slug, target)
write.csv(fix_df, "analysis/data/computed-fixes.csv", row.names = FALSE)
print(fix_df)
cat(sprintf("\n%d fixes computed, saved to analysis/data/computed-fixes.csv\n", nrow(fix_df)))
