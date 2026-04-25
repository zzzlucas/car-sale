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
if ($mapProvider -ne 'tianditu' -and $mapProvider -ne 'amap') {
    throw "MAP_SERVICE_PROVIDER 只允许 tianditu 或 amap，当前值: $mapProvider"
}
Add-EnvLine -Lines $updateLines -Key 'MAP_SERVICE_PROVIDER' -Value $mapProvider

$tiandituKeys = [string]($localEnv['TIANDITU_WEB_SERVICE_KEYS'])
if ($mapProvider -eq 'tianditu' -and ([string]::IsNullOrWhiteSpace($tiandituKeys) -or $tiandituKeys -like '<*' -or $tiandituKeys -eq 'change-me')) {
    throw "请先在 $LocalEnvPath 填写真实 TIANDITU_WEB_SERVICE_KEYS，或将 MAP_SERVICE_PROVIDER 改为 amap。"
}
if (-not [string]::IsNullOrWhiteSpace($tiandituKeys) -and $tiandituKeys -notlike '<*' -and $tiandituKeys -ne 'change-me') {
    Add-EnvLine -Lines $updateLines -Key 'TIANDITU_WEB_SERVICE_KEYS' -Value $tiandituKeys
}

$tiandituDefaults = [ordered]@{
    TIANDITU_WEB_SERVICE_TIMEOUT_MS = '2500'
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

if ($mapProvider -eq 'amap' -and -not $SkipAmapKeys) {
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

$tempFile = Join-Path $env:TEMP ("car-preprod-amap-{0}.env" -f ([guid]::NewGuid().ToString('N')))
try {
    $updateLines | Set-Content -LiteralPath $tempFile -Encoding UTF8
    $remoteTemp = "/tmp/car-preprod-amap-$([guid]::NewGuid().ToString('N')).env"
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
    'TIANDITU_WEB_SERVICE_REFERER',
    'AMAP_WEB_SERVICE_KEYS',
    'AMAP_WEB_SERVICE_TIMEOUT_MS',
    'AMAP_WEB_SERVICE_PROXY_BASE_URL',
    'AMAP_WEB_SERVICE_PROXY_APPNAME',
    'AMAP_WEB_SERVICE_PROXY_CALLBACK',
    'AMAP_WEB_SERVICE_PROXY_REFERER',
    'AMAP_WEB_SERVICE_PROXY_X_REQUESTED_WITH',
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
    ($remoteScript -replace "`r`n", "`n") | ssh -i $SshKey $SshHost 'bash -s'
}
finally {
    if (Test-Path -LiteralPath $tempFile) {
        Remove-Item -LiteralPath $tempFile -Force
    }
}
