import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const source = process.cwd();
const extraction = await mkdtemp(join(tmpdir(), "prompt-capsule-"));
const excluded = new Set(["node_modules", ".next", ".git", ".turbo", "coverage", "dist", "build", "dist-electron"]);

function run(args) {
  const command = process.platform === "win32" ? "pnpm.exe" : "pnpm";
  const result = spawnSync(command, args, {
    cwd: extraction,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    shell: false,
    stdio: "inherit",
  });
  if (result.status !== 0) throw new Error(`Extraction command failed: pnpm ${args.join(" ")}`);
}

try {
  await cp(source, extraction, {
    recursive: true,
    filter: (path) => !excluded.has(path.split(/[\\/]/u).at(-1)),
  });
  run(["install", "--frozen-lockfile"]);
  run(["run", "verify:structure"]);
  run(["run", "lint"]);
  run(["run", "typecheck"]);
  run(["run", "test"]);
  run(["run", "build"]);
  run(["run", "desktop:smoke"]);
  run(["run", "deploy:dry-run"]);
  console.log("Extraction verification passed.");
} finally {
  await rm(extraction, { recursive: true, force: true });
}
