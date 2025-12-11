<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Product;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // 1. Tạo danh sách danh mục mẫu để dữ liệu "thật" hơn
        // Giúp khi phân tích dữ liệu không bị lệch lạc (VD: Category là "Bàn ghế" mà Sub là "Áo")
        $productTypes = [
            ['Category' => 'Áo', 'SubCategory' => 'Áo Phông'],
            ['Category' => 'Áo', 'SubCategory' => 'Sơ Mi'],
            ['Category' => 'Áo', 'SubCategory' => 'Áo Khoác'],
            ['Category' => 'Quần', 'SubCategory' => 'Quần Jean'],
            ['Category' => 'Quần', 'SubCategory' => 'Quần Kaki'],
            ['Category' => 'Quần', 'SubCategory' => 'Quần Short'],
            ['Category' => 'Giày', 'SubCategory' => 'Sneaker'],
            ['Category' => 'Giày', 'SubCategory' => 'Giày Tây'],
            ['Category' => 'Phụ Kiện', 'SubCategory' => 'Thắt Lưng'],
        ];

        // Lấy ngẫu nhiên 1 cặp
        $selectedType = $this->faker->randomElement($productTypes);

        return [
            // 2. ProdID: Dạng chuỗi P100, P101... (Khóa chính)
            'ProdID' => 'P' . $this->faker->unique()->numberBetween(100, 9999),

            // 3. Gán danh mục đã chọn
            'Category' => $selectedType['Category'],
            'SubCategory' => $selectedType['SubCategory'],

            // 4. Mô tả ngẫu nhiên
            'Description' => $this->faker->sentence(6), // Ví dụ: "Áo sơ mi nam chất liệu cotton..."

            // 5. Chi phí sản xuất: Từ 50k đến 500k VNĐ
            // Dùng round để làm tròn số cho đẹp (VD: 50000 thay vì 50123)
            'ProductionCost' => $this->faker->numberBetween(50, 500) * 1000, 
        ];
    }
}
