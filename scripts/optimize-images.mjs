// Run once when photos change: src/img/raw/*.jpg -> src/img/<name>-<width>.{avif,webp}
// The old Adobe banners carry a text label on their left side, so they are cropped.
import sharp from 'sharp';
import fs from 'fs';

const raw = 'src/img/raw';
const out = 'src/img';
const jobs = {
  'olivia-aquarelle': { widths: [480, 800, 1200] },
  planchette: { widths: [800, 1280, 1780] },
  'planche-italienne': { crop: { left: 330, top: 0, width: 521, height: 315 }, widths: [520] },
  'burger-olivia': { crop: { left: 270, top: 0, width: 581, height: 315 }, widths: [580] },
  'pluma-iberico': { crop: { left: 270, top: 0, width: 581, height: 315 }, widths: [580] },
};

const sizes = {};
for (const [name, { crop, widths }] of Object.entries(jobs)) {
  let img = sharp(`${raw}/${name}.jpg`);
  if (crop) img = img.extract(crop);
  const buf = await img.toBuffer();
  const meta = await sharp(buf).metadata();
  sizes[name] = { w: meta.width, h: meta.height, widths };
  for (const w of widths) {
    const r = sharp(buf).resize({ width: Math.min(w, meta.width) });
    await r.clone().avif({ quality: 55 }).toFile(`${out}/${name}-${w}.avif`);
    await r.clone().webp({ quality: 78 }).toFile(`${out}/${name}-${w}.webp`);
  }
}
fs.writeFileSync(`${out}/sizes.json`, JSON.stringify(sizes, null, 1));
console.log(sizes);
