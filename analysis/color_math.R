# Pure base-R color science primitives.
#
# Written from scratch rather than relying on `colorspace`/`farver` after
# discovering both packages segfault reproducibly on this machine when their
# color-conversion + comparison functions are used together at any real
# scale (reproduced even after recompiling both from source against the
# exact running R build -- a genuine upstream bug on this platform, not an
# R-version mismatch). These implement the same standard, well-published
# formulas those packages use internally, so results are directly
# comparable to literature values.

# sRGB hex -> CIE Lab (D65 white point). Standard formula: sRGB -> linear
# RGB (inverse gamma) -> CIE XYZ (sRGB/D65 3x3 matrix) -> CIE Lab.
srgb_to_lab <- function(hex) {
  rgb <- t(col2rgb(hex)) / 255
  lin <- ifelse(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055)^2.4)

  M <- matrix(
    c(0.4124564, 0.3575761, 0.1804375,
      0.2126729, 0.7151522, 0.0721750,
      0.0193339, 0.1191920, 0.9503041),
    nrow = 3, byrow = TRUE
  )
  xyz <- lin %*% t(M)

  Xn <- 0.95047; Yn <- 1.00000; Zn <- 1.08883
  xr <- xyz[, 1] / Xn; yr <- xyz[, 2] / Yn; zr <- xyz[, 3] / Zn

  delta <- 6 / 29
  f <- function(t) ifelse(t > delta^3, t^(1 / 3), t / (3 * delta^2) + 4 / 29)
  fx <- f(xr); fy <- f(yr); fz <- f(zr)

  data.frame(
    hex = toupper(hex),
    L = 116 * fy - 16,
    a = 500 * (fx - fy),
    b = 200 * (fy - fz)
  )
}

# CIE76 distance (Euclidean in Lab). Simpler than CIEDE2000 but standard,
# well-understood, and doesn't depend on any package -- used here because
# the packages that provide CIEDE2000 (farver) proved unstable in this
# environment; CIE76 is still a legitimate, widely-used metric.
delta_e76 <- function(lab1, lab2) {
  sqrt((lab1$L - lab2$L)^2 + (lab1$a - lab2$a)^2 + (lab1$b - lab2$b)^2)
}

# CVD simulation, full-severity dichromacy, Machado/Oliveira/Fernandes
# (2009) linear-RGB transformation matrices -- the same model colorspace's
# protan()/deutan()/tritan() are based on. Applied in linear RGB, then
# re-encoded to sRGB gamma.
.cvd_matrices <- list(
  protan = matrix(c(
    0.152286,  1.052583, -0.204868,
    0.114503,  0.786281,  0.099216,
    -0.003882, -0.048116,  1.051998
  ), nrow = 3, byrow = TRUE),
  deutan = matrix(c(
    0.367322,  0.860646, -0.227968,
    0.280085,  0.672501,  0.047413,
    -0.011820,  0.042940,  0.968881
  ), nrow = 3, byrow = TRUE),
  tritan = matrix(c(
    1.255528, -0.076749, -0.178779,
    -0.078411,  0.930809,  0.147602,
    0.004733,  0.691367,  0.303900
  ), nrow = 3, byrow = TRUE)
)

simulate_cvd <- function(hex, type = c("protan", "deutan", "tritan")) {
  type <- match.arg(type)
  rgb <- t(col2rgb(hex)) / 255
  lin <- ifelse(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055)^2.4)
  sim_lin <- lin %*% t(.cvd_matrices[[type]])
  sim_lin <- pmin(pmax(sim_lin, 0), 1)
  sim_srgb <- ifelse(sim_lin <= 0.0031308, sim_lin * 12.92, 1.055 * sim_lin^(1 / 2.4) - 0.055)
  sim_srgb <- pmin(pmax(sim_srgb, 0), 1)
  rgb(sim_srgb[, 1], sim_srgb[, 2], sim_srgb[, 3])
}

if (sys.nframe() == 0) {
  # Sanity checks when run directly: qualitative behavior of well-known
  # reference colors under each CVD type, since there's no package to
  # validate against in this environment.
  cat("Lab of pure colors (sanity check vs. well-known reference values):\n")
  print(srgb_to_lab(c("#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF")))
  cat("\nCVD simulation of pure red/green/blue (deuteranopia should shift red/green toward a shared brownish-yellow; tritanopia should scramble blue):\n")
  for (h in c("#FF0000", "#00FF00", "#0000FF")) {
    cat(sprintf("%s -> protan=%s deutan=%s tritan=%s\n", h, simulate_cvd(h, "protan"), simulate_cvd(h, "deutan"), simulate_cvd(h, "tritan")))
  }
}
