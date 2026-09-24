param([switch]$SkipBuild)
$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
foreach ($name in @('JAVA_HOME', 'ANDROID_HOME', 'NDK_HOME')) {
  $value = [Environment]::GetEnvironmentVariable($name, 'User')
  if (-not $value -or -not (Test-Path -LiteralPath $value)) { throw "Missing $name; see README.md" }
  [Environment]::SetEnvironmentVariable($name, $value, 'Process')
}
Set-Location -LiteralPath $projectRoot
# AF_UNIX connections fail on this Windows host. An unavailable Unix socket
# directory makes OpenJDK PipeImpl fall back to its supported TCP loopback path.
$env:JAVA_TOOL_OPTIONS = "$env:JAVA_TOOL_OPTIONS -Djdk.net.unixdomain.tmpdir=NUL".Trim()
if (-not $SkipBuild) {
  & .\node_modules\.bin\tauri.cmd android build --apk --target aarch64 --ci
  if ($LASTEXITCODE -ne 0) { throw 'Android build failed' }
}
$apk = Get-ChildItem -LiteralPath (Join-Path $projectRoot 'src-tauri\gen\android\app\build\outputs\apk') -Recurse -Filter '*release-unsigned.apk' | Select-Object -First 1
if (-not $apk) { throw 'Release APK not found' }
$signingDir = Join-Path $env:LOCALAPPDATA 'Epic7CalcSigning'
New-Item -ItemType Directory -Force -Path $signingDir | Out-Null
$keyStore = Join-Path $signingDir 'mobile-release.p12'
$passwordFile = Join-Path $signingDir 'password.clixml'
if (-not (Test-Path -LiteralPath $keyStore)) {
  if (Test-Path -LiteralPath $passwordFile) { throw 'Signing key missing; restore it before building updates' }
  $bytes = New-Object byte[] 32
  [Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
  $secure = ConvertTo-SecureString ([Convert]::ToBase64String($bytes)) -AsPlainText -Force
  $secure | Export-Clixml -LiteralPath $passwordFile
  $env:E7_SIGN_PASSWORD = [Net.NetworkCredential]::new('', $secure).Password
  & "$env:JAVA_HOME\bin\keytool.exe" -genkeypair -keystore $keyStore -storetype PKCS12 -storepass:env E7_SIGN_PASSWORD -keypass:env E7_SIGN_PASSWORD -alias epic7-mobile -keyalg RSA -keysize 3072 -validity 10000 -dname 'CN=Epic7 Calc Mobile' -noprompt
  if ($LASTEXITCODE -ne 0) { throw 'Signing key generation failed' }
} else {
  $secure = Import-Clixml -LiteralPath $passwordFile
  $env:E7_SIGN_PASSWORD = [Net.NetworkCredential]::new('', $secure).Password
}
try {
  $release = Join-Path $projectRoot 'release'
  New-Item -ItemType Directory -Force -Path $release | Out-Null
  $version = (Get-Content -LiteralPath 'package.json' -Raw | ConvertFrom-Json).version
  $output = Join-Path $release "Epic7-Calc-Mobile-v$version-arm64.apk"
  & "$env:ANDROID_HOME\build-tools\36.0.0\apksigner.bat" sign --ks $keyStore --ks-key-alias epic7-mobile --ks-pass env:E7_SIGN_PASSWORD --key-pass env:E7_SIGN_PASSWORD --out $output $apk.FullName
  if ($LASTEXITCODE -ne 0) { throw 'APK signing failed' }
  & "$env:ANDROID_HOME\build-tools\36.0.0\apksigner.bat" verify --verbose $output
  if ($LASTEXITCODE -ne 0) { throw 'APK signature verification failed' }
  & "$env:ANDROID_HOME\build-tools\36.0.0\zipalign.exe" -c -P 16 4 $output
  if ($LASTEXITCODE -ne 0) { throw 'APK alignment verification failed' }
  Get-Item -LiteralPath $output | Select-Object FullName, Length | Format-List
  Get-FileHash -LiteralPath $output -Algorithm SHA256 | Format-List
} finally {
  [Environment]::SetEnvironmentVariable('E7_SIGN_PASSWORD', $null, 'Process')
}
