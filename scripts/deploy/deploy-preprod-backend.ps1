#Requires -Version 5.1
[CmdletBinding()]
param(
    [string]$SshHost = 'ubuntu@124.222.31.238',
    [string]$SshKey = 'C:/Users/Lucas/.ssh/id_ed25519',
    [string]$RemoteAppDir = '/srv/apps/car-platform/app',
    [string]$Ref = 'HEAD',
    [switch]$Install
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

function Invoke-RemoteScript {
    param([Parameter(Mandatory = $true)][string]$Script)
    ($Script -replace "`r`n", "`n") | ssh -i $SshKey $SshHost 'bash -s'
    if ($LASTEXITCODE -ne 0) {
        throw "远端后端部署失败，退出码：$LASTEXITCODE"
    }
}

$commit = (git rev-parse $Ref).Trim()
if (-not $commit) {
    throw "无法解析 Git ref: $Ref"
}

$archivePath = Join-Path $env:TEMP ("car-platform-$($commit.Substring(0, 12)).tar")
try {
    git archive --format=tar --output=$archivePath $commit
    $remoteArchive = "/tmp/car-platform-$($commit.Substring(0, 12)).tar"
    scp -i $SshKey $archivePath "${SshHost}:$remoteArchive" | Out-Host

    $installCommand = if ($Install) { 'pnpm install --frozen-lockfile' } else { "echo 'SKIP_INSTALL=1'" }
    $remoteScript = @"
set -euo pipefail
APP_DIR='$RemoteAppDir'
ARCHIVE='$remoteArchive'
BACKUP_DIR='/srv/apps/car-platform/backups'
STAMP=`$(date +%Y%m%d%H%M%S)
mkdir -p "`$APP_DIR" "`$BACKUP_DIR"
if [ -d "`$APP_DIR" ] && [ "`$(find "`$APP_DIR" -mindepth 1 -maxdepth 1 | wc -l)" -gt 0 ]; then
  tar -czf "`$BACKUP_DIR/source-`$STAMP.tgz" --exclude='./node_modules' --exclude='./apps/backend/dist' -C "`$APP_DIR" .
  echo "SOURCE_BACKUP=`$BACKUP_DIR/source-`$STAMP.tgz"
fi

tar -xf "`$ARCHIVE" -C "`$APP_DIR"
rm -f "`$ARCHIVE"
cd "`$APP_DIR"

echo "DEPLOY_COMMIT=$commit"
$installCommand
pnpm --filter @car/shared-types build
pnpm build:backend
pnpm --filter @car/backend pm2:restart
sleep 4
pm2 describe car-platform-backend >/dev/null
curl -fsS http://127.0.0.1:8120/app/content/support
printf '\n'
curl -sS 'http://127.0.0.1:8120/app/map/regeo?longitude=113.366739&latitude=23.128003'
printf '\n'
"@

    Invoke-RemoteScript -Script $remoteScript
}
finally {
    if (Test-Path -LiteralPath $archivePath) {
        Remove-Item -LiteralPath $archivePath -Force
    }
}
