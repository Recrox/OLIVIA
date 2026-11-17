// Run once: app icons (sharp) and the Open Graph image (Playwright, so it uses the real fonts).
import sharp from 'sharp';
import fs from 'fs';
import { pathToFileURL } from 'url';
import { chromium } from 'playwright';

const ORANGE = '#f29400';
const INK = '#1f1b16';
// A serif "O": two offset, tilted ellipses give it thick and thin strokes. No font needed.
const mark = (size, scale = 1, radius = 0.22) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <rect width="100" height="100" rx="${radius * 100}" fill="${ORANGE}"/>
  <g transform="translate(50 50) scale(${scale}) rotate(-14)">
    <path fill="${INK}" fill-rule="evenodd" d="M0-34a27 34 0 1 1 0 68a27 34 0 1 1 0-68ZM1.5-29.5a15.5 29.5 0 1 0 0 59a15.5 29.5 0 1 0 0-59Z"/>
  </g>
</svg>`;

fs.mkdirSync('src/static/icons', { recursive: true });
fs.writeFileSync('src/static/icons/favicon.svg', mark(32));
const png = (svg, file) => sharp(Buffer.from(svg)).png().toFile(`src/static/icons/${file}`);
await png(mark(32), 'favicon-32.png');
await png(mark(192), 'icon-192.png');
await png(mark(512), 'icon-512.png');
await png(mark(180, 1, 0), 'apple-touch-icon.png'); // iOS rounds corners itself
await png(mark(512, 0.72, 0), 'maskable-512.png'); // glyph inside the 80% safe zone

const font = f => pathToFileURL(`src/fonts/${f}`).href;
const html = `<!doctype html><html><head><style>
@font-face { font-family: F; src: url(${font('fraunces.woff2')}); font-weight: 400 600; }
@font-face { font-family: S; src: url(${font('instrument-sans.woff2')}); }
body { margin: 0; width: 1200px; height: 630px; background: #f6f1e8; display: grid; grid-template-columns: 1fr 560px; align-items: center; overflow: hidden; }
div { padding: 72px; display: grid; gap: 24px; }
h1 { font: 450 128px/1 F; letter-spacing: -0.03em; margin: 0; color: ${INK}; }
p { font: 400 34px/1.35 S; color: #574e43; margin: 0; }
img { width: 640px; mix-blend-mode: multiply; margin-left: -40px; }
</style></head><body><div><h1>Olivia</h1><p>Tapas, pâtes et spritz<br>Grand-Place de Tournai</p></div>
<img src="${pathToFileURL('src/img/raw/olivia-aquarelle.jpg').href}"></body></html>`;
fs.writeFileSync('scripts/.og.html', html);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.goto(pathToFileURL('scripts/.og.html').href);
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: 'src/img/og-olivia.jpg', type: 'jpeg', quality: 85 });
await b.close();
fs.rmSync('scripts/.og.html');
console.log('icons + og image written');
