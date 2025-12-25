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
        $message = $request->input('question');

        // Gọi Service xử lý (Service này sẽ thực hiện cả 2 bước của Function Calling)
        $result = $this->analysisService->analyzeAndRespond($message);

        // BƯỚC 1: Kiểm tra trạng thái status
        if (!isset($result['status']) || $result['status'] === 'error') {
            return response()->json([
                'status' => 'error',
                'message' => $result['message'] ?? 'AI không trả về nội dung'
            ], 500);
        }

        // BƯỚC 2: Trích xuất dữ liệu từ trong ['data']
        $aiData = $result['data'];
        $answer = $aiData['answer'];
        $recommendation = $aiData['recommendation'] ?? '';

        // BƯỚC 3: Lưu Log (Lúc này chắc chắn các biến đã có dữ liệu)
        ChatLog::create([
            'user_id' => $request->user_id ?? 1,
            'question' => $message,
            'bot_response' => $answer,
            'recommendation' => $recommendation
        ]);

        // BƯỚC 4: Trả về kết quả cho Frontend
        return response()->json([
            'status' => 'success',
            'data' => [
                'answer' => $answer,
                'recommendation' => $recommendation,
                'model_info' => $aiData['model_info'] ?? 'N/A'
            ]
        ]);
    }
}
