# PowerShell script to convert logo.png to ICO format for Windows

# Load required assemblies
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.IO

# Define paths
$logoPath = Join-Path -Path (Get-Location) -ChildPath "logo.png"
$icoPath = Join-Path -Path (Get-Location) -ChildPath "frontend\public\favicon.ico"
$publicLogoPath = Join-Path -Path (Get-Location) -ChildPath "frontend\public\logo.png"

# Function to create multiple icon sizes
function Convert-PngToIco {
    param (
        [string]$InputPath,
        [string]$OutputPath
    )
    
    try {
        # Check if source file exists
        if (-not (Test-Path $InputPath)) {
            Write-Host "Error: Source file not found at $InputPath"
            return $false
        }
        
        # Load the source image
        $sourceImage = [System.Drawing.Image]::FromFile($InputPath)
        
        # Create a bitmap with transparent background
        $sizes = @(16, 32, 48, 64, 128, 256)
        $memoryStream = New-Object System.IO.MemoryStream
        
        # Create icon from the image
        $icon = [System.Drawing.Icon]::FromHandle($sourceImage.GetHicon())
        
        # Save the icon to the output path
        $fileStream = New-Object System.IO.FileStream($OutputPath, [System.IO.FileMode]::Create)
        $icon.Save($fileStream)
        
        # Clean up
        $fileStream.Close()
        $fileStream.Dispose()
        $icon.Dispose()
        $sourceImage.Dispose()
        
        Write-Host "Successfully converted $InputPath to $OutputPath"
        return $true
    }
    catch {
        Write-Host "Error converting image: $_"
        return $false
    }
}

# Copy logo to public folder if it doesn't exist there
if (-not (Test-Path $publicLogoPath) -and (Test-Path $logoPath)) {
    Copy-Item -Path $logoPath -Destination $publicLogoPath -Force
    Write-Host "Copied logo to public folder: $publicLogoPath"
}

# Convert the logo to ICO
if (Test-Path $logoPath) {
    $success = Convert-PngToIco -InputPath $logoPath -OutputPath $icoPath
    if ($success) {
        Write-Host "Logo successfully converted to ICO format at: $icoPath"
    } else {
        Write-Host "Failed to convert logo to ICO format."
    }
} else {
    Write-Host "Logo file not found at: $logoPath"
}
