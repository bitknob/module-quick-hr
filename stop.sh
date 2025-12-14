#!/bin/bash

echo "=========================================="
echo "HRM Microservices - Stop Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables if .env exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

API_GATEWAY_PORT=${API_GATEWAY_PORT:-9400}
AUTH_SERVICE_PORT=${AUTH_SERVICE_PORT:-9401}
EMPLOYEE_SERVICE_PORT=${EMPLOYEE_SERVICE_PORT:-9402}

# Function to kill process on port
kill_port() {
    local port=$1
    local service_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        local pid=$(lsof -ti:$port)
        if [ ! -z "$pid" ]; then
            echo -e "${YELLOW}Stopping $service_name on port $port (PID: $pid)...${NC}"
            kill -9 $pid 2>/dev/null
            sleep 1
            if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
                echo -e "${GREEN}$service_name stopped successfully.${NC}"
            else
                echo -e "${RED}Failed to stop $service_name.${NC}"
            fi
        fi
    elif netstat -an 2>/dev/null | grep -q ":$port.*LISTEN"; then
        echo -e "${YELLOW}Stopping $service_name on port $port...${NC}"
        if command -v fuser &> /dev/null; then
            fuser -k $port/tcp 2>/dev/null
            echo -e "${GREEN}$service_name stopped.${NC}"
        else
            echo -e "${YELLOW}Please stop the process on port $port manually.${NC}"
        fi
    else
        echo -e "${GREEN}$service_name is not running on port $port.${NC}"
    fi
}

# Stop all services
echo "Stopping all services..."
echo ""

kill_port $API_GATEWAY_PORT "API Gateway"
kill_port $AUTH_SERVICE_PORT "Auth Service"
kill_port $EMPLOYEE_SERVICE_PORT "Employee Service"

# Kill any remaining node processes related to the project
echo ""
echo "Checking for remaining processes..."
PIDS=$(pgrep -f "hrm|module-quick-hr" 2>/dev/null)
if [ ! -z "$PIDS" ]; then
    echo -e "${YELLOW}Found additional processes. Stopping...${NC}"
    echo "$PIDS" | xargs kill -9 2>/dev/null
fi

# Kill turbo processes
TURBO_PIDS=$(pgrep -f "turbo" 2>/dev/null)
if [ ! -z "$TURBO_PIDS" ]; then
    echo -e "${YELLOW}Stopping Turbo processes...${NC}"
    echo "$TURBO_PIDS" | xargs kill -9 2>/dev/null
fi

echo ""
echo -e "${GREEN}All services stopped!${NC}"
echo ""

