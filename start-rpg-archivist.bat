@echo off
echo.
echo  ____  ____   ____    _              _     _       _     _
echo ^|  _ \^|  _ \ / ___|  / \   _ __ ___^| ^|__ ^(_)_   _^(_)___^| ^|_
echo ^| ^|_) ^| ^|_) ^| ^|  _  / _ \ ^| '__/ __^| '_ \^| \ \ / / / __^| __^|
echo ^|  _ ^<^|  __/^| ^|_^| ^|/ ___ \^| ^| ^| (__^| ^| ^| ^| ^|\ V /^| \__ \ ^|_
echo ^|_^| \_\_^|    \____/_/   \_\_^|  \___)_^| ^|_^|_^| \_/ ^|_^|___/\__^|
echo.
echo Starting RPG Archivist Application...
echo.

:: Check for running processes and kill them if needed
echo Checking for existing RPG Archivist processes...

:: Enable delayed expansion for variables inside loops
setlocal EnableDelayedExpansion

:: Check for processes using port 3000 (frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Found process using port 3000 (Frontend): %%a
    taskkill /F /PID %%a >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo Successfully terminated frontend process.
    ) else (
        echo Failed to terminate frontend process. You may need to close it manually.
    )
)

:: Check for processes using port 4000 (backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000 ^| findstr LISTENING') do (
    echo Found process using port 4000 (Backend): %%a
    taskkill /F /PID %%a >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo Successfully terminated backend process.
    ) else (
        echo Failed to terminate backend process. You may need to close it manually.
    )
)

echo Cleared any existing RPG Archivist processes.

:: Set the project directory - use the directory where the batch file is located
set PROJECT_DIR=%~dp0
echo Project directory: %PROJECT_DIR%

:: Remove trailing backslash if present
if %PROJECT_DIR:~-1%==\ set PROJECT_DIR=%PROJECT_DIR:~0,-1%

:: Change to the project directory
cd /d "%PROJECT_DIR%"

:: Make sure we're in the right directory
if not exist "frontend" (
    echo ERROR: Could not find the frontend directory.
    echo Current directory: %CD%
    echo Please make sure this batch file is in the root of the RPG Archivist project.
    pause
    exit /b 1
)

if not exist "backend" (
    echo ERROR: Could not find the backend directory.
    echo Current directory: %CD%
    echo Please make sure this batch file is in the root of the RPG Archivist project.
    pause
    exit /b 1
)

:: Start the backend server in a new window
echo Starting Backend Server...
start "RPG Archivist Backend" cmd /k "cd /d "%PROJECT_DIR%\backend" && npm run dev"

:: Wait for 5 seconds to allow the backend to initialize
echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

:: Start the frontend server in a new window
echo Starting Frontend Server...
start "RPG Archivist Frontend" cmd /k "cd /d "%PROJECT_DIR%\frontend" && npm start"

:: Open the application in the default browser after a short delay
echo Waiting for frontend to initialize...
timeout /t 15 /nobreak > nul
echo Opening application in browser...
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
