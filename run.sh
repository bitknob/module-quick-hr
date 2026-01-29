#!/bin/bash

echo "=========================================="
echo "HRM Microservices - Run Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo -e "${YELLOW}Please run './setup.sh' first to create .env file.${NC}"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if node_modules exist
if [ ! -d "node_modules" ] || [ ! -d "packages/common/node_modules" ]; then
    echo -e "${YELLOW}Dependencies not installed. Running setup...${NC}"
    ./setup.sh
    if [ $? -ne 0 ]; then
        echo -e "${RED}Setup failed!${NC}"
        exit 1
    fi
fi

# Check if common package is built
if [ ! -d "packages/common/dist" ]; then
    echo -e "${YELLOW}Common package not built. Building...${NC}"
    cd packages/common
    npm run build
    cd ../..
fi

# Function to check if port is in use
check_port() {
    local port=$1
    # Try lsof first (macOS/Linux)
    if command -v lsof &> /dev/null; then
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            return 0
        fi
    fi
    # Try netstat (Linux)
    if command -v netstat &> /dev/null; then
        if netstat -an 2>/dev/null | grep -q ":$port.*LISTEN"; then
            return 0
        fi
    fi
    # Try ss (Linux)
    if command -v ss &> /dev/null; then
        if ss -lnt 2>/dev/null | grep -q ":$port"; then
            return 0
        fi
    fi
    return 1
}

# Function to kill process on port
kill_port() {
    local port=$1
    local service_name=$2
    echo -e "${YELLOW}Port $port is in use. Attempting to free it...${NC}"
    
    # Try lsof first (macOS/Linux)
    if command -v lsof &> /dev/null; then
        local pid=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$pid" ]; then
            echo -e "${YELLOW}Killing process $pid on port $port...${NC}"
            kill -9 $pid 2>/dev/null
            sleep 2
            if ! check_port $port; then
                echo -e "${GREEN}Port $port freed successfully.${NC}"
                return 0
            fi
        fi
    fi
    
    # Try fuser (Linux)
    if command -v fuser &> /dev/null; then
        fuser -k $port/tcp 2>/dev/null
        sleep 2
        if ! check_port $port; then
            echo -e "${GREEN}Port $port freed successfully.${NC}"
            return 0
        fi
    fi
    
    echo -e "${RED}Failed to free port $port. Please free it manually or stop $service_name.${NC}"
    return 1
}

# Check and free ports
API_GATEWAY_PORT=${API_GATEWAY_PORT:-9400}
AUTH_SERVICE_PORT=${AUTH_SERVICE_PORT:-9401}
EMPLOYEE_SERVICE_PORT=${EMPLOYEE_SERVICE_PORT:-9402}
PAYROLL_SERVICE_PORT=${PAYROLL_SERVICE_PORT:-9403}
PAYMENT_SERVICE_PORT=${PAYMENT_SERVICE_PORT:-9404}

echo "Checking ports..."
if check_port $API_GATEWAY_PORT; then
    kill_port $API_GATEWAY_PORT "API Gateway"
else
    echo -e "${GREEN}Port $API_GATEWAY_PORT (API Gateway) is available.${NC}"
fi

if check_port $AUTH_SERVICE_PORT; then
    kill_port $AUTH_SERVICE_PORT "Auth Service"
else
    echo -e "${GREEN}Port $AUTH_SERVICE_PORT (Auth Service) is available.${NC}"
fi

if check_port $EMPLOYEE_SERVICE_PORT; then
    kill_port $EMPLOYEE_SERVICE_PORT "Employee Service"
else
    echo -e "${GREEN}Port $EMPLOYEE_SERVICE_PORT (Employee Service) is available.${NC}"
fi

if check_port $PAYROLL_SERVICE_PORT; then
    kill_port $PAYROLL_SERVICE_PORT "Payroll Service"
else
    echo -e "${GREEN}Port $PAYROLL_SERVICE_PORT (Payroll Service) is available.${NC}"
fi

if check_port $PAYMENT_SERVICE_PORT; then
    kill_port $PAYMENT_SERVICE_PORT "Payment Service"
else
    echo -e "${GREEN}Port $PAYMENT_SERVICE_PORT (Payment Service) is available.${NC}"
fi

# Check database connection
echo ""
echo "Checking database connection..."
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-quick_hr}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

# Check if PostgreSQL is accessible
if command -v psql &> /dev/null; then
    export PGPASSWORD=$DB_PASSWORD
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" >/dev/null 2>&1; then
        echo -e "${GREEN}Database connection successful!${NC}"
    else
        echo -e "${YELLOW}Warning: Cannot connect to database.${NC}"
        echo -e "${YELLOW}Please ensure PostgreSQL is running and credentials are correct.${NC}"
    fi
    unset PGPASSWORD
