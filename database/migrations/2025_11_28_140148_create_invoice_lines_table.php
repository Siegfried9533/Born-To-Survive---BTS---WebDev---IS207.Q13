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
        Schema::create('invoice_lines', function (Blueprint $table) {
            // Bảng này thường dùng khóa chính phức hợp (InvoiceID + Line) hoặc ID tự tăng
            $table->string('InvoiceID', 10);
            $table->foreign('InvoiceID')->references('InvoiceID')->on('invoices')->onDelete('cascade');
            
            $table->string('Line', 10); // Số thứ tự dòng
            $table->string('SKU', 10); // Liên kết sang Product_SKUs

            //Khóa chính phức hợp
            $table->primary(['InvoiceID', 'Line']);
            
            $table->integer('Quantity');
            $table->integer('UnitPrice'); // Giá đơn vị
            $table->integer('Discount')->default(0); // Giảm giá trên dòng này
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices_lines');
    }
};
