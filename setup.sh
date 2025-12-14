#!/bin/bash

echo "=========================================="
echo "HRM Microservices - Setup Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}.env file created. Please update it with your actual values.${NC}"
else
    echo -e "${GREEN}.env file already exists.${NC}"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js version 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}Node.js version: $(node -v)${NC}"

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Warning: Docker is not installed. Database containers will not start.${NC}"
else
    if ! docker info &> /dev/null; then
        echo -e "${YELLOW}Warning: Docker is not running. Please start Docker first.${NC}"
    else
        echo -e "${GREEN}Docker is installed and running.${NC}"
    fi
fi

# Install dependencies
echo ""
echo "Installing root dependencies..."
npm install

# Build common package
echo ""
echo "Building common package..."
cd packages/common
npm install
npm run build
cd ../..

# Install service dependencies
echo ""
echo "Installing service dependencies..."
cd services/auth-service
npm install
cd ../employee-service
npm install
cd ../api-gateway
npm install
cd ../..

# Create logs directory
echo ""
echo "Creating logs directory..."
mkdir -p logs

# Check if Docker containers are running
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo ""
    echo "Starting Docker containers..."
    docker-compose up -d
    
    echo ""
    echo "Waiting for databases to be ready..."
    sleep 5
    
    # Wait for PostgreSQL to be ready
    echo "Checking PostgreSQL connection..."
    for i in {1..30}; do
        if docker exec hrm-postgres pg_isready -U postgres &> /dev/null; then
            echo -e "${GREEN}PostgreSQL is ready!${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}PostgreSQL failed to start within 30 seconds.${NC}"
            exit 1
        fi
        sleep 1
    done
    
    # Wait for MongoDB to be ready
    echo "Checking MongoDB connection..."
    for i in {1..30}; do
        if docker exec hrm-mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
            echo -e "${GREEN}MongoDB is ready!${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${YELLOW}MongoDB failed to start within 30 seconds (may not be critical).${NC}"
        fi
        sleep 1
    done
    
    # Run database migrations
    echo ""
    echo "Running database migrations..."
    npm run db:migrate
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Database migrations completed successfully!${NC}"
    else
        echo -e "${RED}Database migrations failed!${NC}"
        exit 1
    fi
    
    # Seed initial data (optional)
    echo ""
    read -p "Do you want to seed initial data? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run db:seed
        echo -e "${GREEN}Database seeded successfully!${NC}"
    fi
else
    echo -e "${YELLOW}Skipping database setup (Docker not available).${NC}"
    echo -e "${YELLOW}Please ensure databases are running and run 'npm run db:migrate' manually.${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Setup completed successfully!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Update .env file with your actual configuration"
echo "2. Run './run.sh' to start all services"
echo ""

