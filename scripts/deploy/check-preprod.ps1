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
  for key in TIANDITU_WEB_SERVICE_KEYS TIANDITU_WEB_SERVICE_TIMEOUT_MS TIANDITU_WEB_SERVICE_ACCESS TIANDITU_WEB_SERVICE_REFERER; do
    check_key "$key" || missing=1
  done
elif [ "$provider" = "amap-official" ]; then
  for key in AMAP_WEB_SERVICE_KEYS AMAP_WEB_SERVICE_TIMEOUT_MS; do
    check_key "$key" || missing=1
  done
elif [ "$provider" = "amap" ] || [ "$provider" = "amap-proxy" ]; then
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

for key in COS_REGION COS_BUCKET COS_APP_ID COS_SECRET_ID COS_SECRET_KEY COS_UPLOAD_PREFIX; do
  check_key "$key" || missing=1
done

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

upload_ticket_response=$(curl -sS -X POST 'http://127.0.0.1:8120/app/valuation-orders/photos/upload-ticket' \
  -H 'Content-Type: application/json' \
  -H 'X-Visitor-Key: preprod-deploy-check' \
  --data-binary '{"fileName":"car.jpg","contentType":"image/jpeg"}')
if ! printf '%s' "$upload_ticket_response" | grep -q '"code":1000'; then
  echo 'UPLOAD_TICKET_CHECK=FAILED'
  exit 2
fi
if ! printf '%s' "$upload_ticket_response" | grep -q '"method":"PUT"'; then
  echo 'UPLOAD_TICKET_METHOD_CHECK=FAILED'
  exit 2
fi
if ! printf '%s' "$upload_ticket_response" | grep -q '"objectPointer":"cos://'; then
  echo 'UPLOAD_TICKET_POINTER_CHECK=FAILED'
  exit 2
fi
echo 'UPLOAD_TICKET_CHECK=OK'
'@

$remoteScript = $remoteScript.Replace('__REMOTE_APP_DIR__', $RemoteAppDir)
Invoke-RemoteScript -Script $remoteScript

try {
    $publicIndex = (curl.exe -fsS -H 'Cache-Control: no-cache' "$PublicBaseUrl/") -join "`n"
    $publicEntryAssets = @(
        [regex]::Matches($publicIndex, '(?:src|href)="/?(assets/[^"?#]+)') |
            ForEach-Object { $_.Groups[1].Value } |
            Sort-Object -Unique
    )

    if ($publicEntryAssets.Count -eq 0) {
        throw "公网首页缺少移动端 assets 入口引用"
    }

    foreach ($asset in $publicEntryAssets) {
        $assetUrl = "$($PublicBaseUrl.TrimEnd('/'))/$asset"
        $assetContent = (curl.exe -fsS -H 'Cache-Control: no-cache' $assetUrl) -join "`n"
        if ($assetContent -match '127\.0\.0\.1:8001') {
            throw "公网移动端资源仍包含本地 API 地址：$assetUrl"
        }
    }

    Write-Output "PUBLIC_MOBILE_ENTRY_ASSETS=$($publicEntryAssets -join ',')"
}
catch {
    throw "公网移动端首页探活失败: $PublicBaseUrl/"
}

try {
    $support = curl.exe -fsS "$PublicBaseUrl/api/app/content/support"
    Write-Output $support
}
catch {
    throw "公网 support 探活失败: $PublicBaseUrl/api/app/content/support"
}

$publicUploadTicketBody = Join-Path $env:TEMP ("car-upload-ticket-{0}.json" -f ([guid]::NewGuid().ToString('N')))
try {
    Set-Content -LiteralPath $publicUploadTicketBody -Value '{"fileName":"car.jpg","contentType":"image/jpeg"}' -NoNewline -Encoding UTF8
    $uploadTicket = curl.exe -fsS -X POST "$PublicBaseUrl/api/app/valuation-orders/photos/upload-ticket" `
        -H "Content-Type: application/json" `
        -H "X-Visitor-Key: preprod-deploy-check" `
        --data-binary "@$publicUploadTicketBody"
    if ($uploadTicket -notmatch '"code":1000') {
        throw "公网 upload-ticket 返回异常"
    }
    if ($uploadTicket -notmatch '"method":"PUT"' -or $uploadTicket -notmatch '"objectPointer":"cos://') {
        throw "公网 upload-ticket 响应缺少 PUT 或 objectPointer"
    }
    Write-Output 'PUBLIC_UPLOAD_TICKET_CHECK=OK'
}
finally {
    if (Test-Path -LiteralPath $publicUploadTicketBody) {
        Remove-Item -LiteralPath $publicUploadTicketBody -Force
    }
}
