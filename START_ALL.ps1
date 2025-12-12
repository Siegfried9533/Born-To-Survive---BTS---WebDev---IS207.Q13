# ============================================================
# Born to Survive - Fashion Business Dashboard
# PowerShell script khởi chạy tất cả dịch vụ trên Windows
# ============================================================

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Fashion Business Dashboard - Startup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra xem folder node_modules có tồn tại không
if (-not (Test-Path "node_modules")) {
    Write-Host "[1/5] Installing NPM packages..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install NPM packages" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Kiểm tra xem folder vendor có tồn tại không
if (-not (Test-Path "vendor")) {
    Write-Host "[2/5] Installing Composer packages..." -ForegroundColor Yellow
    composer install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install Composer packages" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Kiểm tra file .env
if (-not (Test-Path ".env")) {
    Write-Host "[3/5] Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    php artisan key:generate
}

# Clear cache
Write-Host "[4/5] Clearing cache..." -ForegroundColor Yellow
php artisan config:clear | Out-Null
php artisan cache:clear | Out-Null
php artisan route:clear | Out-Null
php artisan view:clear | Out-Null

Write-Host ""
Write-Host "[5/5] Starting all services..." -ForegroundColor Yellow
Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "Services will start in separate windows:" -ForegroundColor Green
Write-Host "- PHP Laravel Server: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "- Vite Dev Server: http://localhost:5173" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 2

# Khởi chạy Laravel server trong window riêng
Write-Host "Starting Laravel server..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k php artisan serve --host=127.0.0.1 --port=8000" -WindowStyle Normal -PassThru | Out-Null

# Đợi 3 giây để Laravel khởi động
Start-Sleep -Seconds 3

# Khởi chạy Vite dev server trong window riêng
Write-Host "Starting Vite dev server..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k npm run dev" -WindowStyle Normal -PassThru | Out-Null

Write-Host ""
Write-Host "All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "Access the application at: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host ""
Write-Host "To stop all services, close both CMD windows" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to continue (script can close after services start)"
