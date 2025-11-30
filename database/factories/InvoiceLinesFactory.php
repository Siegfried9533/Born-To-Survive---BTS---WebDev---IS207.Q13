<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\InvoiceLines>
 */
class InvoiceLinesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'Line' => $this->faker->numberBetween(1, 10),
            'SKU' => 'SKU-' . $this->faker->numberBetween(100, 999),
            'Quantity' => $this->faker->numberBetween(1, 5), // Mua từ 1 đến 5 cái
            'UnitPrice' => $this->faker->numberBetween(100, 5000) * 1000, // Giá từ 100k đến 5tr
            'Discount' => 0,
        ];
    }
}
