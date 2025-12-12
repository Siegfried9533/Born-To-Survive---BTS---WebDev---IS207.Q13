<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Store>
 */
class StoreFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // Tạo ID kiểu chuỗi: S001, S002... (tối đa S999)
            // unique() đảm bảo không trùng ID
            'StoreID' => 'S' . $this->faker->unique()->numberBetween(100, 999),
            
            'Name' => 'Modalab Store ' . $this->faker->city(),
            'City' => $this->faker->city(),
            'Country' => 'Vietnam',
            'ZIPCode' => $this->faker->postcode(),
            'Latitude' => $this->faker->latitude(),
            'Longitude' => $this->faker->longitude(),
        ];
    }
}