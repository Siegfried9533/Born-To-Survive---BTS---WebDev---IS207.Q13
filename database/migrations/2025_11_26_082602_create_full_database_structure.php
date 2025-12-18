<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // Thêm thư viện này để chạy lệnh insert

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Bảng PRODUCTS (Sản phẩm)
        Schema::create('products', function (Blueprint $table) {
            // SQL: ProductID INTEGER PRIMARY KEY
            // Lưu ý: Nếu ID không tự tăng thì dùng integer()->primary()
            $table->integer('ProductID')->primary();

            $table->string('Category', 255)->nullable();
            $table->string('SubCategory', 255)->nullable();
            $table->string('Description', 255)->nullable();
            $table->string('Color', 255)->nullable();
            $table->string('Size', 255)->nullable();
            $table->integer('ProductCost')->nullable();

            $table->timestamps();
        });

        // 2. Bảng CUSTOMERS (Khách hàng)
        Schema::create('customers', function (Blueprint $table) {
            // SQL: CustomerID BIGINT PRIMARY KEY
            $table->bigInteger('CustomerID')->primary();

            $table->string('Name', 255)->nullable();
            $table->string('Email', 255)->nullable();
            $table->string('Telephone', 255)->nullable();
            $table->string('City', 255)->nullable();
            $table->string('Country', 255)->nullable();
            $table->string('Gender', 255)->nullable();
            $table->dateTime('DateOfBirth')->nullable();
            $table->string('JobTitle', 255)->nullable();

            $table->timestamps();
        });

        // 3. Bảng DISCOUNTS (Giảm giá)
        Schema::create('discounts', function (Blueprint $table) {
            // SQL: DiscountID INTEGER IDENTITY(1,1) PRIMARY KEY
            // IDENTITY(1,1) tương đương với increments trong Laravel
            $table->increments('DiscountID'); // FIXED: Sử dụng increments() để tự động tăng 

            $table->decimal('Discount', 10, 2)->nullable();
            $table->dateTime('Start')->nullable();
            $table->dateTime('End')->nullable(); // 'End' là từ khóa SQL nhưng Laravel xử lý được
            $table->string('Description', 255)->nullable();
            $table->string('Category', 255)->nullable();
            $table->string('SubCategory', 255)->nullable();

            $table->timestamps();
        });


        // 4. Bảng STORES (Cửa hàng)
        Schema::create('stores', function (Blueprint $table) {
            // SQL: StoreID INTEGER PRIMARY KEY
            $table->integer('StoreID')->primary();

            $table->string('Country', 255)->nullable();
            $table->string('City', 255)->nullable();
            $table->string('StoreName', 255)->nullable();
            $table->integer('NumberOfEmployee')->nullable();
            $table->string('ZipCode', 255)->nullable();
            $table->string('Latitude', 255)->nullable();
            $table->string('Longitude', 255)->nullable();

            $table->timestamps();
        });

        // 5. Bảng EMPLOYEES (Nhân viên) - Phụ thuộc vào STORES
        Schema::create('employees', function (Blueprint $table) {
            // SQL: EmployeeID INTEGER PRIMARY KEY
            $table->integer('EmployeeID')->primary();

            $table->integer('StoreID'); // FK
            $table->string('Name', 255)->nullable();
            $table->string('Position', 255)->nullable();

            $table->timestamps();

            // Khóa ngoại: FK_Employee_Store
            $table->foreign('StoreID')->references('StoreID')->on('stores');
        });

        // 6. Bảng TRANSACTIONS (Giao dịch) - Bảng trung tâm
        Schema::create('transactions', function (Blueprint $table) {
            // SQL: InvoiceID INTEGER IDENTITY(1,1) PRIMARY KEY
            $table->integer('InvoiceID');

            $table->string('InvoiceHASH', 20)->nullable();
            $table->integer('Line')->nullable();

            // Các cột dùng làm khóa ngoại
            $table->bigInteger('CustomerID'); // Phải khớp kiểu với CustomerID ở bảng customers
            $table->integer('ProductID');     // Phải khớp kiểu với ProductID ở bảng products
            $table->string('Size', 255)->nullable();
            $table->string('Color', 255)->nullable();
            $table->integer('UnitPrice')->nullable();
            $table->integer('Quantity')->nullable();
            $table->dateTime('DATE')->nullable();
            $table->unsignedInteger('DiscountID')->nullable(); // FIXED: Phải unsigned để khớp với increments()

            $table->integer('LineTotal')->nullable();

            $table->integer('StoreID');
            $table->integer('EmployeeID');


            $table->string('Currency', 255)->nullable();
            $table->string('CurrencySymbol', 255)->nullable();
            $table->string('SKU', 255)->nullable();
            $table->string('TransactionType', 255)->nullable();
            $table->string('PaymentMethod', 255)->nullable();
            $table->integer('InvoiceTotal')->nullable();

            $table->timestamps();

            // Thiết lập các khóa ngoại (Foreign Keys)
            $table->foreign('CustomerID')->references('CustomerID')->on('customers');
            $table->foreign('ProductID')->references('ProductID')->on('products');
            $table->foreign('DiscountID')->references('DiscountID')->on('discounts');
            $table->foreign('EmployeeID')->references('EmployeeID')->on('employees');
            $table->foreign('StoreID')->references('StoreID')->on('stores');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Xóa bảng con trước, bảng cha sau (Reverse Order)
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('employees');
        Schema::dropIfExists('stores');
        Schema::dropIfExists('discounts_bridge');
        Schema::dropIfExists('discounts');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('products');
    }
};
