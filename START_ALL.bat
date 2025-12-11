@echo off
REM ============================================================
REM Born to Survive - Fashion Business Dashboard
REM Script khởi chạy tất cả dịch vụ trên Windows
REM ============================================================

echo.
echo ====================================
echo Fashion Business Dashboard - Startup
echo ====================================
echo.

REM Kiểm tra xem folder node_modules có tồn tại không
if not exist "node_modules" (
    echo [1/5] Installing NPM packages...
    call npm install
    if errorlevel 1 (
        echo Error: Failed to install NPM packages
        pause
        exit /b 1
    )
)

REM Kiểm tra xem folder vendor có tồn tại không
if not exist "vendor" (
    echo [2/5] Installing Composer packages...
    call composer install
    if errorlevel 1 (
        echo Error: Failed to install Composer packages
        pause
        exit /b 1
    )
)

REM Kiểm tra file .env
if not exist ".env" (
    echo [3/5] Creating .env file...
    copy .env.example .env
    call php artisan key:generate
)

REM Clear cache
echo [4/5] Clearing cache...
call php artisan config:clear
call php artisan cache:clear
call php artisan route:clear
call php artisan view:clear

echo.
echo [5/5] Starting all services...
echo.
echo ====================================
echo Services will start in separate windows:
echo - PHP Laravel Server: http://127.0.0.1:8000
echo - Vite Dev Server: http://localhost:5173
echo ====================================
echo.

timeout /t 2 /nobreak

REM Khởi chạy Laravel server trong window riêng
echo Starting Laravel server...
start "Laravel Dev Server" cmd /k "php artisan serve --host=127.0.0.1 --port=8000"

REM Đợi 3 giây để Laravel khởi động
timeout /t 3 /nobreak

REM Khởi chạy Vite dev server trong window riêng
echo Starting Vite dev server...
start "Vite Dev Server" cmd /k "npm run dev"

echo.
echo All services started! 
echo.
echo Access the application at: http://127.0.0.1:8000
echo.
pause
