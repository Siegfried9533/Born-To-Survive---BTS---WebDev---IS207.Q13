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
        Schema::create('chat_logs', function (Blueprint $table) {
            $table->id();
            // User nào hỏi?
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Hoặc admin_id tùy hệ thống
            
            $table->text('question');      // Câu hỏi từ User
            $table->text('bot_response');  // Phản hồi từ Chatbot
            $table->text('recommendation')->nullable(); // Lời khuyên thêm từ Chatbot
            $table->json('data_snapshot')->nullable(); // Lưu kèm số liệu lúc đó (JSON) để vẽ biểu đồ nhỏ nếu cần
            
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
