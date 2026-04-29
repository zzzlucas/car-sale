#Requires -Version 5.1
[CmdletBinding()]
param(
    [string]$SshHost = 'ubuntu@124.222.31.238',
    [string]$SshKey = 'C:/Users/Lucas/.ssh/id_ed25519',
    [string]$RemoteAppDir = '/srv/apps/car-platform/app',
    [string]$LocalEnvPath = 'apps/backend/.env.preprod',
    [switch]$SkipAmapKeys,
    [switch]$NoRestart
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

function Read-EnvFile {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "本地 env 文件不存在: $Path"
    }

    $values = [ordered]@{}
    foreach ($line in Get-Content -LiteralPath $Path) {
        $trimmed = $line.Trim()
        if ([string]::IsNullOrWhiteSpace($trimmed) -or $trimmed.StartsWith('#')) {
            continue
        }
        $match = [regex]::Match($trimmed, '^(?:export\s+)?(?<key>[A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?<value>.*)$')
        if ($match.Success) {
            $values[$match.Groups['key'].Value] = $match.Groups['value'].Value.Trim()
        }
    }
    return $values
}

function Add-EnvLine {
    param(
        [System.Collections.Generic.List[string]]$Lines,
        [Parameter(Mandatory = $true)][string]$Key,
        [Parameter(Mandatory = $true)][string]$Value
    )

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return
    }
    $Lines.Add("$Key=$Value")
}

$localEnv = Read-EnvFile -Path $LocalEnvPath
$updateLines = New-Object System.Collections.Generic.List[string]

$mapProvider = if ($localEnv.Contains('MAP_SERVICE_PROVIDER') -and -not [string]::IsNullOrWhiteSpace([string]$localEnv['MAP_SERVICE_PROVIDER'])) {
    [string]$localEnv['MAP_SERVICE_PROVIDER']
}
else {
    'tianditu'
}
$mapProvider = $mapProvider.Trim().ToLowerInvariant()
if ($mapProvider -ne 'tianditu' -and $mapProvider -ne 'amap' -and $mapProvider -ne 'amap-proxy' -and $mapProvider -ne 'amap-official') {
    throw "MAP_SERVICE_PROVIDER 只允许 tianditu、amap-official、amap 或 amap-proxy，当前值: $mapProvider"
}
Add-EnvLine -Lines $updateLines -Key 'MAP_SERVICE_PROVIDER' -Value $mapProvider

$tiandituKeys = [string]($localEnv['TIANDITU_WEB_SERVICE_KEYS'])
if ($mapProvider -eq 'tianditu' -and ([string]::IsNullOrWhiteSpace($tiandituKeys) -or $tiandituKeys -like '<*' -or $tiandituKeys -eq 'change-me')) {
    throw "请先在 $LocalEnvPath 填写真实 TIANDITU_WEB_SERVICE_KEYS，或将 MAP_SERVICE_PROVIDER 改为 amap-official/amap-proxy。"
}
if (-not [string]::IsNullOrWhiteSpace($tiandituKeys) -and $tiandituKeys -notlike '<*' -and $tiandituKeys -ne 'change-me') {
    Add-EnvLine -Lines $updateLines -Key 'TIANDITU_WEB_SERVICE_KEYS' -Value $tiandituKeys
}

$tiandituDefaults = [ordered]@{
    TIANDITU_WEB_SERVICE_TIMEOUT_MS = '2500'
    TIANDITU_WEB_SERVICE_ACCESS = 'browser'
    TIANDITU_WEB_SERVICE_REFERER = 'https://name10.lucasishere.top/'
}

foreach ($entry in $tiandituDefaults.GetEnumerator()) {
    $value = if ($localEnv.Contains($entry.Key) -and -not [string]::IsNullOrWhiteSpace([string]$localEnv[$entry.Key])) {
        [string]$localEnv[$entry.Key]
    }
    else {
        [string]$entry.Value
    }
    Add-EnvLine -Lines $updateLines -Key $entry.Key -Value $value
}

if (($mapProvider -eq 'amap' -or $mapProvider -eq 'amap-proxy' -or $mapProvider -eq 'amap-official') -and -not $SkipAmapKeys) {
    $amapKeys = [string]($localEnv['AMAP_WEB_SERVICE_KEYS'])
    if ([string]::IsNullOrWhiteSpace($amapKeys) -or $amapKeys -like '<*') {
        throw "请先在 $LocalEnvPath 填写真实 AMAP_WEB_SERVICE_KEYS，或加 -SkipAmapKeys 只更新非密钥中转站变量。"
    }
    Add-EnvLine -Lines $updateLines -Key 'AMAP_WEB_SERVICE_KEYS' -Value $amapKeys
}

