<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Tạo Khách hàng
    \App\Models\Customers::factory(50)->create();

    // 2. Tạo Hóa đơn và Chi tiết
    \App\Models\Invoices::factory(50)->create()->each(function ($invoice) {
        // Tạo 3 dòng chi tiết cho mỗi hóa đơn.
        // Sử dụng ->sequence() để ép buộc cột Line lần lượt là '1', '2', '3'
        \App\Models\InvoiceLines::factory()
            ->count(3)
            ->sequence(
                ['Line' => '1'],
                ['Line' => '2'],
                ['Line' => '3']
            )
            ->create([
                'InvoiceID' => $invoice->InvoiceID
            ]);
        // --------------------
    });
    }
}
