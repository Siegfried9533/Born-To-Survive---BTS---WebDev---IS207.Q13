<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalysisChatServices
{
    protected $geminiKey;
    protected $groqKey;
    protected $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/';

    // ĐỊNH NGHĨA DANH SÁCH MODEL ƯU TIÊN
    protected $modelPriority = [
        ['provider' => 'gemini', 'name' => 'gemini-2.0-flash'],
        ['provider' => 'gemini', 'name' => 'gemini-3-flash-preview'],
        ['provider' => 'gemini', 'name' => 'gemini-2.0-flash'],
        ['provider' => 'groq',   'name' => 'llama-3.1-70b-versatile'],
        ['provider' => 'groq',   'name' => 'mixtral-8x7b-32768'],
        ['provider' => 'gemini', 'name' => 'gemini-2.0-flash-lite'],
    ];

    public function __construct()
    {
        $this->geminiKey = config('services.gemini.key');
        $this->groqKey = config('services.groq.key');
    }

    public function analyzeAndRespond($userQuestion)
    {
        // Lấy dữ liệu ngữ cảnh (đã được làm sạch ký tự lỗi)
        $businessData = $this->getAllContextData();

        // Xây dựng prompt chuẩn
        $fullPrompt = $this->buildPrompt($businessData, $userQuestion);

        foreach ($this->modelPriority as $model) {
            $provider = $model['provider'];
            $modelName = $model['name'];

            try {
                Log::info("Đang thử với: $provider ($modelName)");

                // GỌI API THEO PROVIDER
                $response = ($provider === 'gemini')
                    ? $this->callGeminiApi($modelName, $fullPrompt)
                    : $this->callGroqApi($modelName, $fullPrompt);

                // 1. Kiểm tra hết hạn mức (429) hoặc Lỗi nhà cung cấp
                if ($response->status() === 429 || $response->status() === 503) {
                    Log::warning("Model $modelName của $provider tạm thời không khả dụng. Đang đổi...");
                    continue;
                }

                // 2. Kiểm tra lỗi hệ thống (404, 401...)
                if ($response->failed()) {
                    Log::error("Lỗi từ $provider: " . $response->body());
                    continue;
                }

                $result = $response->json();

                // 3. TRÍCH XUẤT VĂN BẢN (Xử lý đa cấu trúc JSON)
                $aiText = ($provider === 'gemini')
                    ? data_get($result, 'candidates.0.content.parts.0.text')
                    : data_get($result, 'choices.0.message.content');

                if ($aiText) {
                    return [
                        'status' => 'success',
                        'data' => [
                            'answer' => $aiText,
                            'recommendation' => "Phân tích hoàn tất bởi trợ lý $provider.",
                            'model_info' => "$provider ($modelName)"
                        ]
                    ];
                }
            } catch (\Exception $e) {
                Log::error("Sự cố nghiêm trọng với $modelName: " . $e->getMessage());
                continue;
            }
        }

        return [
            'status' => 'error',
            'message' => 'Tất cả các "bộ não" AI đều đang bận. Bạn vui lòng thử lại sau 30 giây.'
        ];
    }
    //Hàm gọi API Groq
    private function callGroqApi($modelName, $prompt)
    {
        return Http::withoutVerifying()
            ->withToken($this->groqKey)
            ->timeout(20)
            ->post("https://api.groq.com/openai/v1/chat/completions", [
                'model' => $modelName,
                'messages' => [
                    ['role' => 'system', 'content' => 'Bạn là chuyên gia BI Analyst cao cấp.'],
                    ['role' => 'user', 'content' => $prompt]
                ],
                'temperature' => 0.7
            ]);
    }
    //Hàm gọi API Gemini
    private function callGeminiApi($modelName, $prompt)
    {
        $url = "{$this->baseUrl}{$modelName}:generateContent?key={$this->geminiKey}";

        return Http::withoutVerifying()
            ->timeout(20)
            ->post($url, [
                'contents' => [['parts' => [['text' => $prompt]]]],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 2048,
                ]
            ]);
    }

    //hàm xây dựng prompt với dữ liệu kinh doanh
    private function buildPrompt($data, $question)
    {
        return "
            BẠN LÀ CHUYÊN GIA PHÂN TÍCH DỮ LIỆU KINH DOANH (BI ANALYST) CAO CẤP.
            Nhiệm vụ: Phân tích dữ liệu nội bộ và đưa ra các chiến lược hành động thực tế.

            [DỮ LIỆU HỆ THỐNG]:
            ---
            $data
            ---

            [CÂU HỎI]: \"$question\"

            [YÊU CẦU TRÌNH BÀY]:
            1. 🌟PHÂN TÍCH CON SỐ: Trích xuất các chỉ số liên quan trực tiếp đến câu hỏi.
            2. 🌟PHÁT HIỆN BẤT THƯỜNG: So sánh dữ liệu để tìm ra 'điểm đau' (ví dụ: doanh thu tăng nhưng khách VIP chi tiêu giảm, hoặc cửa hàng lớn nhất có nhân viên năng suất thấp).
            3. 🌟ĐÁNH GIÁ SỨC KHỎE: (Tốt/Cảnh báo/Nguy cấp) kèm lý do ngắn gọn.
            4. 🌟KIẾN NGHỊ CHIẾN LƯỢC: Đưa ra 02 hành động cụ thể. 
               - Một hành động về Tăng trưởng (Sales/Marketing).
               - Một hành động về Vận hành (Quản lý cửa hàng/Nhân sự).

            [RÀO CẢN]:
            - Chỉ dùng dữ liệu đã cung cấp. 
            - Định dạng Markdown chuyên nghiệp, sử dụng list để so sánh.
            - Kết thúc bằng câu: '**Hành động khuyến nghị:** [Nội dung hành động]' in đậm.
        ";
    }

    public function getAllContextData()
    {
        // Lấy mốc thời gian thực tế nhất
        $latestTransaction = DB::table('TRANSACTIONS')->latest('DATE')->first();
        $targetMonth = $latestTransaction ? Carbon::parse($latestTransaction->DATE)->month : now()->month;
        $targetYear = $latestTransaction ? Carbon::parse($latestTransaction->DATE)->year : now()->year;

        return "
            THỜI ĐIỂM BÁO CÁO: Tháng $targetMonth/$targetYear
            ---
            " . $this->getFinanceContext($targetMonth, $targetYear) . "
            ---
            [TOP SẢN PHẨM]:
            " . $this->getTopProductsContext($targetMonth, $targetYear) . "
            ---
            [KHÁCH HÀNG VIP]:
            " . $this->getCustomerContext($targetMonth, $targetYear) . "
            ---
            [CHI NHÁNH & NHÂN SỰ]:
            " . $this->getPerformanceContext($targetMonth, $targetYear) . "
        ";
    }

    private function cleanString($string)
    {
        if (!$string) return 'N/A';
        // Giữ lại tiếng Việt và ký tự cơ bản, loại bỏ ký tự lạ gây lỗi AI
        return preg_replace('/[^\x20-\x7E\x{00C0}-\x{1EF9}]/u', '', $string);
    }

    private function getFinanceContext($m, $y)
    {
        $thisMonth = DB::table('TRANSACTIONS')
            ->whereMonth('DATE', $m)->whereYear('DATE', $y)
            ->sum('LineTotal');

        // Lấy tháng liền trước của mốc target (không phải của now)
        $currentDate = Carbon::create($y, $m, 1);
        $lastMonthDate = $currentDate->copy()->subMonth();

        $prevMonth = DB::table('TRANSACTIONS')
            ->whereMonth('DATE', $lastMonthDate->month)
            ->whereYear('DATE', $lastMonthDate->year)
            ->sum('LineTotal');

        $growth = $prevMonth > 0 ? (($thisMonth - $prevMonth) / $prevMonth) * 100 : 0;
        $growthText = $growth >= 0 ? "Tăng trưởng " . round($growth, 2) . "%" : "Sụt giảm " . abs(round($growth, 2)) . "%";

        return "- Doanh thu tháng $m/$y: " . number_format($thisMonth) . " USD
            - Doanh thu tháng trước: " . number_format($prevMonth) . " USD
            - Trạng thái: $growthText";
    }

    private function getTopProductsContext($m, $y)
    {
        $items = DB::table('TRANSACTIONS')
            ->join('products', 'TRANSACTIONS.ProductID', '=', 'products.ProductID')
            ->whereMonth('TRANSACTIONS.DATE', $m) // Đồng bộ ở đây
            ->whereYear('TRANSACTIONS.DATE', $y)
            ->select(
                'products.Description',
                'products.Category',
                DB::raw('SUM(Quantity) as total_qty'),
                DB::raw('SUM(LineTotal) as total_rev')
            )
            ->groupBy('products.ProductID', 'products.Description', 'products.Category')
            ->orderByDesc('total_qty')
            ->limit(5)->get();

        if ($items->isEmpty()) return "- Không có dữ liệu bán hàng trong tháng này.";

        return $items->map(fn($i) => "- {$i->Description} ({$i->Category}): Bán {$i->total_qty} món, Doanh thu: " . number_format($i->total_rev) . " USD")->implode("\n");
    }

    private function getCustomerContext($m, $y)
    {
        $vips = DB::table('TRANSACTIONS')
            ->join('CUSTOMERS', 'TRANSACTIONS.CustomerID', '=', 'CUSTOMERS.CustomerID')
            ->whereMonth('TRANSACTIONS.DATE', $m) // Đồng bộ ở đây
            ->whereYear('TRANSACTIONS.DATE', $y)
            ->select('CUSTOMERS.Name', DB::raw('SUM(LineTotal) as total_spent'))
            ->groupBy('CUSTOMERS.CustomerID', 'CUSTOMERS.Name')
            ->orderByDesc('total_spent')
            ->limit(3)->get();

        return $vips->map(fn($v) => "- {$this->cleanString($v->Name)}: Chi tiêu " . number_format($v->total_spent) . " USD")->implode("\n");
    }

    private function getPerformanceContext($m, $y)
    {
        $bestStore = DB::table('TRANSACTIONS')
            ->join('stores', 'TRANSACTIONS.StoreID', '=', 'stores.StoreID')
            ->whereMonth('TRANSACTIONS.DATE', $m)
            ->whereYear('TRANSACTIONS.DATE', $y)
            ->select('stores.StoreName', DB::raw('SUM(LineTotal) as rev'))
            ->groupBy('stores.StoreID', 'stores.StoreName')
            ->orderByDesc('rev')->first();

        $bestEmployee = DB::table('TRANSACTIONS')
            ->join('EMPLOYEES', 'TRANSACTIONS.EmployeeID', '=', 'EMPLOYEES.EmployeeID')
            ->whereMonth('TRANSACTIONS.DATE', $m)
            ->whereYear('TRANSACTIONS.DATE', $y)
            ->select('EMPLOYEES.Name', DB::raw('SUM(LineTotal) as rev'))
            ->groupBy('EMPLOYEES.EmployeeID', 'EMPLOYEES.Name')
            ->orderByDesc('rev')->first();

        return "- Cửa hàng xuất sắc nhất tháng: " . ($bestStore->StoreName ?? 'N/A') . " (" . number_format($bestStore->rev ?? 0) . " USD)
            - Nhân viên xuất sắc nhất tháng: " . ($this->cleanString($bestEmployee->Name) ?? 'N/A') . " (" . number_format($bestEmployee->rev ?? 0) . " USD)";
    }
}
