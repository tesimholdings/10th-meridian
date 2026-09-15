/**
 * Rasterize the official gold meridian emblem for browser / home-screen icons.
 * Does not invent a mark — uses public/brand/tenth-meridian-mark.svg on house black.
 */
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const GOLD = "#c4a264";
const VOID = "#070809";

const emblem = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <rect width="80" height="80" fill="${VOID}"/>
  <g fill="none" stroke="${GOLD}" stroke-linecap="round" stroke-linejoin="round" transform="translate(40 40) scale(1.12) translate(-40 -40)">
    <circle cx="40" cy="40" r="26" stroke-width="2.1"/>
    <path d="M40 14 V66" stroke-width="1.8"/>
    <ellipse cx="40" cy="40" rx="26" ry="10.2" transform="rotate(-48 40 40)" stroke-width="1.85"/>
    <ellipse cx="40" cy="40" rx="26" ry="10.2" transform="rotate(48 40 40)" stroke-width="1.85"/>
    <ellipse cx="40" cy="40" rx="26" ry="7.4" stroke-width="1.05" stroke-dasharray="0.85 2.3"/>
    <ellipse cx="40" cy="40" rx="20.5" ry="20" stroke-width="0.7" stroke-dasharray="0.55 2" opacity="0.75"/>
  </g>
</svg>`;

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

async function png(size) {
  const bytes = await sharp(Buffer.from(emblem))
    .resize(size, size, { fit: "fill" })
    .png()
    .toBuffer();
  return { bytes, meta: { width: size, height: size } };
}

const out = {
  "public/favicon-16x16.png": 16,
  "public/favicon-32x32.png": 32,
  "public/apple-touch-icon.png": 180,
  "public/icon-192.png": 192,
  "public/icon-512.png": 512,
};

for (const [path, size] of Object.entries(out)) {
  const { bytes } = await png(size);
  writeFileSync(path, bytes);
  console.log(path, bytes.length);
}

const ico = icoFromPngs([await png(16), await png(32)]);
writeFileSync("public/favicon.ico", ico);
console.log("public/favicon.ico", ico.length);
