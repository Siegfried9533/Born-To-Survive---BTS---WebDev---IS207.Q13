import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Cấu hình số lượng dòng muốn tạo
const RECORD_COUNTS = {
    STORES: 5,
    EMPLOYEES: 50,
    CUSTOMERS: 50,
    PRODUCTS: 20,
    SKUS: 50,
    DISCOUNTS: 10,
    INVOICES: 100, // Tạo nhiều hóa đơn chút
    LINES: 200,    // Chi tiết hóa đơn
    LOGS: 50
};

const OUT_DIR = 'database/seeders/data';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

// --- HELPER FUNCTIONS ---
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const formatDate = (d) => d.toISOString().slice(0, 19).replace('T', ' ');
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// --- DATA GENERATORS ---

// 1. STORES
const cities = ['Hà Nội', 'HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];
const stores = [];
let csv = 'StoreID,Name,City,Country,ZIPCode,Latitude,Longitude,created_at,updated_at\n';
for (let i = 1; i <= RECORD_COUNTS.STORES; i++) {
    const id = `S${String(i).padStart(3, '0')}`;
    const city = cities[i-1] || randomItem(cities);
    stores.push(id);
    csv += `${id},Modalab Store ${i},${city},Vietnam,${100000 + i*1000},0,0,2024-01-01 00:00:00,2024-01-01 00:00:00\n`;
}
fs.writeFileSync(path.join(OUT_DIR, 'stores.csv'), csv);
console.log('Created stores.csv');

// 2. EMPLOYEES
const positions = ['Sales Manager', 'Cashier', 'Store Keeper', 'Sales Assistant'];
const employees = [];
csv = 'EmpID,Name,Position,StoreID,created_at,updated_at\n';
for (let i = 1; i <= RECORD_COUNTS.EMPLOYEES; i++) {
    const id = `E${String(i).padStart(3, '0')}`;
    employees.push(id);
    csv += `${id},Employee ${i},${randomItem(positions)},${randomItem(stores)},2024-01-01 00:00:00,2024-01-01 00:00:00\n`;
}
fs.writeFileSync(path.join(OUT_DIR, 'employees.csv'), csv);
console.log('Created employees.csv');

// 3. CUSTOMERS
const genders = ['M', 'F', 'Other'];
const customers = [];
csv = 'CusID,Name,Phone,Email,City,Country,Gender,DateOfBirth,JobTitle,created_at,updated_at\n';
for (let i = 1; i <= RECORD_COUNTS.CUSTOMERS; i++) {
    const id = `C${String(i).padStart(3, '0')}`;
    customers.push(id);
    csv += `${id},Customer ${i},09${randomInt(10000000, 99999999)},cust${i}@email.com,${randomItem(cities)},Vietnam,${randomItem(genders)},199${randomInt(0,9)}-01-01,Freelancer,2024-01-01 00:00:00,2024-01-01 00:00:00\n`;
}
fs.writeFileSync(path.join(OUT_DIR, 'customers.csv'), csv);
console.log('Created customers.csv');

// 4. PRODUCTS
const prodTypes = [
    {cat: 'Áo', sub: 'Áo Phông', cost: 50000},
    {cat: 'Áo', sub: 'Sơ Mi', cost: 120000},
    {cat: 'Quần', sub: 'Jean', cost: 150000},
    {cat: 'Giày', sub: 'Sneaker', cost: 200000}
];
const products = [];
csv = 'ProdID,Category,SubCategory,Description,ProductionCost,created_at,updated_at\n';
for (let i = 1; i <= RECORD_COUNTS.PRODUCTS; i++) {
    const id = `P${String(i).padStart(3, '0')}`;
    const type = randomItem(prodTypes);
    products.push({id, ...type});
    csv += `${id},${type.cat},${type.sub},Mô tả sản phẩm ${i},${type.cost},2024-01-01 00:00:00,2024-01-01 00:00:00\n`;
}
fs.writeFileSync(path.join(OUT_DIR, 'products.csv'), csv);
console.log('Created products.csv');

// 5. PRODUCT SKUs
const colors = ['Trắng', 'Đen', 'Xanh', 'Đỏ'];
const sizes = ['S', 'M', 'L', 'XL'];
const skus = [];
csv = 'SKU,Color,Size,ProdID,created_at,updated_at\n';
for (let i = 1; i <= RECORD_COUNTS.SKUS; i++) {
    const id = `SK${String(i).padStart(3, '0')}`;
    const prod = randomItem(products);
    skus.push({id, prodId: prod.id, cost: prod.cost}); // Lưu cost để tính giá bán sau này
    csv += `${id},${randomItem(colors)},${randomItem(sizes)},${prod.id},2024-01-01 00:00:00,2024-01-01 00:00:00\n`;
}
fs.writeFileSync(path.join(OUT_DIR, 'product_skus.csv'), csv);
console.log('Created product_skus.csv');

// 6. DISCOUNTS
const discounts = [];
csv = 'DiscountID,Name,Description,DiscountRate,Category,SubCategory,StartDate,EndDate,created_at,updated_at\n';
for (let i = 1; i <= RECORD_COUNTS.DISCOUNTS; i++) {
    const id = `D${String(i).padStart(3, '0')}`;
    discounts.push(id);
    csv += `${id},Sale ${i},Giảm giá mùa ${i},0.1,Áo,NULL,2024-01-01 00:00:00,2024-12-31 23:59:59,2024-01-01 00:00:00,2024-01-01 00:00:00\n`;
}
fs.writeFileSync(path.join(OUT_DIR, 'discounts.csv'), csv);
console.log('Created discounts.csv');

// 7. INVOICES
const invoices = [];
csv = 'InvoiceID,Date,TransactionType,PaymentMethod,Currency,CusID,EmpID,StoreID,created_at,updated_at\n';
for (let i = 1; i <= RECORD_COUNTS.INVOICES; i++) {
    const id = `INV${String(i).padStart(3, '0')}`;
    invoices.push(id);
    const date = formatDate(randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31)));
    csv += `${id},${date},Sale,${randomItem(['Cash', 'Card', 'Transfer'])},VND,${randomItem(customers)},${randomItem(employees)},${randomItem(stores)},${date},${date}\n`;
}
fs.writeFileSync(path.join(OUT_DIR, 'invoices.csv'), csv);
console.log('Created invoices.csv');

