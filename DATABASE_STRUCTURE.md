# 📊 Cấu trúc Cơ sở Dữ liệu - Born to Survive Dashboard

## 📋 Tổng quan

Cơ sở dữ liệu gồm **9 bảng chính** lưu trữ dữ liệu cho hệ thống phân tích kinh doanh thời trang.

---

## 🗂️ Chi tiết các Bảng

### 1️⃣ **STORES** (Cửa hàng)

Lưu thông tin các cửa hàng bán hàng.

| Cột         | Kiểu dữ liệu | Độ dài | Bắt buộc | Ghi chú                                       |
| ----------- | ------------ | ------ | -------- | --------------------------------------------- |
| **StoreID** | VARCHAR      | 10     | ✅       | **Khóa chính** - Mã cửa hàng (VD: S001, S002) |
| Name        | VARCHAR      | 255    | ✅       | Tên cửa hàng                                  |
| City        | VARCHAR      | 50     | ❌       | Thành phố                                     |
| Country     | VARCHAR      | 50     | ❌       | Quốc gia                                      |
| ZIPCode     | VARCHAR      | 10     | ❌       | Mã bưu điện                                   |
| Latitude    | VARCHAR      | 10     | ❌       | Vĩ độ (tọa độ)                                |
| Longitude   | VARCHAR      | 10     | ❌       | Kinh độ (tọa độ)                              |
| created_at  | TIMESTAMP    | -      | ✅       | Thời gian tạo (tự động)                       |
| updated_at  | TIMESTAMP    | -      | ✅       | Thời gian cập nhật (tự động)                  |

**Ví dụ dữ liệu:**

```
StoreID  | Name               | City      | Country | ZIPCode
---------|-------------------|-----------|---------|----------
S001     | Modalab Store 1    | Hà Nội    | Vietnam | 100000
S002     | Modalab Store 2    | HCM       | Vietnam | 700000
S003     | Modalab Store 3    | Đà Nẵng   | Vietnam | 500000
```

---

### 2️⃣ **EMPLOYEES** (Nhân viên)

Lưu thông tin nhân viên bán hàng.

| Cột         | Kiểu dữ liệu | Độ dài | Bắt buộc | Ghi chú                                        |
| ----------- | ------------ | ------ | -------- | ---------------------------------------------- |
| **EmpID**   | VARCHAR      | 10     | ✅       | **Khóa chính** - Mã nhân viên (VD: E001, E002) |
| Name        | VARCHAR      | 255    | ✅       | Tên nhân viên                                  |
| Position    | VARCHAR      | 255    | ❌       | Chức vụ (VD: Sales Manager, Cashier)           |
| **StoreID** | VARCHAR      | 10     | ✅       | **Khóa ngoại** → STORES.StoreID                |
| created_at  | TIMESTAMP    | -      | ✅       | Thời gian tạo (tự động)                        |
| updated_at  | TIMESTAMP    | -      | ✅       | Thời gian cập nhật (tự động)                   |

**Ví dụ dữ liệu:**

```
EmpID | Name         | Position         | StoreID
------|--------------|------------------|----------
E001  | Nguyễn Văn A | Sales Manager    | S001
E002  | Trần Thị B   | Cashier          | S001
E003  | Lê Văn C     | Sales Manager    | S002
```

---

### 3️⃣ **CUSTOMERS** (Khách hàng)

Lưu thông tin khách hàng mua hàng.

| Cột         | Kiểu dữ liệu | Độ dài | Bắt buộc | Ghi chú                                         |
| ----------- | ------------ | ------ | -------- | ----------------------------------------------- |
| **CusID**   | VARCHAR      | 10     | ✅       | **Khóa chính** - Mã khách hàng (VD: C001, C002) |
| Name        | VARCHAR      | 255    | ✅       | Tên khách hàng                                  |
| Phone       | VARCHAR      | 255    | ❌       | Số điện thoại                                   |
| Email       | VARCHAR      | 255    | ❌       | Email                                           |
| City        | VARCHAR      | 50     | ❌       | Thành phố                                       |
| Country     | VARCHAR      | 50     | ❌       | Quốc gia                                        |
| Gender      | VARCHAR      | 6      | ❌       | Giới tính (M/F/Other)                           |
| DateOfBirth | DATETIME     | -      | ❌       | Ngày sinh                                       |
| JobTitle    | VARCHAR      | 255    | ❌       | Công việc                                       |
| created_at  | TIMESTAMP    | -      | ✅       | Thời gian tạo (tự động)                         |
| updated_at  | TIMESTAMP    | -      | ✅       | Thời gian cập nhật (tự động)                    |

**Ví dụ dữ liệu:**

