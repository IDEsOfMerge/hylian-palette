'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const cs = require('../scripts/color-science');

const HEX6_RE = /^#[0-9A-F]{6}$/;
const PALETTES_DIR = path.join(__dirname, '..', 'palettes');

let palettesBySlug = null;
function loadAllPalettes() {
  if (!palettesBySlug) {
    palettesBySlug = new Map();
    for (const file of fs.readdirSync(PALETTES_DIR).filter((f) => f.endsWith('.js')).sort()) {
      const mod = require(path.join(PALETTES_DIR, file));
      palettesBySlug.set(mod.slug, mod);
    }
  }
  return palettesBySlug;
}

function loadPalette(slug) {
  const palette = loadAllPalettes().get(slug);
  assert.ok(palette, `Expected palette with slug "${slug}" in palettes/`);
  return palette;
}

function clonePalette(palette) {
  return JSON.parse(JSON.stringify(palette));
}

describe('color-science: hexToRgb & rgbToHex', () => {
  it('converts canonical 6-digit hex strings with exact channels', () => {
    assert.deepEqual(cs.hexToRgb('#000000'), { r: 0, g: 0, b: 0, a: 1 });
    assert.deepEqual(cs.hexToRgb('#FFFFFF'), { r: 255, g: 255, b: 255, a: 1 });
    assert.deepEqual(cs.hexToRgb('#FF0000'), { r: 255, g: 0, b: 0, a: 1 });
    assert.deepEqual(cs.hexToRgb('#00FF00'), { r: 0, g: 255, b: 0, a: 1 });
    assert.deepEqual(cs.hexToRgb('#0000FF'), { r: 0, g: 0, b: 255, a: 1 });
    assert.deepEqual(cs.hexToRgb('#123456'), { r: 0x12, g: 0x34, b: 0x56, a: 1 });
  });

  it('handles lowercase, uppercase, omitted leading #, whitespace, and 8-digit alpha', () => {
    assert.deepEqual(cs.hexToRgb('#a1b2c3'), { r: 0xa1, g: 0xb2, b: 0xc3, a: 1 });
    assert.deepEqual(cs.hexToRgb('#A1B2C3'), { r: 0xa1, g: 0xb2, b: 0xc3, a: 1 });
    assert.deepEqual(cs.hexToRgb('a1b2c3'), { r: 0xa1, g: 0xb2, b: 0xc3, a: 1 });
    assert.deepEqual(cs.hexToRgb('  #4F8A10  '), { r: 0x4f, g: 0x8a, b: 0x10, a: 1 });

    const withAlpha = cs.hexToRgb('#10203080');
    assert.equal(withAlpha.r, 0x10);
    assert.equal(withAlpha.g, 0x20);
    assert.equal(withAlpha.b, 0x30);
    assert.ok(Math.abs(withAlpha.a - 0x80 / 255) < 1e-12);
    assert.equal(cs.hexToRgb('#AABBCC00').a, 0);
    assert.equal(cs.hexToRgb('#AABBCCFF').a, 1);
  });

  it('formats uppercase #RRGGBB, rounds fractional channels, and clamps out-of-range values', () => {
    assert.equal(cs.rgbToHex({ r: 0, g: 0, b: 0 }), '#000000');
    assert.equal(cs.rgbToHex({ r: 255, g: 255, b: 255 }), '#FFFFFF');
    assert.equal(cs.rgbToHex({ r: 10, g: 171, b: 205 }), '#0AABCD');
    assert.equal(cs.rgbToHex({ r: -25, g: 127.6, b: 999 }), '#0080FF');
  });

  it('round-trips hex -> rgb -> hex losslessly across diverse inputs', () => {
    const samples = [
      '#000000',
      '#ffffff',
      'ff00aa',
      '#0f380f',
      '#5442BA',
      '#EDE9D6',
      '010203',
      '#7f8081',
    ];
    for (const raw of samples) {
      const normalized = `#${raw.replace('#', '').toUpperCase()}`;
      assert.equal(cs.rgbToHex(cs.hexToRgb(raw)), normalized);
    }

    // compositeOver: 50% alpha blend & opaque pass-through
    const halfBlend = cs.compositeOver('#FF000080', '#0000FF');
    assert.match(halfBlend, HEX6_RE);
    const blendRgb = cs.hexToRgb(halfBlend);
    assert.ok(Math.abs(blendRgb.r - 128) <= 1, `Expected r ≈ 128, got ${blendRgb.r}`);
    assert.equal(blendRgb.g, 0);
    assert.ok(Math.abs(blendRgb.b - 127) <= 1, `Expected b ≈ 127, got ${blendRgb.b}`);
    assert.equal(cs.compositeOver('#123456FF', '#FFFFFF'), '#123456');
    assert.equal(cs.compositeOver('#123456', '#FFFFFF'), '#123456');
  });
});

