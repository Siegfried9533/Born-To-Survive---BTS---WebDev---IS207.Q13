# API Testing Guide - Fashion Business Dashboard

## Base URL
```
http://127.0.0.1:8000/api
```

---

## 📊 DASHBOARD APIs

### 1. Dashboard Overview
**Chức năng:** Lấy tổng quan dashboard với metrics, biểu đồ GMV Evolution, Modalab Synthesis, Sales Channels

**Endpoint:** `GET /api/dashboard/overview`

**Curl Command:**
```bash
curl -X GET "http://127.0.0.1:8000/api/dashboard/overview"
```

**Response Data:**
- `total_revenue`: Tổng doanh thu tháng hiện tại
- `new_orders`: Số đơn hàng mới trong ngày
- `top_products`: Top 5 sản phẩm bán chạy
- `alerts`: Cảnh báo (mã giảm giá sắp hết hạn, giao dịch giá trị cao)
- `GMV_Evolution`: Dữ liệu biểu đồ GMV 12 tháng
- `Modalab_Synthesis`: Top 6 category theo doanh thu (%)
- `Sales_Channels`: Phân bổ theo phương thức thanh toán (%)

---

## 👥 CUSTOMERS APIs

### 2. Danh Sách Khách Hàng (Có Phân Trang)
**Chức năng:** Lấy danh sách khách hàng với total_spent, rank (VIP/Gold/Member)

**Endpoint:** `GET /api/analytics/customers`

**Parameters:**
- `limit` (optional): Nếu = `all` thì lấy toàn bộ, không phân trang

**Curl Commands:**
```bash
# Lấy trang 1 (10 khách hàng)
curl -X GET "http://127.0.0.1:8000/api/analytics/customers"

# Lấy trang 2
curl -X GET "http://127.0.0.1:8000/api/analytics/customers?page=2"

# Lấy toàn bộ (không phân trang - dùng cho Export)
curl -X GET "http://127.0.0.1:8000/api/analytics/customers?limit=all"
```

**Response Data:**
- `CusID`, `Name`, `Phone`, `Email`
- `total_spent`: Tổng tiền đã chi tiêu
- `formatted_spent`: Format với VND
- `rank`: VIP (≥10M), Gold (≥5M), Member

### 3. Tìm Kiếm Khách Hàng
**Chức năng:** Smart search theo tên, SĐT, email, ID

**Endpoint:** `GET /api/customers/search`

**Parameters:**
- `keyword` (required): Từ khóa tìm kiếm

**Curl Commands:**
```bash
# Tìm theo tên
curl -X GET "http://127.0.0.1:8000/api/customers/search?keyword=Nguyen"

# Tìm theo SĐT
curl -X GET "http://127.0.0.1:8000/api/customers/search?keyword=0912345678"

# Tìm theo email
curl -X GET "http://127.0.0.1:8000/api/customers/search?keyword=example@gmail.com"
```

**Response Data:**
- `total_found`: Số kết quả tìm được
- `data`: Danh sách khách hàng (limit 20)

---

## 💰 SALES APIs

### 4. Dữ Liệu Doanh Thu Theo Ngày
**Chức năng:** Lấy dữ liệu biểu đồ doanh thu theo ngày (mặc định 30 ngày gần nhất)

**Endpoint:** `GET /api/analytics/sales`

**Parameters:**
- `from` (optional): Ngày bắt đầu (Y-m-d)
- `to` (optional): Ngày kết thúc (Y-m-d)

**Curl Commands:**
```bash
# Lấy 30 ngày gần nhất
curl -X GET "http://127.0.0.1:8000/api/analytics/sales"

# Lọc theo khoảng thời gian
curl -X GET "http://127.0.0.1:8000/api/analytics/sales?from=2025-11-01&to=2025-11-30"
```

**Response Data:**
- `filter`: Khoảng thời gian đã lọc
- `summary`: Tổng doanh thu, tổng đơn hàng
- `chart_data`: Dữ liệu theo ngày (date, revenue, total_orders)

---

## 🏪 STORES APIs

### 5. Danh Sách Tất Cả Cửa Hàng
**Chức năng:** Lấy danh sách tất cả các cửa hàng

**Endpoint:** `GET /api/analytics/stores`