```
CusID | Name           | Phone       | Email              | Gender | City
------|----------------|-------------|-------------------|--------|-------
C001  | Phạm Quốc Anh  | 0912345678  | anh@email.com     | M      | HCM
C002  | Đinh Thu Huyền | 0987654321  | huyen@email.com   | F      | Hà Nội
C003  | Lý Kiến Quyết  | 0967890123  | quyet@email.com   | M      | Đà Nẵng
```

---

### 4️⃣ **PRODUCTS** (Sản phẩm)

Lưu thông tin sản phẩm.

| Cột            | Kiểu dữ liệu | Độ dài | Bắt buộc | Ghi chú                                       |
| -------------- | ------------ | ------ | -------- | --------------------------------------------- |
| **ProdID**     | VARCHAR      | 10     | ✅       | **Khóa chính** - Mã sản phẩm (VD: P001, P002) |
| Category       | VARCHAR      | 255    | ❌       | Danh mục chính (VD: Áo, Quần, Giày)           |
| SubCategory    | VARCHAR      | 255    | ❌       | Danh mục phụ (VD: Áo Phông, Áo Sơ Mi)         |
| Description    | VARCHAR      | 255    | ❌       | Mô tả sản phẩm                                |
| ProductionCost | INT          | -      | ✅       | Chi phí sản xuất (đơn vị: VNĐ)                |
| created_at     | TIMESTAMP    | -      | ✅       | Thời gian tạo (tự động)                       |
| updated_at     | TIMESTAMP    | -      | ✅       | Thời gian cập nhật (tự động)                  |

**Ví dụ dữ liệu:**

```
ProdID | Category | SubCategory    | Description          | ProductionCost
--------|----------|----------------|----------------------|---------------
P001   | Áo       | Áo Phông       | Áo phông nam trắng   | 50000
P002   | Quần     | Quần Jean      | Quần jean nam xanh   | 80000
P003   | Giày     | Giày Thể Thao  | Giày sneaker nữ      | 120000
```

---

### 5️⃣ **PRODUCT_SKUs** (Biến thể sản phẩm)

Lưu các biến thể (màu sắc, kích thước) của sản phẩm.

| Cột        | Kiểu dữ liệu | Độ dài | Bắt buộc | Ghi chú                                    |
| ---------- | ------------ | ------ | -------- | ------------------------------------------ |
| **SKU**    | VARCHAR      | 10     | ✅       | **Khóa chính** - Mã SKU (VD: SK001, SK002) |
| Color      | VARCHAR      | 20     | ❌       | Màu sắc                                    |
| Size       | VARCHAR      | 5      | ❌       | Kích thước (XS, S, M, L, XL)               |
| **ProdID** | VARCHAR      | 10     | ✅       | **Khóa ngoại** → PRODUCTS.ProdID           |
| created_at | TIMESTAMP    | -      | ✅       | Thời gian tạo (tự động)                    |
| updated_at | TIMESTAMP    | -      | ✅       | Thời gian cập nhật (tự động)               |

**Ví dụ dữ liệu:**

```
SKU    | Color  | Size | ProdID
--------|--------|------|--------
SK001  | White  | M    | P001
SK002  | Black  | M    | P001
SK003  | Blue   | 32   | P002
SK004  | Red    | 36   | P002
```

---

### 6️⃣ **DISCOUNTS** (Giảm giá / Khuyến mãi)

Lưu thông tin các chương trình giảm giá.

| Cột            | Kiểu dữ liệu | Độ dài | Bắt buộc | Ghi chú                                       |
| -------------- | ------------ | ------ | -------- | --------------------------------------------- |
| **DiscountID** | VARCHAR      | 10     | ✅       | **Khóa chính** - Mã giảm giá (VD: D001, D002) |
| Name           | VARCHAR      | 50     | ✅       | Tên chương trình                              |
| Description    | VARCHAR      | 255    | ❌       | Mô tả                                         |
| DiscountRate   | FLOAT        | -      | ✅       | Tỷ lệ giảm (0.1 = 10%, 0.2 = 20%)             |
| Category       | VARCHAR      | 255    | ❌       | Danh mục áp dụng                              |
| SubCategory    | VARCHAR      | 255    | ❌       | Danh mục phụ áp dụng                          |
| StartDate      | DATETIME     | -      | ❌       | Ngày bắt đầu                                  |
| EndDate        | DATETIME     | -      | ❌       | Ngày kết thúc                                 |
| created_at     | TIMESTAMP    | -      | ✅       | Thời gian tạo (tự động)                       |
| updated_at     | TIMESTAMP    | -      | ✅       | Thời gian cập nhật (tự động)                  |

