<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // 1. Migration bảng customers
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->String('CusID', 10) -> primary(); // Mã khách hàng
            $table->String('Name', 255); // Tên khách hàng
            $table->String('Phone', 10); // Số điện thoại khách hàng
            $table->String('Email', 255) -> nullable(); // Email khách hàng
            $table->String('City', 50) -> nullable(); // Địa chỉ khách hàng
            $table->String('Country', 50) -> nullable(); // Quốc gia khách hàng
            $table->String('Gender', 6) -> nullable(); // Giới tính khách hàng
            $table->date('DateOfBirth') -> nullable(); // Ngày sinh khách hàng
            $table->String('JobTitle', 255) -> nullable(); // Chức vụ công việc khách hàng
            $table->timestamps(); // Tạo 2 cột created_at và updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
