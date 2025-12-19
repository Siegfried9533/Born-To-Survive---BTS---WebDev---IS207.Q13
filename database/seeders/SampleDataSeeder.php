<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Store;
use App\Models\Employee;
use App\Models\Customers;
use App\Models\Product;
use App\Models\Discount;
use App\Models\Transaction;
use Faker\Factory as Faker;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('vi_VN'); // Sử dụng dữ liệu tiếng Việt

        // --- DỌN DẸP DỮ LIỆU ---
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Transaction::truncate();
        Employee::truncate();
        Store::truncate();
        Customers::truncate();
        Product::truncate();
        Discount::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. TẠO STORES (10 cửa hàng trên toàn quốc)
        $cities = ['Ho Chi Minh', 'Ha Noi', 'Da Nang', 'Can Tho', 'Hai Phong'];
        foreach ($cities as $index => $city) {
            Store::create([
                'StoreID' => $index + 1,
                'Country' => 'Vietnam',
                'City' => $city,
                'StoreName' => "TechZone " . $city,
                'NumberOfEmployee' => rand(5, 20),
                'ZipCode' => rand(10000, 90000),
                'Latitude' => $faker->latitude,
                'Longitude' => $faker->longitude,
            ]);
        }
        echo "✓ Đã tạo 5 Stores\n";

        // 2. TẠO PRODUCTS (20 sản phẩm đa dạng)
        $categories = [
            'Electronics' => ['Laptop', 'Smartphone', 'Tablet', 'Camera'],
            'Clothing' => ['T-Shirt', 'Jeans', 'Jacket', 'Shoes'],
            'Home Decor' => ['Lamp', 'Vase', 'Painting']
        ];

        $pId = 501;
        foreach ($categories as $cat => $subs) {
            foreach ($subs as $sub) {
                Product::create([
                    'ProductID' => $pId++,
                    'Category' => $cat,
                    'SubCategory' => $sub,
                    'Description' => $faker->words(3, true),
                    'Color' => $faker->colorName,
                    'Size' => $faker->randomElement(['S', 'M', 'L', 'XL', 'Standard']),
                    'ProductCost' => rand(100000, 20000000),
                ]);
            }
        }
        echo "✓ Đã tạo 20 Products\n";

        // 3. TẠO CUSTOMERS (100 khách hàng)
        for ($i = 0; $i < 100; $i++) {
            Customers::create([
                'CustomerID' => 1001 + $i,
                'Name' => $faker->name,
                'Email' => $faker->unique()->safeEmail,
                'Telephone' => $faker->phoneNumber,
                'City' => $faker->randomElement($cities),
                'Country' => 'Vietnam',
                'Gender' => $faker->randomElement(['Male', 'Female']),
                'DateOfBirth' => $faker->dateTimeBetween('-50 years', '-18 years'),
                'JobTitle' => $faker->jobTitle,
            ]);
        }
        echo "✓ Đã tạo 100 Customers\n";

        // 4. TẠO DISCOUNTS (Phải tạo trước Transaction)
        Discount::create([
            'DiscountID' => 1,
            'Discount' => 0.0,
            'Start' => '2020-01-01',
            'End' => '2030-12-31',
            'Description' => 'No Discount',
            'created_at' => now(),
        ]);
        echo "✓ Đã tạo Discount mặc định (ID=1)\n";

        // 5. TẠO EMPLOYEES (Phải tạo trước Transaction)
        // Lưu ý: Nếu Model Employee dùng EmployeeID làm khóa chính, hãy khai báo cụ thể
        for ($i = 0; $i < 10; $i++) {
            Employee::create([
                'EmployeeID' => 101 + $i,
                'StoreID' => rand(1, 5),
                'Name' => $faker->name,
                'Position' => $faker->jobTitle,
            ]);
        }
        echo "✓ Đã tạo 10 Employees\n";

        // 6. TẠO TRANSACTIONS (Dữ liệu lớn trong 3 năm: 2023, 2024, 2025)
        $paymentMethods = ['Credit Card', 'Cash', 'E-Wallet', 'Transfer'];
        $transactionsCount = 1000; // Số lượng giao dịch bạn muốn tạo

        for ($i = 0; $i < $transactionsCount; $i++) {
            $qty = rand(1, 3);
            $uPrice = rand(200000, 15000000);

            // Random ngày trong khoảng 3 năm gần đây
            $randomDate = $faker->dateTimeBetween('-3 years', 'now');

            Transaction::create([
                'InvoiceID' => 90000 + $i,
                'InvoiceHASH' => Str::random(10),
                'Line' => 1,
                'CustomerID' => rand(1001, 1100),
                'ProductID' => rand(501, 511),
                'UnitPrice' => $uPrice,
                'Quantity' => $qty,
                'DATE' => $randomDate,
                'DiscountID' => 1, // Giả định No Discount
                'LineTotal' => $uPrice * $qty,
                'StoreID' => rand(1, 5),
                'EmployeeID' => rand(101, 104), // Giả định bạn đã có NV
                'Currency' => 'VND',
                'CurrencySymbol' => '₫',
                'PaymentMethod' => $faker->randomElement($paymentMethods),
                'TransactionType' => 'Sale',
                'InvoiceTotal' => $uPrice * $qty,
            ]);
        }

        echo "✓ Đã tạo " . $transactionsCount . " Giao dịch trải dài từ 2023 đến 2025\n";
        echo "✅ HOÀN TẤT SEED DỮ LIỆU KHỔNG LỒ!\n";
    }
}
