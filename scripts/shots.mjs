// Dev helper: screenshots of pages at several viewports. Usage: node scripts/shots.mjs <outDir> [base]
import { chromium } from 'playwright';
const [out = '.shots', base = 'http://localhost:4173'] = process.argv.slice(2);
const views = { mobile: [390, 844], tablet: [820, 1180], laptop: [1366, 768], desktop: [1920, 1080] };
const b = await chromium.launch();
for (const [name, [w, h]] of Object.entries(views)) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => m.type() === 'error' && errors.push(m.text()));
  for (const path of ['/', '/carte/']) {
    await p.goto(base + path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(900);
    const f = `${out}/${name}${path.replace(/\//g, '_')}`;
    await p.screenshot({ path: f + 'fold.png' });
    await p.screenshot({ path: f + 'full.png', fullPage: true });
  }
  if (errors.length) console.log(name, errors);
  await p.close();
}
await b.close();