**Curl Command:**
```bash
curl -X GET "http://127.0.0.1:8000/api/analytics/stores"
```

**Response Data:**
- `StoreID`, `Name`, `City`, `Country`, `ZIPCode`, `Latitude`, `Longitude`

### 6. KPI Chi Tiết Của 1 Cửa Hàng
**Chức năng:** Lấy chỉ số KPI của cửa hàng cụ thể (doanh thu, số đơn, AOV, nhân viên, sản phẩm bán chạy)

**Endpoint:** `GET /api/stores/{id}/metrics`

**Curl Commands:**
```bash
# Thay {id} bằng StoreID thực tế (VD: S001)
curl -X GET "http://127.0.0.1:8000/api/stores/S001/metrics"
```

**Response Data:**
- `store_info`: Thông tin cửa hàng
- `kpis`: 
  - `total_revenue`: Tổng doanh thu
  - `total_orders`: Tổng đơn hàng
  - `aov`: Average Order Value
  - `total_employees`: Số nhân viên
  - `best_selling_product`: Sản phẩm bán chạy nhất

### 7. Danh Sách Nhân Viên Của Cửa Hàng
**Chức năng:** Lấy danh sách nhân viên làm việc tại cửa hàng

**Endpoint:** `GET /api/stores/{id}/employees`

**Curl Commands:**
```bash
curl -X GET "http://127.0.0.1:8000/api/stores/S001/employees"
```

**Response Data:**
- `store_name`: Tên cửa hàng
- `count`: Số lượng nhân viên
- `data`: Danh sách nhân viên (EmpID, Name, Position)

### 8. Cập Nhật Thông Tin Cửa Hàng
**Chức năng:** Cập nhật thông tin cửa hàng (tên, thành phố, mã ZIP)

**Endpoint:** `PUT /api/stores/{id}`

**Curl Commands:**
```bash
curl -X PUT "http://127.0.0.1:8000/api/stores/S001" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Chi Nhanh Sai Gon",
    "City": "Ho Chi Minh",
    "ZIPCode": "70000"
  }'
```

---

## 🛍️ PRODUCTS APIs

### 9. Danh Sách Sản Phẩm (Có Phân Trang)
**Chức năng:** Lấy danh sách sản phẩm, có thể lọc theo category

**Endpoint:** `GET /api/products`

**Parameters:**
- `category` (optional): Lọc theo danh mục
- `page` (optional): Số trang

**Curl Commands:**
```bash
# Lấy tất cả sản phẩm (trang 1)
curl -X GET "http://127.0.0.1:8000/api/products"

# Lọc theo category
curl -X GET "http://127.0.0.1:8000/api/products?category=Ao"

# Lấy trang 2
curl -X GET "http://127.0.0.1:8000/api/products?page=2"
```

**Response Data:**
- Pagination data với 10 sản phẩm/trang
- `ProdID`, `Category`, `SubCategory`, `Description`, `ProductionCost`

### 10. Chi Tiết 1 Sản Phẩm
**Chức năng:** Xem chi tiết sản phẩm kèm các biến thể (SKUs)

**Endpoint:** `GET /api/products/{id}`

**Curl Commands:**
```bash
curl -X GET "http://127.0.0.1:8000/api/products/P001"
```

**Response Data:**
- Thông tin sản phẩm
- `skus`: Danh sách biến thể (SKU, Color, Size)

### 11. Tạo Sản Phẩm Mới
**Chức năng:** Thêm sản phẩm mới vào hệ thống

**Endpoint:** `POST /api/products`

**Curl Commands:**
```bash
curl -X POST "http://127.0.0.1:8000/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "ProdID": "P999",
    "Description": "Ao Thun Mau Den",
    "Category": "Ao",
    "SubCategory": "T-Shirt",
    "ProductionCost": 50000
  }'
```

**Validation:**
- `ProdID`: Required, unique, max 10 ký tự
- `Description`: Required, max 255 ký tự
- `Category`: Required
- `ProductionCost`: Integer, min 0

### 12. Danh Sách Category Với Doanh Thu
**Chức năng:** Lấy danh sách category kèm Delta GMV và InStore GMV

**Endpoint:** `GET /api/products/categories`

