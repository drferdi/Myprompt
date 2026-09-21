import { access } from "node:fs/promises";
import { join } from "node:path";

for (const artifact of [
  "dist-electron/desktop/bootstrap.js",
  "dist-electron/desktop/renderer/index.html",
]) {
  await access(join(process.cwd(), artifact));
}

console.log("Deploy dry-run passed: desktop artifacts are present.");