describe('color-science: hexToOklch & oklchToHex', () => {
  it('round-trips primaries, secondaries, neutrals, black, and white accurately', () => {
    const samples = [
      { name: 'red', hex: '#FF0000' },
      { name: 'crimson', hex: '#CC2222' },
      { name: 'green', hex: '#00FF00' },
      { name: 'forest green', hex: '#1E8A44' },
      { name: 'blue', hex: '#0000FF' },
      { name: 'cobalt blue', hex: '#2455D6' },
      { name: 'orange', hex: '#FF7A00' },
      { name: 'violet', hex: '#7A38CC' },
      { name: 'dark grey', hex: '#404040' },
      { name: 'mid grey', hex: '#808080' },
      { name: 'light grey', hex: '#C0C0C0' },
      { name: 'white', hex: '#FFFFFF' },
      { name: 'black', hex: '#000000' },
    ];

    for (const { name, hex } of samples) {
      const oklch = cs.hexToOklch(hex);
      assert.ok(oklch.L >= 0 && oklch.L <= 1, `${name}: L out of [0,1]: ${oklch.L}`);
      assert.ok(oklch.C >= 0, `${name}: negative chroma: ${oklch.C}`);
      assert.ok(oklch.h >= 0 && oklch.h < 360, `${name}: hue out of [0,360): ${oklch.h}`);

      const roundTripped = cs.oklchToHex(oklch);
      assert.match(roundTripped, HEX6_RE, `${name}: invalid hex ${roundTripped}`);

      const orig = cs.hexToRgb(hex);
      const back = cs.hexToRgb(roundTripped);
      assert.ok(Math.abs(orig.r - back.r) <= 1, `${name}: R mismatch ${orig.r} vs ${back.r}`);
      assert.ok(Math.abs(orig.g - back.g) <= 1, `${name}: G mismatch ${orig.g} vs ${back.g}`);
      assert.ok(Math.abs(orig.b - back.b) <= 1, `${name}: B mismatch ${orig.b} vs ${back.b}`);
      assert.ok(cs.deltaE00Hex(hex, roundTripped) < 0.5, `${name}: dE00 too large`);
    }
  });

  it('produces zero/near-zero chroma for achromatic neutrals and expected lightness bounds', () => {
    const black = cs.hexToOklch('#000000');
    const grey = cs.hexToOklch('#808080');
    const white = cs.hexToOklch('#FFFFFF');

    assert.ok(black.L < 1e-4 && black.C < 1e-4);
    assert.ok(grey.L > 0.5 && grey.L < 0.7 && grey.C < 1e-4);
    assert.ok(white.L > 0.999 && white.C < 1e-4);
  });

  it('gamut-maps extreme out-of-gamut OKLCH inputs to valid #RRGGBB hex strings', () => {
    const extremeInputs = [
      { L: 0.7, C: 0.5, h: 140 },
      { L: 0.5, C: 0.9, h: 25 },
      { L: 0.85, C: 0.45, h: 260 },
      { L: 0.25, C: 0.6, h: 320 },
      { L: 1.5, C: 0.3, h: 90 },
      { L: -0.2, C: 0.3, h: 90 },
      { L: 0.5, C: -0.1, h: 180 },
    ];

    for (const input of extremeInputs) {
      const hex = cs.oklchToHex(input);
      assert.match(hex, HEX6_RE, `Expected valid #RRGGBB for ${JSON.stringify(input)}, got ${hex}`);
    }

    assert.equal(cs.oklchToHex({ L: 0, C: 0.3, h: 120 }), '#000000');
    assert.equal(cs.oklchToHex({ L: 1, C: 0.3, h: 120 }), '#FFFFFF');

    // Out-of-gamut chroma clamping preserves lightness closely.
    const clamped = cs.oklchToHex({ L: 0.65, C: 0.6, h: 145 });
    const clampedLch = cs.hexToOklch(clamped);
    assert.ok(Math.abs(clampedLch.L - 0.65) < 0.03, `Expected L≈0.65, got ${clampedLch.L}`);

    // oklchShift: +dL lightens, -dL darkens, and dh wraps cleanly into [0, 360)
    const baseHex = '#3A6EA5';
    const baseLch = cs.hexToOklch(baseHex);
    const lighterHex = cs.oklchShift(baseHex, { dL: 0.15 });
    const darkerHex = cs.oklchShift(baseHex, { dL: -0.15 });
    const wrappedHex = cs.oklchShift(baseHex, { dh: -300 });
    assert.match(lighterHex, HEX6_RE);
    assert.match(darkerHex, HEX6_RE);
    assert.match(wrappedHex, HEX6_RE);
    assert.ok(cs.hexToOklch(lighterHex).L > baseLch.L + 0.1, 'Expected +dL to lighten');
    assert.ok(cs.hexToOklch(darkerHex).L < baseLch.L - 0.1, 'Expected -dL to darken');
    const wrappedLch = cs.hexToOklch(wrappedHex);
    assert.ok(wrappedLch.h >= 0 && wrappedLch.h < 360, `Expected wrapped hue in [0,360), got ${wrappedLch.h}`);
    const expectedHue = ((baseLch.h - 300) % 360 + 360) % 360;
    const hueDiff = Math.min(Math.abs(wrappedLch.h - expectedHue), 360 - Math.abs(wrappedLch.h - expectedHue));
    assert.ok(hueDiff < 2.0, `Expected hue ≈ ${expectedHue.toFixed(1)}, got ${wrappedLch.h.toFixed(1)}`);

    // oklchMix: t=0 ≈ a, t=1 ≈ b, and t=0.5 has intermediate OKLab L
    const mixA = '#1A2438';
    const mixB = '#E8D2A0';
    const mix0 = cs.oklchMix(mixA, mixB, 0);
    const mix1 = cs.oklchMix(mixA, mixB, 1);
    const mixMid = cs.oklchMix(mixA, mixB, 0.5);
    assert.ok(cs.deltaE00Hex(mix0, mixA) < 0.5, `Expected oklchMix(t=0) ≈ ${mixA}, got ${mix0}`);
    assert.ok(cs.deltaE00Hex(mix1, mixB) < 0.5, `Expected oklchMix(t=1) ≈ ${mixB}, got ${mix1}`);
    const lA = cs.hexToOklab(mixA).L;
    const lB = cs.hexToOklab(mixB).L;
    const lMid = cs.hexToOklab(mixMid).L;
    assert.ok(lMid > lA && lMid < lB, `Expected intermediate L between ${lA} and ${lB}, got ${lMid}`);
    assert.ok(Math.abs(lMid - 0.5 * (lA + lB)) < 0.02, `Expected L ≈ midpoint, got ${lMid}`);
  });
});

