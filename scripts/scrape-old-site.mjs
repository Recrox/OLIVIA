// One-off audit tool: snapshot the old Adobe Express pages (full text, photos, screenshot).
// The ?page-mode=static (screen-reader) version holds all the text; the animated one truncates it.
// Usage: node scripts/scrape-old-site.mjs <outDir> <slug>=<adobeId> ...
import { chromium } from 'playwright';
import fs from 'fs';

const [out, ...pages] = process.argv.slice(2);
const b = await chromium.launch();
for (const pair of pages) {
  const [slug, id] = pair.split('=');
  const dir = `${out}/${slug}`;
  fs.mkdirSync(dir, { recursive: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(`https://new.express.adobe.com/webpage/${id}?page-mode=static`, { waitUntil: 'networkidle', timeout: 90000 });
  await p.waitForTimeout(2000);
  fs.writeFileSync(`${dir}/text.txt`, await p.evaluate(() => document.body.innerText));
  fs.writeFileSync(`${dir}/links.json`, JSON.stringify(await p.evaluate(() =>
    [...document.querySelectorAll('a')].map(a => [a.innerText.trim(), a.href]).filter(([, h]) => !/adobe\.com\/(go|legal)|helpx|#$/.test(h))), null, 1));
  const imgs = [...new Set(await p.evaluate(() =>
    [...document.querySelectorAll('img, [style*="background-image"]')]
      .map(e => e.currentSrc || e.src || (getComputedStyle(e).backgroundImage.match(/url\("?(.*?)"?\)/) || [])[1])
      .filter(u => u && u.includes('/resources/'))))];
  let n = 0;
  for (const u of imgs) {
    const r = await p.request.get(u.replace(/size=\d+/, 'size=2560'));
    const ext = (r.headers()['content-type'] || 'image/jpeg').split('/')[1].replace('jpeg', 'jpg');
    fs.writeFileSync(`${dir}/img-${String(n++).padStart(2, '0')}.${ext}`, await r.body());
  }
  await p.screenshot({ path: `${dir}/full.png`, fullPage: true });
  await p.close();
  console.log(slug, 'text', fs.statSync(`${dir}/text.txt`).size, 'imgs', imgs.length);
}
await b.close();
