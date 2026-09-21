import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'

function getExpectedExecutable() {
  switch (process.platform) {
    case 'darwin':
      return 'Electron.app/Contents/MacOS/Electron'
    case 'win32':
      return 'electron.exe'
    default:
      return 'electron'
  }
}

function readExecutablePath(electronDir) {
  const pathFile = path.join(electronDir, 'path.txt')
  if (!fs.existsSync(pathFile)) {
    return null
  }

  return fs.readFileSync(pathFile, 'utf8').trim() || null
}

function isInstalled(electronDir) {
  const executablePath = readExecutablePath(electronDir)
  if (!executablePath) {
    return false
  }

  return fs.existsSync(path.join(electronDir, 'dist', executablePath))
}

async function repairInstall(electronDir, electronRequire) {
  const { downloadArtifact } = electronRequire('@electron/get')
  const packageJsonPath = path.join(electronDir, 'package.json')
  const checksumsPath = path.join(electronDir, 'checksums.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const checksums = JSON.parse(fs.readFileSync(checksumsPath, 'utf8'))
  const distDir = path.join(electronDir, 'dist')
  const zipPath = await downloadArtifact({
    version: packageJson.version,
    artifactName: 'electron',
    platform: process.platform,
    arch: process.arch,
    checksums,
  })

  fs.rmSync(distDir, { recursive: true, force: true })
  fs.mkdirSync(distDir, { recursive: true })

  if (process.platform === 'win32') {
    const expand = spawnSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${distDir.replace(/'/g, "''")}' -Force`,
      ],
      { stdio: 'inherit' }
    )

    if (expand.status !== 0) {
      process.exit(expand.status ?? 1)
    }
  } else {
    const extract = electronRequire('extract-zip')
    await extract(zipPath, { dir: distDir })
  }

  const bundledTypeDefs = path.join(distDir, 'electron.d.ts')
  if (fs.existsSync(bundledTypeDefs)) {
    fs.renameSync(bundledTypeDefs, path.join(electronDir, 'electron.d.ts'))
  }

  fs.writeFileSync(path.join(electronDir, 'path.txt'), getExpectedExecutable())
}

async function main() {
  const require = createRequire(import.meta.url)
  const electronPackageJson = require.resolve('electron/package.json')
  const electronDir = path.dirname(electronPackageJson)
  const electronRequire = createRequire(electronPackageJson)

  if (!isInstalled(electronDir)) {
    await repairInstall(electronDir, electronRequire)
  }

  const executablePath = readExecutablePath(electronDir)
  const expected = getExpectedExecutable()

  if (!executablePath || !fs.existsSync(path.join(electronDir, 'dist', executablePath))) {
    console.error(
      `Electron install completed without a usable binary. Expected ${expected}, got ${executablePath ?? 'missing path.txt'}.`
    )
    process.exit(1)
  }
}

try {
  await main()
} catch (error) {
  console.error(error)
  process.exit(1)
}
