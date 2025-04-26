@echo off
echo Starting RPG Archivist Application...
echo.

:: Set the project directory
set PROJECT_DIR=D:\AI Projects\RPG-Archivist-Web

:: Change to the project directory
cd /d %PROJECT_DIR%

:: Start the backend server in a new window
start cmd /k "echo Starting Backend Server... && cd backend && npm run dev"

:: Wait for 5 seconds to allow the backend to initialize
timeout /t 5 /nobreak > nul

:: Start the frontend server in a new window
start cmd /k "echo Starting Frontend Server... && cd frontend && npm start"

:: Open the application in the default browser after a short delay
timeout /t 10 /nobreak > nul
start http://localhost:3000

echo.
echo RPG Archivist is now running!
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:4000
echo.
echo You can close this window, but keep the other command windows open to keep the application running.
echo To stop the application, close the command windows or press Ctrl+C in each window.
echo.
pause
