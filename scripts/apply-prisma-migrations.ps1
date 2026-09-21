param(
  [switch]$MarkInitApplied,
  [switch]$SkipGenerate,
  [string]$InitMigration = "20260322000000_init"
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoDir = Split-Path -Parent $scriptDir

Set-Location $repoDir

Write-Host "== Prisma migration preflight =="
npx prisma validate

if ($MarkInitApplied) {
  Write-Host "== Marking baseline migration as applied: $InitMigration =="
  npx prisma migrate resolve --applied $InitMigration
}

Write-Host "== Deploying pending Prisma migrations =="
npx prisma migrate deploy

if (-not $SkipGenerate) {
  Write-Host "== Regenerating Prisma client =="
  npx prisma generate
}

Write-Host "== Prisma migration flow completed successfully =="
