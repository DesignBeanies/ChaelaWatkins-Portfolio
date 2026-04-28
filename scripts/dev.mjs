#!/usr/bin/env node
/**
 * Starts `next dev` and prints the URL that includes basePath (see next.config.mjs).
 * Without that path, the HTML loads but /_next assets 404 and the app looks broken.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const port = process.env.PORT ?? "3000";
/** Keep in sync with `basePath` in next.config.mjs */
const basePath = "/ChaelaWatkins-Portfolio";

const url = `http://localhost:${port}${basePath}/`;
console.log(`\n  Portfolio (use this URL): ${url}`);
console.log(
  `  If you see 404: run npm run dev:clean and open the URL above (with trailing slash).\n`,
);

const child = spawn(
  "npx",
  ["next", "dev", "-H", "0.0.0.0", "-p", port],
  {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, NODE_ENV: "development" },
  },
);

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
