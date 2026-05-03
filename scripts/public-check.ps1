#Requires -Version 5.1
[CmdletBinding()]
param()

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Push-Location $repoRoot
try {
    $failures = New-Object System.Collections.Generic.List[string]

    function Add-Failure {
        param([Parameter(Mandatory = $true)][string]$Message)
        $failures.Add($Message)
    }

    $trackedEnvFiles = @(git ls-files '*.env*')
    $nonExampleEnvFiles = @(
        $trackedEnvFiles |
            Where-Object {
                $_ -notmatch '(^|/)\.env(\.[^.\/]+)*\.example$' -and
                $_ -notmatch '(^|/)\.env\.example$'
            }
    )
    if ($nonExampleEnvFiles.Count -gt 0) {
        Add-Failure "Git 仍在跟踪真实 env 文件：$($nonExampleEnvFiles -join ', ')"
    }

    $sensitiveEnvHistory = @(
        git log --all --oneline -- `
            .env `
            .env.local `
            .env.preprod `
            .env.production.local `
            apps/backend/.env `
            apps/backend/.env.local `
            apps/backend/.env.preprod `
            apps/backend/.env.production.local
    )
    if ($sensitiveEnvHistory.Count -gt 0) {
        Add-Failure "Git 历史仍包含敏感 env 路径：$($sensitiveEnvHistory[0])"
    }

    $trackedFiles = @(
        git ls-files |
            Where-Object {
                $_ -notmatch '(^|/)pnpm-lock\.yaml$' -and
                $_ -notmatch '^apps/backend/public/swagger/' -and
                $_ -notmatch '(^|/)(dist|coverage)/' -and
                $_ -notmatch '\.(png|jpg|jpeg|gif|webp|ico|svg|map)$'
            }
    )

    $blockedFileNames = @(
        '(?i)(^|/)(id_rsa|id_ed25519|known_hosts)(\.|$)',
        '(?i)\.(pem|p12|pfx|key)$',
        '(?i)(secret|credential|credentials)\.(env|json|ya?ml|txt)$'
    )
    foreach ($file in $trackedFiles) {
        foreach ($pattern in $blockedFileNames) {
            if ($file -match $pattern) {
                Add-Failure "不应跟踪疑似密钥/凭据文件：$file"
            }
        }
    }

    $blockedContentPatterns = [ordered]@{
        'OpenAI/SiliconFlow 风格 API Key' = 'sk-[A-Za-z0-9_-]{20,}'
        '腾讯云 SecretId' = 'AKID[A-Za-z0-9]{16,}'
        'GitHub Token' = 'gh[pousr]_[A-Za-z0-9_]{20,}'
        '私钥内容' = '-----BEGIN (RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----'
        '真实 SSH 私钥路径' = 'C:/Users/[^\\/\s]+/\.ssh/(id_rsa|id_ed25519)'
        '真实 SSH 目标' = '\b(root|ubuntu)@[0-9]{1,3}(\.[0-9]{1,3}){3}\b'
        '真实公网 IP' = '\b(?!127\.0\.0\.1\b)(?!0\.0\.0\.0\b)(?!10\.)(?!192\.168\.)(?!172\.(1[6-9]|2[0-9]|3[0-1])\.)(?!203\.0\.113\.)(?!198\.51\.100\.)(?!192\.0\.2\.)[0-9]{1,3}(\.[0-9]{1,3}){3}\b'
        '本机 car 绝对路径' = 'E:\\web_work_-1\\car'
        '真实预发布域名' = 'name10\.lucasishere\.top'
        '真实埋点域名' = 'find\.lucasishere\.top'
        '真实高德中转站域名' = 'amap\.bangban\.cc'
        '真实高德中转站请求头' = 'com\.bangban\.cc'
        '真实 Tailscale 抠图地址' = '100\.98\.52\.104'
    }

    $allowedContentLinePatterns = [ordered]@{
        'apps/backend/src/modules/app/service/map.ts' = @(
            'sdkversion:\s*''2\.3\.5\.6'''
        )
    }

    foreach ($file in $trackedFiles) {
        if (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
            continue
        }

        $lines = @(Get-Content -LiteralPath $file -ErrorAction SilentlyContinue)
        if ($null -eq $lines) {
            continue
        }

        for ($index = 0; $index -lt $lines.Count; $index++) {
            $line = $lines[$index]
            $isAllowedLine = $false
            if ($allowedContentLinePatterns.Contains($file)) {
                foreach ($allowPattern in $allowedContentLinePatterns[$file]) {
                    if ($line -match $allowPattern) {
                        $isAllowedLine = $true
                        break
                    }
                }
            }
            if ($isAllowedLine) {
                continue
            }

            foreach ($entry in $blockedContentPatterns.GetEnumerator()) {
                if ($line -match $entry.Value) {
                    Add-Failure "$($entry.Key)：${file}:$($index + 1)"
                }
            }
        }
    }

    if ($failures.Count -gt 0) {
        Write-Error ("PUBLIC_CHECK=FAILED`n" + ($failures -join "`n"))
        exit 1
    }

    Write-Output "PUBLIC_CHECK=OK"
    Write-Output "TRACKED_ENV_FILES=$($trackedEnvFiles -join ',')"
}
finally {
    Pop-Location
}
