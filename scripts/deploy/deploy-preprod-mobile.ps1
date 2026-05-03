#Requires -Version 5.1
[CmdletBinding()]
param(
    [string]$SshHost = $env:CAR_PREPROD_SSH_HOST,
    [string]$SshKey = $env:CAR_PREPROD_SSH_KEY,
    [string]$RemoteSiteDir = $env:CAR_PREPROD_REMOTE_SITE_DIR,
    [string]$PublicBaseUrl = $env:CAR_PREPROD_PUBLIC_BASE_URL,
    [string]$AnalyticsOrigin = $env:CAR_PREPROD_ANALYTICS_ORIGIN,
    [string]$ApiBaseUrl = '/api',
    [switch]$SkipBuild
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '../..')
. (Join-Path $PSScriptRoot 'local-env.ps1')
Import-CarLocalEnv -RepoRoot $repoRoot

$SshHost = Resolve-CarSetting -CurrentValue $SshHost -EnvName 'CAR_PREPROD_SSH_HOST' -Message '缺少 SshHost'
$SshKey = Resolve-CarSetting -CurrentValue $SshKey -EnvName 'CAR_PREPROD_SSH_KEY' -Message '缺少 SshKey'
$RemoteSiteDir = Resolve-CarSetting -CurrentValue $RemoteSiteDir -EnvName 'CAR_PREPROD_REMOTE_SITE_DIR' -Message '缺少 RemoteSiteDir'
$PublicBaseUrl = Resolve-CarSetting -CurrentValue $PublicBaseUrl -EnvName 'CAR_PREPROD_PUBLIC_BASE_URL' -Message '缺少 PublicBaseUrl'

function Invoke-CheckedNativeCommand {
    param(
        [Parameter(Mandatory = $true)][scriptblock]$Command,
        [Parameter(Mandatory = $true)][string]$ErrorMessage
    )

    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "$ErrorMessage，退出码：$LASTEXITCODE"
    }
}

function Invoke-RemoteScript {
    param([Parameter(Mandatory = $true)][string]$Script)

    $localScript = Join-Path $env:TEMP ("car-deploy-mobile-{0}.sh" -f ([guid]::NewGuid().ToString('N')))
    $remoteScriptPath = "/tmp/car-deploy-mobile-$([guid]::NewGuid().ToString('N')).sh"
    try {
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($localScript, ($Script -replace "`r`n", "`n"), $utf8NoBom)
        scp -i $SshKey $localScript "${SshHost}:$remoteScriptPath" | Out-Host
        ssh -i $SshKey $SshHost "bash '$remoteScriptPath'; code=`$?; rm -f '$remoteScriptPath'; exit `$code"
        if ($LASTEXITCODE -ne 0) {
            throw "远端移动端静态部署失败，退出码：$LASTEXITCODE"
        }
    }
    finally {
        if (Test-Path -LiteralPath $localScript) {
            Remove-Item -LiteralPath $localScript -Force
        }
    }
}

