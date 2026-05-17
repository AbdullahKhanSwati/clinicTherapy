// Generate brand icons for the Therapy Companion app.
// Outputs: icon.png, adaptive-icon.png, splash-icon.png at 1024×1024.
//
// Design: a soft teal background with a stylized circle motif representing
// connection / wholeness — a centered ring with an inner heart-like crescent.
// Inspired by the brand color #00A8CC.
//
// Run: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const SIZE = 1024;
const OUT_DIR = path.join(__dirname, '..', 'assets');

// ----- Brand palette -----
const PRIMARY = hex('#00A8CC');
const PRIMARY_LIGHT = hex('#1FC2E7');
const PRIMARY_DARK = hex('#067A95');
const WHITE = hex('#FFFFFF');
const SHADOW = hex('#055D72');

function hex(h) {
  const v = h.replace('#', '');
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

// Smoothstep — for nicer anti-aliased edges
function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Build a canvas of given size with a function returning {r,g,b,a} per pixel
function buildCanvas(size, fn) {
  const png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const c = fn(x, y) || { r: 0, g: 0, b: 0, a: 0 };
      png.data[idx + 0] = c.r;
      png.data[idx + 1] = c.g;
      png.data[idx + 2] = c.b;
      png.data[idx + 3] = c.a == null ? 255 : c.a;
    }
  }
  return png;
}

function savePng(png, name) {
  const file = path.join(OUT_DIR, name);
  return new Promise((resolve, reject) => {
    png
      .pack()
      .pipe(fs.createWriteStream(file))
      .on('finish', () => {
        console.log('Wrote', file);
        resolve();
      })
      .on('error', reject);
  });
}

// Mix two colors by alpha-blending fg over bg using fg.a in [0..1]
function over(bg, fg, alpha) {
  return {
    r: Math.round(fg.r * alpha + bg.r * (1 - alpha)),
    g: Math.round(fg.g * alpha + bg.g * (1 - alpha)),
    b: Math.round(fg.b * alpha + bg.b * (1 - alpha)),
    a: 255,
  };
}

// Composite with transparent background
function overTransparent(fg, alpha) {
  return {
    r: fg.r,
    g: fg.g,
    b: fg.b,
    a: Math.round(255 * alpha),
  };
}

// ---------- Draw the brand mark ----------
//
// The mark is a thick teal-gradient ring (donut) with an inner soft heart-shaped
// crescent — symbolizes connection and care. Background controls how it composites.
function drawMark({ size, bgFn, foregroundColor = WHITE, scale = 0.62 }) {
  return buildCanvas(size, (x, y) => {
    const cx = size / 2;
    const cy = size / 2;
    // normalized distance from center
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.sqrt(dx * dx + dy * dy);

    const baseRadius = (size / 2) * scale; // outer ring radius
    const ringThickness = baseRadius * 0.18;
    const innerRingOuter = baseRadius;
    const innerRingInner = baseRadius - ringThickness;

    // Outer ring with anti-aliasing
    const outerEdge =
      smoothstep(innerRingOuter + 1.5, innerRingOuter - 1.5, r) -
      smoothstep(innerRingInner + 1.5, innerRingInner - 1.5, r);
    let ringAlpha = Math.max(0, outerEdge);

    // Inner accent dot (a smaller filled circle slightly above center)
    const innerR = baseRadius * 0.32;
    const dotCx = cx;
    const dotCy = cy + baseRadius * 0.06;
    const dotR = Math.sqrt((x - dotCx) ** 2 + (y - dotCy) ** 2);
    const dotAlpha = 1 - smoothstep(innerR - 1.5, innerR + 1.5, dotR);

    // Crescent: take the dot but cut a smaller circle above-right of center
    // to make a smile / crescent shape that reads as warm + open.
    const cutCx = cx + baseRadius * 0.08;
    const cutCy = cy - baseRadius * 0.08;
    const cutR = innerR * 0.85;
    const cutDist = Math.sqrt((x - cutCx) ** 2 + (y - cutCy) ** 2);
    const cutAlpha = 1 - smoothstep(cutR - 1.5, cutR + 1.5, cutDist);

    const crescentAlpha = Math.max(0, dotAlpha - cutAlpha);

    const fgAlpha = Math.max(ringAlpha, crescentAlpha);

    const bg = bgFn(x, y);

    if (bg && bg.a !== 0) {
      // Composite foreground onto background
      return over(bg, foregroundColor, fgAlpha);
    } else {
      // Transparent — output only foreground with its alpha
      return overTransparent(foregroundColor, fgAlpha);
    }
  });
}

// Background fillers
function solidBg(color) {
  return () => ({ ...color, a: 255 });
}

function radialGradientBg(inner, outer) {
  return (x, y) => {
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    const maxD = Math.sqrt(2) * (SIZE / 2);
    const t = Math.min(1, d / maxD);
    return {
      r: Math.round(inner.r * (1 - t) + outer.r * t),
      g: Math.round(inner.g * (1 - t) + outer.g * t),
      b: Math.round(inner.b * (1 - t) + outer.b * t),
      a: 255,
    };
  };
}

