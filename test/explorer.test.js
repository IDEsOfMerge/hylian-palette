'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const {
  loadThemeDataset,
  jacobiEigenSymmetric,
  computeClassicalMds2d,
  enrichDatasetWithSimilarity,
  buildHtml,
} = require('../scripts/generate-explorer');

const ROOT_DIR = path.join(__dirname, '..');
const themeMetadata = require(path.join(ROOT_DIR, 'theme-metadata.json'));

function extractInlineScript(html) {
  const match = html.match(/<script(?:\s+nonce="\{\{CSP_NONCE\}\}")?>([\s\S]*?)<\/script>/);
  assert.ok(match && match[1].length > 1000, 'Expected embedded inline <script> bundle');
  return match[1];
}

describe('explorer: Classical MDS & eigensolver math', () => {
  it('recovers exact eigenvalues and orthonormal eigenvectors on a symmetric matrix', () => {
    const A = [
      [4, 1, 1],
      [1, 3, 0],
      [1, 0, 2],
    ];
    const eigs = jacobiEigenSymmetric(A);
    assert.equal(eigs.length, 3);

    // Eigenvalues sorted descending and sum equals trace (4 + 3 + 2 = 9)
    assert.ok(eigs[0].val >= eigs[1].val && eigs[1].val >= eigs[2].val);
    const trace = eigs.reduce((s, e) => s + e.val, 0);
    assert.ok(Math.abs(trace - 9) < 1e-8, `Expected trace 9, got ${trace}`);

    // Verify A * v = lambda * v and eigenvector orthonormality
    for (let p = 0; p < 3; p++) {
      const { val, vec } = eigs[p];
      for (let i = 0; i < 3; i++) {
        const av = A[i][0] * vec[0] + A[i][1] * vec[1] + A[i][2] * vec[2];
        assert.ok(Math.abs(av - val * vec[i]) < 1e-7);
      }
      for (let q = 0; q < 3; q++) {
        const dot =
          vec[0] * eigs[q].vec[0] + vec[1] * eigs[q].vec[1] + vec[2] * eigs[q].vec[2];
        const expected = p === q ? 1 : 0;
        assert.ok(Math.abs(dot - expected) < 1e-7, `Dot (${p},${q}) = ${dot}, expected ${expected}`);
      }
    }
  });

  it('reconstructs pairwise Euclidean distances up to rigid transform via computeClassicalMds2d', () => {
    const pts = [
      [0, 0],
      [3, 0],
      [3, 4],
      [0, 4],
    ];
    const D = pts.map((a) => pts.map((b) => Math.hypot(a[0] - b[0], a[1] - b[1])));
    const { coords, v1, v2 } = computeClassicalMds2d(D);
    assert.ok(Math.abs(v1 + v2 - 100) < 0.2, `2D rectangle should explain ~100% variance, got ${v1 + v2}`);
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const dRec = Math.hypot(coords[i][0] - coords[j][0], coords[i][1] - coords[j][1]);
        assert.ok(Math.abs(dRec - D[i][j]) < 1e-5, `Distance (${i},${j}) mismatch: ${dRec} vs ${D[i][j]}`);
      }
    }
  });
});

