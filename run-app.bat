@echo off
echo Starting RPG Archivist Application...

:: Kill any existing processes
taskkill /f /im node.exe >nul 2>&1

:: Set the project directory
set PROJECT_DIR=%~dp0
echo Project directory: %PROJECT_DIR%

:: Change to the project directory
cd /d "%PROJECT_DIR%"

:: Start the backend server
echo Starting Backend Server...
start "RPG Archivist Backend" cmd /k "cd backend && npm run dev"

:: Wait for backend to initialize
echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

:: Start the frontend server
echo Starting Frontend Server...
start "RPG Archivist Frontend" cmd /k "cd frontend && npm start"

:: Wait for frontend to initialize
echo Waiting for frontend to initialize...
timeout /t 15 /nobreak > nul

:: Open the application in browser
echo Opening application in browser...
start http://localhost:3000

echo.
echo RPG Archivist is now running!
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:4000
echo.
echo You can close this window, but keep the other command windows open to keep the application running.
pause