// 8. INVOICE LINES
csv = 'InvoiceID,Line,Quantity,UnitPrice,Discount,SKU,DiscountID,created_at,updated_at\n';
for (let i = 1; i <= RECORD_COUNTS.LINES; i++) {
    const invId = randomItem(invoices);
    const sku = randomItem(skus);
    const qty = randomInt(1, 3);
    // Giá bán = Chi phí SX * 2 (Giả định)
    const unitPrice = sku.cost * 2; 
    csv += `${invId},${i},${qty},${unitPrice},0,${sku.id},,2024-01-01 00:00:00,2024-01-01 00:00:00\n`;
}
fs.writeFileSync(path.join(OUT_DIR, 'invoice_lines.csv'), csv);
console.log('Created invoice_lines.csv');

// 9. CHAT LOGS
csv = 'id,user_id,question,bot_response,recommendation,data_snapshot,created_at,updated_at\n';
for (let i = 1; i <= RECORD_COUNTS.LOGS; i++) {
    csv += `${i},1,Câu hỏi số ${i},Câu trả lời máy mốt,NULL,NULL,2024-01-01 00:00:00,2024-01-01 00:00:00\n`;
}
fs.writeFileSync(path.join(OUT_DIR, 'chat_logs.csv'), csv);
console.log('Created chat_logs.csv');

console.log('Đã tạo xong dữ liệu tại thư mục /csv_data');