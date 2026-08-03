import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dir = path.join(root, "public", "images", "portal");

// Soft dark vignette that covers the generator watermark in the bottom-right
// corner without cropping the characters.
function cornerVignette(width, height) {
  const w = Math.round(width * 0.22);
  const h = Math.round(height * 0.16);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <radialGradient id="v" cx="1" cy="1" r="1">
      <stop offset="0" stop-color="#05070d" stop-opacity="0.97"/>
      <stop offset="0.55" stop-color="#05070d" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#05070d" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="${width - w}" y="${height - h}" width="${w}" height="${h}" fill="url(#v)"/>
</svg>`;
  return Buffer.from(svg);
}

const jobs = [
  {
    input: path.join(dir, "Rick_and_Morty_cartoon_style_i_2026-08-03T16-36-58.png"),
    outputs: ["hero-desktop-portal.webp"],
  },
  {
    input: path.join(dir, "Rick_and_Morty_cartoon_style_i_2026-08-03T16-15-45.png"),
    outputs: ["hero-mobile-portal.webp"],
  },
];

for (const job of jobs) {
  const base = sharp(job.input);
  const meta = await base.metadata();
  const patched = base.composite([
    { input: cornerVignette(meta.width, meta.height), top: 0, left: 0 },
  ]);
  for (const name of job.outputs) {
    await patched
      .clone()
      .webp({ quality: 88 })
      .toFile(path.join(dir, name));
    console.log("written:", name, `${meta.width}x${meta.height}`);
  }
}
