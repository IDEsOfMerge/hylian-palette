# Pure base-R color science primitives (CIE Lab, OKLCH, CIEDE2000, WCAG, CVD).
#
# Written from scratch rather than relying on `colorspace`/`farver` so these
# scripts run reliably with zero C++ color-package binary issues. Implements
# the exact published formulas:
#   - IEC 61966-2-1 sRGB <-> Linear RGB
#   - Björn Ottosson (2020) OKLab & OKLCH
#   - CIE 1976 L*a*b* (D65) + CIE76 + Sharma/Wu/Dalal (2005) CIEDE2000
#   - Machado, Oliveira & Fernandes (2009) full-severity dichromacy matrices

srgb_to_linear <- function(hex) {
  rgb <- t(col2rgb(hex)) / 255
  ifelse(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055)^2.4)
}

srgb_to_lab <- function(hex) {
  lin <- srgb_to_linear(hex)
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

# Björn Ottosson (2020) OKLab / OKLCH from sRGB hex
srgb_to_oklch <- function(hex) {
  lin <- srgb_to_linear(hex)
  M1 <- matrix(
    c(0.4122214708, 0.5363325363, 0.0514459929,
      0.2119034982, 0.6806995451, 0.1073969566,
      0.0883024619, 0.2817188376, 0.6299787005),
    nrow = 3, byrow = TRUE
  )
  M2 <- matrix(
    c(0.2104542553,  0.7936177850, -0.0040720468,
      1.9779984951, -2.4285922050,  0.4505937099,
      0.0259040371,  0.7827717662, -0.8086757660),
    nrow = 3, byrow = TRUE
  )
  lms <- (lin %*% t(M1))^(1 / 3)
  oklab <- lms %*% t(M2)
  C <- sqrt(oklab[, 2]^2 + oklab[, 3]^2)
  h <- (atan2(oklab[, 3], oklab[, 2]) * 180 / pi) %% 360
  h[C < 1e-5] <- 0
  data.frame(hex = toupper(hex), L = oklab[, 1], C = C, h = h)
}

delta_e76 <- function(lab1, lab2) {
  sqrt((lab1$L - lab2$L)^2 + (lab1$a - lab2$a)^2 + (lab1$b - lab2$b)^2)
}

# Exact Sharma, Wu & Dalal (2005) CIEDE2000 color difference
delta_e00 <- function(lab1, lab2) {
  L1 <- lab1$L; a1 <- lab1$a; b1 <- lab1$b
  L2 <- lab2$L; a2 <- lab2$a; b2 <- lab2$b
  C1 <- sqrt(a1^2 + b1^2); C2 <- sqrt(a2^2 + b2^2)
  Cbar <- 0.5 * (C1 + C2)
  G <- 0.5 * (1 - sqrt(Cbar^7 / (Cbar^7 + 25^7)))
  a1p <- (1 + G) * a1; a2p <- (1 + G) * a2
  C1p <- sqrt(a1p^2 + b1^2); C2p <- sqrt(a2p^2 + b2^2)
  h1p <- ifelse(a1p == 0 & b1 == 0, 0, (atan2(b1, a1p) * 180 / pi) %% 360)
  h2p <- ifelse(a2p == 0 & b2 == 0, 0, (atan2(b2, a2p) * 180 / pi) %% 360)

  dLp <- L2 - L1
  dCp <- C2p - C1p
  dhp <- ifelse(C1p * C2p == 0, 0,
    ifelse(abs(h2p - h1p) <= 180, h2p - h1p,
      ifelse(h2p - h1p > 180, h2p - h1p - 360, h2p - h1p + 360)))
  dHp <- 2 * sqrt(C1p * C2p) * sin(0.5 * dhp * pi / 180)

  Lbarp <- 0.5 * (L1 + L2)
  Cbarp <- 0.5 * (C1p + C2p)
  hbarp <- ifelse(C1p * C2p == 0, h1p + h2p,
    ifelse(abs(h1p - h2p) <= 180, 0.5 * (h1p + h2p),
      ifelse(h1p + h2p < 360, 0.5 * (h1p + h2p + 360), 0.5 * (h1p + h2p - 360))))

  deg <- pi / 180
  T_fac <- 1 - 0.17 * cos((hbarp - 30) * deg) + 0.24 * cos(2 * hbarp * deg) +
           0.32 * cos((3 * hbarp + 6) * deg) - 0.20 * cos((4 * hbarp - 63) * deg)
  dTheta <- 30 * exp(-((hbarp - 275) / 25)^2)
  RC <- 2 * sqrt(Cbarp^7 / (Cbarp^7 + 25^7))
  SL <- 1 + (0.015 * (Lbarp - 50)^2) / sqrt(20 + (Lbarp - 50)^2)
  SC <- 1 + 0.045 * Cbarp
  SH <- 1 + 0.015 * Cbarp * T_fac
  RT <- -sin(2 * dTheta * deg) * RC

  sqrt((dLp / SL)^2 + (dCp / SC)^2 + (dHp / SH)^2 + RT * (dCp / SC) * (dHp / SH))
}

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
  lin <- srgb_to_linear(hex)
  sim_lin <- lin %*% t(.cvd_matrices[[type]])
  sim_lin <- pmin(pmax(sim_lin, 0), 1)
  sim_srgb <- ifelse(sim_lin <= 0.0031308, sim_lin * 12.92, 1.055 * sim_lin^(1 / 2.4) - 0.055)
  sim_srgb <- pmin(pmax(sim_srgb, 0), 1)
  rgb(sim_srgb[, 1], sim_srgb[, 2], sim_srgb[, 3])
}

if (sys.nframe() == 0) {
  cat("Lab & OKLCH of pure reference colors:\n")
  print(srgb_to_lab(c("#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF")))
  print(srgb_to_oklch(c("#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF")))
}
