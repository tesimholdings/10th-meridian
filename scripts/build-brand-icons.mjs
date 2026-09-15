/**
 * Rasterize Stefan's official cream-on-black meridian emblem for browser / home-screen icons.
 *
 * Source of truth: public/brand/tenth-meridian-emblem-icon.png
 * Do not rebuild from public/brand/tenth-meridian-mark.svg — that file is an
 * approximate #c4a264 stroke reconstruction, not the official mark.
 */
import { copyFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const SOURCE = "public/brand/tenth-meridian-emblem-icon.png";
const VOID = { r: 0, g: 0, b: 0, alpha: 1 };
const VOID_HEX = "#000000";
const APP_INSET = 0.2;
const FAVICON_INSET = 0.16;
const CROP_HALO = 2;

async function extractEmblem() {
  const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  const { width, height, channels } = info;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const lum = Math.max(data[i], data[i + 1], data[i + 2]);
      if (data[i + 3] > 20 && lum > 18) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX) {
    throw new Error(`${SOURCE} has no visible emblem pixels`);
  }
  const left = Math.max(0, minX - CROP_HALO);
  const top = Math.max(0, minY - CROP_HALO);
  return sharp(SOURCE)
    .extract({
      left,
      top,
      width: Math.min(width - left, maxX - minX + 1 + CROP_HALO * 2),
      height: Math.min(height - top, maxY - minY + 1 + CROP_HALO * 2),
    })
    .png()
    .toBuffer();
}

function icoFromPngs(pngs) {
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  const entries = [];
  let offset = 6 + 16 * count;
  const bodies = [];
  for (const png of pngs) {
    const entry = Buffer.alloc(16);
    const size = png.meta.width >= 256 ? 0 : png.meta.width;
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.bytes.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    bodies.push(png.bytes);
    offset += png.bytes.length;
  }
  return Buffer.concat([header, ...entries, ...bodies]);
}

function svgFromPng(pngBytes, size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="10th Meridian">
  <title>10th Meridian</title>
  <rect width="${size}" height="${size}" fill="${VOID_HEX}"/>
  <image href="data:image/png;base64,${pngBytes.toString("base64")}" width="${size}" height="${size}"/>
</svg>
`;
}

const emblem = await extractEmblem();

async function png(size, inset) {
  const inner = Math.round(size * (1 - 2 * inset));
  const fitted = await sharp(emblem)
    .resize(inner, inner, {
      fit: "contain",
      background: VOID,
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();
  const bytes = await sharp({
    create: { width: size, height: size, channels: 4, background: VOID },
  })
    .composite([{ input: fitted, gravity: "center" }])
    .png()
    .toBuffer();
  return { bytes, meta: { width: size, height: size } };
}

const rasters = {
  "public/favicon-16x16.png": { size: 16, inset: FAVICON_INSET },
  "public/favicon-32x32.png": { size: 32, inset: FAVICON_INSET },
  "public/apple-touch-icon.png": { size: 180, inset: APP_INSET },
  "src/app/apple-icon.png": { size: 180, inset: APP_INSET },
  "public/icon-192.png": { size: 192, inset: APP_INSET },
  "public/icon-512.png": { size: 512, inset: APP_INSET },
};

for (const [path, { size, inset }] of Object.entries(rasters)) {
  const { bytes } = await png(size, inset);
  writeFileSync(path, bytes);
  console.log(path, bytes.length);
}

const ico = icoFromPngs([await png(16, FAVICON_INSET), await png(32, FAVICON_INSET)]);
writeFileSync("public/favicon.ico", ico);
copyFileSync("public/favicon.ico", "src/app/favicon.ico");
console.log("public/favicon.ico", ico.length);
console.log("src/app/favicon.ico", ico.length);

const svgMaster = await png(256, APP_INSET);
const svg = svgFromPng(svgMaster.bytes, 256);
writeFileSync("public/favicon.svg", svg);
writeFileSync("src/app/icon.svg", svg);
console.log("public/favicon.svg", svg.length);
console.log("src/app/icon.svg", svg.length);
