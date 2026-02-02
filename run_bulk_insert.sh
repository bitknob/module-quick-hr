#!/bin/bash

# ============================================
# Bulk Data Insertion Script
# ============================================

# Database connection details (using defaults from config)
DB_NAME="${DB_NAME:-quick_hr}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo "============================================"
echo "Inserting bulk data into database"
echo "============================================"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo "============================================"
echo ""

# Execute the SQL file
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f insert_bulk_data.sql

echo ""
echo "============================================"
echo "Bulk data insertion completed!"
echo "============================================"