describe('explorer: 36-theme CIEDE2000 similarity & MDS metadata invariants', () => {
  const dataset = loadThemeDataset();
  const mdsMeta = enrichDatasetWithSimilarity(dataset);

  it("computes valid Light (18) and Dark (17 polychromatic + Link's Awakening Dark outlier) MDS coordinates", () => {
    assert.equal(dataset.length, 36);

    const lightThemes = dataset.filter((t) => t.mode === 'light');
    const darkThemes = dataset.filter((t) => t.mode === 'dark');
    assert.equal(lightThemes.length, 18);
    assert.equal(darkThemes.length, 18);

    assert.equal(mdsMeta.light.v1, 37.8);
    assert.equal(mdsMeta.light.v2, 20.2);
    assert.ok(mdsMeta.light.v1 > 20 && mdsMeta.light.v2 > 10 && mdsMeta.light.v1 + mdsMeta.light.v2 <= 100);

    assert.equal(mdsMeta.dark.v1, 29.2);
    assert.equal(mdsMeta.dark.v2, 22.9);
    assert.ok(mdsMeta.dark.v1 > 20 && mdsMeta.dark.v2 > 10 && mdsMeta.dark.v1 + mdsMeta.dark.v2 <= 100);

    assert.equal(mdsMeta.dark.dmgMeanDe, 38.5);
    assert.equal(mdsMeta.dark.dmgMinDe, 31.8);
    assert.equal(mdsMeta.dark.dmgMaxDe, 45.3);

    for (const t of dataset) {
      assert.ok(t.mds, `Missing mds metadata on ${t.slug}`);
      if (t.slug === 'linksawakening-dark') {
        assert.equal(t.mds.outlier, true);
        assert.ok(t.mds.meanDe > 35 && t.mds.meanDe < 42);
        assert.equal(t.mds.meanDe, 38.5);
        assert.equal(t.mds.minDe, 31.8);
        assert.equal(t.mds.maxDe, 45.3);
      } else {
        assert.equal(Boolean(t.mds.outlier), false);
        assert.ok(Number.isFinite(t.mds.x) && Number.isFinite(t.mds.y));
        assert.ok(t.mds.nx >= 0 && t.mds.nx <= 1);
        assert.ok(t.mds.ny >= 0 && t.mds.ny <= 1);
      }
    }

    // Deterministic semantic pole orientation: Majora's Mask on -X, Zelda II on +Y in both modes
    const bySlug = new Map(dataset.map((t) => [t.slug, t]));
    assert.ok(bySlug.get('majora-light').mds.x < 0);
    assert.ok(bySlug.get('majora-dark').mds.x < 0);
    assert.ok(bySlug.get('zelda2-light').mds.y > 0);
    assert.ok(bySlug.get('zelda2-dark').mds.y > 0);
  });

  it('populates sorted 4-neighbor & polychromatic farthest metadata with exact 36/36 parity against theme-metadata.json', () => {
    const bySlug = new Map(dataset.map((t) => [t.slug, t]));
    const metaBySlug = new Map(themeMetadata.map((m) => [m.slug, m]));
    assert.equal(metaBySlug.size, 36);

    for (const t of dataset) {
      assert.equal(t.neighbors.length, 4, `${t.slug} should have 4 nearest neighbors`);
      const seenNb = new Set();
      for (let i = 0; i < t.neighbors.length; i++) {
        const nb = t.neighbors[i];
        assert.notEqual(nb.slug, t.slug);
        assert.equal(bySlug.get(nb.slug).mode, t.mode);
        assert.ok(nb.de > 0);
        assert.equal(seenNb.has(nb.slug), false, `Duplicate neighbor ${nb.slug} on ${t.slug}`);
        seenNb.add(nb.slug);
        if (i > 0) assert.ok(nb.de >= t.neighbors[i - 1].de);
      }

      assert.ok(t.farthest && t.farthest.slug !== t.slug);
      assert.equal(bySlug.get(t.farthest.slug).mode, t.mode);
      assert.notEqual(t.farthest.slug, 'linksawakening-dark');
      assert.ok(t.farthest.de >= t.neighbors[t.neighbors.length - 1].de);

      // Exact parity with theme-metadata.json
      const metaEntry = metaBySlug.get(t.slug);
      assert.ok(metaEntry, `Missing theme-metadata.json entry for ${t.slug}`);
      assert.deepEqual(t.neighbors, metaEntry.neighbors.slice(0, 4));
      assert.deepEqual(t.farthest, metaEntry.farthest);
    }

    // Known close game sibling pairs
    assert.equal(bySlug.get('windwaker-dark').neighbors[0].slug, 'phantomhourglass-dark');
    assert.equal(bySlug.get('phantomhourglass-dark').neighbors[0].slug, 'windwaker-dark');
    assert.equal(bySlug.get('totk-dark').neighbors[0].slug, 'botw-dark');
    assert.equal(bySlug.get('windwaker-light').neighbors[0].slug, 'skywardsword-light');

    // Reversed-dataset order invariance & tie-breaker parity across all 36 themes
    const reversedDataset = loadThemeDataset().reverse();
    enrichDatasetWithSimilarity(reversedDataset);
    const revBySlug = new Map(reversedDataset.map((t) => [t.slug, t]));
    assert.equal(revBySlug.size, 36);
    for (const t of dataset) {
      const rt = revBySlug.get(t.slug);
      assert.ok(rt, `Missing reversed-dataset entry for ${t.slug}`);
      assert.deepEqual(rt.neighbors, t.neighbors, `Neighbor order drift on ${t.slug}`);
      assert.deepEqual(rt.farthest, t.farthest, `Farthest drift on ${t.slug}`);
    }
  });
});

