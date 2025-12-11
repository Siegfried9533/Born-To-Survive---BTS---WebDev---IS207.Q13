<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\ProductSku;
use App\Models\Product;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProductSku>
 */
class ProductSkuFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // Dùng unique() để tránh lỗi trùng lặp khóa chính
            'SKU' => 'SK' . $this->faker->unique()->numberBetween(1000, 99999),

            // safeColorName() trả về các màu cơ bản dễ đọc
            'Color' => $this->faker->safeColorName(),

            // Kích thước: Random giữa size chữ và size số
            'Size' => $this->faker->randomElement(['S', 'M', 'L', 'XL', 'XXL', '29', '30', '31', '32']),

            // Khi dùng trong Seeder với recycle($products), Laravel sẽ tự lấy ID sản phẩm có sẵn điền vào đây.
            // Nếu chạy lẻ, nó sẽ tự tạo mới một Product.
            'ProdID' => Product::factory(),
        ];
    }
}
