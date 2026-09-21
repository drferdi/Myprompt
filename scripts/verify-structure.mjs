import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();
const required = [
  "AGENTS.md",
  "README.md",
  "project.contract.json",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "capabilities.json",
  "desktop",
  "lib",
  "prisma/schema.prisma",
  "prisma/migrations",
  "docs",
  "tests",
];

for (const entry of required) {
  try {
    await readFile(join(root, entry));
  } catch (error) {
    if (error.code !== "EISDIR") throw new Error(`Missing required capsule entry: ${entry}`);
  }
}

const manifest = await readFile(join(root, "package.json"), "utf8");
if (/workspace:|file:\.\.[\\/]/u.test(manifest)) {
  throw new Error("Capsule manifest contains a forbidden workspace or parent dependency.");
}

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (/\.(?:[cm]?[jt]sx?|prisma)$/u.test(entry.name)) files.push(fullPath);
  }
  return files;
}

const forbidden = [];
for (const sourceDirectory of ["desktop", "lib", "prisma", "scripts", "data", "types"]) {
  for (const file of await walk(join(root, sourceDirectory))) {
    const content = await readFile(file, "utf8");
    if (/D:\\DEV\\Monorepo|D:\\Devops\\abyss-monorepo/u.test(content)) {
      forbidden.push(relative(root, file));
    }
  }
}
if (forbidden.length > 0) {
  throw new Error(`Forbidden external source reference: ${forbidden.join(", ")}`);
}

console.log("Structural verification passed: Prompt is capsule-local.");
