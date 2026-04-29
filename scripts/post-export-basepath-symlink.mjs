#!/usr/bin/env node
/**
 * Static export writes HTML that references `/ChaelaWatkins-Portfolio/_next/...`
 * while files live at `out/_next/`. Plain static servers map URL paths to disk
 * literally, so local `npx serve out` would 404 on those URLs unless
 * `out/ChaelaWatkins-Portfolio/...` exists. A symlink `out/ChaelaWatkins-Portfolio` → `out`
 * fixes local preview.
 *
 * Do NOT create that symlink in CI: `actions/upload-pages-artifact` archives `out/`
 * and following a self-referential symlink recurses until logs/size explode.
 * GitHub Pages serves the artifact root at `/<repo>/`, so `out/_next` already maps to
 * `/<repo>/_next` — no symlink needed for deployment.
 */
import { existsSync, lstatSync, rmSync, symlinkSync } from "node:fs";
import { join } from "node:path";

const skipSymlink =
  process.env.CI === "true" || process.env.SKIP_BASEPATH_SYMLINK === "1";

if (skipSymlink) {
  console.log(
    "post-export-basepath-symlink: skip (CI or SKIP_BASEPATH_SYMLINK — not needed for Pages upload)",
  );
  process.exit(0);
}

const outDir = join(process.cwd(), "out");
const linkPath = join(outDir, "ChaelaWatkins-Portfolio");

if (!existsSync(outDir)) {
  console.warn("post-export-basepath-symlink: no out/ — skip");
  process.exit(0);
}

if (existsSync(linkPath)) {
  try {
    const st = lstatSync(linkPath);
    if (st.isSymbolicLink()) {
      rmSync(linkPath);
    } else if (st.isDirectory()) {
      rmSync(linkPath, { recursive: true });
    }
  } catch {
    // ignore
  }
}

try {
  symlinkSync(".", linkPath);
  console.log("post-export-basepath-symlink: out/ChaelaWatkins-Portfolio -> .");
} catch (e) {
  console.warn("post-export-basepath-symlink:", e instanceof Error ? e.message : e);
  process.exitCode = 0;
}