describe('color-science: hexToLab, deltaE76 & deltaE00Hex', () => {
  it('maps black, white, and neutral greys to expected CIE L*a*b* coordinates', () => {
    const black = cs.hexToLab('#000000');
    const white = cs.hexToLab('#FFFFFF');
    const grey = cs.hexToLab('#808080');

    assert.ok(Math.abs(black.L) < 1e-6 && Math.abs(black.a) < 1e-6 && Math.abs(black.b) < 1e-6);
    assert.ok(Math.abs(white.L - 100) < 0.05 && Math.abs(white.a) < 0.05 && Math.abs(white.b) < 0.05);
    assert.ok(grey.L > 50 && grey.L < 56 && Math.abs(grey.a) < 0.05 && Math.abs(grey.b) < 0.05);
  });

  it('satisfies identity (distance === 0 for identical colors)', () => {
    for (const hex of ['#000000', '#FFFFFF', '#5442BA', '#A1001F', '#005F22', '#808080']) {
      const lab = cs.hexToLab(hex);
      assert.equal(cs.deltaE76(lab, lab), 0);
      assert.equal(cs.deltaE00Hex(hex, hex), 0);
    }
  });

  it('satisfies symmetry d(a, b) ≈ d(b, a) across hue quadrants and blue rotation zone', () => {
    const pairs = [
      ['#CC2222', '#2266CC'],
      ['#FF8800', '#5442BA'],
      ['#005F22', '#805C00'],
      ['#1A2B88', '#4B3A99'],
      ['#EDE9D6', '#17181E'],
      ['#808080', '#9944AA'],
    ];

    for (const [a, b] of pairs) {
      const labA = cs.hexToLab(a);
      const labB = cs.hexToLab(b);
      assert.ok(Math.abs(cs.deltaE76(labA, labB) - cs.deltaE76(labB, labA)) < 1e-12);
      assert.ok(Math.abs(cs.deltaE00Hex(a, b) - cs.deltaE00Hex(b, a)) < 1e-10);
    }
  });

  it('orders perceptually similar colors closer than opposite/complementary colors', () => {
    const base = '#2050A0';
    const nearby = '#2858A8';
    const opposite = '#E0B020';

    const labBase = cs.hexToLab(base);
    const labNearby = cs.hexToLab(nearby);
    const labOpposite = cs.hexToLab(opposite);

    assert.ok(cs.deltaE76(labBase, labNearby) < cs.deltaE76(labBase, labOpposite));
    assert.ok(cs.deltaE00Hex(base, nearby) < cs.deltaE00Hex(base, opposite));

    assert.ok(cs.deltaE00Hex('#808080', '#8A8A8A') < cs.deltaE00Hex('#FF0000', '#00FF00'));
    assert.ok(cs.deltaE00Hex('#FF0000', '#E81010') < cs.deltaE00Hex('#FF0000', '#0000FF'));
  });

  it('matches known perceptible separation benchmarks and Sharma (2005) CIEDE2000 reference', () => {
    const d76BW = cs.deltaE76(cs.hexToLab('#000000'), cs.hexToLab('#FFFFFF'));
    const d00BW = cs.deltaE00Hex('#000000', '#FFFFFF');
    assert.ok(Math.abs(d76BW - 100) < 0.1, `Expected dE76(B,W) ≈ 100, got ${d76BW}`);
    assert.ok(d00BW > 95 && d00BW <= 105, `Expected dE00(B,W) ≈ 100, got ${d00BW}`);

    const subtle = cs.deltaE00Hex('#808080', '#8A8A8A');
    assert.ok(subtle > 1.0 && subtle < 6.0, `Expected subtle dE00 in (1, 6), got ${subtle}`);
    assert.ok(cs.deltaE00Hex('#A1001F', '#005F22') > 40);

    // Sharma, Wu & Dalal (2005) Table 1, Pair 1: reference dE00 = 2.0425.
    const sharmaPair1 = cs.ciede2000(
      { L: 50.0, a: 2.6772, b: -79.7751 },
      { L: 50.0, a: 0.0, b: -82.7485 }
    );
    assert.ok(Math.abs(sharmaPair1 - 2.0425) < 1e-3, `Expected ~2.0425, got ${sharmaPair1}`);
  });
});

