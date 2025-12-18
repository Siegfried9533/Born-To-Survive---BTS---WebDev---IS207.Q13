<?php

namespace App\Http\Controllers\Api;

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
        $salesData = DB::table('transactions')
            ->select(
                // Gom nhóm theo ngày (Bỏ giờ phút)
                DB::raw('DATE(transactions.DATE) as date'),

                // Tính tổng doanh thu: SUM( (SL * Giá) - Giảm giá )
                DB::raw('SUM(CASE WHEN transactions.LineTotal IS NOT NULL THEN transactions.LineTotal ELSE (transactions.Quantity * transactions.UnitPrice) END) as revenue'),

                // Đếm tổng số đơn hàng trong ngày
                DB::raw('COUNT(DISTINCT transactions.InvoiceID) as total_orders')
            )

            // Lọc theo khoảng thời gian
            ->whereBetween('transactions.DATE', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59'])

            // Gom nhóm và Sắp xếp
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($item) {
                // ✅ Cast sang số để JavaScript không cần parse
                return [
                    'date' => $item->date,
                    'revenue' => (float) $item->revenue,
                    'total_orders' => (int) $item->total_orders
                ];
            });

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
