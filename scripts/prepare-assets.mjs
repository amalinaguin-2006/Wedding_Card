import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const ASSETS_DIR = path.join(ROOT, 'assets');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT_ASSETS = path.join(PUBLIC_DIR, 'assets');
const OUT_PETALS = path.join(OUT_ASSETS, 'petals');
const OUT_SPARKLES = path.join(OUT_ASSETS, 'sparkles');

fs.mkdirSync(OUT_ASSETS, { recursive: true });
fs.mkdirSync(OUT_PETALS, { recursive: true });
fs.mkdirSync(OUT_SPARKLES, { recursive: true });

// Skip files we explicitly decided not to use
const SKIP_FILES = new Set([
  'p10-bride-hair.png',
  'p10-plant-1.png',
  'p10-plant-2.png',
  'p10-plant-3.png',
  'p10-plant-4.png',
  'p10-plant-5.png',
  'elephant-body.png',
  'elephant-trunk.png',
  'butterfly.png',
]);

async function cleanAndConvertP10Bride(srcPath, destPath) {
  // Remove only the two stray orange specks in the upper-left transparent area (top-left ~80x200px)
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  for (let y = 0; y < Math.min(220, height); y++) {
    for (let x = 0; x < Math.min(100, width); x++) {
      const idx = (y * width + x) * channels;
      data[idx + 3] = 0; // make stray specks fully transparent
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .webp({ quality: 88, alphaQuality: 95 })
    .toFile(destPath);
}

/**
 * Connected-component bounding box finder on alpha channel to crop individual sprites (petals or stars)
 */
async function cropComponents(srcPath, outDir, prefix, minPixels = 80) {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const boxes = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (visited[p]) continue;
      const alpha = data[p * channels + 3];
      if (alpha < 15) continue;

      let minX = x, maxX = x, minY = y, maxY = y;
      let count = 0;
      const queue = [p];
      visited[p] = 1;

      while (queue.length > 0) {
        const cur = queue.pop();
        const cx = cur % width;
        const cy = (cur - cx) / width;
        count++;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        const neighbors = [
          cx > 0 ? cur - 1 : -1,
          cx < width - 1 ? cur + 1 : -1,
          cy > 0 ? cur - width : -1,
          cy < height - 1 ? cur + width : -1,
        ];
        for (const n of neighbors) {
          if (n >= 0 && !visited[n] && data[n * channels + 3] >= 15) {
            visited[n] = 1;
            queue.push(n);
          }
        }
      }

      if (count > minPixels) {
        boxes.push({
          left: Math.max(0, minX - 2),
          top: Math.max(0, minY - 2),
          width: Math.min(width - Math.max(0, minX - 2), maxX - minX + 5),
          height: Math.min(height - Math.max(0, minY - 2), maxY - minY + 5),
        });
      }
    }
  }

  // Sort largest first so star-1 is the big star, etc.
  boxes.sort((a, b) => b.width * b.height - a.width * a.height);
  console.log(`Found ${boxes.length} ${prefix} components in ${path.basename(srcPath)}`);
  for (let i = 0; i < boxes.length; i++) {
    const outFile = path.join(outDir, `${prefix}-${i + 1}.webp`);
    await sharp(srcPath)
      .extract(boxes[i])
      .webp({ quality: 88, alphaQuality: 95 })
      .toFile(outFile);
  }
}

async function run() {
  const files = fs.readdirSync(ASSETS_DIR);
  for (const file of files) {
    if (!/\.(png|jpe?g)$/i.test(file)) continue;
    if (SKIP_FILES.has(file)) continue;

    const src = path.join(ASSETS_DIR, file);
    const base = file.replace(/\.(png|jpe?g)$/i, '');
    const dest = path.join(OUT_ASSETS, `${base}.webp`);

    if (file === 'p10-bride.png') {
      await cleanAndConvertP10Bride(src, dest);
    } else if (file === 'petal.png') {
      await cropComponents(src, OUT_PETALS, 'petal', 80);
      await sharp(src).webp({ quality: 88, alphaQuality: 95 }).toFile(dest);
    } else if (file === 'sparkle.png') {
      await cropComponents(src, OUT_SPARKLES, 'star', 20);
      await sharp(src).webp({ quality: 88, alphaQuality: 95 }).toFile(dest);
    } else {
      await sharp(src).webp({ quality: 86, alphaQuality: 95 }).toFile(dest);
    }
  }

  // Create favicon.webp (from butterfly-open.png) and og-preview.webp (from couple.png on cream bg)
  await sharp(path.join(ASSETS_DIR, 'butterfly-open.png'))
    .resize(64, 64, { fit: 'contain', background: { r: 255, g: 244, b: 228, alpha: 1 } })
    .webp({ quality: 85 })
    .toFile(path.join(PUBLIC_DIR, 'favicon.webp'));

  const coupleBuf = await sharp(path.join(ASSETS_DIR, 'couple.png'))
    .resize(600, 600, { fit: 'contain', background: { r: 255, g: 244, b: 228, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 255, g: 244, b: 228, alpha: 1 },
    },
  })
    .composite([{ input: coupleBuf, gravity: 'center' }])
    .webp({ quality: 86 })
    .toFile(path.join(PUBLIC_DIR, 'og-preview.webp'));

  console.log('Assets prepared in public/assets/');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