$proxyDefaults = [ordered]@{
    AMAP_WEB_SERVICE_TIMEOUT_MS = '2500'
    AMAP_WEB_SERVICE_PROXY_BASE_URL = 'https://amap.bangban.cc/_AMapService'
    AMAP_WEB_SERVICE_PROXY_APPNAME = 'https%3A%2F%2Famap.bangban.cc%2Fdt.html'
    AMAP_WEB_SERVICE_PROXY_CALLBACK = 'jsonp_test'
    AMAP_WEB_SERVICE_PROXY_REFERER = 'https://amap.bangban.cc/dt.html'
    AMAP_WEB_SERVICE_PROXY_X_REQUESTED_WITH = 'com.bangban.cc'
}

foreach ($entry in $proxyDefaults.GetEnumerator()) {
    $value = if ($localEnv.Contains($entry.Key) -and -not [string]::IsNullOrWhiteSpace([string]$localEnv[$entry.Key])) {
        [string]$localEnv[$entry.Key]
    }
    else {
        [string]$entry.Value
    }
    Add-EnvLine -Lines $updateLines -Key $entry.Key -Value $value
}

$cosRequiredKeys = @(
    'COS_REGION',
    'COS_BUCKET',
    'COS_APP_ID',
    'COS_SECRET_ID',
    'COS_SECRET_KEY'
)
foreach ($key in $cosRequiredKeys) {
    $value = [string]($localEnv[$key])
    if ([string]::IsNullOrWhiteSpace($value) -or $value -like '<*' -or $value -eq 'change-me') {
        throw "请先在 $LocalEnvPath 填写真实 $key。"
    }
    Add-EnvLine -Lines $updateLines -Key $key -Value $value
}

$cosUploadPrefix = if ($localEnv.Contains('COS_UPLOAD_PREFIX') -and -not [string]::IsNullOrWhiteSpace([string]$localEnv['COS_UPLOAD_PREFIX'])) {
    [string]$localEnv['COS_UPLOAD_PREFIX']
}
else {
    'car-platform-preprod/'
}
Add-EnvLine -Lines $updateLines -Key 'COS_UPLOAD_PREFIX' -Value $cosUploadPrefix

if ($localEnv.Contains('COS_SIGN_EXPIRES') -and -not [string]::IsNullOrWhiteSpace([string]$localEnv['COS_SIGN_EXPIRES'])) {
    Add-EnvLine -Lines $updateLines -Key 'COS_SIGN_EXPIRES' -Value ([string]$localEnv['COS_SIGN_EXPIRES'])
}

$aiRequiredKeys = @(
    'AI_SUPPORT_PROVIDER',
    'AI_SUPPORT_BASE_URL',
    'AI_SUPPORT_API_KEYS',
    'AI_SUPPORT_MODEL'
)
foreach ($key in $aiRequiredKeys) {
    $value = [string]($localEnv[$key])
    if ([string]::IsNullOrWhiteSpace($value) -or $value -like '<*' -or $value -eq 'change-me') {
        throw "请先在 $LocalEnvPath 填写真实 $key。"
    }
    Add-EnvLine -Lines $updateLines -Key $key -Value $value
}

$aiOptionalKeys = @(
    'AI_SUPPORT_TIMEOUT_MS',
    'AI_SUPPORT_LEVEL1_ALLOWLIST',
    'AI_SUPPORT_FALLBACK_API_KEYS',
    'AI_SUPPORT_DAILY_LIMIT'
)
foreach ($key in $aiOptionalKeys) {
    if ($localEnv.Contains($key) -and -not [string]::IsNullOrWhiteSpace([string]$localEnv[$key])) {
        Add-EnvLine -Lines $updateLines -Key $key -Value ([string]$localEnv[$key])
    }
}

