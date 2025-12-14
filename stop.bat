@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo HRM Microservices - Stop Script
echo ==========================================

REM Load port from .env if exists
set API_GATEWAY_PORT=9400
set AUTH_SERVICE_PORT=9401
set EMPLOYEE_SERVICE_PORT=9402

if exist .env (
    for /f "tokens=2 delims==" %%a in ('findstr /b "API_GATEWAY_PORT=" .env') do set API_GATEWAY_PORT=%%a
    for /f "tokens=2 delims==" %%a in ('findstr /b "AUTH_SERVICE_PORT=" .env') do set AUTH_SERVICE_PORT=%%a
    for /f "tokens=2 delims==" %%a in ('findstr /b "EMPLOYEE_SERVICE_PORT=" .env') do set EMPLOYEE_SERVICE_PORT=%%a
)

echo Stopping all services...
echo.

REM Function to kill process on port
for %%p in (%API_GATEWAY_PORT% %AUTH_SERVICE_PORT% %EMPLOYEE_SERVICE_PORT%) do (
    netstat -ano | findstr ":%%p" | findstr "LISTENING" >nul
    if !errorlevel! equ 0 (
        echo Stopping service on port %%p...
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%p" ^| findstr "LISTENING"') do (
            taskkill /F /PID %%a >nul 2>&1
            if !errorlevel! equ 0 (
                echo Service on port %%p stopped successfully.
            ) else (
                echo Failed to stop service on port %%p.
            )
        )
    ) else (
        echo No service running on port %%p.
    )
)

REM Kill node processes related to the project
echo.
echo Checking for remaining Node.js processes...
tasklist | findstr "node.exe" >nul
if !errorlevel! equ 0 (
    for /f "tokens=2" %%a in ('tasklist ^| findstr "node.exe"') do (
        wmic process where "ProcessId=%%a" get CommandLine 2>nul | findstr /i "hrm module-quick-hr turbo" >nul
        if !errorlevel! equ 0 (
            taskkill /F /PID %%a >nul 2>&1
        )
    )
)

echo.
echo All services stopped!
echo.

endlocal

