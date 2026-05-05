#!/usr/bin/env node
/**
 * Starts `next dev`. Config uses `basePath: ""` in dev so the app runs at `/`
 * (see next.config.mjs); without that, opening `/` while `_next` expects a path prefix breaks hydration.
 *
 * On macOS, native file watchers often hit EMFILE ("too many open files"), Next only
 * compiles `/_not-found`, and every route 404s. We mitigate by:
 * - Raising the soft `ulimit -n` when spawning the dev server (best-effort).
 * - Setting `WATCHPACK_POLLING=true` so webpack polls instead of one watch descriptor per file.
 *
 * Disable polling: `PORTFOLIO_DEV_POLLING=false npm run dev`
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const rawPort = process.env.PORT ?? "3000";
const port = /^\d+$/.test(String(rawPort)) ? String(rawPort) : "3000";

const url = `http://localhost:${port}/`;
console.log(`\n  Portfolio dev (open this URL): ${url}`);
console.log(
  `  If styles/clicks break: rm -rf .next && npm run dev; production: https://designbeanies.com/.\n`,
);

const env = {
  ...process.env,
  NODE_ENV: "development",
};

const pollingOff = process.env.PORTFOLIO_DEV_POLLING === "false";
if (!pollingOff && process.env.WATCHPACK_POLLING === undefined) {
  env.WATCHPACK_POLLING = "true";
}

if (process.platform === "darwin" && !pollingOff) {
  console.log(
    "  Dev: WATCHPACK_POLLING=true (avoids macOS EMFILE / 404 routes). Set PORTFOLIO_DEV_POLLING=false to disable.\n",
  );
}

function spawnDev() {
  if (process.platform === "darwin") {
    // Best-effort raise open-file limit; then replace shell with next dev.
    const cmd = `ulimit -n 10240 2>/dev/null; exec npx next dev -H 0.0.0.0 -p "${port}"`;
    return spawn("sh", ["-c", cmd], {
      cwd: root,
      stdio: "inherit",
      env,
    });
  }
  return spawn("npx", ["next", "dev", "-H", "0.0.0.0", "-p", port], {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env,
  });
}

const child = spawnDev();

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
