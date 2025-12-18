<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Lấy ngày từ request, nếu không truyền sẽ là null
        $fromDate = $request->query('from');
        $toDate   = $request->query('to');

        $amountExprSql = 'COALESCE(transactions.LineTotal, transactions.Quantity * transactions.UnitPrice)';

        // Tạo một Query Builder gốc cho bảng transactions
        $baseQuery = DB::table('transactions')
            // Logic: CHỈ lọc nếu có $fromDate và $toDate
            ->when($fromDate && $toDate, function ($query) use ($fromDate, $toDate) {
                return $query->whereBetween('DATE', [$fromDate, $toDate]);
            });
        // 1. TỔNG DOANH THU
        $totalRevenue = (clone $baseQuery) // Dùng clone để không làm hỏng query gốc
            ->selectRaw("SUM($amountExprSql) as total")
            ->value('total') ?? 0;

        // 2. ĐƠN HÀNG MỚI (New Orders)
        // Logic: Đếm số lượng đơn (InvoiceID) được tạo trong ngày hôm nay
        $newOrders = (clone $baseQuery)
            ->distinct('InvoiceID')
            ->count('InvoiceID');

        // 3. SẢN PHẨM BÁN CHẠY (Top Products)
        // Logic: Join transactions -> products. Group by Tên sản phẩm và sắp xếp theo tổng số lượng bán.
        $topProducts = (clone $baseQuery)
            ->join('products', 'transactions.ProductID', '=', 'products.ProductID')
            ->select(
                'products.ProductID as product_id',
                DB::raw('CAST(SUM(transactions.Quantity) AS UNSIGNED) as total_sold'),
                DB::raw("CAST(SUM($amountExprSql) AS DECIMAL(15,2)) as revenue_generated")
            )
            ->groupBy('products.ProductID')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                $item->revenue_generated = (float) $item->revenue_generated;
                return $item;
            });

        // 4. CẢNH BÁO (Alerts)
        $alerts = [];

        // Alert A: Các mã giảm giá (Discounts) sắp hết hạn trong 7 ngày tới
        $expiringDiscounts = DB::table('discounts')
            ->where('End', '>=', Carbon::now())
            ->where('End', '<=', Carbon::now()->addDays(7))
            ->select('Description', 'End')
            ->get();

        foreach ($expiringDiscounts as $discount) {
            $alerts[] = [
                'type' => 'warning',
                'message' => "Chương trình giảm giá '{$discount->Description}' sẽ hết hạn vào " . Carbon::parse($discount->End)->format('d/m/Y')
            ];
        }

        // Alert B: Giao dịch giá trị lớn bất thường (Ví dụ > 10,000,000) trong ngày
        // Cần subquery để tính tổng giá trị từng đơn hàng
        $highValueTrans = DB::table('transactions')
            ->whereDate('transactions.DATE', Carbon::today())
            ->select('transactions.InvoiceID', DB::raw("SUM($amountExprSql) as total_val"))
            ->groupBy('transactions.InvoiceID')
            ->having('total_val', '>', 10000000) // Ngưỡng ví dụ: 10 triệu
            ->count();

        if ($highValueTrans > 0) {
            $alerts[] = [
                'type' => 'info',
                'message' => "Hôm nay có {$highValueTrans} đơn hàng giá trị cao (trên 10tr)."
            ];
        }

        // 5. GMV EVOLUTION – Linh hoạt theo bộ lọc
        // Lấy ngày bắt đầu và kết thúc thực tế từ request hoặc mặc định 12 tháng
        $gmvStart = $fromDate ?: Carbon::now()->subMonths(11)->startOfMonth()->toDateString();
        $gmvEnd   = $toDate ?: Carbon::now()->endOfMonth()->toDateString();

        $gmvByMonth = DB::table('transactions')
            ->whereBetween('DATE', [$gmvStart, $gmvEnd]) // Khớp với bộ lọc
            ->selectRaw('DATE_FORMAT(DATE, "%Y-%m") as ym')
            ->selectRaw("SUM($amountExprSql) as gmv")
            ->groupBy('ym')
            ->orderBy('ym')
            ->pluck('gmv', 'ym');

        // Tạo cursor chạy từ gmvStart đến gmvEnd để đảm bảo không mất tháng nào
        $startDateObj = Carbon::parse($gmvStart)->startOfMonth();
        $endDateObj   = Carbon::parse($gmvEnd)->endOfMonth();
        $diffInMonths = $startDateObj->diffInMonths($endDateObj) + 1;

        // Giới hạn để tránh treo trình duyệt nếu dữ liệu quá nhiều năm
        if ($diffInMonths > 24 && !$fromDate) {
            $startDateObj = Carbon::now()->subMonths(11)->startOfMonth();
            $diffInMonths = 12;
        }

        $gmvLabels = [];
        $gmvValues = [];
        $gmvGrowth = [];
        $cursor = $startDateObj->copy();
        $prevGmv = null;

        for ($i = 0; $i < $diffInMonths; $i++) {
            $ymKey = $cursor->format('Y-m');
            $currentGmv = (float) ($gmvByMonth[$ymKey] ?? 0);

            $gmvLabels[] = $cursor->format('M Y'); // Ví dụ: Dec 2025
            $gmvValues[] = $currentGmv;

            // Tính growth %
            if ($prevGmv === null) {
                $growth = 0;
            } elseif ($prevGmv == 0) {
                $growth = ($currentGmv > 0) ? 100 : 0;
            } else {
                $growth = (($currentGmv - $prevGmv) / $prevGmv) * 100;
            }

            $gmvGrowth[] = round($growth, 1);
            $prevGmv = $currentGmv;
            $cursor->addMonth();
        }

        $gmvEvolution = [
            'labels' => $gmvLabels,
            'gmv'    => $gmvValues,
            'growth' => $gmvGrowth,
        ];

        // 6. MODALAB SYNTHESIS – TOP 6 CATEGORY THEO DOANH THU (%)
        $categoryData = (clone $baseQuery)
            ->join('products', 'transactions.ProductID', '=', 'products.ProductID')
            ->select(
                'products.Category as category',
                DB::raw("SUM($amountExprSql) as revenue")
            )
            ->groupBy('products.Category')
            ->orderByDesc('revenue')
            ->limit(6)
            ->get();

        $totalCategoryRevenue = $categoryData->sum('revenue');

        $modalabLabels = [];
        $modalabValues = [];

        foreach ($categoryData as $row) {
            $modalabLabels[] = $row->category ?? 'N/A';

            if ($totalCategoryRevenue > 0) {
                $percent = ($row->revenue / $totalCategoryRevenue) * 100;
            } else {
                $percent = 0;
            }

            $modalabValues[] = round($percent, 1);
        }

        $modalabSynthesis = [
            'labels' => $modalabLabels,
            'values' => $modalabValues,
        ];

        // 7. SALES CHANNELS – PHÂN BỔ THEO PHƯƠNG THỨC THANH TOÁN (%)
        $channels = (clone $baseQuery)
            ->select('PaymentMethod', DB::raw('COUNT(*) as total'))
            ->groupBy('PaymentMethod')
            ->get();

        $totalChannels = $channels->sum('total');

        $channelLabels = [];
        $channelValues = [];
        $channelColors = [];

        $palette = [
            '#647acb',
            '#FFCCFF',
            '#a0aec0',
            '#f6ad55',
            '#48bb78',
            '#63b3ed',
            '#f56565',
        ];

        $colorIndex = 0;

        foreach ($channels as $row) {
            $label = $row->PaymentMethod ?: 'Unknown';

            $channelLabels[] = $label;

            if ($totalChannels > 0) {
                $percent = ($row->total / $totalChannels) * 100;
            } else {
                $percent = 0;
            }

            $channelValues[] = round($percent, 1);

            $channelColors[] = $palette[$colorIndex % count($palette)];
            $colorIndex++;
        }

        $salesChannels = [
            'labels' => $channelLabels,
            'values' => $channelValues,
            'colors' => $channelColors,
        ];

        // Trả về JSON format
        return response()->json([
            // Metrics tổng quan (giữ nguyên để có thể dùng cho dashboard cards sau này)
            'total_revenue' => (float) $totalRevenue,
            'new_orders'    => (int) $newOrders,
            'top_products'  => $topProducts,
            'alerts'        => $alerts,

            // Dữ liệu cho 3 biểu đồ trong overview.js
            'GMV_Evolution'     => $gmvEvolution,
            'Modalab_Synthesis' => $modalabSynthesis,
            'Sales_Channels'    => $salesChannels,
        ]);
    }
}
