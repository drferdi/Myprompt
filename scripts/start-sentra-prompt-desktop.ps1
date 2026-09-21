$ErrorActionPreference = 'Stop'

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$DistRoot = Join-Path $ProjectRoot 'dist-electron\desktop'
$BuildStampPath = Join-Path $DistRoot '.desktop-build.stamp'
$LogPath = Join-Path ([System.IO.Path]::GetTempPath()) 'sentra-prompt-desktop-start.log'

function Ensure-LogDirectory {
  $logDirectory = Split-Path -Parent $LogPath
  if (-not (Test-Path -LiteralPath $logDirectory)) {
    New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
  }
}

function Invoke-Logged {
  param(
    [Parameter(Mandatory = $true)][string]$FilePath,
    [Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments
  )

  Ensure-LogDirectory
  & $FilePath @Arguments *>> $LogPath
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: $FilePath $($Arguments -join ' ')"
  }
}

function Get-ElectronPackageRoot {
  Ensure-LogDirectory
  $packageJsonPath = & node '-p' "require.resolve('electron/package.json')" 2>> $LogPath
  if ($LASTEXITCODE -ne 0 -or -not $packageJsonPath) {
    throw "Unable to resolve electron/package.json. See log: $LogPath"
  }

  return Split-Path -Parent $packageJsonPath.Trim()
}

function Invoke-ElectronInstallScript {
  param(
    [Parameter(Mandatory = $true)][string]$ElectronPackageRoot,
    [switch]$ForceNoCache
  )

  $installScript = Join-Path $ElectronPackageRoot 'install.js'
  if (-not (Test-Path -LiteralPath $installScript)) {
    throw "Electron install script not found: $installScript"
  }

  Push-Location -LiteralPath $ElectronPackageRoot
  try {
    if ($ForceNoCache) {
      $env:force_no_cache = 'true'
    }
    & node $installScript *>> $LogPath
    return $LASTEXITCODE -eq 0
  } finally {
    if ($ForceNoCache) {
      Remove-Item Env:force_no_cache -ErrorAction SilentlyContinue
    }
    Pop-Location
  }
}

function Repair-ElectronInstallFromArtifact {
  param(
    [Parameter(Mandatory = $true)][string]$ElectronPackageRoot
  )

  $artifactProbe = @'
const { downloadArtifact } = require('@electron/get');
const { version } = require('./package.json');

(async () => {
  const zipPath = await downloadArtifact({
    version,
    artifactName: 'electron',
    force: true,
    checksums: require('./checksums.json'),
    platform: process.platform,
    arch: process.arch,
  });
  process.stdout.write(zipPath);
})().catch((error) => {
  console.error(error.stack);
  process.exit(1);
});
'@

  Push-Location -LiteralPath $ElectronPackageRoot
  try {
    $zipPath = $artifactProbe | node - 2>> $LogPath
    if ($LASTEXITCODE -ne 0 -or -not $zipPath) {
      throw "Unable to download Electron artifact. See log: $LogPath"
    }
  } finally {
    Pop-Location
  }

  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $distPath = Join-Path $ElectronPackageRoot 'dist'
  if (Test-Path -LiteralPath $distPath) {
    $resolvedDist = Resolve-Path -LiteralPath $distPath
    if ($resolvedDist.Path -notlike "$ElectronPackageRoot*") {
      throw "Refusing to remove unexpected Electron dist path: $distPath"
    }
    Remove-Item -LiteralPath $distPath -Recurse -Force
  }

  New-Item -ItemType Directory -Force -Path $distPath | Out-Null
  [System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath.Trim(), $distPath, $true)
  Set-Content -LiteralPath (Join-Path $ElectronPackageRoot 'path.txt') -Value 'electron.exe' -NoNewline -Encoding ascii
}