**Ví dụ dữ liệu:**

```
DiscountID | Name              | DiscountRate | Category | StartDate          | EndDate
------------|-------------------|--------------|----------|-------------------|------------------
D001       | Summer Sale 2024   | 0.2          | Áo       | 2024-06-01 00:00   | 2024-08-31 23:59
D002       | New Year Promo     | 0.15         | Quần     | 2024-12-25 00:00   | 2025-01-05 23:59
D003       | Clearance          | 0.5          | Giày     | 2024-11-01 00:00   | 2024-11-30 23:59
```

---

### 7️⃣ **INVOICES** (Hóa đơn)

Lưu thông tin các hóa đơn bán hàng.

| Cột             | Kiểu dữ liệu | Độ dài | Bắt buộc | Ghi chú                                          |
| --------------- | ------------ | ------ | -------- | ------------------------------------------------ |
| **InvoiceID**   | VARCHAR      | 10     | ✅       | **Khóa chính** - Mã hóa đơn (VD: INV001, INV002) |
| Date            | DATETIME     | -      | ✅       | Ngày/giờ giao dịch                               |
| TransactionType | VARCHAR      | 255    | ❌       | Loại giao dịch (Sale, Return, Refund)            |
| PaymentMethod   | VARCHAR      | 50     | ❌       | Phương thức thanh toán (Cash, Card, Transfer)    |
| Currency        | VARCHAR      | 5      | ✅       | Loại tiền tệ (VND, USD)                          |
| **CusID**       | VARCHAR      | 10     | ✅       | **Khóa ngoại** → CUSTOMERS.CusID                 |
| **EmpID**       | VARCHAR      | 10     | ❌       | **Khóa ngoại** → EMPLOYEES.EmpID                 |
| **StoreID**     | VARCHAR      | 10     | ❌       | **Khóa ngoại** → STORES.StoreID                  |
| created_at      | TIMESTAMP    | -      | ✅       | Thời gian tạo (tự động)                          |
| updated_at      | TIMESTAMP    | -      | ✅       | Thời gian cập nhật (tự động)                     |

**Ví dụ dữ liệu:**

```
InvoiceID | Date               | PaymentMethod | Currency | CusID | EmpID | StoreID
-----------|-------------------|---------------|----------|-------|-------|----------
INV001    | 2024-12-01 10:30   | Cash          | VND      | C001  | E001  | S001
INV002    | 2024-12-01 14:15   | Card          | VND      | C002  | E002  | S001
INV003    | 2024-12-02 09:45   | Transfer      | VND      | C003  | E003  | S002
```

---

### 8️⃣ **INVOICE_LINES** (Chi tiết hóa đơn)

Lưu chi tiết từng dòng sản phẩm trong hóa đơn.

| Cột            | Kiểu dữ liệu | Độ dài | Bắt buộc | Ghi chú                                             |
| -------------- | ------------ | ------ | -------- | --------------------------------------------------- |
| **InvoiceID**  | VARCHAR      | 10     | ✅       | **Khóa ngoại** → INVOICES.InvoiceID                 |
| **Line**       | VARCHAR      | 10     | ✅       | Số thứ tự dòng trong hóa đơn (1, 2, 3...)           |
| Quantity       | INT          | -      | ✅       | Số lượng bán                                        |
| UnitPrice      | INT          | -      | ✅       | Giá đơn vị (VNĐ)                                    |
| Discount       | INT          | -      | ✅       | Giảm giá (VNĐ, hoặc 0 nếu không có)                 |
| **SKU**        | VARCHAR      | 10     | ✅       | **Khóa ngoại** → PRODUCT_SKUs.SKU                   |
| **DiscountID** | VARCHAR      | 10     | ❌       | **Khóa ngoại** → DISCOUNTS.DiscountID (có thể NULL) |
| created_at     | TIMESTAMP    | -      | ✅       | Thời gian tạo (tự động)                             |
| updated_at     | TIMESTAMP    | -      | ✅       | Thời gian cập nhật (tự động)                        |

⚠️ **Khóa chính phức hợp**: (InvoiceID, Line)

**Ví dụ dữ liệu:**

```
InvoiceID | Line | Quantity | UnitPrice | Discount | SKU   | DiscountID
-----------|------|----------|-----------|----------|-------|------------
INV001    | 1    | 2        | 100000    | 20000    | SK001 | D001
INV001    | 2    | 1        | 80000     | 0        | SK003 | NULL
INV002    | 1    | 3        | 150000    | 45000    | SK002 | D002
```

---

### 9️⃣ **CHAT_LOGS** (Lịch sử Chatbot)

Lưu lịch sử các cuộc trò chuyện của người dùng với Chatbot phân tích dữ liệu.

