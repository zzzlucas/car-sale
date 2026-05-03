#Requires -Version 5.1
[CmdletBinding()]
param(
    [string]$SshHost = $env:CAR_PREPROD_SSH_HOST,
    [string]$SshKey = $env:CAR_PREPROD_SSH_KEY,
    [string]$RemoteAppDir = $(if ($env:CAR_PREPROD_REMOTE_APP_DIR) { $env:CAR_PREPROD_REMOTE_APP_DIR } else { '/srv/apps/car-platform/app' }),
    [string]$LocalEnvPath = 'apps/backend/.env.preprod'
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '../..')
. (Join-Path $PSScriptRoot 'local-env.ps1')
Import-CarLocalEnv -RepoRoot $repoRoot

$SshHost = Resolve-CarSetting -CurrentValue $SshHost -EnvName 'CAR_PREPROD_SSH_HOST' -Message '缺少 SshHost'
$SshKey = Resolve-CarSetting -CurrentValue $SshKey -EnvName 'CAR_PREPROD_SSH_KEY' -Message '缺少 SshKey'

function Read-EnvKeys {
    param([Parameter(Mandatory = $true)][string]$Path)

    $keys = New-Object System.Collections.Generic.List[string]
    foreach ($line in Get-Content -LiteralPath $Path) {
        $trimmed = $line.Trim()
        if ([string]::IsNullOrWhiteSpace($trimmed) -or $trimmed.StartsWith('#') -or -not $trimmed.Contains('=')) {
            continue
        }
        $key = $trimmed.Split('=', 2)[0].Trim()
        if (-not [string]::IsNullOrWhiteSpace($key)) {
            $keys.Add($key)
        }
    }
    return $keys
}

$localFullPath = Join-Path (Get-Location) $LocalEnvPath
$localDir = Split-Path -Parent $localFullPath
if (-not (Test-Path -LiteralPath $localDir -PathType Container)) {
    New-Item -ItemType Directory -Path $localDir -Force | Out-Null
}

$tempFile = Join-Path $env:TEMP ("car-preprod-backend-env-{0}.env" -f ([guid]::NewGuid().ToString('N')))
$remoteEnvPath = "$RemoteAppDir/apps/backend/.env.production.local"

try {
    scp -i $SshKey "${SshHost}:$remoteEnvPath" $tempFile | Out-Host
    if (-not (Test-Path -LiteralPath $tempFile -PathType Leaf)) {
        throw "远端 env 拉取失败: $remoteEnvPath"
    }

    Move-Item -LiteralPath $tempFile -Destination $localFullPath -Force
    $keys = Read-EnvKeys -Path $localFullPath
    Write-Output "LOCAL_ENV_PATH=$LocalEnvPath"
    Write-Output "PULLED_KEYS=$($keys -join ',')"
}
finally {
    if (Test-Path -LiteralPath $tempFile) {
        Remove-Item -LiteralPath $tempFile -Force
    }
}
