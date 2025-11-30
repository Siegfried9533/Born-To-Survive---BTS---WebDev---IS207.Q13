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
        // 1. Bảng STORES (Cửa hàng)
        Schema::create('stores', function (Blueprint $table) {
            $table->string('StoreID', 10)->primary(); // Khóa chính là chuỗi
            $table->string('Name', 255);
            $table->string('City', 50)->nullable();
            $table->string('Country', 50)->nullable();
            $table->string('ZIPCode', 10)->nullable();
            $table->string('Latitude', 10)->nullable();
            $table->string('Longitude', 10)->nullable();
            $table->timestamps();
        });

        // 2. Bảng EMPLOYEES (Nhân viên)
        Schema::create('employees', function (Blueprint $table) {
            $table->string('EmpID', 10)->primary();
            $table->string('Name', 255);
            $table->string('Position', 255)->nullable();
            
            // Khóa ngoại liên kết với bảng STORES
            $table->string('StoreID', 10);
            $table->foreign('StoreID')->references('StoreID')->on('stores');
            
            $table->timestamps();
        });

        // 3. Bảng CUSTOMERS (Khách hàng)
        Schema::create('customers', function (Blueprint $table) {
            $table->string('CusID', 10)->primary();
            $table->string('Name', 255);
            $table->string('Phone', 10)->nullable();
            $table->string('Email', 255)->nullable();
            $table->string('City', 50)->nullable();
            $table->string('Country', 50)->nullable();
            $table->string('Gender', 6)->nullable();
            $table->dateTime('DateOfBirth')->nullable();
            $table->string('JobTitle', 255)->nullable();
            $table->timestamps();
        });

        // 4. Bảng PRODUCTS (Sản phẩm)
        Schema::create('products', function (Blueprint $table) {
            $table->string('ProdID', 10)->primary();
            $table->string('Category', 255)->nullable();
            $table->string('SubCategory', 255)->nullable();
            $table->string('Description', 255)->nullable();
            $table->integer('ProductionCost')->default(0);
            $table->timestamps();
        });

        // 5. Bảng PRODUCT_SKUs (Chi tiết biến thể sản phẩm)
        Schema::create('product_skus', function (Blueprint $table) {
            $table->string('SKU', 10)->primary();
            $table->string('Color', 20)->nullable();
            $table->string('Size', 5)->nullable();
            
            // Khóa ngoại liên kết với PRODUCTS
            $table->string('ProdID', 10);
            $table->foreign('ProdID')->references('ProdID')->on('products');
            
            $table->timestamps();
        });

        // 6. Bảng DISCOUNTS (Giảm giá)
        Schema::create('discounts', function (Blueprint $table) {
            $table->string('DiscountID', 10)->primary();
            $table->string('Name', 50);
            $table->string('Description', 255)->nullable();
            $table->float('DiscountRate')->default(0);
            $table->string('Category', 255)->nullable();
            $table->string('SubCategory', 255)->nullable();
            $table->dateTime('StartDate')->nullable();
            $table->dateTime('EndDate')->nullable();
            $table->timestamps();
        });

        // 7. Bảng INVOICES (Hóa đơn)
        Schema::create('invoices', function (Blueprint $table) {
            $table->string('InvoiceID', 10)->primary();
            $table->dateTime('Date');
            $table->string('TransactionType', 255)->nullable();
            $table->string('PaymentMethod', 50)->nullable();
            $table->string('Currency', 5)->default('USD');
            
            // Các khóa ngoại
            $table->string('CusID', 10);
            $table->foreign('CusID')->references('CusID')->on('customers');

            $table->string('EmpID', 10);
            $table->foreign('EmpID')->references('EmpID')->on('employees');

            $table->string('StoreID', 10);
            $table->foreign('StoreID')->references('StoreID')->on('stores');
            
            $table->timestamps();
        });

        // 8. Bảng INVOICE_LINES (Chi tiết hóa đơn)
        Schema::create('invoice_lines', function (Blueprint $table) {
            // Thiết lập khóa ngoại
            $table->string('InvoiceID', 10);
            $table->foreign('InvoiceID')->references('InvoiceID')->on('invoices');

            $table->string('Line', 10); // Số dòng
            
            $table->integer('Quantity')->default(1);
            $table->integer('UnitPrice')->default(0);
            $table->integer('Discount')->default(0);

            $table->string('SKU', 10);
            $table->foreign('SKU')->references('SKU')->on('product_skus');

            $table->string('DiscountID', 10)->nullable(); // Có thể không có mã giảm giá
            $table->foreign('DiscountID')->references('DiscountID')->on('discounts');
            
            // Thiết lập Khóa Chính Phức Hợp (Composite Primary Key)
            // Vì trong hình PK nằm ở cả InvoiceID và Line
            $table->primary(['InvoiceID', 'Line']);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Xóa bảng theo thứ tự ngược lại để tránh lỗi khóa ngoại
        Schema::dropIfExists('invoice_lines');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('discounts');
        Schema::dropIfExists('product_skus');
        Schema::dropIfExists('products');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('employees');
        Schema::dropIfExists('stores');
    }
};