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
        Schema::create('CHAT_LOGS', function (Blueprint $table) {
            $table->id();

            // Chỉnh sửa quan trọng ở đây:
            // 1. Khai báo cột user_id (phải cùng kiểu dữ liệu với cột id của bảng ACCOUNT)
            $table->unsignedBigInteger('user_id');

            // 2. Thiết lập khóa ngoại trỏ đúng vào bảng ACCOUNT
            $table->foreign('user_id')
                ->references('id')
                ->on('ACCOUNT')
                ->onDelete('cascade'); // Tùy chọn: Xóa account thì xóa luôn log

            $table->text('question');
            $table->text('bot_response');
            $table->text('recommendation')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_logs');
    }
};
