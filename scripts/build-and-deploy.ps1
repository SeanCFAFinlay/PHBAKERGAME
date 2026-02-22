param(
  [switch]$Preview,
  [switch]$DeployProd
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
  Write-Host ""
  Write-Host "=== $Message ==="
}

function Assert-Command([string]$Name) {
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $cmd) { throw "Missing required command: $Name" }
}

function Remove-Utf8Bom([string]$FullPath) {
  if (-not (Test-Path -Path $FullPath -PathType Leaf)) { return }

  [byte[]]$bytes = [System.IO.File]::ReadAllBytes($FullPath)
  if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    [System.IO.File]::WriteAllBytes($FullPath, $bytes[3..($bytes.Length-1)])
    Write-Host "Removed UTF-8 BOM: $FullPath"
  }
}

Write-Step "Validate tools"
Assert-Command "git"
Assert-Command "node"
Assert-Command "npm"
Assert-Command "vercel"

Write-Step "Resolve project paths"
$repoRoot = "C:\Users\sean\PHBAKERGAME"
$appRoot  = Join-Path $repoRoot "bakery-battle"

if (-not (Test-Path -Path $appRoot -PathType Container)) {
  throw "App folder not found: $appRoot"
}

$pkg = Join-Path $appRoot "package.json"
$lock = Join-Path $appRoot "package-lock.json"

Write-Step "Verify app files exist"
if (-not (Test-Path -Path $pkg -PathType Leaf))  { throw "Missing: $pkg" }
if (-not (Test-Path -Path $lock -PathType Leaf)) { throw "Missing: $lock" }

Write-Step "Normalize encoding (prevent JSON/PostCSS failures)"
Remove-Utf8Bom -FullPath $pkg
Remove-Utf8Bom -FullPath $lock
Remove-Utf8Bom -FullPath (Join-Path $appRoot "vercel.json")
Remove-Utf8Bom -FullPath (Join-Path $appRoot "tsconfig.json")
Remove-Utf8Bom -FullPath (Join-Path $appRoot "vite.config.ts")

Write-Step "Confirm package.json is valid JSON"
Set-Location -Path $appRoot
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"

Write-Step "Install dependencies (clean + deterministic)"
$nodeModules = Join-Path $appRoot "node_modules"
if (Test-Path -Path $nodeModules) {
  Remove-Item -Path $nodeModules -Recurse -Force
}

npm ci

Write-Step "Typecheck + build"
npm run build

if ($Preview) {
  Write-Step "Preview (press Ctrl+C to stop)"
  npm run preview -- --host 127.0.0.1 --port 4173
}

if ($DeployProd) {
  Write-Step "Deploy to Vercel (production)"
  vercel deploy --prod
}

Write-Step "Done"