describe('color-science: contrastRatio (WCAG 2.1)', () => {
  it('returns 21 for pure white vs black and 1 for identical colors', () => {
    assert.equal(cs.contrastRatio('#FFFFFF', '#000000'), 21);
    assert.equal(cs.contrastRatio('#000000', '#FFFFFF'), 21);
    for (const hex of ['#000000', '#FFFFFF', '#5442BA', '#808080', '#0F380F']) {
      assert.equal(cs.contrastRatio(hex, hex), 1);
    }
  });

  it('is symmetric for arbitrary color pairs', () => {
    const pairs = [
      ['#17181E', '#EDE9D6'],
      ['#5442BA', '#EDE9D6'],
      ['#C5DF56', '#0F380F'],
      ['#FF7A00', '#121626'],
    ];
    for (const [a, b] of pairs) {
      assert.equal(cs.contrastRatio(a, b), cs.contrastRatio(b, a));
    }
  });

  it('changes monotonically when lightening or darkening a surface', () => {
    const ramp = ['#000000', '#262626', '#4D4D4D', '#737373', '#999999', '#BFBFBF', '#E6E6E6', '#FFFFFF'];

    for (let i = 1; i < ramp.length; i++) {
      assert.ok(
        cs.contrastRatio(ramp[i], '#000000') > cs.contrastRatio(ramp[i - 1], '#000000'),
        `Expected ${ramp[i]} > ${ramp[i - 1]} contrast on black`
      );
    }

    for (let i = 1; i < ramp.length; i++) {
      assert.ok(
        cs.contrastRatio(ramp[i], '#FFFFFF') < cs.contrastRatio(ramp[i - 1], '#FFFFFF'),
        `Expected ${ramp[i]} < ${ramp[i - 1]} contrast on white`
      );
    }
  });
});

