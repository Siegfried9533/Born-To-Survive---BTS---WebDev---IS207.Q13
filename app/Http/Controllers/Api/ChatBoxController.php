<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\AnalysisChatServices;
use App\Models\ChatLog;

class ChatBoxController extends Controller
{
    protected $analysisService;

    public function __construct(AnalysisChatServices $analysisService)
    {
        $this->analysisService = $analysisService;
    }

    public function ask(Request $request)
    {
        $message = $request->input('message');

        // Gọi Service xử lý (Service này sẽ thực hiện cả 2 bước của Function Calling)
        $result = $this->analysisService->analyzeAndRespond($message);

        // Kiểm tra nếu có lỗi kết nối API dẫn đến result['answer'] bị null
        if (!$result['answer']) {
            return response()->json(['status' => 'error', 'message' => 'AI không trả về nội dung'], 500);
        }

        // Sau khi đã có câu trả lời thực sự từ AI, mới tiến hành lưu Log
        ChatLog::create([
            'user_id' => auth()->id() ?? 1, // Đảm bảo user_id tồn tại như đã xử lý trước đó
            'question' => $message,
            'bot_response' => $result['answer'], // Chắc chắn không null nữa
            'recommendation' => $result['recommendation'] ?? ''
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $result
        ]);
    }

    // Các hàm history, suggestions, clearHistory giữ nguyên logic cũ nhưng cập nhật Auth::id()
}
