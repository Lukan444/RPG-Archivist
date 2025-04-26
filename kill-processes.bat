@echo off
echo Checking for running processes that might interfere with RPG Archivist...

echo Stopping Node.js processes...
taskkill /f /im node.exe >nul 2>&1

echo Stopping any processes on port 3000 (frontend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Stopping any processes on port 4000 (backend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo All potentially conflicting processes have been stopped.
echo You can now run the RPG Archivist application.
echo.
pause
