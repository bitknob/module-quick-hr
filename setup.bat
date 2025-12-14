@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo HRM Microservices - Setup Script
echo ==========================================

REM Check if .env exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo .env file created. Please update it with your actual values.
) else (
    echo .env file already exists.
)

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo Node.js version:
node -v

REM Check if Docker is installed
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: Docker is not installed. Database containers will not start.
) else (
    docker info >nul 2>&1
    if %errorlevel% neq 0 (
        echo Warning: Docker is not running. Please start Docker first.
    ) else (
        echo Docker is installed and running.
    )
)

REM Install dependencies
echo.
echo Installing root dependencies...
call npm install

REM Build common package
echo.
echo Building common package...
cd packages\common
call npm install
call npm run build
cd ..\..

REM Install service dependencies
echo.
echo Installing service dependencies...
cd services\auth-service
call npm install
cd ..\employee-service
call npm install
cd ..\api-gateway
call npm install
cd ..\..

REM Create logs directory
echo.
echo Creating logs directory...
if not exist logs mkdir logs

REM Check if Docker containers are running
where docker >nul 2>&1
if %errorlevel% equ 0 (
    docker info >nul 2>&1
    if %errorlevel% equ 0 (
        echo.
        echo Starting Docker containers...
        docker-compose up -d
        
        echo.
        echo Waiting for databases to be ready...
        timeout /t 5 /nobreak >nul
        
        echo Checking PostgreSQL connection...
        set PG_READY=0
        for /l %%i in (1,1,30) do (
            docker exec hrm-postgres pg_isready -U postgres >nul 2>&1
            if !errorlevel! equ 0 (
                echo PostgreSQL is ready!
                set PG_READY=1
                goto :pg_ready
            )
            timeout /t 1 /nobreak >nul
        )
        :pg_ready
        
        if !PG_READY! equ 0 (
            echo PostgreSQL failed to start within 30 seconds.
            exit /b 1
        )
        
        REM Run database migrations
        echo.
        echo Running database migrations...
        call npm run db:migrate
        
        if %errorlevel% equ 0 (
            echo Database migrations completed successfully!
        ) else (
            echo Database migrations failed!
            exit /b 1
        )
        
        REM Seed initial data (optional)
        echo.
        set /p SEED_DATA="Do you want to seed initial data? (y/n): "
        if /i "!SEED_DATA!"=="y" (
            call npm run db:seed
            echo Database seeded successfully!
        )
    ) else (
        echo Skipping database setup (Docker not running).
        echo Please ensure databases are running and run 'npm run db:migrate' manually.
    )
) else (
    echo Skipping database setup (Docker not available).
    echo Please ensure databases are running and run 'npm run db:migrate' manually.
)

echo.
echo ==========================================
echo Setup completed successfully!
echo ==========================================
echo.
echo Next steps:
echo 1. Update .env file with your actual configuration
echo 2. Run 'run.bat' to start all services
echo.

endlocal

