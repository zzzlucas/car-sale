[CmdletBinding()]
param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$InputPath,

  [string]$OutputPath,

  [string]$ApiBaseUrl = 'http://100.98.52.104:17000',

  [ValidateSet('auto', 'none', 'pngquant', 'magick')]
  [string]$CompressionMode = 'auto',

  [int]$TimeoutSec = 600,

  [switch]$Overwrite,

  [switch]$KeepRawOutput
)

$modulePath = Join-Path $PSScriptRoot 'rembg-openclaw.psm1'
Import-Module $modulePath -Force

Invoke-OpenClawRembg `
  -InputPath $InputPath `
  -OutputPath $OutputPath `
  -ApiBaseUrl $ApiBaseUrl `
  -CompressionMode $CompressionMode `
  -TimeoutSec $TimeoutSec `
  -Overwrite:$Overwrite `
  -KeepRawOutput:$KeepRawOutput