function Get-MobileEntryAssets {
    param([Parameter(Mandatory = $true)][string]$IndexHtmlPath)

    $indexHtml = Get-Content -LiteralPath $IndexHtmlPath -Raw
    $matches = [regex]::Matches($indexHtml, "(?:src|href)=`"/?(assets/[^`"?#]+)")
    $assets = @($matches | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique)
    if ($assets.Count -eq 0) {
        throw "移动端构建产物缺少 assets 入口引用：$IndexHtmlPath"
    }

    return $assets
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '../..')
$distDir = Join-Path $repoRoot 'apps/mobile/dist'
$indexHtmlPath = Join-Path $distDir 'index.html'

if (-not $SkipBuild) {
    $previousApiBaseUrl = $env:VITE_API_BASE_URL
    $previousAnalyticsEnv = $env:VITE_CAR_ANALYTICS_ENV
    $previousAnalyticsOrigin = $env:VITE_CAR_ANALYTICS_ORIGIN
    Push-Location $repoRoot
    try {
        $env:VITE_API_BASE_URL = $ApiBaseUrl
        $env:VITE_CAR_ANALYTICS_ENV = 'preprod'
        if (-not [string]::IsNullOrWhiteSpace($AnalyticsOrigin)) {
            $env:VITE_CAR_ANALYTICS_ORIGIN = $AnalyticsOrigin
        }
        Invoke-CheckedNativeCommand -Command { pnpm build:mobile } -ErrorMessage '移动端构建失败'
    }
    finally {
        if ($null -eq $previousApiBaseUrl) {
            Remove-Item Env:VITE_API_BASE_URL -ErrorAction SilentlyContinue
        }
        else {
            $env:VITE_API_BASE_URL = $previousApiBaseUrl
        }
        if ($null -eq $previousAnalyticsEnv) {
            Remove-Item Env:VITE_CAR_ANALYTICS_ENV -ErrorAction SilentlyContinue
        }
        else {
            $env:VITE_CAR_ANALYTICS_ENV = $previousAnalyticsEnv
        }
        if ($null -eq $previousAnalyticsOrigin) {
            Remove-Item Env:VITE_CAR_ANALYTICS_ORIGIN -ErrorAction SilentlyContinue
        }
        else {
            $env:VITE_CAR_ANALYTICS_ORIGIN = $previousAnalyticsOrigin
        }
        Pop-Location
    }
}

if (-not (Test-Path -LiteralPath $indexHtmlPath)) {
    throw "移动端构建产物不存在：$indexHtmlPath"
}

$localApiLeak = Get-ChildItem -LiteralPath $distDir -Recurse -File |
    Select-String -Pattern '127.0.0.1:8001' -SimpleMatch -List
if ($localApiLeak) {
    throw "移动端构建产物仍包含本地 API 地址：$($localApiLeak.Path)"
}

$entryAssets = Get-MobileEntryAssets -IndexHtmlPath $indexHtmlPath

$archivePath = Join-Path $env:TEMP ("car-mobile-dist-{0}.tgz" -f ([guid]::NewGuid().ToString('N')))
try {
    Push-Location $distDir
    try {
        Invoke-CheckedNativeCommand -Command { tar -czf $archivePath . } -ErrorMessage '移动端构建产物打包失败'
    }
    finally {
        Pop-Location
    }

    $remoteArchive = "/tmp/car-mobile-dist-$([guid]::NewGuid().ToString('N')).tgz"
    Invoke-CheckedNativeCommand -Command { scp -i $SshKey $archivePath "${SshHost}:$remoteArchive" } -ErrorMessage '移动端构建产物上传失败'

    $remoteScript = @(
        'set -euo pipefail',
        "SITE_DIR='$RemoteSiteDir'",
        "ARCHIVE='$remoteArchive'",
        "BACKUP_DIR='/srv/apps/car-platform/backups'",
        'STAMP=$(date +%Y%m%d%H%M%S)',
        'mkdir -p "$SITE_DIR" "$BACKUP_DIR"',
        '',
        "SITE_DIR_EXPECTED='$RemoteSiteDir'",
        'SITE_DIR_REAL=$(realpath -m "$SITE_DIR")',
        'SITE_DIR_EXPECTED_REAL=$(realpath -m "$SITE_DIR_EXPECTED")',
        'if [ "$SITE_DIR_REAL" != "$SITE_DIR_EXPECTED_REAL" ]; then',
        '  echo "unexpected site dir: $SITE_DIR_REAL" >&2',
        '  exit 1',
        'fi',
        '',
        'if [ -d "$SITE_DIR" ] && [ "$(find "$SITE_DIR" -mindepth 1 -maxdepth 1 | wc -l)" -gt 0 ]; then',
        '  sudo tar -czf "$BACKUP_DIR/site-$STAMP.tgz" -C "$SITE_DIR" .',
        '  echo "SITE_BACKUP=$BACKUP_DIR/site-$STAMP.tgz"',
        'fi',
        '',
        'TMP_DIR=$(mktemp -d)',
        'trap ''rm -rf "$TMP_DIR" "$ARCHIVE"'' EXIT',
        'tar -xzf "$ARCHIVE" -C "$TMP_DIR"',
        'test -f "$TMP_DIR/index.html"',
        '',
        'sudo find "$SITE_DIR" -mindepth 1 -maxdepth 1 ! -name admin -exec rm -rf {} +',
        'sudo cp -a "$TMP_DIR"/. "$SITE_DIR"/',
        'sudo chown -R ubuntu:ubuntu "$SITE_DIR"',
        '',
        'echo "MOBILE_SITE_DIR=$SITE_DIR"',
        'echo "MOBILE_INDEX_ASSETS="',
        'grep -Eo "assets/[^\"? ]+" "$SITE_DIR/index.html" | sort -u'
    ) -join "`n"

    Invoke-RemoteScript -Script $remoteScript
}
finally {
    if (Test-Path -LiteralPath $archivePath) {
        Remove-Item -LiteralPath $archivePath -Force
    }
}

$publicIndex = (curl.exe -fsS -H 'Cache-Control: no-cache' "$PublicBaseUrl/") -join "`n"
foreach ($asset in $entryAssets) {
    if ($publicIndex -notmatch [regex]::Escape($asset)) {
        throw "公网首页未切到本轮移动端产物：缺少 $asset"
    }

    $assetUrl = "$($PublicBaseUrl.TrimEnd('/'))/$asset"
    $assetContent = (curl.exe -fsS -H 'Cache-Control: no-cache' $assetUrl) -join "`n"
    if ($assetContent -match '127\.0\.0\.1:8001') {
        throw "公网移动端资源仍包含本地 API 地址：$assetUrl"
    }
}

$joinedEntryAssets = $entryAssets -join ','
Write-Output "PUBLIC_MOBILE_ENTRY_ASSETS=$joinedEntryAssets"
