@echo off
echo RPG Archivist Launcher Installer
echo ==============================
echo.

echo Converting logo to icon format...
powershell -ExecutionPolicy Bypass -File convert-logo-to-ico.ps1

echo Creating desktop shortcut...
powershell -ExecutionPolicy Bypass -File create-desktop-shortcut.ps1

echo.
echo Installation complete!
echo You can now start RPG Archivist by double-clicking the shortcut on your desktop.
echo.
echo Press any key to exit...
pause > nul
