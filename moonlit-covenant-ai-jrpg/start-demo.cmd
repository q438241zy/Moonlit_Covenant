@echo off
setlocal
rem Moonlit Covenant - one-click demo launcher for Windows (double-click this file).
rem Always runs in zero-cost demo AI mode; edit .env and use "npm start" for model mode.
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo [Moonlit Covenant] Node.js was not found.
  echo Please install Node.js 20 or newer from https://nodejs.org/ and run this file again.
  echo.
  pause
  exit /b 1
)

set "AI_MODE=demo"
if not defined HOST set "HOST=127.0.0.1"
if not defined PORT set "PORT=4173"

rem Open the browser about two seconds later, after the server has started.
if not "%NO_BROWSER%"=="1" start "" /b cmd /c "ping -n 3 127.0.0.1 >nul & start "" http://127.0.0.1:%PORT%/"

node server.mjs
if errorlevel 1 (
  echo.
  echo [Moonlit Covenant] The server stopped with an error. See the message above.
  echo If port %PORT% is already in use, open a Command Prompt in this folder and run:
  echo     set PORT=4174
  echo     start-demo.cmd
  echo.
  pause
)
endlocal
