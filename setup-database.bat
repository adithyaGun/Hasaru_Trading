@echo off
echo ========================================
echo  Hasaru Trading - Database Setup
echo ========================================
echo.

REM Check if MySQL is accessible
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: MySQL is not found in PATH!
    echo Please add MySQL to your system PATH or run this from MySQL bin directory.
    echo.
    pause
    exit /b 1
)

echo Step 1: Database setup options...
echo.

REM Prompt for MySQL credentials
set /p MYSQL_USER="Enter MySQL username (default: root): " || set MYSQL_USER=root
set /p MYSQL_PASS="Enter MySQL password (press Enter if none): "

echo.
echo WARNING: Database 'tire_auto_parts_db' may already exist.
echo.
echo Choose an option:
echo   1. Drop and recreate database (will delete all existing data)
echo   2. Keep existing database and only insert/update sample data
echo   3. Cancel
echo.
set /p DB_OPTION="Enter your choice (1, 2, or 3): "

if "%DB_OPTION%"=="3" (
    echo.
    echo Setup cancelled.
    pause
    exit /b 0
)

if "%DB_OPTION%"=="1" (
    echo.
    echo Dropping existing database...
    if "%MYSQL_PASS%"=="" (
        mysql -u %MYSQL_USER% -e "DROP DATABASE IF EXISTS tire_auto_parts_db;"
    ) else (
        mysql -u %MYSQL_USER% -p%MYSQL_PASS% -e "DROP DATABASE IF EXISTS tire_auto_parts_db;"
    )
    echo ✓ Database dropped.
)

echo.
echo Creating database and tables...
echo.

if "%MYSQL_PASS%"=="" (
    mysql -u %MYSQL_USER% < backend\database\schema.sql
) else (
    mysql -u %MYSQL_USER% -p%MYSQL_PASS% < backend\database\schema.sql
)

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to create database schema!
    echo Please check your MySQL credentials and try again.
    pause
    exit /b 1
)

echo.
echo ✓ Database schema created successfully!
echo.
echo Step 2: Inserting sample data...
echo.

if "%MYSQL_PASS%"=="" (
    mysql -u %MYSQL_USER% < backend\database\seed.sql
) else (
    mysql -u %MYSQL_USER% -p%MYSQL_PASS% < backend\database\seed.sql
)

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to insert sample data!
    pause
    exit /b 1
)

echo.
echo ========================================
echo  ✓ Database Setup Complete!
echo ========================================
echo.
echo Database: tire_auto_parts_db
echo.
echo Test Account Credentials:
echo --------------------------
echo Admin:
echo   Email: admin@hasarutrading.com
echo   Password: password
echo.
echo Sales Staff 1:
echo   Email: sales1@hasarutrading.com
echo   Password: password
echo.
echo Sales Staff 2:
echo   Email: sales2@hasarutrading.com
echo   Password: password
echo.
echo Customer 1:
echo   Email: customer1@email.com
echo   Password: password
echo.
echo Customer 2:
echo   Email: customer2@email.com
echo   Password: password
echo.
echo ========================================
echo You can now start the application!
echo Run: start.bat
echo ========================================
echo.
pause
