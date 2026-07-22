@echo off
REM Start the remote Claude CLI bridge on Windows.
REM Reads configuration from a .env file next to this script (copy
REM .env.example to .env and fill in CLAUDE_BRIDGE_TOKEN first).

setlocal enabledelayedexpansion
cd /d "%~dp0"

if exist ".env" (
  for /f "usebackq eol=# tokens=1,* delims==" %%a in (".env") do (
    if not "%%b"=="" set "%%a=%%b"
  )
)

if "%CLAUDE_BRIDGE_TOKEN%"=="" (
  echo [claude-bridge] CLAUDE_BRIDGE_TOKEN is not set. Copy .env.example to .env and set it.
  exit /b 1
)

echo [claude-bridge] starting bridge...
node "%~dp0server.js"