**Curl Command:**
```bash
curl -X GET "http://127.0.0.1:8000/api/products/categories"
```

**Response Data:**
- `Category`: Tên danh mục
- `product_count`: Số lượng sản phẩm
- `delta_gmv`: Tổng doanh thu
- `instore_gmv`: Doanh thu In-Store

### 13. Phân Tích Sản Phẩm (Analytics)
**Chức năng:** Lấy dữ liệu phân tích sản phẩm với bộ lọc

**Endpoint:** `GET /api/analytics/products`

**Parameters:**
- `category` (optional): Lọc theo danh mục
- `from_date` (optional): Ngày bắt đầu (Y-m-d)
- `to_date` (optional): Ngày kết thúc (Y-m-d)

**Curl Commands:**
```bash
# Lấy tất cả
curl -X GET "http://127.0.0.1:8000/api/analytics/products"

# Lọc theo category
curl -X GET "http://127.0.0.1:8000/api/analytics/products?category=Ao"

# Lọc theo thời gian
curl -X GET "http://127.0.0.1:8000/api/analytics/products?from_date=2025-11-01&to_date=2025-11-30"

# Kết hợp nhiều filter
curl -X GET "http://127.0.0.1:8000/api/analytics/products?category=Ao&from_date=2025-11-01&to_date=2025-11-30"
```

**Response Data:**
- `filters`: Các filter đã áp dụng
- `data`: Danh sách sản phẩm với:
  - `ProdID`, `ProductName`, `Category`
  - `total_sold`: Tổng số lượng bán
  - `revenue`: Doanh thu

---

## 💬 CHATBOT APIs

### 14. Gửi Câu Hỏi Tới Chatbot
**Chức năng:** Phân tích câu hỏi và trả lời với recommendation

**Endpoint:** `POST /api/chat/ask`

**Curl Commands:**
```bash
# Hỏi về doanh thu
curl -X POST "http://127.0.0.1:8000/api/chat/ask" \
  -H "Content-Type: application/json" \
  -d '{"message": "Doanh thu tháng này thế nào?"}'

# Hỏi về khách hàng
curl -X POST "http://127.0.0.1:8000/api/chat/ask" \
  -H "Content-Type: application/json" \
  -d '{"message": "Top khách hàng VIP là ai?"}'
```

**Response Data:**
- `user_question`: Câu hỏi gốc
- `bot_answer`: Câu trả lời
- `bot_recommendation`: Gợi ý hành động

### 15. Lịch Sử Chat
**Chức năng:** Lấy 20 tin nhắn gần nhất

**Endpoint:** `GET /api/chat/history`

**Curl Command:**
```bash
curl -X GET "http://127.0.0.1:8000/api/chat/history"
```

**Response Data:**
- Array of chat logs (id, question, bot_response, time)

### 16. Gợi Ý Câu Hỏi
**Chức năng:** Lấy danh sách gợi ý câu hỏi mẫu

**Endpoint:** `GET /api/chat/suggestions`

**Curl Command:**
```bash
curl -X GET "http://127.0.0.1:8000/api/chat/suggestions"
```

**Response Data:**
- Array of suggestion strings

### 17. Xóa Lịch Sử Chat
**Chức năng:** Xóa toàn bộ lịch sử chat của user hiện tại

**Endpoint:** `DELETE /api/chat/history/clear`

**Curl Command:**
```bash
curl -X DELETE "http://127.0.0.1:8000/api/chat/history/clear"
```

**Response Data:**
- `deleted_count`: Số lượng record đã xóa
- `message`: Thông báo

---

## 📤 EXPORT APIs

### 18. Export CSV - Customers
**Chức năng:** Xuất danh sách khách hàng ra file CSV

**Endpoint:** `GET /api/export/customers`

**Curl Command:**
```bash
# Tải file
curl -X GET "http://127.0.0.1:8000/api/export/customers" -o customers_export.csv

# Hoặc mở trực tiếp trên browser
# http://127.0.0.1:8000/api/export/customers
```

**Columns:**
- CusID, Name, Phone, Email, City, Country, Gender, DateOfBirth, JobTitle

### 19. Export CSV - Stores
**Endpoint:** `GET /api/export/stores`

**Curl Command:**
```bash
curl -X GET "http://127.0.0.1:8000/api/export/stores" -o stores_export.csv
```

