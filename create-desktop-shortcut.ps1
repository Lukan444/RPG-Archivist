# PowerShell script to create a desktop shortcut for RPG Archivist

# Define the paths
$batchFilePath = Join-Path -Path (Get-Location) -ChildPath "start-rpg-archivist.bat"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path -Path $desktopPath -ChildPath "RPG Archivist.lnk"
$logoPath = Join-Path -Path (Get-Location) -ChildPath "frontend\public\logo.png"

# Create an icon from the logo if possible
$iconPath = Join-Path -Path (Get-Location) -ChildPath "rpg-archivist-icon.ico"
try {
    # Try to load System.Drawing assembly for image conversion
    Add-Type -AssemblyName System.Drawing

    if (Test-Path $logoPath) {
        # Convert PNG to ICO if the logo exists
        $image = [System.Drawing.Image]::FromFile($logoPath)
        $icon = [System.Drawing.Icon]::FromHandle($image.GetHicon())
        $fileStream = New-Object System.IO.FileStream($iconPath, [System.IO.FileMode]::Create)
        $icon.Save($fileStream)
        $fileStream.Close()
        $icon.Dispose()
        $image.Dispose()

        Write-Host "Created icon file from logo at: $iconPath"
    }
} catch {
    Write-Host "Could not create icon from logo: $_"
    # If conversion fails, we'll use the default icon
    $iconPath = "shell32.dll,22"
}

# Create the shortcut
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = $batchFilePath
$Shortcut.Description = "Start RPG Archivist Application"
$Shortcut.WorkingDirectory = (Get-Location).Path

# Use the custom icon if it was created, otherwise use a system icon
if ((Test-Path $iconPath) -and (-not $iconPath.Contains("shell32.dll"))) {
    $Shortcut.IconLocation = $iconPath
} else {
    $Shortcut.IconLocation = "shell32.dll,22" # Fallback to system icon
}
$Shortcut.Save()

Write-Host "Desktop shortcut created successfully at: $shortcutPath"
Write-Host "You can now start RPG Archivist by double-clicking the shortcut on your desktop."
