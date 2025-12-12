<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\AnalysisChatServices;

class ChatBoxController extends Controller
{
    // API: POST /api/chat/ask - Gửi câu hỏi và nhận phản hồi
    public function ask(Request $request)
    {
        // 1. Validate đầu vào
        $request->validate([
            'message' => 'required|string'
        ]);

        // 2. Khởi tạo Service (Bộ não)
        $service = new AnalysisChatServices();
        
        // 3. Lấy kết quả phân tích
        $result = $service->analyzeAndRespond($request->input('message'));

        // 4. Lưu log vào database
        \App\Models\ChatLog::create([
            'user_id' => 1, // Tạm thời hardcode là 1 (hoặc $request->user()->id nếu đã có Auth)
            'question' => $request->input('message'),
            'bot_response' => $result['answer'],
            'recommendation' => $result['recommendation']
        ]);

        // 5. Trả về JSON chuẩn
        return response()->json([
            'status' => 'success',
            'data' => [
                'user_question' => $request->input('message'),
                'bot_answer' => $result['answer'],
                'bot_recommendation' => $result['recommendation']
            ]
        ]);
    }
    // API: GET /api/chat/history - Lấy lịch sử chat
    public function history(Request $request)
    {
        // Lấy 20 tin nhắn gần nhất, sắp xếp mới nhất lên đầu
        $logs = \App\Models\ChatLog::query()
            ->where('user_id', 1) // Lọc theo user hiện tại (Tạm thời là 1)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        // Format lại dữ liệu cho đẹp (nếu cần)
        $data = $logs->transform(function ($log) {
            return [
                'id' => $log->id,
                'question' => $log->question,
                'bot_response' => [
                    'answer' => $log->bot_response,
                    'recommendation' => $log->recommendation
                ],
                'time' => $log->created_at->format('H:i d/m/Y') // VD: 14:30 29/11/2025
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }
    //GET /api/chat/suggestions - Lấy gợi ý câu hỏi
    public function suggestions(Request $request){
        $prompts =[
            "Doanh thu tháng này thế nào?",
            "Top khách hàng VIP là ai?",
            "Tình hình khách mới trong tháng?",
            "Sản phẩm nào đang bán chạy nhất?",
            "Cần làm gì để tăng doanh thu?"
        ];
        return response()->json([
            'status' => 'success',
            'data' => $prompts
        ]);
    }
    //DELETE /api/chat/history - Xoá lịch sử chat
    public function clearHistory(Request $request)
    {
        //lấy user hiện tại
        $userId = 1; // Tạm thời hardcode là 1 (hoặc $request->user()->id nếu đã có Auth)
        // Xoá tất cả lịch sử chat của user hiện tại (Tạm thời là user_id = 1)
        $deleteCount = \App\Models\ChatLog::query()
            ->where('user_id', $userId)
            ->delete();

        return response()->json([
            'status' => 'success',
            'deleted_count' => $deleteCount,
            'message' => 'Lịch sử chat đã được xoá.'
        ]);
    }
}
