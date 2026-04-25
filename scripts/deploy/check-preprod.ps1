#Requires -Version 5.1
[CmdletBinding()]
param(
    [string]$SshHost = 'ubuntu@124.222.31.238',
    [string]$SshKey = 'C:/Users/Lucas/.ssh/id_ed25519',
    [string]$RemoteAppDir = '/srv/apps/car-platform/app',
    [string]$PublicBaseUrl = 'https://name10.lucasishere.top'
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

function Invoke-RemoteScript {
    param([Parameter(Mandatory = $true)][string]$Script)

    $localScript = Join-Path $env:TEMP ("car-check-preprod-{0}.sh" -f ([guid]::NewGuid().ToString('N')))
    $remoteScriptPath = "/tmp/car-check-preprod-$([guid]::NewGuid().ToString('N')).sh"
    try {
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($localScript, ($Script -replace "`r`n", "`n"), $utf8NoBom)
        scp -i $SshKey $localScript "${SshHost}:$remoteScriptPath" | Out-Host
        ssh -i $SshKey $SshHost "bash '$remoteScriptPath'; code=`$?; rm -f '$remoteScriptPath'; exit `$code"
        if ($LASTEXITCODE -ne 0) {
            throw "remote preprod check failed, exit code: $LASTEXITCODE"
        }
    }
    finally {
        if (Test-Path -LiteralPath $localScript) {
            Remove-Item -LiteralPath $localScript -Force
        }
    }
}

$remoteScript = @'
set -euo pipefail
APP_DIR="__REMOTE_APP_DIR__"
ENV_FILE="$APP_DIR/apps/backend/.env.production.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "ENV_FILE=MISSING:$ENV_FILE"
  exit 1
fi

check_key() {
  key="$1"
  if grep -Eq "^${key}=." "$ENV_FILE"; then
    echo "${key}=SET"
  else
    echo "${key}=MISSING"
    return 1
  fi
}

missing=0
for key in DB_HOST DB_PORT DB_USERNAME DB_PASSWORD DB_NAME MAP_SERVICE_PROVIDER; do
  check_key "$key" || missing=1
done

provider=$(grep -E '^MAP_SERVICE_PROVIDER=' "$ENV_FILE" | tail -n1 | cut -d= -f2- | tr '[:upper:]' '[:lower:]')
if [ -z "$provider" ] || [ "$provider" = "tianditu" ]; then
  for key in TIANDITU_WEB_SERVICE_KEYS TIANDITU_WEB_SERVICE_TIMEOUT_MS TIANDITU_WEB_SERVICE_REFERER; do
    check_key "$key" || missing=1
  done
elif [ "$provider" = "amap" ]; then
  for key in AMAP_WEB_SERVICE_KEYS AMAP_WEB_SERVICE_PROXY_BASE_URL AMAP_WEB_SERVICE_PROXY_APPNAME AMAP_WEB_SERVICE_PROXY_CALLBACK AMAP_WEB_SERVICE_PROXY_REFERER AMAP_WEB_SERVICE_PROXY_X_REQUESTED_WITH; do
    check_key "$key" || missing=1
  done
else
  echo "MAP_SERVICE_PROVIDER=INVALID:$provider"
  missing=1
fi

if [ "$missing" -ne 0 ]; then
  exit 1
fi

pm2 describe car-platform-backend >/dev/null
support_response=$(curl -fsS http://127.0.0.1:8120/app/content/support)
echo "$support_response"
if ! printf '%s' "$support_response" | grep -q '"code":1000'; then
  echo 'SUPPORT_CHECK=FAILED'
  exit 2
fi

map_response=$(curl -sS 'http://127.0.0.1:8120/app/map/regeo?longitude=113.366739&latitude=23.128003')
echo "$map_response"
if ! printf '%s' "$map_response" | grep -q '"code":1000'; then
  echo 'MAP_CHECK=FAILED'
  exit 2
fi
'@

$remoteScript = $remoteScript.Replace('__REMOTE_APP_DIR__', $RemoteAppDir)
Invoke-RemoteScript -Script $remoteScript

try {
    $support = curl.exe -fsS "$PublicBaseUrl/api/app/content/support"
    Write-Output $support
}
catch {
    throw "公网 support 探活失败: $PublicBaseUrl/api/app/content/support"
}