describe('color-science: apcaContrast', () => {
  it('returns positive Lc for dark text on light background and negative Lc for light text on dark background', () => {
    const darkOnLight = cs.apcaContrast('#17181E', '#EDE9D6');
    const lightOnDark = cs.apcaContrast('#EDE9D6', '#17181E');

    assert.ok(darkOnLight > 0, `Expected positive Lc, got ${darkOnLight}`);
    assert.ok(lightOnDark < 0, `Expected negative Lc, got ${lightOnDark}`);
  });

  it('returns 0 for identical colors', () => {
    for (const hex of ['#000000', '#444444', '#808080', '#EDE9D6', '#FFFFFF']) {
      assert.equal(cs.apcaContrast(hex, hex), 0);
    }
  });

  it('produces |Lc| > 100 for pure black and pure white pairs', () => {
    const blackOnWhite = cs.apcaContrast('#000000', '#FFFFFF');
    const whiteOnBlack = cs.apcaContrast('#FFFFFF', '#000000');

    assert.ok(blackOnWhite > 100, `Expected black-on-white Lc > 100, got ${blackOnWhite}`);
    assert.ok(whiteOnBlack < -100, `Expected white-on-black Lc < -100, got ${whiteOnBlack}`);
    assert.ok(Math.abs(whiteOnBlack) > 100);
  });
});

describe('color-science: readableTextOn', () => {
  it('chooses light text on dark surfaces and dark text on light surfaces', () => {
    for (const darkBg of ['#000000', '#121626', '#0F380F', '#2B1438']) {
      assert.equal(cs.readableTextOn(darkBg), '#FAF8F5');
    }
    for (const lightBg of ['#FFFFFF', '#EDE9D6', '#F5E8C8', '#D6E8D0']) {
      assert.equal(cs.readableTextOn(lightBg), '#141418');
    }
  });

  it('honors custom candidates and falls back to #000000/#FFFFFF when custom candidates fail 4.5:1', () => {
    assert.equal(cs.readableTextOn('#101010', '#F0F0F0', '#202020'), '#F0F0F0');
    assert.equal(cs.readableTextOn('#F0F0F0', '#EEEEEE', '#111111'), '#111111');

    assert.equal(cs.readableTextOn('#777777', '#888888', '#666666'), '#000000');
    assert.equal(cs.readableTextOn('#757575', '#888888', '#666666'), '#FFFFFF');
  });
});

describe('color-science: simulateCvd', () => {
  const cvdTypes = ['protan', 'deutan', 'tritan'];

  it('returns valid #RRGGBB hex strings for protan, deutan, and tritan, and throws on unknown types', () => {
    const samples = ['#FF0000', '#00FF00', '#0000FF', '#FF7A00', '#5442BA', '#EDE9D6', '#000000', '#FFFFFF'];
    for (const type of cvdTypes) {
      for (const hex of samples) {
        assert.match(cs.simulateCvd(hex, type), HEX6_RE);
      }
    }

    assert.throws(() => cs.simulateCvd('#FF0000', 'unknown'), /Unknown CVD type/);
  });

  it('keeps pure achromatic grays neutral across all dichromacy matrices', () => {
    const grays = ['#000000', '#404040', '#808080', '#BFBFBF', '#FFFFFF'];
    for (const type of cvdTypes) {
      for (const gray of grays) {
        const sim = cs.simulateCvd(gray, type);
        const rgb = cs.hexToRgb(sim);
        const spread = Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b);
        assert.ok(spread <= 1, `${type} shifted neutral ${gray} -> ${sim} (spread ${spread})`);
      }
    }
  });

  it('compresses red/green CIE Lab distance under deutan and protan', () => {
    const red = '#C82820';
    const green = '#288C28';
    const normalDist = cs.deltaE76(cs.hexToLab(red), cs.hexToLab(green));

    for (const type of ['protan', 'deutan']) {
      const simRed = cs.simulateCvd(red, type);
      const simGreen = cs.simulateCvd(green, type);
      const cvdDist = cs.deltaE76(cs.hexToLab(simRed), cs.hexToLab(simGreen));

      assert.ok(
        cvdDist < normalDist * 0.5,
        `Expected ${type} to compress red/green distance (${cvdDist.toFixed(1)} vs normal ${normalDist.toFixed(1)})`
      );
    }

    // Tritanopia compresses blue vs teal-green CIE Lab distance
    const blue = '#2868D8';
    const teal = '#209878';
    const normalTritanDist = cs.deltaE76(cs.hexToLab(blue), cs.hexToLab(teal));
    const tritanDist = cs.deltaE76(
      cs.hexToLab(cs.simulateCvd(blue, 'tritan')),
      cs.hexToLab(cs.simulateCvd(teal, 'tritan'))
    );
    assert.ok(
      tritanDist < normalTritanDist * 0.5,
      `Expected tritan to compress blue/teal-green distance (${tritanDist.toFixed(1)} vs normal ${normalTritanDist.toFixed(1)})`
    );
  });
});