else
    # Try with Docker if psql is not available
    if command -v docker &> /dev/null && docker ps | grep -q hrm-postgres; then
        if docker exec hrm-postgres pg_isready -U postgres >/dev/null 2>&1; then
            echo -e "${GREEN}Database container is running!${NC}"
        else
            echo -e "${YELLOW}Warning: Database container exists but may not be ready.${NC}"
        fi
    else
        echo -e "${YELLOW}Warning: Cannot verify database connection (psql not installed).${NC}"
        echo -e "${YELLOW}Please ensure PostgreSQL is running.${NC}"
    fi
fi

# Check if migrations have been run
echo ""
echo "Checking if database migrations have been run..."
MIGRATIONS_RUN=false

if command -v psql &> /dev/null; then
    export PGPASSWORD=$DB_PASSWORD
    USERS_TABLE_EXISTS=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Users');" 2>/dev/null)
    ROLES_TABLE_EXISTS=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Roles');" 2>/dev/null)
    unset PGPASSWORD
    
    if [ "$USERS_TABLE_EXISTS" = "t" ] && [ "$ROLES_TABLE_EXISTS" = "t" ]; then
        echo -e "${GREEN}Database tables exist. Migrations appear to have been run.${NC}"
        MIGRATIONS_RUN=true
    elif [ "$USERS_TABLE_EXISTS" = "t" ] && [ "$ROLES_TABLE_EXISTS" != "t" ]; then
        echo -e "${YELLOW}Roles table not found. Running migrations to update schema...${NC}"
        npm run db:migrate
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Migrations completed successfully!${NC}"
            MIGRATIONS_RUN=true
        else
            echo -e "${RED}Migration failed!${NC}"
            echo -e "${YELLOW}Please check database connection and run 'npm run db:migrate' manually.${NC}"
        fi
    else
        echo -e "${YELLOW}Database tables not found. Running migrations...${NC}"
        npm run db:migrate
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Migrations completed successfully!${NC}"
            MIGRATIONS_RUN=true
        else
            echo -e "${RED}Migration failed!${NC}"
            echo -e "${YELLOW}Please check database connection and run 'npm run db:migrate' manually.${NC}"
        fi
    fi
elif command -v docker &> /dev/null && docker ps | grep -q hrm-postgres; then
    # Try to check via Docker
    USERS_TABLE_EXISTS=$(docker exec hrm-postgres psql -U postgres -d $DB_NAME -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Users');" 2>/dev/null)
    ROLES_TABLE_EXISTS=$(docker exec hrm-postgres psql -U postgres -d $DB_NAME -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Roles');" 2>/dev/null)
    if [ "$USERS_TABLE_EXISTS" = "t" ] && [ "$ROLES_TABLE_EXISTS" = "t" ]; then
        echo -e "${GREEN}Database tables exist (checked via Docker). Migrations appear to have been run.${NC}"
        MIGRATIONS_RUN=true
    elif [ "$USERS_TABLE_EXISTS" = "t" ] && [ "$ROLES_TABLE_EXISTS" != "t" ]; then
        echo -e "${YELLOW}Roles table not found. Running migrations to update schema...${NC}"
        npm run db:migrate
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Migrations completed successfully!${NC}"
            MIGRATIONS_RUN=true
        else
            echo -e "${YELLOW}Migration check failed. Please ensure migrations have been run.${NC}"
        fi
    else
        echo -e "${YELLOW}Database tables not found. Running migrations...${NC}"
        npm run db:migrate
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Migrations completed successfully!${NC}"
            MIGRATIONS_RUN=true
        else
            echo -e "${YELLOW}Migration check failed. Please ensure migrations have been run.${NC}"
        fi
    fi
else
    echo -e "${YELLOW}Cannot verify migrations (psql not installed and Docker not available).${NC}"
    echo -e "${YELLOW}Please ensure migrations have been run with 'npm run db:migrate'${NC}"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start services
echo ""
echo -e "${GREEN}Starting all services...${NC}"
echo ""

# Start services in background using turbo
npm run dev

echo ""
echo -e "${GREEN}All services started!${NC}"
echo ""
echo "Services running on:"
echo "  - API Gateway: http://localhost:$API_GATEWAY_PORT"
echo "  - Auth Service: http://localhost:$AUTH_SERVICE_PORT"
echo "  - Employee Service: http://localhost:$EMPLOYEE_SERVICE_PORT"
echo "  - Payroll Service: http://localhost:$PAYROLL_SERVICE_PORT"
echo "  - Payment Service: http://localhost:$PAYMENT_SERVICE_PORT"
echo ""
echo "Press Ctrl+C to stop all services"