describe('explorer: built HTML bundles & export formats', () => {
  const EXPORT_OPTIONS = [
    'vscode',
    'ghostty',
    'wezterm',
    'alacritty',
    'windowsterminal',
    'kitty',
    'iterm2',
    'css',
  ];

  it('site/index.html embeds MDS map, neighbor bar, all 8 export formats, OG card, and zero external URLs', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'site', 'index.html'), 'utf8');
    const inlineScript = extractInlineScript(html);
    assert.doesNotThrow(() => new vm.Script(inlineScript, { filename: 'site/index.html' }));

    assert.ok(html.includes('data-target="web"'));
    assert.ok(html.includes('<meta http-equiv="Content-Security-Policy"'));
    assert.ok(html.includes("default-src 'none'"));
    assert.ok(html.includes('property="og:title"'));
    assert.ok(html.includes('property="og:image"'));
    assert.ok(html.includes('name="twitter:card"'));
    assert.ok(html.includes('og-preview.png'));

    for (const hook of [
      'id="map-strip"',
      'id="mds-svg"',
      'id="neighbor-bar"',
      'id="game-search"',
      'id="era-filter-bar"',
      'class="filter-chip"',
      'id="compare-strip"',
      'id="btn-compare-swap"',
      'id="btn-share-url"',
      'id="mds-legend-key"',
    ]) {
      assert.ok(html.includes(hook), `site/index.html missing DOM hook ${hook}`);
    }

    assert.ok(html.includes('const MDS_META = '));
    for (const opt of EXPORT_OPTIONS) {
      assert.ok(html.includes(`value="${opt}"`), `site/index.html missing export option "${opt}"`);
    }
    assert.equal(/<(?:script|link|img)\b[^>]+(?:src|href)=["']https?:\/\//i.test(html), false);
    assert.equal(html.includes('{{CSP_META}}'), false);
    assert.equal(html.includes('{{CSP_NONCE}}'), false);

    // Client regression & export template structure checks
    assert.ok(inlineScript.includes('let passCount = 0;'));
    assert.ok(inlineScript.includes("passCount + '/' + AUDIT_ROLES.length + ' roles >= 4.5:1"));
    assert.ok(inlineScript.includes('slug === activeSlug'));
    assert.ok(inlineScript.includes('if (compareUserPinned && compareSlug === slug)'));
    assert.ok(inlineScript.includes('EXACT_GAME_ALIASES.has(part)'));
    assert.ok(inlineScript.includes("if (fmt === 'iterm2')") && inlineScript.includes('<plist version="1.0">'));
    assert.ok(
      inlineScript.includes("if (fmt === 'windowsterminal')") &&
        inlineScript.includes('purple:') &&
        inlineScript.includes('brightPurple:')
    );
    assert.ok(inlineScript.includes('--hp-bg:') && inlineScript.includes('--hp-ansi-'));
    assert.ok(
      inlineScript.includes('const otherMode = THEMES.find((t) => t.game === gameName && t.mode !== cur.mode);')
    );
    assert.ok(inlineScript.includes("btn.setAttribute('aria-pressed', String(target.slug === cur.slug));"));
  });

  it('assets/explorer/explorer.html embeds MDS map, neighbor bar, all 8 export formats, CSP placeholders, and zero external URLs', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'assets', 'explorer', 'explorer.html'), 'utf8');
    const inlineScript = extractInlineScript(html);
    assert.doesNotThrow(() => new vm.Script(inlineScript, { filename: 'assets/explorer/explorer.html' }));

    assert.ok(html.includes('data-target="webview"'));
    assert.ok(html.includes('id="map-strip"'));
    assert.ok(html.includes('id="mds-svg"'));
    assert.ok(html.includes('id="neighbor-bar"'));
    assert.ok(html.includes('id="mds-legend-key"'));
    assert.ok(html.includes('const MDS_META = '));
    for (const opt of EXPORT_OPTIONS) {
      assert.ok(html.includes(`value="${opt}"`), `assets/explorer/explorer.html missing export option "${opt}"`);
    }
    assert.equal(/<(?:script|link|img)\b[^>]+(?:src|href)=["']https?:\/\//i.test(html), false);
    assert.equal((html.match(/\{\{CSP_META\}\}/g) || []).length, 1);
    assert.equal((html.match(/\{\{CSP_NONCE\}\}/g) || []).length, 1);
    assert.equal((html.match(/data-initial-theme=""/g) || []).length, 1);
    assert.ok(html.includes('<script nonce="{{CSP_NONCE}}">'));
    assert.equal(html.includes('property="og:'), false);
    assert.equal(html.includes('name="twitter:'), false);
    assert.ok(inlineScript.includes("msg.type === 'activeThemeChanged' && typeof msg.label === 'string'"));
    assert.match(
      inlineScript,
      /msg\.type === 'activeThemeChanged' && typeof msg\.label === 'string'[\s\S]{0,400}if \(compareUserPinned && compareSlug === match\.slug\)\s*\{\s*compareUserPinned = false;\s*compareSlug = null;\s*\}/
    );
  });

  it('buildHtml deterministically matches committed site/index.html and assets/explorer/explorer.html', () => {
    const dataset = loadThemeDataset();
    const mdsMeta = enrichDatasetWithSimilarity(dataset);

    const webDisk = fs.readFileSync(path.join(ROOT_DIR, 'site', 'index.html'), 'utf8');
    const webviewDisk = fs.readFileSync(path.join(ROOT_DIR, 'assets', 'explorer', 'explorer.html'), 'utf8');

    assert.equal(buildHtml({ dataset, mdsMeta, target: 'web' }), webDisk);
    assert.equal(buildHtml({ dataset, mdsMeta, target: 'webview' }), webviewDisk);
  });
});
