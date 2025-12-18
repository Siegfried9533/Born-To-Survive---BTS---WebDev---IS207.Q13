<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalysisChatServices
{
    protected $apiKey;
    protected $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
    }
    public function analyzeAndRespond($userQuestion)
    {
        try {
            // 1. Lấy toàn bộ dữ liệu từ Database
            $businessData = $this->getAllContextData();

            // 2. Xây dựng Prompt (Giữ nguyên logic BI Analyst của bạn)
            $fullPrompt = "
                BẠN LÀ CHUYÊN GIA PHÂN TÍCH DỮ LIỆU NỘI BỘ (BI ANALYST).
                Dưới đây là dữ liệu thực tế trích xuất từ hệ thống quản lý của tôi:
                ---
                $businessData
                ---

                CÂU HỎI CỦA CHỦ CỬA HÀNG: \"$userQuestion\"

                QUY TRÌNH PHÂN TÍCH CỦA BẠN:
                Bước 1: Trích xuất các con số chính liên quan đến câu hỏi.
                Bước 2: So sánh và tìm ra điểm bất thường (Ví dụ: Doanh thu giảm nhưng sản phẩm A vẫn tăng, hoặc chi nhánh B đang kéo thấp chỉ số chung).
                Bước 3: Đưa ra nhận xét về sức khỏe doanh nghiệp (Tốt/Cảnh báo/Nguy cấp).
                Bước 4: Đề xuất 01 hành động cụ thể để xoay chuyển tình hình.

                RÀO CẢN PHÁP LÝ:
                - Tuyệt đối không nhắc đến dữ liệu ngoài hệ thống (Shopee, Lazada...).
                - Nếu không có số liệu cụ thể cho câu hỏi, hãy yêu cầu người dùng cung cấp thêm thông tin thay vì nói 'Dữ liệu không có'.
                - Trình bày bằng Markdown chuyên nghiệp (sử dụng in đậm để nhấn mạnh con số).
            ";

            // 3. Chuẩn bị Payload
            $payload = [
                'contents' => [['parts' => [['text' => $fullPrompt]]]],
                'generationConfig' => [
                    'temperature' => 0.4,
                    'maxOutputTokens' => 1500,
                ]
            ];

            // Log Payload để kiểm tra (chỉ nên bật khi debug)
            Log::info("Payload gửi cho Gemini: " . json_encode($payload));

            // 4. Gửi request DUY NHẤT một lần
            $response = Http::withoutVerifying()
                ->timeout(30) // Thêm timeout để tránh treo app
                ->post("{$this->apiUrl}?key={$this->apiKey}", $payload);

            // 5. Kiểm tra lỗi HTTP
            if ($response->failed()) {
                Log::error("Gemini API Error: " . $response->body());
                return [
                    'answer' => "Tôi gặp khó khăn khi kết nối với máy chủ AI. Vui lòng thử lại sau.",
                    'recommendation' => "Mã lỗi: " . $response->status()
                ];
            }

            $result = $response->json();

            // 6. Trích xuất văn bản an toàn bằng data_get
            $aiText = data_get($result, 'candidates.0.content.parts.0.text');

            // 7. Xử lý trường hợp không có text (Safety filters)
            if (!$aiText) {
                $finishReason = data_get($result, 'candidates.0.finishReason');
                Log::warning("Gemini không trả về text. Lý do: $finishReason");

                if ($finishReason === 'SAFETY') {
                    $aiText = "Câu hỏi hoặc dữ liệu bị hệ thống an toàn từ chối xử lý.";
                } else {
                    $aiText = "AI đã nhận dữ liệu nhưng không thể đưa ra câu trả lời (Lý do: $finishReason).";
                }
            }

            return [
                'answer' => $aiText,
                'recommendation' => 'Phân tích dựa trên báo cáo Snapshot hệ thống.'
            ];
        } catch (\Exception $e) {
            Log::error("General Analysis Error: " . $e->getMessage());
            return [
                'answer' => 'Hệ thống phân tích đang gặp sự cố kỹ thuật.',
                'recommendation' => $e->getMessage()
            ];
        }
    }
    // Lấy toàn bộ dữ liệu ngữ cảnh hiện tại để AI tham khảo
    public function getAllContextData()
    {
        //đồng nhất thời gian
        // Xác định mốc thời gian đồng bộ
        $targetMonth = now()->month;
        $targetYear = now()->year;

        // Truyền mốc thời gian vào các hàm con
        $finance = $this->getFinanceContext($targetMonth, $targetYear);
        $products = $this->getTopProductsContext($targetMonth, $targetYear);
        $customers = $this->getCustomerContext($targetMonth, $targetYear);
        $performance = $this->getPerformanceContext($targetMonth, $targetYear);

        return "
            [BÁO CÁO TÀI CHÍNH THÁNG]:
            $finance

            [PHÂN TÍCH SẢN PHẨM]:
            $products

            [KHÁCH HÀNG CHI TIÊU NHIỀU NHẤT]:
            $customers

            [HIỆU SUẤT CỬA HÀNG & NHÂN SỰ]:
            $performance
            ";
    }

    private function getFinanceContext($m, $y)
    {
        $thisMonth = DB::table('transactions')
            ->whereMonth('DATE', $m)->whereYear('DATE', $y)
            ->sum('LineTotal');

        $lastMonthDate = now()->subMonth();
        $prevMonth = DB::table('transactions')
            ->whereMonth('DATE', $lastMonthDate->month)
            ->whereYear('DATE', $lastMonthDate->year)
            ->sum('LineTotal');

        $growth = $prevMonth > 0 ? (($thisMonth - $prevMonth) / $prevMonth) * 100 : 0;

        return "- Doanh thu tháng này: " . number_format($thisMonth) . " VND
            - Doanh thu tháng trước: " . number_format($prevMonth) . " VND
            - Tăng trưởng: " . round($growth, 2) . "%";
    }

    private function getTopProductsContext($m, $y)
    {
        $items = DB::table('transactions')
            ->join('products', 'transactions.ProductID', '=', 'products.ProductID')
            ->whereMonth('transactions.DATE', $m) // Đồng bộ ở đây
            ->whereYear('transactions.DATE', $y)
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

        return $items->map(fn($i) => "- {$i->Description} ({$i->Category}): Bán {$i->total_qty} món, Doanh thu: " . number_format($i->total_rev) . " VND")->implode("\n");
    }

    private function getCustomerContext($m, $y)
    {
        $vips = DB::table('transactions')
            ->join('customers', 'transactions.CustomerID', '=', 'customers.CustomerID')
            ->whereMonth('transactions.DATE', $m) // Đồng bộ ở đây
            ->whereYear('transactions.DATE', $y)
            ->select('customers.Name', DB::raw('SUM(LineTotal) as total_spent'))
            ->groupBy('customers.CustomerID', 'customers.Name')
            ->orderByDesc('total_spent')
            ->limit(3)->get();

        return $vips->map(fn($v) => "- {$v->Name}: Chi tiêu " . number_format($v->total_spent) . " VND")->implode("\n");
    }

    private function getPerformanceContext($m, $y)
    {
        $bestStore = DB::table('transactions')
            ->join('stores', 'transactions.StoreID', '=', 'stores.StoreID')
            ->whereMonth('transactions.DATE', $m)
            ->whereYear('transactions.DATE', $y)
            ->select('stores.StoreName', DB::raw('SUM(LineTotal) as rev'))
            ->groupBy('stores.StoreID', 'stores.StoreName')
            ->orderByDesc('rev')->first();

        $bestEmployee = DB::table('transactions')
            ->join('employees', 'transactions.EmployeeID', '=', 'employees.EmployeeID')
            ->whereMonth('transactions.DATE', $m)
            ->whereYear('transactions.DATE', $y)
            ->select('employees.Name', DB::raw('SUM(LineTotal) as rev'))
            ->groupBy('employees.EmployeeID', 'employees.Name')
            ->orderByDesc('rev')->first();

        return "- Cửa hàng xuất sắc nhất tháng: " . ($bestStore->StoreName ?? 'N/A') . " (" . number_format($bestStore->rev ?? 0) . " VND)
            - Nhân viên xuất sắc nhất tháng: " . ($bestEmployee->Name ?? 'N/A') . " (" . number_format($bestEmployee->rev ?? 0) . " VND)";
    }
}
