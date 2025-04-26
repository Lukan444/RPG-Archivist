# PowerShell script to create a desktop shortcut for RPG Archivist

# Define the paths
$batchFilePath = Join-Path -Path (Get-Location) -ChildPath "start-rpg-archivist.bat"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path -Path $desktopPath -ChildPath "RPG Archivist.lnk"

# Create the shortcut
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = $batchFilePath
$Shortcut.Description = "Start RPG Archivist Application"
$Shortcut.WorkingDirectory = (Get-Location).Path
$Shortcut.IconLocation = "shell32.dll,22" # Using a system icon (you can change this)
$Shortcut.Save()

Write-Host "Desktop shortcut created successfully at: $shortcutPath"
Write-Host "You can now start RPG Archivist by double-clicking the shortcut on your desktop."
