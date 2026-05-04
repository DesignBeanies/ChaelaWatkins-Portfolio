#!/usr/bin/env node
/**
 * When `prodBasePath` is non-empty, static export HTML references `/prefix/_next/...`
 * while files live at `out/_next/`. Plain static servers map paths literally, so local
 * `npx serve out` would 404 unless `out/<prefix>` exists. A symlink `out/<prefix>` → `out`
 * fixes local preview.
 *
 * When `prodBasePath` is empty (custom domain at site root), no symlink is needed.
 *
 * Do NOT create a self-referential symlink in CI: `actions/upload-pages-artifact` archives
 * `out/` and following it recurses until logs/size explode. GitHub Pages maps URLs to
 * `out/` correctly for both project paths and apex custom domains.
 */
import { existsSync, lstatSync, readFileSync, rmSync, symlinkSync } from "node:fs";
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
if (!existsSync(outDir)) {
  console.warn("post-export-basepath-symlink: no out/ — skip");
  process.exit(0);
}

const configSrc = readFileSync(join(process.cwd(), "next.config.mjs"), "utf8");
const m = configSrc.match(/const\s+prodBasePath\s*=\s*["']([^"']*)["']/);
const prodBasePath = m?.[1] ?? "";
const segment = prodBasePath.replace(/^\//, "").replace(/\/$/, "");

if (!segment) {
  console.log(
    "post-export-basepath-symlink: skip (prodBasePath empty — site at domain root)",
  );
  process.exit(0);
}

const linkPath = join(outDir, segment);

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
  console.log(`post-export-basepath-symlink: out/${segment} -> .`);
} catch (e) {
  console.warn("post-export-basepath-symlink:", e instanceof Error ? e.message : e);
  process.exitCode = 0;
}
