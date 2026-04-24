Set-StrictMode -Version Latest

function Resolve-RembgOutputPath {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,

    [string]$OutputPath
  )

  if (-not [string]::IsNullOrWhiteSpace($OutputPath)) {
    return [System.IO.Path]::GetFullPath($OutputPath)
  }

  $resolvedInputPath = [System.IO.Path]::GetFullPath($InputPath)
  $directory = [System.IO.Path]::GetDirectoryName($resolvedInputPath)
  $basename = [System.IO.Path]::GetFileNameWithoutExtension($resolvedInputPath)

  return [System.IO.Path]::Combine($directory, "$basename.rembg.png")
}

function Get-RembgApiRemoveUrl {
  [CmdletBinding()]
  param(
    [string]$ApiBaseUrl = 'http://100.98.52.104:17000'
  )

  $trimmed = $ApiBaseUrl.TrimEnd('/')

  if ($trimmed.EndsWith('/api/remove')) {
    return $trimmed
  }

  if ($trimmed.EndsWith('/api')) {
    return "$trimmed/remove"
  }

  return "$trimmed/api/remove"
}

function Get-AvailableCompressionTools {
  [CmdletBinding()]
  param()

  return @{
    pngquant = [bool](Get-Command pngquant -ErrorAction SilentlyContinue)
    magick   = [bool](Get-Command magick -ErrorAction SilentlyContinue)
  }
}

function Resolve-RembgCompressionMode {
  [CmdletBinding()]
  param(
    [ValidateSet('auto', 'none', 'pngquant', 'magick')]
    [string]$RequestedMode = 'auto',

    [hashtable]$AvailableCompressionTools = (Get-AvailableCompressionTools)
  )

  if ($RequestedMode -eq 'none') {
    return 'none'
  }

  if ($RequestedMode -eq 'pngquant') {
    if (-not $AvailableCompressionTools.pngquant) {
      throw 'Requested pngquant compression, but pngquant is not available on this machine.'
    }

    return 'pngquant'
  }

  if ($RequestedMode -eq 'magick') {
    if (-not $AvailableCompressionTools.magick) {
      throw 'Requested magick compression, but ImageMagick is not available on this machine.'
    }

    return 'magick'
  }

  if ($AvailableCompressionTools.pngquant) {
    return 'pngquant'
  }

  if ($AvailableCompressionTools.magick) {
    return 'magick'
  }

  return 'none'
}

function Get-RembgRawOutputPath {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$FinalOutputPath
  )

  $resolvedFinalOutputPath = [System.IO.Path]::GetFullPath($FinalOutputPath)
  $directory = [System.IO.Path]::GetDirectoryName($resolvedFinalOutputPath)
  $basename = [System.IO.Path]::GetFileNameWithoutExtension($resolvedFinalOutputPath)

  return [System.IO.Path]::Combine($directory, "$basename.raw.png")
}

function Get-RembgTemporaryOutputPath {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$FinalOutputPath,

    [Parameter(Mandatory = $true)]
    [string]$Suffix
  )

  $resolvedFinalOutputPath = [System.IO.Path]::GetFullPath($FinalOutputPath)
  $directory = [System.IO.Path]::GetDirectoryName($resolvedFinalOutputPath)
  $basename = [System.IO.Path]::GetFileNameWithoutExtension($resolvedFinalOutputPath)

  return [System.IO.Path]::Combine($directory, "$basename.$Suffix.png")
}

function Invoke-PngquantCompression {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,

    [Parameter(Mandatory = $true)]
    [string]$OutputPath
  )

  $tool = (Get-Command pngquant -ErrorAction Stop).Source
  & $tool --force --skip-if-larger --strip --quality=70-95 --output $OutputPath -- $InputPath
  $exitCode = $LASTEXITCODE

  if ($exitCode -in @(0, 98) -and (Test-Path -LiteralPath $OutputPath)) {
    return $true
  }

  return $false
}

function Invoke-MagickCompression {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,

    [Parameter(Mandatory = $true)]
    [string]$OutputPath
  )

  $tool = (Get-Command magick -ErrorAction Stop).Source
  & $tool $InputPath -strip -define png:compression-level=9 -define png:compression-strategy=1 $OutputPath

  if ($LASTEXITCODE -ne 0) {
    return $false
  }

  return (Test-Path -LiteralPath $OutputPath)
}

