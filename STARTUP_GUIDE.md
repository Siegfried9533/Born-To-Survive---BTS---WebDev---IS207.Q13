# Born to Survive - Fashion Business Dashboard

## Hướng dẫn khởi chạy dự án

Dự án này là một Laravel + Vite dashboard phân tích dữ liệu kinh doanh thời trang. Dưới đây là các cách khởi chạy đầy đủ.

---

## 🚀 **Cách 1: Chạy nhanh với Script (Khuyến nghị nhất)**

### Windows (CMD - Easiest)

```bash
# Nhấp đôi file hoặc chạy:
START_ALL.bat
```

### Windows (PowerShell - More advanced)

```powershell
# Chạy PowerShell làm admin rồi:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\START_ALL.ps1
```

### Linux / Mac / Git Bash

```bash
chmod +x START_ALL.sh
./START_ALL.sh
```

**Script này sẽ tự động:**

1. ✅ Cài NPM packages (nếu chưa có `node_modules`)
2. ✅ Cài Composer packages (nếu chưa có `vendor`)
3. ✅ Tạo file `.env` nếu chưa có
4. ✅ Clear cache (routes, views, config)
5. ✅ Khởi chạy **Laravel server** (http://127.0.0.1:8000)
6. ✅ Khởi chạy **Vite dev server** (http://localhost:5173)

**Kết quả:** 2 command windows sẽ mở, hiển thị logs của cả 2 server. Bạn chỉ cần truy cập http://127.0.0.1:8000 là sẵn sàng!

---

## **Cách 2: Chạy thủ công (Nếu muốn kiểm soát từng bước)**

### Bước 1: Chuẩn bị môi trường (chỉ cần chạy lần đầu)

```bash
# Cài đặt dependencies Node.js
npm install

# Cài đặt dependencies PHP (Composer)
composer install

# Copy file .env
cp .env.example .env

# Tạo APP_KEY
php artisan key:generate

# (Tuỳ chọn) Chạy migration & seed dữ liệu
php artisan migrate --seed
```

### Bước 2: Khởi chạy dịch vụ

**Cách 2A: Chạy cả hai cùng lúc (Khuyến nghị)**

```bash
composer run dev
```

Lệnh này dùng `npx concurrently` để chạy Laravel server, queue listener, logs, và Vite dev server cùng lúc trong một terminal.

**Cách 2B: Chạy riêng lẻ (2 terminal)**

Terminal 1 - Chạy Laravel server:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

Terminal 2 - Chạy Vite (assets + hot reload):

```bash
npm run dev
```

---

## 📍 **Truy cập ứng dụng**

Sau khi khởi chạy, mở trình duyệt và truy cập:

-   **✅ Ứng dụng chính**: http://127.0.0.1:8000
-   **Vite Dev Server** (nội bộ): http://localhost:5173

---

## **Các lệnh hữu ích khác**

### Build assets cho production

```bash
npm run build
```

### Xóa cache (nếu gặp lỗi cache cũ)

```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

### Chạy migration

```bash
php artisan migrate

# Chạy migration + seed (thêm dữ liệu mẫu)
php artisan migrate --seed

# Rollback migration
php artisan migrate:rollback
```

### Chạy test

```bash
composer run test
```

---

## 🖥️ **Thông tin hệ thống**

-   **Frontend**: Blade templates + Vite (Tailwind CSS)
-   **Backend**: Laravel 12 (PHP 8.2+)
-   **Database**: MySQL/SQLite (cấu hình trong `.env`)
-   **Package Manager**: NPM + Composer
-   **Build Tool**: Vite
-   **Framework CSS**: Tailwind CSS 4

---

## ⚙️ **Cấu hình .env (nếu cần)**

Mở file `.env` và điều chỉnh (tuỳ chọn):

```env
APP_NAME="Fashion Business Dashboard"
APP_URL=http://127.0.0.1:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bts_dashboard
DB_USERNAME=root
DB_PASSWORD=

# Pusher (nếu dùng realtime)
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=mt1
```

---

## **Cấu trúc thư mục chính**

```
project/
├── resources/
│   ├── views/          # Blade templates (pages)
│   ├── js/             # JavaScript nguồn (Vite)
│   └── css/            # CSS nguồn (Tailwind)
├── routes/
│   └── web.php         # Routes định nghĩa
├── app/
│   ├── Http/Controllers/
│   ├── Models/
│   └── Services/
├── public/
│   ├── css/            # CSS build
│   ├── js/             # JS build
│   └── assets/         # Static images
├── database/
│   ├── migrations/     # Database schema
│   ├── seeders/        # Seed dữ liệu
│   └── fake-data/      # Dữ liệu giả
├── vite.config.js      # Cấu hình Vite
├── composer.json       # PHP dependencies
├── package.json        # Node.js dependencies
└── START_ALL.bat/.sh   # Script khởi chạy
```

---

## **Khắc phục sự cố**

### Lỗi: "node_modules not found"

```bash
npm install
```

### Lỗi: "vendor not found"

```bash
composer install
```

### Lỗi: ".env file not found"

```bash
cp .env.example .env
php artisan key:generate
```

### Lỗi: "Port 8000 đã được sử dụng"

```bash
# Chạy trên port khác
php artisan serve --host=127.0.0.1 --port=8001
```

### Lỗi: Component không load

-   Kiểm tra console browser (F12)
-   Kiểm tra server logs
-   Đảm bảo cả Laravel + Vite đều chạy

---

## **Tips**

-   Nếu chỉnh sửa file JS/CSS, Vite sẽ tự động rebuild (HMR - Hot Module Replacement)
-   Nếu chỉnh sửa file Blade, reload trang (F5) để thấy thay đổi
-   Dùng `php artisan tinker` để debug code PHP nhanh chóng
-   Dùng `npm run build` trước khi deploy production

---

**Liên hệ hỗ trợ**: Born to Survive Development Team
