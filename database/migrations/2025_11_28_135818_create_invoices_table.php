<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->string('InvoiceID', 10)->primary();
            $table->dateTime('Date'); // Ngày giao dịch
            $table->string('TransactionType', 255)->nullable();
            $table->string('PaymentMethod', 50)->nullable();
            $table->string('Currency', 5)->default('VND');
    
            // Khóa ngoại
            $table->string('CusID', 10);
            $table->foreign('CusID')->references('CusID')->on('customers');
    
            $table->string('EmpID', 10)->nullable();
            //$table->foreign('EmpID')->references('EmpID')->on('employees');

            $table->string('StoreID', 10)->nullable();
            //$table->foreign('StoreID')->references('StoreID')->on('stores');
    
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