function Compress-RembgPng {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,

    [Parameter(Mandatory = $true)]
    [string]$FinalOutputPath,

    [Parameter(Mandatory = $true)]
    [ValidateSet('none', 'pngquant', 'magick')]
    [string]$CompressionMode,

    [switch]$KeepRawOutput
  )

  $resolvedInputPath = [System.IO.Path]::GetFullPath($InputPath)
  $resolvedFinalOutputPath = [System.IO.Path]::GetFullPath($FinalOutputPath)
  $rawSizeBytes = (Get-Item -LiteralPath $resolvedInputPath).Length

  if ($CompressionMode -eq 'none') {
    if ($KeepRawOutput) {
      Copy-Item -LiteralPath $resolvedInputPath -Destination $resolvedFinalOutputPath -Force
    } else {
      Move-Item -LiteralPath $resolvedInputPath -Destination $resolvedFinalOutputPath -Force
    }

    return [PSCustomObject]@{
      CompressionMode = 'none'
      UsedCompression = $false
      RawSizeBytes    = $rawSizeBytes
      FinalSizeBytes  = (Get-Item -LiteralPath $resolvedFinalOutputPath).Length
    }
  }

  $temporaryOutputPath = Get-RembgTemporaryOutputPath -FinalOutputPath $resolvedFinalOutputPath -Suffix $CompressionMode
  if (Test-Path -LiteralPath $temporaryOutputPath) {
    Remove-Item -LiteralPath $temporaryOutputPath -Force
  }

  $compressionSucceeded = $false

  try {
    switch ($CompressionMode) {
      'pngquant' {
        $compressionSucceeded = Invoke-PngquantCompression -InputPath $resolvedInputPath -OutputPath $temporaryOutputPath
      }
      'magick' {
        $compressionSucceeded = Invoke-MagickCompression -InputPath $resolvedInputPath -OutputPath $temporaryOutputPath
      }
    }
  } catch {
    $compressionSucceeded = $false
  }

  if ($compressionSucceeded -and (Test-Path -LiteralPath $temporaryOutputPath)) {
    $compressedSizeBytes = (Get-Item -LiteralPath $temporaryOutputPath).Length
    if ($compressedSizeBytes -lt $rawSizeBytes) {
      Move-Item -LiteralPath $temporaryOutputPath -Destination $resolvedFinalOutputPath -Force

      if (-not $KeepRawOutput -and (Test-Path -LiteralPath $resolvedInputPath)) {
        Remove-Item -LiteralPath $resolvedInputPath -Force
      }

      return [PSCustomObject]@{
        CompressionMode = $CompressionMode
        UsedCompression = $true
        RawSizeBytes    = $rawSizeBytes
        FinalSizeBytes  = (Get-Item -LiteralPath $resolvedFinalOutputPath).Length
      }
    }

    Remove-Item -LiteralPath $temporaryOutputPath -Force
  }

  if ($KeepRawOutput) {
    Copy-Item -LiteralPath $resolvedInputPath -Destination $resolvedFinalOutputPath -Force
  } else {
    Move-Item -LiteralPath $resolvedInputPath -Destination $resolvedFinalOutputPath -Force
  }

  return [PSCustomObject]@{
    CompressionMode = $CompressionMode
    UsedCompression = $false
    RawSizeBytes    = $rawSizeBytes
    FinalSizeBytes  = (Get-Item -LiteralPath $resolvedFinalOutputPath).Length
  }
}

function Invoke-OpenClawRembg {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,

    [string]$OutputPath,

    [string]$ApiBaseUrl = 'http://100.98.52.104:17000',

    [ValidateSet('auto', 'none', 'pngquant', 'magick')]
    [string]$CompressionMode = 'auto',

    [int]$TimeoutSec = 600,

    [switch]$Overwrite,

    [switch]$KeepRawOutput
  )

  $resolvedInputPath = [System.IO.Path]::GetFullPath($InputPath)
  if (-not (Test-Path -LiteralPath $resolvedInputPath -PathType Leaf)) {
    throw "Input file does not exist: $resolvedInputPath"
  }

  $resolvedOutputPath = Resolve-RembgOutputPath -InputPath $resolvedInputPath -OutputPath $OutputPath
  $outputDirectory = [System.IO.Path]::GetDirectoryName($resolvedOutputPath)

  if (-not [string]::IsNullOrWhiteSpace($outputDirectory) -and -not (Test-Path -LiteralPath $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
  }

  if ((Test-Path -LiteralPath $resolvedOutputPath) -and -not $Overwrite) {
    throw "Output file already exists: $resolvedOutputPath. Use -Overwrite to replace it."
  }

  $rawOutputPath = Get-RembgRawOutputPath -FinalOutputPath $resolvedOutputPath
  if ((Test-Path -LiteralPath $rawOutputPath) -and -not $Overwrite) {
    throw "Raw output file already exists: $rawOutputPath. Use -Overwrite to replace it."
  }

  if (Test-Path -LiteralPath $resolvedOutputPath) {
    Remove-Item -LiteralPath $resolvedOutputPath -Force
  }

  if (Test-Path -LiteralPath $rawOutputPath) {
    Remove-Item -LiteralPath $rawOutputPath -Force
  }

  $apiRemoveUrl = Get-RembgApiRemoveUrl -ApiBaseUrl $ApiBaseUrl
  $curlCommand = (Get-Command curl.exe -ErrorAction Stop).Source

  & $curlCommand '-sS' '--fail' '--max-time' "$TimeoutSec" '-F' "file=@$resolvedInputPath" $apiRemoveUrl '-o' $rawOutputPath
  if ($LASTEXITCODE -ne 0) {
    throw "curl failed while calling rembg. Exit code: $LASTEXITCODE"
  }

  if (-not (Test-Path -LiteralPath $rawOutputPath)) {
    throw "rembg did not produce the expected raw output file: $rawOutputPath"
  }

  $resolvedCompressionMode = Resolve-RembgCompressionMode -RequestedMode $CompressionMode
  $compressionResult = Compress-RembgPng -InputPath $rawOutputPath -FinalOutputPath $resolvedOutputPath -CompressionMode $resolvedCompressionMode -KeepRawOutput:$KeepRawOutput

  return [PSCustomObject]@{
    InputPath         = $resolvedInputPath
    OutputPath        = $resolvedOutputPath
    RawOutputPath     = $(if ($KeepRawOutput) { $rawOutputPath } else { $null })
    ApiRemoveUrl      = $apiRemoveUrl
    CompressionMode   = $compressionResult.CompressionMode
    UsedCompression   = $compressionResult.UsedCompression
    RawSizeKB         = [math]::Round(($compressionResult.RawSizeBytes / 1KB), 1)
    FinalSizeKB       = [math]::Round(($compressionResult.FinalSizeBytes / 1KB), 1)
    SavedKB           = [math]::Round((($compressionResult.RawSizeBytes - $compressionResult.FinalSizeBytes) / 1KB), 1)
  }
}

Export-ModuleMember -Function Resolve-RembgOutputPath, Get-RembgApiRemoveUrl, Resolve-RembgCompressionMode, Invoke-OpenClawRembg