function transparentBg() {
  return () => ({ r: 0, g: 0, b: 0, a: 0 });
}

// ---------- Generate the three icons ----------
async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // 1. icon.png — full-bleed teal radial gradient + white brand mark.
  //    Used as iOS app icon (no transparency required).
  const icon = drawMark({
    size: SIZE,
    bgFn: radialGradientBg(PRIMARY_LIGHT, PRIMARY_DARK),
    foregroundColor: WHITE,
    scale: 0.6,
  });
  await savePng(icon, 'icon.png');

  // 2. adaptive-icon.png — transparent background, brand mark fills the
  //    inner safe-zone (66% of canvas) so it survives Android's
  //    circle/squircle/teardrop masks.
  //    Android adaptive icons use 108dp total but only the inner 66dp is
  //    guaranteed visible — we draw a teal-filled "puck" of ~80% then the
  //    mark at ~50%, both centered, with transparent outer padding.
  const adaptive = buildCanvas(SIZE, (x, y) => {
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const r = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    const puckR = SIZE * 0.4; // inside safe zone
    const puckAlpha = 1 - smoothstep(puckR - 2, puckR + 2, r);

    if (puckAlpha <= 0.001) return { r: 0, g: 0, b: 0, a: 0 };

    // Subtle radial gradient inside the puck
    const t = Math.min(1, r / puckR);
    const bg = {
      r: Math.round(PRIMARY_LIGHT.r * (1 - t) + PRIMARY.r * t),
      g: Math.round(PRIMARY_LIGHT.g * (1 - t) + PRIMARY.g * t),
      b: Math.round(PRIMARY_LIGHT.b * (1 - t) + PRIMARY.b * t),
    };

    return {
      r: bg.r,
      g: bg.g,
      b: bg.b,
      a: Math.round(255 * puckAlpha),
    };
  });

  // Now overlay the mark onto the adaptive puck
  const adaptiveWithMark = buildCanvas(SIZE, (x, y) => {
    const base = adaptive.data;
    const idx = (y * SIZE + x) * 4;
    const baseColor = {
      r: base[idx + 0],
      g: base[idx + 1],
      b: base[idx + 2],
      a: base[idx + 3],
    };

    // mark
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.sqrt(dx * dx + dy * dy);
    const baseRadius = SIZE * 0.22;
    const ringThickness = baseRadius * 0.2;
    const ringAlpha = Math.max(
      0,
      smoothstep(baseRadius + 1.5, baseRadius - 1.5, r) -
        smoothstep(baseRadius - ringThickness + 1.5, baseRadius - ringThickness - 1.5, r)
    );

    const innerR = baseRadius * 0.5;
    const dotCx = cx;
    const dotCy = cy + baseRadius * 0.05;
    const dotR = Math.sqrt((x - dotCx) ** 2 + (y - dotCy) ** 2);
    const dotAlpha = 1 - smoothstep(innerR - 1.5, innerR + 1.5, dotR);

    const cutR = innerR * 0.7;
    const cutCx = cx + baseRadius * 0.08;
    const cutCy = cy - baseRadius * 0.08;
    const cutDist = Math.sqrt((x - cutCx) ** 2 + (y - cutCy) ** 2);
    const cutAlpha = 1 - smoothstep(cutR - 1.5, cutR + 1.5, cutDist);

    const crescentAlpha = Math.max(0, dotAlpha - cutAlpha);
    const markAlpha = Math.max(ringAlpha, crescentAlpha);

    if (baseColor.a === 0 && markAlpha === 0) {
      return { r: 0, g: 0, b: 0, a: 0 };
    }

    if (baseColor.a === 0) {
      // Mark on transparent — shouldn't happen since mark is inside puck
      return {
        r: WHITE.r,
        g: WHITE.g,
        b: WHITE.b,
        a: Math.round(255 * markAlpha),
      };
    }

    // Composite white mark onto puck color
    return {
      r: Math.round(WHITE.r * markAlpha + baseColor.r * (1 - markAlpha)),
      g: Math.round(WHITE.g * markAlpha + baseColor.g * (1 - markAlpha)),
      b: Math.round(WHITE.b * markAlpha + baseColor.b * (1 - markAlpha)),
      a: baseColor.a,
    };
  });
  await savePng(adaptiveWithMark, 'adaptive-icon.png');

  // 3. splash-icon.png — transparent background, mark only (the splash
  //    background color is set in app.json's splash.backgroundColor).
  const splashIcon = drawMark({
    size: SIZE,
    bgFn: transparentBg(),
    foregroundColor: WHITE,
    scale: 0.62,
  });
  await savePng(splashIcon, 'splash-icon.png');

  // 4. Keep the legacy logo.png path working — point it to the same icon
  //    so existing SplashScreen.js that references logo.png still renders
  //    something sensible during the React Native splash.
  const logo = drawMark({
    size: SIZE,
    bgFn: transparentBg(),
    foregroundColor: WHITE,
    scale: 0.62,
  });
  await savePng(logo, 'logo.png');

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
