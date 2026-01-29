@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo HRM Microservices - Run Script
echo ==========================================

REM Check if .env exists
if not exist .env (
    echo Error: .env file not found!
    echo Please run 'setup.bat' first to create .env file.
    exit /b 1
)

REM Check if node_modules exist
if not exist "node_modules" (
    echo Dependencies not installed. Running setup...
    call setup.bat
    if errorlevel 1 (
        echo Setup failed!
        exit /b 1
    )
)

REM Check if common package is built
if not exist "packages\common\dist" (
    echo Common package not built. Building...
    cd packages\common
    call npm run build
    cd ..\..
)

REM Function to check if port is in use
set API_GATEWAY_PORT=9400
set AUTH_SERVICE_PORT=9401
set EMPLOYEE_SERVICE_PORT=9402
set PAYROLL_SERVICE_PORT=9403
set PAYMENT_SERVICE_PORT=9404

REM Load port from .env if exists
for /f "tokens=2 delims==" %%a in ('findstr /b "API_GATEWAY_PORT=" .env') do set API_GATEWAY_PORT=%%a
for /f "tokens=2 delims==" %%a in ('findstr /b "AUTH_SERVICE_PORT=" .env') do set AUTH_SERVICE_PORT=%%a
for /f "tokens=2 delims==" %%a in ('findstr /b "EMPLOYEE_SERVICE_PORT=" .env') do set EMPLOYEE_SERVICE_PORT=%%a
for /f "tokens=2 delims==" %%a in ('findstr /b "PAYROLL_SERVICE_PORT=" .env') do set PAYROLL_SERVICE_PORT=%%a
for /f "tokens=2 delims==" %%a in ('findstr /b "PAYMENT_SERVICE_PORT=" .env') do set PAYMENT_SERVICE_PORT=%%a

echo Checking ports...

REM Check and kill processes on ports
for %%p in (%API_GATEWAY_PORT% %AUTH_SERVICE_PORT% %EMPLOYEE_SERVICE_PORT% %PAYROLL_SERVICE_PORT% %PAYMENT_SERVICE_PORT%) do (
    netstat -ano | findstr ":%%p" | findstr "LISTENING" >nul
    if !errorlevel! equ 0 (
        echo Port %%p is in use. Attempting to free it...
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%p" ^| findstr "LISTENING"') do (
            taskkill /F /PID %%a >nul 2>&1
        )
        timeout /t 1 /nobreak >nul
        netstat -ano | findstr ":%%p" | findstr "LISTENING" >nul
        if !errorlevel! equ 0 (
            echo Failed to free port %%p. Please free it manually.
        ) else (
            echo Port %%p freed successfully.
        )
    ) else (
        echo Port %%p is available.
    )
)

REM Check database connection
echo.
echo Checking database connection...

REM Try to check if Docker container is running
docker ps | findstr "hrm-postgres" >nul 2>&1
if !errorlevel! equ 0 (
    docker exec hrm-postgres pg_isready -U postgres >nul 2>&1
    if !errorlevel! equ 0 (
        echo Database container is running!
    ) else (
        echo Warning: Database container exists but may not be ready.
    )
) else (
    echo Warning: Cannot verify database connection.
    echo Please ensure PostgreSQL is running.
)

REM Check if migrations have been run (basic check)
echo.
echo Checking if database setup is complete...
echo Note: Please ensure migrations have been run with 'npm run db:migrate'

REM Create logs directory if it doesn't exist
if not exist logs mkdir logs

REM Start services
echo.
echo Starting all services...
echo.

REM Start services using turbo
call npm run dev

echo.
echo All services started!
echo.
echo Services running on:
echo   - API Gateway: http://localhost:%API_GATEWAY_PORT%
echo   - Auth Service: http://localhost:%AUTH_SERVICE_PORT%
echo   - Employee Service: http://localhost:%EMPLOYEE_SERVICE_PORT%
echo   - Payroll Service: http://localhost:%PAYROLL_SERVICE_PORT%
echo   - Payment Service: http://localhost:%PAYMENT_SERVICE_PORT%
echo.
echo Press Ctrl+C to stop all services

endlocal

