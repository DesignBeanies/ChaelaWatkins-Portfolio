#!/usr/bin/env node
/**
 * Post-build guard: ensures static export emitted Tailwind/CSS and HTML links it
 * under basePath. Run after `npm run build` (CI does this automatically).
 *
 * Does not validate `next dev` — if localhost looks unstyled, see .cursor rule
 * portfolio-styling-sync (wrong URL, port conflict, or stale `.next`).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function fail(message) {
  console.error(`verify-styling: ${message}`);
  process.exit(1);
}

const configPath = join(root, "next.config.mjs");
const configSrc = readFileSync(configPath, "utf8");

const baseMatch = configSrc.match(
  /const\s+prodBasePath\s*=\s*["']([^"']*)["']/,
);
if (!baseMatch) {
  fail('Could not parse prodBasePath from next.config.mjs');
}
const basePath = baseMatch[1];
const hrefNeedle =
  basePath === ""
    ? "/_next/static/css/"
    : `${basePath}/_next/static/css/`;

if (!configSrc.includes('process.argv.includes("build")')) {
  fail(
    'next.config.mjs must gate output: "export" with process.argv.includes("build") — not NODE_ENV alone — or dev CSS may break.',
  );
}

const outDir = join(root, "out");
if (!existsSync(outDir)) {
  fail('Missing out/ — run `npm run build` before verify-styling.');
}

const cssDir = join(outDir, "_next", "static", "css");
if (!existsSync(cssDir)) {
  fail(
    "Missing out/_next/static/css — CSS was not emitted; check Tailwind/postcss and build logs.",
  );
}

const cssFiles = readdirSync(cssDir).filter((f) => f.endsWith(".css"));
if (cssFiles.length === 0) {
  fail("No .css files under out/_next/static/css.");
}

const indexPath = join(outDir, "index.html");
if (!existsSync(indexPath)) {
  fail("Missing out/index.html.");
}

const html = readFileSync(indexPath, "utf8");
if (!html.includes('rel="stylesheet"') || !html.includes(hrefNeedle)) {
  fail(
    `out/index.html must include a stylesheet href under ${hrefNeedle} — basePath/CSS wiring may be wrong.`,
  );
}

console.log(
  `verify-styling: OK (basePath=${basePath === "" ? "(root)" : basePath}, ${cssFiles.length} CSS file(s))`,
);