**Columns:**
- StoreID, Name, City, Country, ZIPCode, Latitude, Longitude

### 20. Export CSV - Products
**Endpoint:** `GET /api/export/products`

**Curl Command:**
```bash
curl -X GET "http://127.0.0.1:8000/api/export/products" -o products_export.csv
```

**Columns:**
- ProdID, Category, SubCategory, Description, ProductionCost

### 21. Export CSV - Invoices
**Endpoint:** `GET /api/export/invoices`

**Curl Command:**
```bash
curl -X GET "http://127.0.0.1:8000/api/export/invoices" -o invoices_export.csv
```

**Columns:**
- InvoiceID, Date, TransactionType, PaymentMethod, Currency, CusID, EmpID, StoreID

---

## 🔐 AUTH API (Sanctum - Chưa Active)

### 22. Get Current User
**Chức năng:** Lấy thông tin user đang đăng nhập (yêu cầu token)

**Endpoint:** `GET /api/user`

**Note:** Cần middleware `auth:sanctum` - Hiện chưa implement đầy đủ authentication

---

## 🧪 QUICK TEST SCRIPT

### Test All Endpoints (Bash)
```bash
#!/bin/bash
BASE_URL="http://127.0.0.1:8000/api"

echo "=== Testing Dashboard ==="
curl -s "$BASE_URL/dashboard/overview" | jq '.status'

echo "=== Testing Customers ==="
curl -s "$BASE_URL/analytics/customers?page=1" | jq '.status'

echo "=== Testing Sales ==="
curl -s "$BASE_URL/analytics/sales" | jq '.status'

echo "=== Testing Stores ==="
curl -s "$BASE_URL/analytics/stores" | jq '.status'

echo "=== Testing Products ==="
curl -s "$BASE_URL/products" | jq '.status'

echo "=== Testing Categories ==="
curl -s "$BASE_URL/products/categories" | jq '.status'

echo "=== Testing Chat Suggestions ==="
curl -s "$BASE_URL/chat/suggestions" | jq '.status'

echo "=== All Tests Done ==="
```

### Windows PowerShell Test
```powershell
$baseUrl = "http://127.0.0.1:8000/api"

Write-Host "Testing Dashboard..." -ForegroundColor Cyan
Invoke-RestMethod "$baseUrl/dashboard/overview" | Select-Object status

Write-Host "Testing Customers..." -ForegroundColor Cyan
Invoke-RestMethod "$baseUrl/analytics/customers" | Select-Object status

Write-Host "Testing Products..." -ForegroundColor Cyan
Invoke-RestMethod "$baseUrl/products" | Select-Object status

Write-Host "All Tests Done!" -ForegroundColor Green
```

---

## 📝 NOTES

### Missing Endpoints (apiResource Auto-Generated)
`Route::apiResource('products', ProductController::class)` tự động tạo thêm:
- `PUT /api/products/{id}` → Update product (chưa implement)
- `DELETE /api/products/{id}` → Delete product (chưa implement)

Nếu gọi sẽ gây lỗi 500 (Method not found). Cần:
1. Thêm method `update()` và `destroy()` vào `ProductController`
2. Hoặc chuyển sang explicit routes thay vì `apiResource`

### Database Dependencies
Tất cả API phụ thuộc vào:
- Database đã migrate: `php artisan migrate:fresh`
- Data đã seed: `php artisan db:seed`

### Response Format
Tất cả API trả về JSON với format:
```json
{
  "status": "success",
  "data": {...}
}
```
Hoặc khi lỗi:
```json
{
  "status": "error",
  "message": "...",
  "errors": {...}
}
```

---

## 🚀 QUICK START

1. **Khởi động servers:**
```bash
# Windows
START_ALL.bat

# Linux/Mac
bash START_ALL.sh
```

2. **Test nhanh bằng browser:**
- Dashboard: http://127.0.0.1:8000/api/dashboard/overview
- Customers: http://127.0.0.1:8000/api/analytics/customers
- Stores: http://127.0.0.1:8000/api/analytics/stores

3. **Test bằng Postman/Insomnia:**
- Import các curl commands trên vào collection
- Base URL: `http://127.0.0.1:8000/api`
