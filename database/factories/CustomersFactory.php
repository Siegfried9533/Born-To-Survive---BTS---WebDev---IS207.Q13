<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customers>
 */
class CustomersFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'CusID' => 'CUS' . $this->faker->unique()->numerify('####'),
            'Name' => $this->faker->name(),
            'Email' => $this->faker->unique()->safeEmail(),
            'Phone' => $this->faker->numerify('##########'),
            'City' => $this->faker->city(),
            'Country' => $this->faker->country(),
            'Gender' => $this->faker->randomElement(['Male', 'Female', 'Other']),
            'DateOfBirth' => $this->faker->date(),
            'JobTitle' => $this->faker->jobTitle(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
