[CmdletBinding()]
param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$InputPath,

  [string]$OutputPath,

  [string]$ApiBaseUrl = $env:CAR_REMBG_API_BASE_URL,

  [ValidateSet('auto', 'none', 'pngquant', 'magick')]
  [string]$CompressionMode = 'auto',

  [int]$TimeoutSec = 600,

  [switch]$Overwrite,

  [switch]$KeepRawOutput
)

$modulePath = Join-Path $PSScriptRoot 'rembg-openclaw.psm1'
Import-Module $modulePath -Force
. (Join-Path $PSScriptRoot 'deploy/local-env.ps1')
Import-CarLocalEnv -RepoRoot (Resolve-Path (Join-Path $PSScriptRoot '..'))

$ApiBaseUrl = Resolve-CarSetting -CurrentValue $ApiBaseUrl -EnvName 'CAR_REMBG_API_BASE_URL' -Message '缺少 ApiBaseUrl'

Invoke-OpenClawRembg `
  -InputPath $InputPath `
  -OutputPath $OutputPath `
  -ApiBaseUrl $ApiBaseUrl `
  -CompressionMode $CompressionMode `
  -TimeoutSec $TimeoutSec `
  -Overwrite:$Overwrite `
  -KeepRawOutput:$KeepRawOutput
