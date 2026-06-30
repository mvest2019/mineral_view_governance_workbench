@echo off
setlocal
cd /d "%~dp0"

set "APP_URL=http://127.0.0.1:5050"
title Governance Workbench

echo.
echo Governance Workbench launcher
echo.

set "PY_CMD="
where py >nul 2>nul
if %errorlevel%==0 set "PY_CMD=py -3"
if not defined PY_CMD (
    where python >nul 2>nul
    if %errorlevel%==0 set "PY_CMD=python"
)

if not defined PY_CMD (
    echo Python was not found on this machine.
    echo Install Python, then try again.
    echo.
    pause
    exit /b 1
)

call %PY_CMD% -c "import flask, requests" 1>nul 2>nul
if not %errorlevel%==0 (
    echo Required Python packages are not installed yet. Installing now...
    call %PY_CMD% -m pip install --quiet flask requests
    if not %errorlevel%==0 (
        echo.
        echo Python package installation failed.
        echo Try running this window as Administrator, then launch again.
        echo.
        pause
        exit /b 1
    )
)

start "" "%APP_URL%"
echo Starting Governance Workbench at %APP_URL%
echo Leave this window open while the app is running.
echo Press Ctrl+C here to stop the app.
echo.

call %PY_CMD% "%~dp0launch_server.py"

echo.
echo Governance Workbench has stopped.
pause