$tempFile = Join-Path $env:TEMP ("car-preprod-env-{0}.env" -f ([guid]::NewGuid().ToString('N')))
$localScript = $null
try {
    $updateLines | Set-Content -LiteralPath $tempFile -Encoding UTF8
    $remoteTemp = "/tmp/car-preprod-env-$([guid]::NewGuid().ToString('N')).env"
    scp -i $SshKey $tempFile "${SshHost}:$remoteTemp" | Out-Host

    $restartFlag = if ($NoRestart) { '0' } else { '1' }
    $remoteScript = @"
set -euo pipefail
APP_DIR='$RemoteAppDir'
ENV_FILE="`$APP_DIR/apps/backend/.env.production.local"
UPDATE_FILE='$remoteTemp'
BACKUP_DIR='/srv/apps/car-platform/backups'
STAMP=`$(date +%Y%m%d%H%M%S)
mkdir -p "`$BACKUP_DIR"
if [ ! -f "`$ENV_FILE" ]; then
  touch "`$ENV_FILE"
fi
BACKUP_FILE="`$BACKUP_DIR/.env.production.local.`$STAMP.bak"
cp "`$ENV_FILE" "`$BACKUP_FILE"
chmod 600 "`$BACKUP_FILE" || true
python3 - "`$ENV_FILE" "`$UPDATE_FILE" <<'PY'
import sys
from pathlib import Path

env_path = Path(sys.argv[1])
update_path = Path(sys.argv[2])
allowed = {
    'MAP_SERVICE_PROVIDER',
    'TIANDITU_WEB_SERVICE_KEYS',
    'TIANDITU_WEB_SERVICE_TIMEOUT_MS',
    'TIANDITU_WEB_SERVICE_ACCESS',
    'TIANDITU_WEB_SERVICE_REFERER',
    'AMAP_WEB_SERVICE_KEYS',
    'AMAP_WEB_SERVICE_TIMEOUT_MS',
    'AMAP_WEB_SERVICE_PROXY_BASE_URL',
    'AMAP_WEB_SERVICE_PROXY_APPNAME',
    'AMAP_WEB_SERVICE_PROXY_CALLBACK',
    'AMAP_WEB_SERVICE_PROXY_REFERER',
    'AMAP_WEB_SERVICE_PROXY_X_REQUESTED_WITH',
    'COS_REGION',
    'COS_BUCKET',
    'COS_APP_ID',
    'COS_SECRET_ID',
    'COS_SECRET_KEY',
    'COS_UPLOAD_PREFIX',
    'COS_SIGN_EXPIRES',
    'AI_SUPPORT_PROVIDER',
    'AI_SUPPORT_BASE_URL',
    'AI_SUPPORT_API_KEYS',
    'AI_SUPPORT_MODEL',
    'AI_SUPPORT_TIMEOUT_MS',
    'AI_SUPPORT_LEVEL1_ALLOWLIST',
    'AI_SUPPORT_FALLBACK_API_KEYS',
    'AI_SUPPORT_DAILY_LIMIT',
}
updates = {}
for raw_line in update_path.read_text(encoding='utf-8-sig').splitlines():
    line = raw_line.strip()
    if not line or line.startswith('#') or '=' not in line:
        continue
    key, value = line.split('=', 1)
    key = key.strip()
    if key in allowed and value.strip():
        updates[key] = value.strip()

if not updates:
    raise SystemExit('no updates')

lines = env_path.read_text(encoding='utf-8').splitlines() if env_path.exists() else []
seen = set()
next_lines = []
for line in lines:
    stripped = line.strip()
    if stripped and not stripped.startswith('#') and '=' in stripped:
        key = stripped.split('=', 1)[0].strip()
        if key in updates:
            next_lines.append(f'{key}={updates[key]}')
            seen.add(key)
            continue
    next_lines.append(line)

if next_lines and next_lines[-1].strip():
    next_lines.append('')
for key, value in updates.items():
    if key not in seen:
        next_lines.append(f'{key}={value}')

env_path.write_text('\n'.join(next_lines).rstrip() + '\n', encoding='utf-8')
print('UPDATED_KEYS=' + ','.join(updates.keys()))
PY
rm -f "`$UPDATE_FILE"
chmod 600 "`$ENV_FILE" || true
echo "BACKUP_FILE=`$BACKUP_FILE"
if [ '$restartFlag' = '1' ]; then
  cd "`$APP_DIR"
  pnpm --filter @car/backend pm2:restart
  sleep 3
  curl -fsS http://127.0.0.1:8120/app/content/support >/dev/null
  curl -sS 'http://127.0.0.1:8120/app/map/regeo?longitude=113.366739&latitude=23.128003'
  echo
fi
"@
    $localScript = Join-Path $env:TEMP ("car-preprod-env-update-{0}.sh" -f ([guid]::NewGuid().ToString('N')))
    $remoteScriptPath = "/tmp/car-preprod-env-update-$([guid]::NewGuid().ToString('N')).sh"
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($localScript, ($remoteScript -replace "`r`n", "`n"), $utf8NoBom)
    scp -i $SshKey $localScript "${SshHost}:$remoteScriptPath" | Out-Host
    ssh -i $SshKey $SshHost "bash '$remoteScriptPath'; code=`$?; rm -f '$remoteScriptPath'; exit `$code"
    if ($LASTEXITCODE -ne 0) {
        throw "远端预发布 env 更新失败，退出码：$LASTEXITCODE"
    }
}
finally {
    if (Test-Path -LiteralPath $tempFile) {
        Remove-Item -LiteralPath $tempFile -Force
    }
    if ($localScript -and (Test-Path -LiteralPath $localScript)) {
        Remove-Item -LiteralPath $localScript -Force
    }
}
