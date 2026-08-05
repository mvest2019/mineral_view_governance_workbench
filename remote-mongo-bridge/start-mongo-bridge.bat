@echo off
REM Start the remote MongoDB TCP bridge on Windows.
REM Reads optional overrides from a .env file next to this script (copy
REM .env.example to .env). With no .env it uses the baked-in defaults:
REM   listen 127.0.0.1:27018  ->  forward 108.181.152.168:27017

setlocal enabledelayedexpansion
cd /d "%~dp0"

if exist ".env" (
  for /f "usebackq eol=# tokens=1,* delims==" %%a in (".env") do (
    if not "%%b"=="" set "%%a=%%b"
  )
)

echo [mongo-bridge] starting bridge...
node "%~dp0server.js"
