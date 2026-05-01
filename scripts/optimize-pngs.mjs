/**
 * Re-encodes PNGs under public/ with max zlib compression.
 * Skips a file if the new buffer would be larger (no bloat).
 * Does not change dimensions, alpha, or other decode-visible semantics.
 */
import { readdir } from "fs/promises";
import { statSync } from "fs";
import { writeFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";

async function* walkPngs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      yield* walkPngs(p);
    } else if (ent.name.toLowerCase().endsWith(".png")) {
      yield p;
    }
  }
}

const root = join(process.cwd(), "public");

/** Case-study comps: copy-only in repo — do not re-encode (preserves alpha / Photoshop export). */
const SKIP_PNG_REENCODE = new Set([
  join(root, "projects", "srp-before.png"),
  join(root, "projects", "srp-after.png"),
]);

let saved = 0;
let n = 0;
for await (const file of walkPngs(root)) {
  if (SKIP_PNG_REENCODE.has(file)) continue;
  const before = statSync(file).size;
  const buf = await sharp(file, { limitInputPixels: false })
    .png({
      compressionLevel: 9,
      effort: 10,
      adaptiveFiltering: true,
    })
    .toBuffer();
  if (buf.length < before) {
    await writeFile(file, buf);
    saved += before - buf.length;
    n += 1;
  }
}
console.log(
  `PNGs: rewrote ${n} file(s), saved ${(saved / 1024 / 1024).toFixed(2)} MiB under public/`,
);
