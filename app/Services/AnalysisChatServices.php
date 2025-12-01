<?php

namespace App\Services;

use App\Models\Invoices;
use App\Models\Customers;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalysisChatServices
{
    //Hàm chính: Nhận message -> Trả về kết quả
    public function analyzeAndRespond($message)
    {
        $msg = strtolower($message); // Chuyển chữ thường để dễ so sánh

        // 1. Nếu hỏi về DOANH THU
        if (str_contains($msg, 'doanh thu') || str_contains($msg, 'tiền') || str_contains($msg, 'bán')) {
            return $this->analyzeSales();
        }

        // 2. Nếu hỏi về KHÁCH HÀNG
        if (str_contains($msg, 'khách') || str_contains($msg, 'vip')) {
            return $this->analyzeCustomers();
        }

        // 3. Không hiểu
        return [
            'answer' => "Xin lỗi, tôi chỉ là trợ lý ảo phân tích dữ liệu. Bạn hãy thử hỏi về 'doanh thu' hoặc 'khách hàng' nhé!",
            'recommendation' => null
        ];
    }

    // --- LOGIC PHÂN TÍCH DOANH THU ---
    private function analyzeSales()
    {
        // Lấy doanh thu tháng này currentRevenue
        $currentMonth = Carbon::now()->month;
        $currentRevenue = Invoices::join('invoice_lines', 'invoices.InvoiceID', '=', 'invoice_lines.InvoiceID')
            ->whereMonth('invoices.Date', $currentMonth)
            ->sum(DB::raw('(invoice_lines.Quantity * invoice_lines.UnitPrice) - invoice_lines.Discount'));

        //lấy doanh thu tháng trước để so sánh previousRevenue
        $previousMonth = Carbon::now()->subMonth()->month;
        $previousRevenue = Invoices::join('invoice_lines', 'invoices.InvoiceID', '=', 'invoice_lines.InvoiceID')
            ->whereMonth('invoices.Date', $previousMonth)
            ->sum(DB::raw('(invoice_lines.Quantity * invoice_lines.UnitPrice) - invoice_lines.Discount'));


        // Logic đưa ra lời khuyên
        if ($currentRevenue < $previousRevenue) {
            $diff = number_format($previousRevenue - $currentRevenue);
            $recommendation = "Cảnh báo: Doanh thu chưa đạt chỉ tiêu (Còn thiếu $diff VND). Đề xuất: Cần chạy chương trình Flash Sale cuối tháng để đẩy số.";
        } else {
            $recommendation = "Tuyệt vời: Doanh thu đã vượt chỉ tiêu. Đề xuất: Nhập thêm hàng mới để chuẩn bị cho tháng sau.";
        }

        return [
            'answer' => "Doanh thu tháng $currentMonth hiện tại là: " . number_format($currentRevenue) . " VND.",
            'recommendation' => $recommendation
        ];
    }

    // --- LOGIC PHÂN TÍCH KHÁCH HÀNG ---
    private function analyzeCustomers()
    {
        // Đếm khách mới trong tháng
        $newCus = Customers::whereMonth('created_at', Carbon::now()->month)->count();

        if ($newCus < 10) {
            $recommendation = "Số lượng khách mới quá thấp. Đề xuất: Kiểm tra lại chiến dịch Marketing hoặc gửi mã giảm giá cho khách hàng cũ giới thiệu bạn bè.";
        } else {
            $recommendation = "Tốc độ tăng trưởng khách hàng ổn định.";
        }

        return [
            'answer' => "Tháng này chúng ta có thêm $newCus khách hàng mới.",
            'recommendation' => $recommendation
        ];
    }
}