param(
  [string]$SourceRoot = (Join-Path $PSScriptRoot '..\..\e7-tools')
)

$ErrorActionPreference = 'Stop'
$TargetRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$SourceRoot = (Resolve-Path $SourceRoot).Path

# Mobile-owned files such as App.tsx, PrimaryNav.tsx, mobile.css, HeroBuildPage.tsx,
# Rust/Tauri config and package metadata are intentionally absent from this list.
$sharedFiles = @(
  'src\app\models\artifact.ts',
  'src\app\models\forms.ts',
  'src\app\models\hero.ts',
  'src\app\models\skill.ts',
  'src\assets\data\constants.ts',
  'src\assets\data\heroes.ts',
  'src\assets\data\artifacts.ts',
  'src\assets\data\skill_ids.ts',
  'src\assets\i18n\cn.json',
  'src\assets\i18n\us.json',
  'src\calc\damageEngine.ts',
  'src\data\catalog.ts',
  'src\data\aliases.json',
  'src\data\profiles.ts',
  'src\data\recents.ts',
  'src\CalculatorWorkspace.tsx'
)

$sharedDirectories = @(
  'src\features\build-presets',
  'src\features\calculator',
  'src\features\defender-effects',
  'src\library',
  'public\library'
)

foreach ($relativePath in $sharedFiles) {
  $source = Join-Path $SourceRoot $relativePath
  if (-not (Test-Path -LiteralPath $source)) { throw "Missing source file: $source" }
  $target = Join-Path $TargetRoot $relativePath
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target) | Out-Null
  Copy-Item -LiteralPath $source -Destination $target -Force
  Write-Host "Synced $relativePath"
}

foreach ($relativePath in $sharedDirectories) {
  $source = Join-Path $SourceRoot $relativePath
  if (-not (Test-Path -LiteralPath $source)) { throw "Missing source directory: $source" }
  $target = Join-Path $TargetRoot $relativePath
  New-Item -ItemType Directory -Force -Path $target | Out-Null
  Copy-Item -Path (Join-Path $source '*') -Destination $target -Recurse -Force
  Write-Host "Synced $relativePath"
}

$assetSource = Join-Path $SourceRoot 'public\assets'
$assetTarget = Join-Path $TargetRoot 'public\assets'
robocopy $assetSource $assetTarget /E /XD (Join-Path $assetSource 'ocr') /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "Asset sync failed with robocopy exit code $LASTEXITCODE" }

& node (Join-Path $PSScriptRoot 'prune-mobile-artworks.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Mobile artwork pruning failed' }
Write-Host 'Mobile shared-data sync completed. Unused artworks excluded; mobile shell and Android files preserved.'
