@echo off
REM Database Migration Script for Hasaru Trading System
REM This script will drop and recreate the database with all tables and seed data

echo ====================================
echo Hasaru Trading Database Migration
echo ====================================
echo.
echo WARNING: This will DROP the existing database and recreate it.
echo All existing data will be LOST!
echo.
set /p CONFIRM="Are you sure you want to continue? (yes/no): "

if /i not "%CONFIRM%"=="yes" (
    echo Migration cancelled.
    pause
    exit /b
)

echo.
echo Starting database migration...
echo.

REM Run schema.sql to create database and tables
echo Step 1: Creating database schema...
mysql -u root -p < backend\database\schema.sql

if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to create database schema
    pause
    exit /b 1
)

echo Schema created successfully.
echo.

REM Run seed.sql to populate initial data
echo Step 2: Seeding initial data...
mysql -u root -p tire_auto_parts_db < backend\database\seed.sql

if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to seed database
    pause
    exit /b 1
)

echo Data seeded successfully.
echo.
echo ====================================
echo Migration completed successfully!
echo ====================================
echo.
pause
