#!/usr/bin/env node
/**
 * Static export writes HTML that references `/ChaelaWatkins-Portfolio/_next/...`
 * while files live at `out/_next/`. Plain static servers map URL paths to disk
 * literally, so `/ChaelaWatkins-Portfolio/_next/*` would 404 without a matching
 * folder. Symlink `out/ChaelaWatkins-Portfolio` → `out` so local `npx serve out`
 * matches GitHub Pages URL behavior.
 */
import { existsSync, lstatSync, rmSync, symlinkSync } from "node:fs";
import { join } from "node:path";

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
