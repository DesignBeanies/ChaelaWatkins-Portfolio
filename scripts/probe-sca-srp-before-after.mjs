/**
 * Validates SCA (recruiter) and SRP (designer) before/after assets:
 * files decode, dimensions, extension vs encoded format, optional HTTP via dev.
 *
 * Usage:
 *   node scripts/probe-sca-srp-before-after.mjs
 *   node scripts/probe-sca-srp-before-after.mjs --http   # 127.0.0.1:3000 (tries / then prod basePath)
 *   node scripts/probe-sca-srp-before-after.mjs --strict   # JPEG-in-.png becomes exit 1, not warning
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const root = join(repoRoot, "public", "projects");

function readProdBasePath() {
  const src = readFileSync(join(repoRoot, "next.config.mjs"), "utf8");
  const m = src.match(/const\s+prodBasePath\s*=\s*["']([^"']+)["']/);
  return m?.[1] ?? "";
}

const PAIRS = [
  {
    name: "SCA (Credit application — recruiter lens)",
    before: "sca-before.png",
    after: "sca-after.png",
  },
  {
    name: "SRP (tile redesign — designer lens)",
    before: "srp-before.png",
    after: "srp-after.png",
  },
];

function aspect(w, h) {
  return w / h;
}

function extMismatch(encoded, filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "png" && encoded === "jpeg") {
    return "file is JPEG data but uses .png extension — rename to .jpg or re-export as PNG";
  }
  if (ext === "jpg" || ext === "jpeg") {
    if (encoded === "png") {
      return "file is PNG data but uses .jpg extension";
    }
  }
  return null;
}

async function meta(file) {
  const p = join(root, file);
  if (!existsSync(p)) {
    return { path: p, ok: false, error: "missing file" };
  }
  try {
    const head = readFileSync(p, { start: 0, end: 11 });
    const isJpeg = head[0] === 0xff && head[1] === 0xd8;
    const isPng =
      head[0] === 0x89 &&
      head[1] === 0x50 &&
      head[2] === 0x4e &&
      head[3] === 0x47;

    const m = await sharp(p).metadata();
    const { width, height, format } = m;
    if (!width || !height) {
      return { path: p, ok: false, error: "no width/height" };
    }
    const mismatch = extMismatch(format, file);
    const magicMismatch =
      !isJpeg && !isPng ? "unrecognized magic bytes" : null;
    return {
      path: p,
      ok: true,
      width,
      height,
      format,
      aspect: aspect(width, height),
      extMismatch: mismatch,
      magicMismatch,
    };
  } catch (e) {
    return { path: p, ok: false, error: String(e?.message || e) };
  }
}

async function checkHttp(relPath, basePrefix) {
  const pathWithBase = `${basePrefix}${relPath}`;
  const url = `http://127.0.0.1:3000${pathWithBase}`;
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 4000);
  try {
    const r = await fetch(url, { signal: ac.signal });
    clearTimeout(t);
    return {
      url,
      pathWithBase,
      status: r.status,
      ok: r.ok,
      ct: r.headers.get("content-type"),
    };
  } catch (e) {
    clearTimeout(t);
    return { url, pathWithBase, ok: false, error: String(e?.message || e) };
  }
}

const wantHttp = process.argv.includes("--http");
const strict = process.argv.includes("--strict");

let exit = 0;
const errors = [];
const warnings = [];

for (const pair of PAIRS) {
  console.log(`\n── ${pair.name} ──`);
  const b = await meta(pair.before);
  const a = await meta(pair.after);
  console.log(
    "before:",
    b.ok
      ? `${b.width}×${b.height} (encoded ${b.format})${b.extMismatch ? " ⚠" : ""}`
      : b.error,
  );
  console.log(
    "after: ",
    a.ok
      ? `${a.width}×${a.height} (encoded ${a.format})${a.extMismatch ? " ⚠" : ""}`
      : a.error,
  );

  if (!b.ok) {
    errors.push(`${pair.name}: before — ${b.error}`);
    exit = 1;
  }
  if (!a.ok) {
    errors.push(`${pair.name}: after — ${a.error}`);
    exit = 1;
  }
  if (b.ok && b.extMismatch) {
    const msg = `${pair.name}: before — ${b.extMismatch}`;
    if (strict) {
      errors.push(msg);
      exit = 1;
    } else {
      warnings.push(msg);
    }
  }
  if (a.ok && a.extMismatch) {
    const msg = `${pair.name}: after — ${a.extMismatch}`;
    if (strict) {
      errors.push(msg);
      exit = 1;
    } else {
      warnings.push(msg);
    }
  }
  if (b.ok && b.magicMismatch) {
    errors.push(`${pair.name}: before — ${b.magicMismatch}`);
    exit = 1;
  }
  if (a.ok && a.magicMismatch) {
    errors.push(`${pair.name}: after — ${a.magicMismatch}`);
    exit = 1;
  }

  if (b.ok && a.ok) {
    const ra = Math.abs(b.aspect - a.aspect) / Math.max(b.aspect, a.aspect);
    if (ra > 0.12) {
      warnings.push(
        `${pair.name}: before/after aspect ratios differ by ${(ra * 100).toFixed(1)}% (before ${b.aspect.toFixed(3)}, after ${a.aspect.toFixed(3)}) — check side-by-side layout`,
      );
    }
    const rw = Math.abs(b.width - a.width) / Math.max(b.width, a.width);
    const rh = Math.abs(b.height - a.height) / Math.max(b.height, a.height);
    if (rw > 0.25 || rh > 0.25) {
      warnings.push(
        `${pair.name}: large pixel-size gap (before ${b.width}×${b.height} vs after ${a.width}×${a.height})`,
      );
    }
  }
}

if (wantHttp) {
  const prodBase = readProdBasePath();
  /** `next dev` uses ""; `next start` / preview often use prodBasePath. */
  const prefixes = ["", prodBase].filter(
    (p, i, a) => p === "" || (p && a.indexOf(p) === i),
  );
  console.log("\n── HTTP (127.0.0.1:3000) ──");
  const paths = [
    "/projects/sca-before.png",
    "/projects/sca-after.png",
    "/projects/srp-before.png",
    "/projects/srp-after.png",
  ];
  for (const p of paths) {
    let last = null;
    for (const prefix of prefixes) {
      last = await checkHttp(p, prefix);
      if (last.ok && last.status === 200) break;
    }
    const h = last;
    if (h.ok && h.status === 200) {
      console.log(`${h.pathWithBase} → ${h.status} ${h.ct || ""}`);
    } else {
      console.log(`${p} →`, h.error || `status ${h.status}`);
      errors.push(`HTTP ${p}: ${h.error || `status ${h.status}`}`);
      exit = 1;
    }
  }
} else {
  console.log("\n(skip HTTP; pass --http with server on :3000)");
}

if (warnings.length) {
  console.log("\nWarnings:");
  for (const w of warnings) console.log(" -", w);
}
if (errors.length) {
  console.log("\nErrors:");
  for (const e of errors) console.log(" -", e);
}

if (!errors.length) {
  console.log(
    warnings.length
      ? "\nDone — no blocking errors (see warnings)."
      : "\nOK — no issues detected for SCA/SRP before+after assets.",
  );
}

process.exit(exit);
