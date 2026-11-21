'use strict';

// Pure, dependency-free perceptual color science engine for Hylian Palette.
//
// Implements standard, peer-reviewed colorimetry and psychophysics models:
//   1. IEC 61966-2-1 sRGB <-> Linear RGB transfer functions + alpha compositing
//   2. Björn Ottosson (2020) OKLab & OKLCH perceptually uniform color space
//      with chroma-preserving sRGB gamut mapping (CSS Color Level 4 method)
//   3. CIE 1976 L*a*b* (D65) + CIE76 (dE*ab) + Sharma/Wu/Dalal (2005) CIEDE2000 (dE00)
//   4. W3C WCAG 2.1 relative luminance & contrast ratio
//   5. APCA-W3 (0.0.98G-4g) polarity-aware perceptual lightness contrast (Lc)
//   6. Machado, Oliveira & Fernandes (2009) physiological dichromacy matrices
//      for protanopia, deuteranopia, and tritanopia

// ---------- 1. sRGB <-> Linear RGB ----------

function hexToRgb(hex) {
  const clean = hex.replace('#', '').trim();
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const a = clean.length === 8 ? parseInt(clean.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

function rgbToHex({ r, g, b }) {
  const clampByte = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${clampByte(r)}${clampByte(g)}${clampByte(b)}`.toUpperCase();
}

function srgbByteToLinear(c8) {
  const c = c8 / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgbUnit(u) {
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  return u <= 0.0031308 ? 12.92 * u : 1.055 * Math.pow(u, 1 / 2.4) - 0.055;
}

function hexToLinearRgb(hex) {
  const { r, g, b } = hexToRgb(hex);
  return [srgbByteToLinear(r), srgbByteToLinear(g), srgbByteToLinear(b)];
}

function compositeOver(fgHex, bgHex) {
  const fg = hexToRgb(fgHex);
  if (fg.a >= 0.999) return rgbToHex(fg);
  const bg = hexToRgb(bgHex);
  const a = fg.a;
  return rgbToHex({
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a),
  });
}

// ---------- 2. OKLab & OKLCH (Ottosson 2020) ----------

function hexToOklab(hex) {
  const [r, g, b] = hexToLinearRgb(hex);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    L: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  };
}

function oklabToLinearRgb({ L, a, b }) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

function isInSrgbGamut([r, g, b], eps = 1e-4) {
  return r >= -eps && r <= 1 + eps && g >= -eps && g <= 1 + eps && b >= -eps && b <= 1 + eps;
}

function hexToOklch(hex) {
  const { L, a, b } = hexToOklab(hex);
  const C = Math.hypot(a, b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, C, h: C < 1e-5 ? 0 : h };
}

// Converts OKLCH (L in [0,1], C >= 0, h in degrees) to sRGB hex, preserving
// perceptual lightness L and hue h via binary-search chroma reduction if out of gamut.
function oklchToHex({ L, C, h }) {
  const clampedL = Math.max(0, Math.min(1, L));
  if (clampedL <= 0.0001) return '#000000';
  if (clampedL >= 0.9999) return '#FFFFFF';

  const rad = (h * Math.PI) / 180;
  const cosH = Math.cos(rad);
  const sinH = Math.sin(rad);

  const tryChroma = (c) => oklabToLinearRgb({ L: clampedL, a: c * cosH, b: c * sinH });
  let lin = tryChroma(Math.max(0, C));
  if (!isInSrgbGamut(lin)) {
    let lo = 0;
    let hi = Math.max(0, C);
    for (let i = 0; i < 24; i++) {
      const mid = 0.5 * (lo + hi);
      const candidate = tryChroma(mid);
      if (isInSrgbGamut(candidate)) {
        lo = mid;
        lin = candidate;
      } else {
        hi = mid;
      }
    }
    lin = tryChroma(lo);
  }

  return rgbToHex({
    r: linearToSrgbUnit(lin[0]) * 255,
    g: linearToSrgbUnit(lin[1]) * 255,
    b: linearToSrgbUnit(lin[2]) * 255,
  });
}

function oklchShift(hex, { dL = 0, scaleC = 1, dC = 0, dh = 0 } = {}) {
  const { L, C, h } = hexToOklch(hex);
  return oklchToHex({
    L: Math.max(0, Math.min(1, L + dL)),
    C: Math.max(0, C * scaleC + dC),
    h: ((h + dh) % 360 + 360) % 360,
  });
}

function oklchMix(hexA, hexB, t) {
  const a = hexToOklab(hexA);
  const b = hexToOklab(hexB);
  const L = a.L + (b.L - a.L) * t;
  const oa = a.a + (b.a - a.a) * t;
  const ob = a.b + (b.b - a.b) * t;
  const C = Math.hypot(oa, ob);
  const h = ((Math.atan2(ob, oa) * 180) / Math.PI + 360) % 360;
  return oklchToHex({ L, C, h });
}

// ---------- 3. CIE 1976 L*a*b* (D65) & CIEDE2000 ----------

function hexToLab(hex) {
  const [r, g, b] = hexToLinearRgb(hex);
  const X = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  const Y = (0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / 1.00000;
  const Z = (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.08883;

  const delta = 6 / 29;
  const delta3 = delta * delta * delta;
  const f = (t) => (t > delta3 ? Math.cbrt(t) : t / (3 * delta * delta) + 4 / 29);

  const fx = f(X);
  const fy = f(Y);
  const fz = f(Z);
  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

function deltaE76(lab1, lab2) {
  return Math.hypot(lab1.L - lab2.L, lab1.a - lab2.a, lab1.b - lab2.b);
}

// Exact Sharma, Wu & Dalal (2005) CIEDE2000 color-difference formula (kL=kC=kH=1).
function ciede2000(lab1, lab2) {
  const { L: L1, a: a1, b: b1 } = lab1;
  const { L: L2, a: a2, b: b2 } = lab2;

  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cbar = 0.5 * (C1 + C2);
  const Cbar7 = Math.pow(Cbar, 7);
  const pow25_7 = 6103515625; // 25^7
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + pow25_7)));

  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);

  const radToDeg = 180 / Math.PI;
  const degToRad = Math.PI / 180;
  const hAngle = (ap, b) => {
    if (ap === 0 && b === 0) return 0;
    const ang = Math.atan2(b, ap) * radToDeg;
    return ang < 0 ? ang + 360 : ang;
  };
  const h1p = hAngle(a1p, b1);
  const h2p = hAngle(a2p, b2);

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp = 0;
  if (C1p * C2p !== 0) {
    if (Math.abs(h2p - h1p) <= 180) dhp = h2p - h1p;
    else if (h2p - h1p > 180) dhp = h2p - h1p - 360;
    else dhp = h2p - h1p + 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(0.5 * dhp * degToRad);

  const Lbarp = 0.5 * (L1 + L2);
  const Cbarp = 0.5 * (C1p + C2p);

  let hbarp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) hbarp = 0.5 * (h1p + h2p);
    else if (h1p + h2p < 360) hbarp = 0.5 * (h1p + h2p + 360);
    else hbarp = 0.5 * (h1p + h2p - 360);
  }

  const T =
    1 -
    0.17 * Math.cos((hbarp - 30) * degToRad) +
    0.24 * Math.cos(2 * hbarp * degToRad) +
    0.32 * Math.cos((3 * hbarp + 6) * degToRad) -
    0.20 * Math.cos((4 * hbarp - 63) * degToRad);

  const dTheta = 30 * Math.exp(-Math.pow((hbarp - 275) / 25, 2));
  const Cbarp7 = Math.pow(Cbarp, 7);
  const RC = 2 * Math.sqrt(Cbarp7 / (Cbarp7 + pow25_7));

  const Lm50_2 = Math.pow(Lbarp - 50, 2);
  const SL = 1 + (0.015 * Lm50_2) / Math.sqrt(20 + Lm50_2);
  const SC = 1 + 0.045 * Cbarp;
  const SH = 1 + 0.015 * Cbarp * T;
  const RT = -Math.sin(2 * dTheta * degToRad) * RC;

  const termL = dLp / SL;
  const termC = dCp / SC;
  const termH = dHp / SH;
  return Math.sqrt(termL * termL + termC * termC + termH * termH + RT * termC * termH);
}

function deltaE00Hex(hexA, hexB) {
  return ciede2000(hexToLab(hexA), hexToLab(hexB));
}

// ---------- 4. WCAG 2.1 & 5. APCA-W3 Perceptual Contrast ----------

function relLuminance(hex) {
  const [R, G, B] = hexToLinearRgb(hex);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(hexA, hexB) {
  const L1 = relLuminance(hexA);
  const L2 = relLuminance(hexB);
  const [light, dark] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (light + 0.05) / (dark + 0.05);
}

// APCA-W3 (0.0.98G-4g) perceptual lightness contrast Lc.
// Positive Lc = dark text on light background; negative Lc = light text on dark background.
function apcaContrast(fgHex, bgHex) {
  const { r: fr, g: fg, b: fb } = hexToRgb(fgHex);
  const { r: br, g: bg, b: bb } = hexToRgb(bgHex);

  const toY = (r, g, b) =>
    0.2126729 * Math.pow(r / 255, 2.4) +
    0.7151522 * Math.pow(g / 255, 2.4) +
    0.0721750 * Math.pow(b / 255, 2.4);

  let Ytxt = toY(fr, fg, fb);
  let Ybg = toY(br, bg, bb);

  if (Ytxt < 0.022) Ytxt += Math.pow(0.022 - Ytxt, 1.414);
  if (Ybg < 0.022) Ybg += Math.pow(0.022 - Ybg, 1.414);

  if (Math.abs(Ybg - Ytxt) < 0.0005) return 0;

  let SAPC;
  if (Ybg > Ytxt) {
    SAPC = (Math.pow(Ybg, 0.56) - Math.pow(Ytxt, 0.57)) * 1.14;
    return SAPC < 0.1 ? 0 : (SAPC - 0.027) * 100;
  } else {
    SAPC = (Math.pow(Ybg, 0.65) - Math.pow(Ytxt, 0.62)) * 1.14;
    return SAPC > -0.1 ? 0 : (SAPC + 0.027) * 100;
  }
}

function readableTextOn(bgHex, lightCandidate = '#FAF8F5', darkCandidate = '#141418') {
  const cDark = contrastRatio(bgHex, darkCandidate);
  const cLight = contrastRatio(bgHex, lightCandidate);
  if (cDark >= cLight && cDark >= 4.5) return darkCandidate;
  if (cLight > cDark && cLight >= 4.5) return lightCandidate;
  return contrastRatio(bgHex, '#000000') >= contrastRatio(bgHex, '#FFFFFF') ? '#000000' : '#FFFFFF';
}

// ---------- 6. Machado, Oliveira & Fernandes (2009) CVD Simulation ----------

const CVD_MATRICES = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.011820, 0.042940, 0.968881],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.303900],
  ],
};

function simulateCvd(hex, type) {
  const M = CVD_MATRICES[type];
  if (!M) throw new Error(`Unknown CVD type: ${type}`);
  const lin = hexToLinearRgb(hex);
  const sim = [
    M[0][0] * lin[0] + M[0][1] * lin[1] + M[0][2] * lin[2],
    M[1][0] * lin[0] + M[1][1] * lin[1] + M[1][2] * lin[2],
    M[2][0] * lin[0] + M[2][1] * lin[1] + M[2][2] * lin[2],
  ];
  return rgbToHex({
    r: linearToSrgbUnit(sim[0]) * 255,
    g: linearToSrgbUnit(sim[1]) * 255,
    b: linearToSrgbUnit(sim[2]) * 255,
  });
}

// ---------- 7. Comprehensive Perceptual Theme Audit ----------

const ALL_FOREGROUND_ROLES = [
  'fg', 'fgVariable', 'fgParameter', 'fgProperty', 'fgPunct', 'fgComment',
  'accentKeyword', 'accentStorage', 'accentString', 'accentRegex',
  'accentFunction', 'accentFunctionDim', 'accentType', 'accentInterface',
  'accentNumber', 'accentDecorator', 'accentNamespace',
  'colorError', 'colorWarning', 'colorInfo',
];

const CRITICAL_SYNTAX_ROLES = [
  'accentKeyword', 'accentStorage', 'accentString',
  'accentFunction', 'accentType', 'accentNumber', 'colorError',
];

const DISTINCT_ROLE_PAIRS = [
  ['accentKeyword', 'accentStorage'],
  ['accentKeyword', 'accentString'],
  ['accentKeyword', 'accentFunction'],
  ['accentKeyword', 'accentType'],
  ['accentKeyword', 'accentNumber'],
  ['accentString', 'accentFunction'],
  ['accentString', 'accentType'],
  ['accentString', 'colorError'],
  ['accentFunction', 'accentType'],
  ['accentFunction', 'accentNumber'],
  ['accentType', 'accentNumber'],
  ['accentStorage', 'accentString'],
  ['accentStorage', 'accentFunction'],
];

// Link's Awakening Dark intentionally honors the 4-shade 1993 DMG-01 LCD hardware
// green ramp, where hue variation does not exist by design.
const MONOCHROME_EXEMPT_SLUGS = new Set(['linksawakening-dark']);

function auditPalette(palette) {
  const { slug, tokens: t } = palette;
  const errors = [];
  const warnings = [];
  const isMono = MONOCHROME_EXEMPT_SLUGS.has(slug);

  // 1. Primary body & comment perceptual hierarchy
  const fgBg = contrastRatio(t.fg, t.bg);
  const fgLc = Math.abs(apcaContrast(t.fg, t.bg));
  const commentBg = contrastRatio(t.fgComment, t.bg);
  const sidebarFgBg = contrastRatio(t.fg, t.bgSidebar);
  const secondaryActivity = contrastRatio(t.fgSecondary, t.bgActivity);

  const minFgContrast = isMono ? 5.8 : 7.0;
  if (fgBg < minFgContrast) {
    errors.push(`${slug}: primary fg/bg contrast ${fgBg.toFixed(2)}:1 < ${minFgContrast}:1`);
  }
  if (fgLc < (isMono ? 55 : 70)) {
    errors.push(`${slug}: primary fg/bg APCA |Lc| ${fgLc.toFixed(1)} < ${isMono ? 55 : 70}`);
  }
  if (commentBg < 4.5) {
    errors.push(`${slug}: fgComment/bg contrast ${commentBg.toFixed(2)}:1 < 4.5:1 WCAG AA`);
  }
  if (!isMono && commentBg > fgBg - 2.0) {
    errors.push(`${slug}: fgComment (${commentBg.toFixed(2)}:1) is too close in salience to primary fg (${fgBg.toFixed(2)}:1)`);
  }
  if (sidebarFgBg < 4.5) {
    errors.push(`${slug}: sidebar fg/bgSidebar contrast ${sidebarFgBg.toFixed(2)}:1 < 4.5:1`);
  }
  if (secondaryActivity < 3.5) {
    errors.push(`${slug}: inactive tab fgSecondary/bgActivity contrast ${secondaryActivity.toFixed(2)}:1 < 3.5:1`);
  }

  // 2. Every single syntax & diagnostic foreground token MUST pass WCAG AA 4.5:1 on editor bg
  let minSyntaxCr = Infinity;
  let minSyntaxRole = '';
  for (const role of ALL_FOREGROUND_ROLES) {
    const cr = contrastRatio(t[role], t.bg);
    if (cr < minSyntaxCr) {
      minSyntaxCr = cr;
      minSyntaxRole = role;
    }
    if (cr < 4.5) {
      errors.push(`${slug}: ${role} (${t[role]}) on bg (${t.bg}) contrast ${cr.toFixed(2)}:1 < 4.5:1 WCAG AA`);
    }
    // Also ensure active-line highlight doesn't destroy legibility (>= 3.8:1)
    const crLine = contrastRatio(t[role], t.bgLine);
    if (crLine < 3.8) {
      errors.push(`${slug}: ${role} (${t[role]}) on bgLine (${t.bgLine}) contrast ${crLine.toFixed(2)}:1 < 3.8:1`);
    }
  }

  // 3. Terminal ANSI colors readability & semantic hue fidelity against terminal.background (t.bg)
  if (t.ansi) {
    const ansiHueBands = {
      red: [345, 42],
      brightRed: [345, 45],
      yellow: [48, 110],
      brightYellow: [48, 112],
      green: [115, 175],
      brightGreen: [115, 178],
      cyan: [170, 228],
      brightCyan: [168, 230],
      blue: [222, 280],
      brightBlue: [220, 282],
      magenta: [275, 355],
      brightMagenta: [275, 358],
    };
    const inBand = (h, [lo, hi]) => (lo <= hi ? h >= lo && h <= hi : h >= lo || h <= hi);
    for (const [k, hex] of Object.entries(t.ansi)) {
      if ((t.mode === 'dark' && k === 'black') || (t.mode === 'light' && k === 'brightWhite')) continue;
      const minAnsi = k === 'brightBlack' ? 3.5 : 4.2;
      const cr = contrastRatio(hex, t.bg);
      if (cr < minAnsi) {
        errors.push(`${slug}: ansi.${k} (${hex}) on bg (${t.bg}) contrast ${cr.toFixed(2)}:1 < ${minAnsi}:1`);
      }
      if (!isMono && ansiHueBands[k]) {
        const { h } = hexToOklch(hex);
        if (!inBand(h, ansiHueBands[k])) {
          errors.push(`${slug}: ansi.${k} (${hex}, h=${h.toFixed(1)}°) drifted outside canonical ${k} hue band`);
        }
      }
    }
  }

  // 4. Intra-theme semantic distinguishability (normal vision + CVD)
  const severeCvd = [];
  if (!isMono) {
    for (const [r1, r2] of DISTINCT_ROLE_PAIRS) {
      if (t[r1].toUpperCase() === t[r2].toUpperCase()) {
        errors.push(`${slug}: ${r1} and ${r2} share identical hex ${t[r1]}`);
      }
      const d00 = deltaE00Hex(t[r1], t[r2]);
      if (d00 < 8.5) {
        errors.push(`${slug}: ${r1} (${t[r1]}) and ${r2} (${t[r2]}) too close in normal vision (dE00=${d00.toFixed(1)} < 8.5)`);
      }
    }

    for (let i = 0; i < CRITICAL_SYNTAX_ROLES.length; i++) {
      for (let j = i + 1; j < CRITICAL_SYNTAX_ROLES.length; j++) {
        const r1 = CRITICAL_SYNTAX_ROLES[i];
        const r2 = CRITICAL_SYNTAX_ROLES[j];
        const lab1 = hexToLab(t[r1]);
        const lab2 = hexToLab(t[r2]);
        const d76Normal = deltaE76(lab1, lab2);
        const d00Normal = ciede2000(lab1, lab2);

        for (const cvdType of ['protan', 'deutan', 'tritan']) {
          const s1 = hexToLab(simulateCvd(t[r1], cvdType));
          const s2 = hexToLab(simulateCvd(t[r2], cvdType));
          const d76Cvd = deltaE76(s1, s2);
          const d00Cvd = ciede2000(s1, s2);
          if (d76Normal >= 15 && d76Cvd < 5.0) {
            severeCvd.push({ r1, r2, cvdType, d76Cvd, d00Cvd, d00Normal });
            errors.push(
              `${slug}: severe ${cvdType} collision between ${r1} (${t[r1]}) & ${r2} (${t[r2]}): dE76=${d76Cvd.toFixed(2)}, dE00=${d00Cvd.toFixed(2)}`
            );
          } else if (d76Normal >= 15 && d76Cvd < 10.0) {
            warnings.push(`${slug}: moderate ${cvdType} compression ${r1}/${r2} (dE76=${d76Cvd.toFixed(1)})`);
          }
        }
      }
    }
  } else {
    // Even for monochrome DMG, enforce distinct hexes for core adjacent tokens
    const dmgCheck = ['accentKeyword', 'accentStorage', 'accentString', 'accentFunction', 'accentType', 'accentNumber'];
    const seen = new Set();
    for (const r of dmgCheck) {
      const h = t[r].toUpperCase();
      if (seen.has(h)) errors.push(`${slug}: duplicate DMG core role hex ${h} on ${r}`);
      seen.add(h);
    }
  }

  return {
    slug,
    errors,
    warnings,
    metrics: {
      fgBg: +fgBg.toFixed(2),
      fgLc: +fgLc.toFixed(1),
      commentBg: +commentBg.toFixed(2),
      sidebarFgBg: +sidebarFgBg.toFixed(2),
      minSyntaxCr: +minSyntaxCr.toFixed(2),
      minSyntaxRole,
      severeCvdCount: severeCvd.length,
    },
  };
}

module.exports = {
  hexToRgb,
  rgbToHex,
  srgbByteToLinear,
  linearToSrgbUnit,
  hexToLinearRgb,
  compositeOver,
  hexToOklab,
  oklabToLinearRgb,
  hexToOklch,
  oklchToHex,
  oklchShift,
  oklchMix,
  hexToLab,
  deltaE76,
  ciede2000,
  deltaE00Hex,
  relLuminance,
  contrastRatio,
  apcaContrast,
  readableTextOn,
  simulateCvd,
  auditPalette,
  ALL_FOREGROUND_ROLES,
  CRITICAL_SYNTAX_ROLES,
  MONOCHROME_EXEMPT_SLUGS,
};
