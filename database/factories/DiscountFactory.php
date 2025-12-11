<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Discount>
 */
class DiscountFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Random mức giảm: 10%, 20%, 50%...
        $rate = $this->faker->randomElement([0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.5]);
        
        return [
            // DiscountID: D001, D002...
            'DiscountID' => 'D' . $this->faker->unique()->numberBetween(100, 999),
            
            'Name' => $this->faker->randomElement(['Summer Sale', 'Black Friday', 'Tet Holiday', 'Flash Sale', 'Membership Promo']),
            'Description' => $this->faker->sentence(),
            'DiscountRate' => $rate, // Lưu tỷ lệ (VD: 0.1)
            
            // Có thể null (áp dụng toàn sàn) hoặc theo danh mục
            'Category' => $this->faker->randomElement(['Áo', 'Quần', 'Giày', null]),
            'SubCategory' => null, 
            
            // Ngày bắt đầu và kết thúc trong năm 2024-2025
            'StartDate' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'EndDate' => $this->faker->dateTimeBetween('now', '+1 year'),
        ];
    }
}
