function Import-CarLocalEnv {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepoRoot
    )

    $workspaceBaseEnvPath = Join-Path (Split-Path -Parent $RepoRoot) '_workspace-base\ops\docs\resources-ai\car-preprod-env.md'
    $legacyLocalEnvPath = Join-Path $RepoRoot '.env.local'
    $sourcePaths = @($workspaceBaseEnvPath, $legacyLocalEnvPath)

    foreach ($sourcePath in $sourcePaths) {
        if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
            continue
        }

        foreach ($line in Get-Content -LiteralPath $sourcePath) {
            $trimmed = $line.Trim()
            $match = [regex]::Match($trimmed, '^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$')
            if (-not $match.Success) {
                continue
            }

            $key = $match.Groups[1].Value.Trim()
            if (-not $key.StartsWith('CAR_')) {
                continue
            }

            if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($key, 'Process'))) {
                [Environment]::SetEnvironmentVariable($key, $match.Groups[2].Value.Trim(), 'Process')
            }
        }
    }
}

function Resolve-CarSetting {
    [CmdletBinding()]
    param(
        [string]$CurrentValue,
        [Parameter(Mandatory = $true)]
        [string]$EnvName,
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    if (-not [string]::IsNullOrWhiteSpace($CurrentValue)) {
        return $CurrentValue
    }

    $envValue = [Environment]::GetEnvironmentVariable($EnvName, 'Process')
    if (-not [string]::IsNullOrWhiteSpace($envValue)) {
        return $envValue
    }

    throw "$Message；请通过参数、$EnvName 或 _workspace-base 的 car-preprod-env.md 提供。"
}
