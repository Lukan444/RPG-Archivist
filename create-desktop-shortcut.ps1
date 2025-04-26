# PowerShell script to create a desktop shortcut for RPG Archivist

# Define the paths
$batchFilePath = Join-Path -Path (Get-Location) -ChildPath "start-rpg-archivist.bat"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path -Path $desktopPath -ChildPath "RPG Archivist.lnk"

# Use the existing favicon.ico file directly
$iconPath = Join-Path -Path (Get-Location) -ChildPath "frontend\public\favicon.ico"

# Check if the icon exists
if (-not (Test-Path $iconPath)) {
    Write-Host "Icon file not found at: $iconPath"
    # If icon doesn't exist, use a system icon
    $iconPath = "shell32.dll,22"
} else {
    Write-Host "Using icon file from: $iconPath"
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
