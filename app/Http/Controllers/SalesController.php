<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Invoices;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SalesController extends Controller
{
    public function index(Request $request)
    {
        // Lọc thời gian
        // Nếu không truyền, mặc định lấy 30 ngày gần nhất
        $fromDate = $request->input('from') ?? Carbon::now()->subDays(30)->format('Y-m-d');
        $toDate = $request->input('to') ?? Carbon::now()->format('Y-m-d');

        // Gom nhóm tính toán
        $salesData = Invoices::query()
            // JOIN bảng chi tiết để lấy tiền
            ->join('invoice_lines', 'invoices.InvoiceID', '=', 'invoice_lines.InvoiceID')
            
            ->select(
                // Gom nhóm theo ngày (Bỏ giờ phút)
                DB::raw('DATE(invoices.Date) as date'), 
                
                // Tính tổng doanh thu: SUM( (SL * Giá) - Giảm giá )
                DB::raw('SUM((invoice_lines.Quantity * invoice_lines.UnitPrice) - invoice_lines.Discount) as revenue'),
                
                // Đếm tổng số đơn hàng trong ngày
                DB::raw('COUNT(DISTINCT invoices.InvoiceID) as total_orders')
            )
            
            // Lọc theo khoảng thời gian
            ->whereBetween('invoices.Date', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59'])
            
            // Gom nhóm và Sắp xếp
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Để hiển thị con số to đùng trên góc biểu đồ
        $totalRevenue = $salesData->sum('revenue');
        $totalOrders = $salesData->sum('total_orders');

        return response()->json([
            'status' => 'success',
            'filter' => [
                'from' => $fromDate,
                'to' => $toDate
            ],
            'summary' => [
                'total_revenue' => (int)$totalRevenue,
                'total_revenue_formatted' => number_format($totalRevenue) . ' VND',
                'total_orders' => (int)$totalOrders
            ],
            'chart_data' => $salesData
        ]);
    }
}
