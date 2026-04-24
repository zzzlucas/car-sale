$ErrorActionPreference = 'Stop'

$modulePath = Join-Path $PSScriptRoot 'rembg-openclaw.psm1'
Import-Module $modulePath -Force

function Assert-Equal {
  param(
    [Parameter(Mandatory = $true)]
    $Actual,

    [Parameter(Mandatory = $true)]
    $Expected,

    [Parameter(Mandatory = $true)]
    [string]$Message
  )

  if ($Actual -ne $Expected) {
    throw "$Message`nExpected: $Expected`nActual:   $Actual"
  }
}

$expectedOutput = 'C:\work\sample.rembg.png'
$actualOutput = Resolve-RembgOutputPath -InputPath 'C:\work\sample.png'
Assert-Equal -Actual $actualOutput -Expected $expectedOutput -Message 'Default output path should stay beside the source file and append .rembg.png'

$apiUrl = Get-RembgApiRemoveUrl -ApiBaseUrl 'http://100.98.52.104:17000'
Assert-Equal -Actual $apiUrl -Expected 'http://100.98.52.104:17000/api/remove' -Message 'Base URL should expand to /api/remove automatically'

$modeAuto = Resolve-RembgCompressionMode -RequestedMode 'auto' -AvailableCompressionTools @{
  pngquant = $false
  magick = $false
}
Assert-Equal -Actual $modeAuto -Expected 'none' -Message 'Auto mode should fall back to none when no alpha-safe external compressor is available'

$modePngquant = Resolve-RembgCompressionMode -RequestedMode 'auto' -AvailableCompressionTools @{
  pngquant = $true
  magick = $false
}
Assert-Equal -Actual $modePngquant -Expected 'pngquant' -Message 'Auto mode should prefer pngquant when it is available'

Write-Host 'rembg-openclaw tests passed'
