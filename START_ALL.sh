#!/bin/bash
# ============================================================
# Born to Survive - Fashion Business Dashboard
# Script khởi chạy tất cả dịch vụ trên Linux/Mac/Git Bash
# ============================================================

echo ""
echo "===================================="
echo "Fashion Business Dashboard - Startup"
echo "===================================="
echo ""

# Kiểm tra xem folder node_modules có tồn tại không
if [ ! -d "node_modules" ]; then
    echo "[1/5] Installing NPM packages..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install NPM packages"
        exit 1
    fi
fi

# Kiểm tra xem folder vendor có tồn tại không
if [ ! -d "vendor" ]; then
    echo "[2/5] Installing Composer packages..."
    composer install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install Composer packages"
        exit 1
    fi
fi

# Kiểm tra file .env
if [ ! -f ".env" ]; then
    echo "[3/5] Creating .env file..."
    cp .env.example .env
    php artisan key:generate
fi

# Clear cache
echo "[4/5] Clearing cache..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo ""
echo "[5/5] Starting all services..."
echo ""
echo "===================================="
echo "Services will start:"
echo "- PHP Laravel Server: http://127.0.0.1:8000"
echo "- Vite Dev Server: http://localhost:5173"
echo "===================================="
echo ""

# Chạy Laravel server ở background
echo "Starting Laravel server..."
php artisan serve --host=127.0.0.1 --port=8000 &
LARAVEL_PID=$!

# Đợi 2 giây để Laravel khởi động
sleep 2

# Chạy Vite dev server (ở foreground - sẽ giữ script chạy)
echo "Starting Vite dev server..."
npm run dev

# Khi Vite dừng (Ctrl+C), cũng dừng Laravel
echo ""
echo "Stopping services..."
kill $LARAVEL_PID 2>/dev/null
echo "All services stopped."
