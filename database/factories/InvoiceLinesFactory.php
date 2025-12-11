<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\ProductSku;
use App\Models\Discount;

class InvoiceLinesFactory extends Factory
{
    public function definition(): array
    {
        // 1. Lấy SKU (như cũ)
        $skuModel = ProductSku::inRandomOrder()->first();
        if (!$skuModel) {
             $skuModel = ProductSku::factory()->create();
        }

        // 2. Logic Giảm giá: Có 30% cơ hội dòng này được áp mã giảm giá
        $discountModel = null;
        if ($this->faker->boolean(30)) { // 30% chance
            // Lấy ngẫu nhiên 1 mã giảm giá (Nếu dùng recycle trong Seeder, nó sẽ lấy từ đó)
            $discountModel = Discount::inRandomOrder()->first();
        }

        // 3. Tính toán tiền
        $qty = $this->faker->numberBetween(1, 5);
        // Giả định giá bán = giá SX * 2 (Vì trong SKU factory tôi không lưu giá bán, nên tạm tính thế này)
        // Nếu bạn muốn chuẩn hơn, hãy thêm cột UnitPrice vào bảng PRODUCT_SKUs
        $unitPrice = ($skuModel->product->ProductionCost ?? 50000) * 2; 

        // Tính số tiền được giảm
        $discountAmount = 0;
        if ($discountModel) {
            // Tiền giảm = Số lượng * Đơn giá * Tỷ lệ giảm
            $discountAmount = $qty * $unitPrice * $discountModel->DiscountRate;
        }

        return [
            'Line' => $this->faker->numberBetween(1, 10),
            'SKU' => $skuModel->SKU,
            'Quantity' => $qty,
            'UnitPrice' => $unitPrice,
            
            // Hai cột mới cần điền
            'Discount' => (int) $discountAmount, // Số tiền giảm (VNĐ)
            'DiscountID' => $discountModel ? $discountModel->DiscountID : null, // Mã giảm hoặc NULL
        ];
    }
}