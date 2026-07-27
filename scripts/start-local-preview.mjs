import { openSync } from "node:fs";
import { spawn } from "node:child_process";

const cwd = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1").replaceAll("/", "\\");
const log = openSync(new URL("../.codex-dev.log", import.meta.url), "a");
const child = spawn(process.execPath, [
  new URL("../node_modules/vinext/dist/cli.js", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1").replaceAll("/", "\\"),
  "dev",
  "--hostname",
  "0.0.0.0",
  "--port",
  "3000",
], {
  cwd,
  detached: true,
  windowsHide: true,
  stdio: ["ignore", log, log],
});

child.unref();
console.log(child.pid);
