# Hylian Palette -- extension icon generator
#
# Renders icon.png: a rounded gem/rhombus split diagonally into warm
# parchment-gold (Light family) and cosmic-violet (Dark family), echoing the
# Hyrule/Lorule light-vs-dark-mirror-world duality (as in A Link Between
# Worlds) purely through color language. Deliberately NOT a Triforce or any
# other game-specific silhouette -- see analysis/README.md for the
# reasoning. A plain gem shape is generic across design contexts broadly,
# not specific to this franchise.
#
# Run from the repo root with: Rscript analysis/generate-icon.R

library(grid)

out_path <- "icon.png"
size <- 256
gold <- "#C9A227"      # Triforce/parchment gold -- the Light family
violet <- "#5B0A93"    # Woodfall/cosmic violet -- the Dark family
outline <- "#1A1424"   # Near-black violet, reads on any host theme
seam <- "#F7D774"      # Warm pale-gold seam accent

ragg::agg_png(out_path, width = size, height = size, background = "transparent", res = 96)

grid.newpage()
pushViewport(viewport(width = 1, height = 1))

# Diamond vertices, npc units, ~5.5% margin
top    <- c(0.500, 0.945)
right  <- c(0.945, 0.500)
bottom <- c(0.500, 0.055)
left   <- c(0.055, 0.500)
center <- c(0.500, 0.500)

# Left half (gold) and right half (violet), split along the vertical diagonal
grid.polygon(
  x = c(top[1], left[1], bottom[1], center[1]),
  y = c(top[2], left[2], bottom[2], center[2]),
  gp = gpar(fill = gold, col = NA)
)
grid.polygon(
  x = c(top[1], right[1], bottom[1], center[1]),
  y = c(top[2], right[2], bottom[2], center[2]),
  gp = gpar(fill = violet, col = NA)
)

# Outline
grid.polygon(
  x = c(top[1], right[1], bottom[1], left[1]),
  y = c(top[2], right[2], bottom[2], left[2]),
  gp = gpar(fill = NA, col = outline, lwd = 5, linejoin = "round")
)

# Seam accent down the center
grid.lines(
  x = c(top[1], bottom[1]), y = c(top[2], bottom[2]),
  gp = gpar(col = seam, lwd = 3)
)

dev.off()
cat("Wrote", out_path, "\n")
