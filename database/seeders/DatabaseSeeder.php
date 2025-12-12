<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Store;
use App\Models\Employee;
use App\Models\Customers;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\Invoices;
use App\Models\InvoiceLines;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Phải có Cửa hàng và Sản phẩm trước tiên
        
        // 1. Tạo 5 Cửa hàng
        $stores = Store::factory(5)->create();

        // 2. Tạo 20 Nhân viên (Gán ngẫu nhiên vào các Store vừa tạo)
        // Logic này giúp tránh lỗi không tìm thấy StoreID cho nhân viên
        $employees = Employee::factory(20)
            ->recycle($stores) // Tái sử dụng store đã có
            ->create();

        // 3. Tạo 50 Khách hàng
        $customers = Customers::factory(50)->create();

        // 4. Tạo 10 Sản phẩm gốc (Products)
        $products = Product::factory(10)->create();

        // 5. Tạo 50 SKU (Biến thể sản phẩm) - QUAN TRỌNG ĐỂ TRÁNH LỖI KHI BÁN HÀNG
        // SKU cần ProdID, nên ta recycle $products
        $skus = ProductSku::factory(50)
            ->recycle($products)
            ->create();

        //Tạo discount trước khi tạo hóa đơn
        $discounts = \App\Models\Discount::factory(10)->create();
        
        // Bây giờ đã đủ Store, Employee, Customer, SKU để tạo hóa đơn

        // 6. Tạo 50 Hóa đơn
        Invoices::factory(50)
            ->recycle($customers) // Lấy khách đã có
            ->recycle($employees) // Lấy nhân viên đã có
            ->recycle($stores)    // Lấy cửa hàng đã có
            ->create()
            ->each(function ($invoice) use ($skus) {
                
                // 7. Tạo Chi tiết hóa đơn (InvoiceLines) cho từng hóa đơn
                InvoiceLines::factory()
                    ->count(3) // Mỗi hóa đơn mua 3 món
                    ->recycle($skus) // QUAN TRỌNG: Lấy SKU từ danh sách đã tạo ở Bước 5
                    ->sequence(
                        ['Line' => '1'],
                        ['Line' => '2'],
                        ['Line' => '3']
                    )
                    ->create([
                        'InvoiceID' => $invoice->InvoiceID
                    ]);
            });
    }
}