| Cột            | Kiểu dữ liệu | Độ dài | Bắt buộc | Ghi chú                                       |
| -------------- | ------------ | ------ | -------- | --------------------------------------------- |
| **id**         | BIGINT       | -      | ✅       | **Khóa chính** (tự động tăng)                 |
| **user_id**    | BIGINT       | -      | ✅       | **Khóa ngoại** → users.id (Người dùng hỏi)    |
| question       | TEXT         | -      | ✅       | Câu hỏi từ người dùng                         |
| bot_response   | TEXT         | -      | ✅       | Phản hồi từ Chatbot                           |
| recommendation | TEXT         | -      | ❌       | Lời khuyên thêm (có thể NULL)                 |
| data_snapshot  | JSON         | -      | ❌       | Snapshot dữ liệu lúc truy vấn (để vẽ biểu đồ) |
| created_at     | TIMESTAMP    | -      | ✅       | Thời gian tạo (tự động)                       |
| updated_at     | TIMESTAMP    | -      | ✅       | Thời gian cập nhật (tự động)                  |

**Ví dụ dữ liệu:**

```
id | user_id | question                           | bot_response                    | created_at
----|---------|------------------------------------|---------------------------------|-------------------
1  | 1       | Doanh số hàng tháng là bao nhiêu? | Total revenue: 1.5B VNĐ        | 2024-12-01 10:00
2  | 1       | Top sản phẩm bán chạy?            | Áo phông bán 5000 cái         | 2024-12-01 10:05
3  | 2       | So sánh 2 cửa hàng                | Store 1: 2B, Store 2: 1.8B     | 2024-12-02 14:30
```

---

## 🔗 Mối Quan hệ (Relationships)

```
STORES (1) ─────────────(N) EMPLOYEES
  ↑
  │
  └─────────────────────(N) INVOICES

CUSTOMERS (1) ───────────────(N) INVOICES

EMPLOYEES (1) ───────────────(N) INVOICES

PRODUCTS (1) ─────────────(N) PRODUCT_SKUs
                              ↓
                          (N) INVOICE_LINES

INVOICE_LINES (N) ──────────(1) INVOICES

DISCOUNTS (1) ────────────(N) INVOICE_LINES (tuỳ chọn)

USERS (1) ─────────────(N) CHAT_LOGS
```

---

## 📝 Hướng dẫn nhập dữ liệu

### Bước 1: Chuẩn bị các CSV files

Tạo các file CSV với cấu trúc sau và đặt vào thư mục `database/seeders/data/`:

**stores.csv**

```csv
StoreID,Name,City,Country,ZIPCode,Latitude,Longitude
S001,Modalab Store 1,Hà Nội,Vietnam,100000,21.0285,105.8542
S002,Modalab Store 2,HCM,Vietnam,700000,10.7769,106.6966
S003,Modalab Store 3,Đà Nẵng,Vietnam,500000,16.0544,108.2022
```

**employees.csv**

```csv
EmpID,Name,Position,StoreID
E001,Nguyễn Văn A,Sales Manager,S001
E002,Trần Thị B,Cashier,S001
E003,Lê Văn C,Sales Manager,S002
```

Và tương tự cho các bảng khác...

### Bước 2: Chạy Migration

```bash
php artisan migrate:fresh --seed
```

---

## 🔍 Truy vấn mẫu

### Lấy tất cả hóa đơn kèm chi tiết khách hàng

```sql
SELECT
    i.InvoiceID,
    i.Date,
    c.Name as CustomerName,
    e.Name as EmployeeName,
    s.Name as StoreName
FROM invoices i
JOIN customers c ON i.CusID = c.CusID
LEFT JOIN employees e ON i.EmpID = e.EmpID
LEFT JOIN stores s ON i.StoreID = s.StoreID
ORDER BY i.Date DESC;
```

### Tính doanh số theo từng cửa hàng

```sql
SELECT
    s.StoreID,
    s.Name,
    SUM(il.Quantity * il.UnitPrice - il.Discount) as TotalRevenue
FROM stores s
LEFT JOIN invoices i ON s.StoreID = i.StoreID
LEFT JOIN invoice_lines il ON i.InvoiceID = il.InvoiceID
GROUP BY s.StoreID, s.Name
ORDER BY TotalRevenue DESC;
```

---

## 💾 Backup & Restore

### Backup DB

```bash
php artisan db:seed --class=DatabaseSeeder
mysqldump -u root -p bts_dashboard > backup.sql
```

### Restore DB

```bash
mysql -u root -p bts_dashboard < backup.sql
```

---

**Tài liệu được cập nhật lần cuối**: 11/12/2024
