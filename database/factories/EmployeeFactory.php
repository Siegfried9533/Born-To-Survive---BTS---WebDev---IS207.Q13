<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Store;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'EmpID' => 'E' . $this->faker->unique()->numberBetween(100, 9999),
            'Name' => $this->faker->name(),
            'Position' => $this->faker->randomElement([
                'Sales Associate', 
                'Cashier  ', 
                'Store Manager', 
                'Inventory Specialist'
            ]),
            'StoreID' => Store::inRandomOrder()->first()->StoreID ?? 'S001',
        ];
    }
}