describe('color-science: auditPalette', () => {
  it('passes with 0 errors and 0 warnings on shipped palettes including majora-dark slug-scan resolution', () => {
    const slugs = ['ocarina-light', 'totk-dark', 'botw-light', 'linksawakening-dark', 'majora-dark'];
    for (const slug of slugs) {
      const palette = loadPalette(slug);
      const result = cs.auditPalette(palette);

      assert.equal(result.slug, slug);
      assert.deepEqual(result.errors, [], `${slug} unexpectedly failed audit: ${result.errors.join('; ')}`);
      assert.deepEqual(result.warnings, [], `${slug} emitted unexpected warnings: ${result.warnings.join('; ')}`);
      assert.ok(result.metrics.fgBg >= (slug === 'linksawakening-dark' ? 5.8 : 7.0));
      assert.ok(result.metrics.minSyntaxCr >= 4.5);
      assert.equal(result.metrics.severeCvdCount, 0);
    }
  });

  it('clears all error, warning, and severe CVD gates across all 36 shipped palettes', () => {
    const allPalettes = loadAllPalettes();
    assert.equal(allPalettes.size, 36);

    for (const [slug, palette] of allPalettes.entries()) {
      const result = cs.auditPalette(palette);
      assert.deepEqual(result.errors, [], `${slug} errors: ${result.errors.join('; ')}`);
      assert.deepEqual(result.warnings, [], `${slug} warnings: ${result.warnings.join('; ')}`);
      assert.equal(result.metrics.severeCvdCount, 0, `${slug} severeCvdCount should be 0`);
    }
  });

  it('rejects a synthetic palette with low fg/bg contrast with clear error messages', () => {
    const lowContrast = clonePalette(loadPalette('ocarina-light'));
    lowContrast.slug = 'synthetic-low-contrast';
    lowContrast.tokens.fg = '#DFDBC6'; // very close to bg #EDE9D6

    const result = cs.auditPalette(lowContrast);
    assert.ok(result.errors.length > 0, 'Expected low-contrast palette to produce errors');
    assert.ok(
      result.errors.some((msg) => msg.includes('primary fg/bg contrast') && msg.includes('< 7:1')),
      `Expected primary fg/bg contrast error, got: ${result.errors.join(' | ')}`
    );
    assert.ok(
      result.errors.some((msg) => msg.includes('APCA |Lc|')),
      `Expected APCA |Lc| error, got: ${result.errors.join(' | ')}`
    );

    // Gate 1: fgComment < 4.5 WCAG AA
    const weakComment = clonePalette(loadPalette('ocarina-light'));
    weakComment.slug = 'synthetic-weak-comment';
    weakComment.tokens.fgComment = '#9E9A8A';
    const weakCommentRes = cs.auditPalette(weakComment);
    assert.ok(
      weakCommentRes.errors.some((msg) => msg.includes('fgComment/bg contrast') && msg.includes('< 4.5:1')),
      `Expected fgComment/bg contrast error, got: ${weakCommentRes.errors.join(' | ')}`
    );

    // Gate 2: fgComment salience hierarchy (commentBg > fgBg - 2.0)
    const loudComment = clonePalette(loadPalette('ocarina-light'));
    loudComment.slug = 'synthetic-loud-comment';
    loudComment.tokens.fgComment = loudComment.tokens.fg;
    const loudCommentRes = cs.auditPalette(loudComment);
    assert.ok(
      loudCommentRes.errors.some((msg) => msg.includes('too close in salience')),
      `Expected fgComment salience error, got: ${loudCommentRes.errors.join(' | ')}`
    );

    // Gate 3: bgLine active-line legibility (< 3.8:1)
    const badBgLine = clonePalette(loadPalette('ocarina-light'));
    badBgLine.slug = 'synthetic-bad-bgline';
    badBgLine.tokens.bgLine = '#989484';
    const badBgLineRes = cs.auditPalette(badBgLine);
    assert.ok(
      badBgLineRes.errors.some((msg) => msg.includes('on bgLine') && msg.includes('< 3.8:1')),
      `Expected bgLine legibility error, got: ${badBgLineRes.errors.join(' | ')}`
    );

    // Gate 4: ANSI contrast failure
    const badAnsiCr = clonePalette(loadPalette('ocarina-light'));
    badAnsiCr.slug = 'synthetic-bad-ansi-cr';
    badAnsiCr.tokens.ansi.red = '#D89690';
    const badAnsiCrRes = cs.auditPalette(badAnsiCr);
    assert.ok(
      badAnsiCrRes.errors.some((msg) => msg.includes('ansi.red') && msg.includes('contrast')),
      `Expected ansi.red contrast error, got: ${badAnsiCrRes.errors.join(' | ')}`
    );

    // Gate 5: ANSI canonical OKLCH hue-band drift
    const badAnsiHue = clonePalette(loadPalette('ocarina-light'));
    badAnsiHue.slug = 'synthetic-bad-ansi-hue';
    badAnsiHue.tokens.ansi.red = '#0055AA';
    const badAnsiHueRes = cs.auditPalette(badAnsiHue);
    assert.ok(
      badAnsiHueRes.errors.some((msg) => msg.includes('ansi.red') && msg.includes('drifted outside canonical')),
      `Expected ansi.red hue-band drift error, got: ${badAnsiHueRes.errors.join(' | ')}`
    );

    // Gate 6: DISTINCT_ROLE_PAIRS identical hex & dE00 < 8.5 normal-vision proximity
    const dupPair = clonePalette(loadPalette('ocarina-light'));
    dupPair.slug = 'synthetic-dup-pair';
    dupPair.tokens.accentStorage = dupPair.tokens.accentKeyword;
    const dupPairRes = cs.auditPalette(dupPair);
    assert.ok(
      dupPairRes.errors.some((msg) => msg.includes('share identical hex')),
      `Expected share identical hex error, got: ${dupPairRes.errors.join(' | ')}`
    );

    const nearPair = clonePalette(loadPalette('ocarina-light'));
    nearPair.slug = 'synthetic-near-pair';
    nearPair.tokens.accentStorage = cs.oklchShift(nearPair.tokens.accentKeyword, { dL: 0.01 });
    assert.notEqual(nearPair.tokens.accentStorage.toUpperCase(), nearPair.tokens.accentKeyword.toUpperCase());
    const nearPairRes = cs.auditPalette(nearPair);
    assert.ok(
      nearPairRes.errors.some((msg) => msg.includes('too close in normal vision') && msg.includes('< 8.5')),
      `Expected normal-vision proximity error, got: ${nearPairRes.errors.join(' | ')}`
    );

    // Gate 7: DMG monochrome duplicate core role hex guard
    const dmgDup = clonePalette(loadPalette('linksawakening-dark'));
    dmgDup.tokens.accentStorage = dmgDup.tokens.accentKeyword;
    const dmgDupRes = cs.auditPalette(dmgDup);
    assert.ok(
      dmgDupRes.errors.some((msg) => msg.includes('duplicate DMG core role hex') && msg.includes('accentStorage')),
      `Expected duplicate DMG core role hex error, got: ${dmgDupRes.errors.join(' | ')}`
    );

    // Gate 8: ALL_FOREGROUND_ROLES WCAG AA (< 4.5:1 on bg)
    const weakSyntax = clonePalette(loadPalette('ocarina-light'));
    weakSyntax.slug = 'synthetic-weak-syntax';
    weakSyntax.tokens.accentString = '#C03B4B';
    const weakSyntaxRes = cs.auditPalette(weakSyntax);
    assert.ok(
      weakSyntaxRes.errors.some(
        (msg) => msg.includes('accentString (#C03B4B) on bg') && msg.includes('< 4.5:1 WCAG AA')
      ),
      `Expected accentString WCAG AA error, got: ${weakSyntaxRes.errors.join(' | ')}`
    );

    // Gate 9: sidebar fg/bgSidebar contrast (< 4.5:1)
    const badSidebar = clonePalette(loadPalette('ocarina-light'));
    badSidebar.slug = 'synthetic-bad-sidebar';
    badSidebar.tokens.bgSidebar = '#5A5A5E';
    const badSidebarRes = cs.auditPalette(badSidebar);
    assert.ok(
      badSidebarRes.errors.some(
        (msg) => msg.includes('sidebar fg/bgSidebar contrast') && msg.includes('< 4.5:1')
      ),
      `Expected sidebar contrast error, got: ${badSidebarRes.errors.join(' | ')}`
    );

    // Gate 10: inactive tab fgSecondary/bgActivity contrast (< 3.5:1)
    const badActivity = clonePalette(loadPalette('ocarina-light'));
    badActivity.slug = 'synthetic-bad-activity';
    badActivity.tokens.bgActivity = '#78787C';
    const badActivityRes = cs.auditPalette(badActivity);
    assert.ok(
      badActivityRes.errors.some(
        (msg) => msg.includes('inactive tab fgSecondary/bgActivity contrast') && msg.includes('< 3.5:1')
      ),
      `Expected inactive tab contrast error, got: ${badActivityRes.errors.join(' | ')}`
    );
  });

  it('rejects a synthetic polychromatic palette with colliding accentKeyword/accentString under CVD', () => {
    const cvdCollision = clonePalette(loadPalette('ocarina-light'));
    cvdCollision.slug = 'synthetic-cvd-collision';
    // Both pass WCAG AA >= 4.5:1 on bg #EDE9D6 & >= 3.8:1 on bgLine #E3DFCA,
    // and are strongly separated in normal vision (dE76 ≈ 57),
    // yet collapse together under deuteranopia (dE76 = 2.98 < 5.0).
    cvdCollision.tokens.accentKeyword = '#8F3214';
    cvdCollision.tokens.accentString = '#465900';

    const result = cs.auditPalette(cvdCollision);
    assert.ok(result.errors.length > 0, 'Expected CVD collision palette to produce errors');
    assert.equal(result.metrics.severeCvdCount, 1);
    assert.ok(
      result.errors.some(
        (msg) =>
          msg.includes('severe deutan collision') &&
          msg.includes('accentKeyword') &&
          msg.includes('accentString')
      ),
      `Expected severe deutan collision error for accentKeyword & accentString, got: ${result.errors.join(' | ')}`
    );
  });

  it('enforces the tightened < 10.0 dE*ab moderate CVD warning gate cleanly around the boundary', () => {
    // Below 10.0 (above old 8.0 threshold): d76Normal = 15.34 >= 15, d76Deutan = 8.91 < 10.0.
    const moderate = clonePalette(loadPalette('ocarina-light'));
    moderate.slug = 'synthetic-moderate-cvd';
    moderate.tokens.accentKeyword = '#664600';

    const modResult = cs.auditPalette(moderate);
    assert.deepEqual(modResult.errors, [], `Unexpected errors: ${modResult.errors.join(' | ')}`);
    assert.equal(modResult.metrics.severeCvdCount, 0);
    assert.equal(modResult.warnings.length, 1);
    assert.ok(
      modResult.warnings[0].includes('moderate deutan compression') &&
        modResult.warnings[0].includes('accentKeyword/accentStorage'),
      `Unexpected warning text: ${modResult.warnings[0]}`
    );

    // Just above 10.0 control: d76Normal = 18.53 >= 15, d76Deutan = 10.05 >= 10.0.
    const clear = clonePalette(loadPalette('ocarina-light'));
    clear.slug = 'synthetic-cvd-clear';
    clear.tokens.accentKeyword = '#674C04';

    const clearResult = cs.auditPalette(clear);
    assert.deepEqual(clearResult.errors, []);
    assert.deepEqual(clearResult.warnings, []);
  });
});