function Test-DesktopBuildFresh {
  $requiredOutputs = @(
    'bootstrap.js',
    'main.js',
    'preload.js',
    'renderer\renderer.js',
    'renderer\index.html',
    'renderer\index.css'
  )

  foreach ($output in $requiredOutputs) {
    if (-not (Test-Path -LiteralPath (Join-Path $DistRoot $output))) {
      return $false
    }
  }
  if (-not (Test-Path -LiteralPath $BuildStampPath)) {
    return $false
  }

  $sourceRoots = @(
    (Join-Path $ProjectRoot 'desktop'),
    (Join-Path $ProjectRoot 'prisma\schema.prisma'),
    (Join-Path $ProjectRoot 'package.json'),
    (Join-Path $ProjectRoot 'tsconfig.desktop.json')
  )
  $sources = foreach ($sourceRoot in $sourceRoots) {
    if (Test-Path -LiteralPath $sourceRoot -PathType Leaf) {
      Get-Item -LiteralPath $sourceRoot
    } elseif (Test-Path -LiteralPath $sourceRoot -PathType Container) {
      Get-ChildItem -LiteralPath $sourceRoot -Recurse -File -Include *.ts,*.html,*.css
    }
  }

  $latestSource = $sources | Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
  $buildStamp = Get-Item -LiteralPath $BuildStampPath

  return $latestSource.LastWriteTimeUtc -le $buildStamp.LastWriteTimeUtc
}

function Test-ElectronInstallHealthy {
  $electronCommand = Join-Path $ProjectRoot 'node_modules\.bin\electron.cmd'
  if (-not (Test-Path -LiteralPath $electronCommand)) {
    return $false
  }

  Ensure-LogDirectory
  & $electronCommand '--version' *>> $LogPath
  return $LASTEXITCODE -eq 0
}

function Repair-ElectronInstall {
  "[$(Get-Date -Format o)] Electron install is unhealthy; rebuilding electron" | Out-File -FilePath $LogPath -Append -Encoding utf8
  $electronPackageRoot = Get-ElectronPackageRoot

  [void](Invoke-ElectronInstallScript -ElectronPackageRoot $electronPackageRoot -ForceNoCache)

  if (-not (Test-ElectronInstallHealthy)) {
    Repair-ElectronInstallFromArtifact -ElectronPackageRoot $electronPackageRoot
  }

  if (-not (Test-ElectronInstallHealthy)) {
    throw "Electron install is still broken after repair. See log: $LogPath"
  }
}

Set-Location -LiteralPath $ProjectRoot
Ensure-LogDirectory
"[$(Get-Date -Format o)] Starting Sentra Prompt Desktop" | Out-File -FilePath $LogPath -Encoding utf8

if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot 'node_modules'))) {
  Invoke-Logged 'corepack' 'pnpm' 'install'
}

if (-not (Test-ElectronInstallHealthy)) {
  Repair-ElectronInstall
}

if (-not (Test-DesktopBuildFresh)) {
  $escapedRoot = [Regex]::Escape($ProjectRoot)
  Get-CimInstance Win32_Process -Filter "Name like '%electron%'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match $escapedRoot } |
    Remove-CimInstance -ErrorAction SilentlyContinue
    
  Invoke-Logged 'corepack' 'pnpm' 'run' 'desktop:build'
  New-Item -ItemType File -Force -Path $BuildStampPath | Out-Null
}

$electronCommand = Join-Path $ProjectRoot 'node_modules\.bin\electron.cmd'
if (-not (Test-Path -LiteralPath $electronCommand)) {
  throw "Electron launcher not found: $electronCommand"
}

$electronProcess = Start-Process `
  -FilePath $electronCommand `
  -ArgumentList @('.\dist-electron\desktop\bootstrap.js') `
  -WorkingDirectory $ProjectRoot `
  -PassThru

if ($env:SENTRA_DESKTOP_SMOKE -eq '1') {
  $electronProcess.WaitForExit()
  exit $electronProcess.ExitCode
}
