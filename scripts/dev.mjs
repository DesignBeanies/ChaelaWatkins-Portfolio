#!/usr/bin/env node
/**
 * Starts `next dev`. Config uses `basePath: ""` in dev so the app runs at `/`
 * (see next.config.mjs); without that, opening `/` while `_next` expects a path prefix breaks hydration.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const port = process.env.PORT ?? "3000";

const url = `http://localhost:${port}/`;
console.log(`\n  Portfolio dev (open this URL): ${url}`);
console.log(
  `  If styles/clicks break: rm -rf .next && npm run dev; production: https://designbeanies.com/.\n`,
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
