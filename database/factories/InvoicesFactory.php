<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invoices>
 */
class InvoicesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        //Giả lập ngày tháng trong vòng 1 năm trở lại đây
        $date = $this->faker->dateTimeBetween('-1 years', 'now')->format('Y-m-d');
        return [
            //Tạo InvoiceID dạng 'INV' + 6 chữ số ngẫu nhiên
            'InvoiceID' => 'INV' . $this->faker->unique()->numerify('######'),
            'Date' => $date,
            'TransactionType' => 'Sale',
            'PaymentMethod' => $this->faker->randomElement(['Credit Card', 'PayPal', 'Bank Transfer', 'Cash']),
            'Currency' => 'VND',

            'CusID' => \App\Models\Customers::inRandomOrder()->first()->CusID ?? 'CUS0001',
            'created_at' => $date,
            'updated_at' => $date,
        ];
    }
}
