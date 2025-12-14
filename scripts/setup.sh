#!/bin/bash

echo "Setting up HRM Microservices Application..."

echo "Installing dependencies..."
npm install

echo "Building common package..."
cd packages/common
npm install
npm run build
cd ../..

echo "Starting Docker containers..."
docker-compose up -d

echo "Waiting for databases to be ready..."
sleep 10

echo "Running database migrations..."
npm run db:migrate

echo "Seeding initial data..."
npm run db:seed

echo "Setup complete!"
echo "To start all services, run: npm run dev"

