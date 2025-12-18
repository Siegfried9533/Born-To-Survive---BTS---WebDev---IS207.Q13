<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Biểu thức tính giá trị dòng giao dịch (dùng chung cho mọi thống kê)
        $amountExprSql = 'COALESCE(transactions.LineTotal, transactions.Quantity * transactions.UnitPrice)';
        $amountExpr    = DB::raw($amountExprSql);
        $anchorInput = request()->input('anchor');
        $endDate  = $anchorInput ? Carbon::parse($anchorInput) : (DB::table('transactions')->max('DATE') ? Carbon::parse(DB::table('transactions')->max('DATE')) : Carbon::today());
        $todayStart  = $endDate->copy()->startOfDay();
        $todayEnd    = $endDate->copy()->endOfDay();
        $monthStart  = $endDate->copy()->startOfMonth();
        $monthEnd    = $endDate->copy()->endOfMonth();

        // Filter stores (optional)
        $storeIds = request()->input('stores', []);
        $storeFilter = function($q) use ($storeIds) {
            if (is_array($storeIds) && count($storeIds) > 0) {
                $q->whereIn('transactions.StoreID', $storeIds);
            }
        };

        // 1. TÍNH TỔNG DOANH THU (Total Revenue) THÁNG HIỆN TẠI
        // Logic: Tổng (Số lượng * Đơn giá) - Giảm giá
        $totalRevenue = DB::table('transactions')
            ->whereBetween('transactions.DATE', [$monthStart, $monthEnd])
            ->when(is_array($storeIds) && count($storeIds) > 0, function ($q) use ($storeIds) {
                $q->whereIn('transactions.StoreID', $storeIds);
            })
            ->sum($amountExpr);

        // 2. ĐƠN HÀNG MỚI (New Orders)
        // Logic: Đếm số lượng đơn (InvoiceID) được tạo trong ngày hôm nay
        $newOrders = DB::table('transactions')
            ->whereBetween('DATE', [$todayStart, $todayEnd])
            ->when(is_array($storeIds) && count($storeIds) > 0, function ($q) use ($storeIds) {
                $q->whereIn('transactions.StoreID', $storeIds);
            })
            ->distinct('InvoiceID')
            ->count('InvoiceID');

        // 3. SẢN PHẨM BÁN CHẠY (Top Products)
        // Logic: Join transactions -> products. Group by Tên sản phẩm và sắp xếp theo tổng số lượng bán.
        $topProducts = DB::table('transactions')
            ->join('products', 'transactions.ProductID', '=', 'products.ProductID')
            ->when(is_array($storeIds) && count($storeIds) > 0, function ($q) use ($storeIds) {
                $q->whereIn('transactions.StoreID', $storeIds);
            })
            ->select(
                'products.ProductID as product_id',
                DB::raw('SUM(transactions.Quantity) as total_sold'),
                DB::raw("SUM($amountExprSql) as revenue_generated")
            )
            ->groupBy('products.ProductID')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

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
            ->when(is_array($storeIds) && count($storeIds) > 0, function ($q) use ($storeIds) {
                $q->whereIn('transactions.StoreID', $storeIds);
            })
            ->select('transactions.InvoiceID', DB::raw("SUM($amountExprSql) as total_val"))
            ->groupBy('transactions.InvoiceID')
            ->havingRaw("SUM($amountExprSql) > 10000000") // Ngưỡng ví dụ: 10 triệu
            ->count();

        if ($highValueTrans > 0) {
            $alerts[] = [
                'type' => 'info',
                'message' => "Hôm nay có {$highValueTrans} đơn hàng giá trị cao (trên 10tr)."
            ];
        }

        // 5. GMV EVOLUTION – 12 THÁNG KẾT THÚC TẠI THÁNG CỦA ANCHOR DATE
        // Ví dụ: anchor = 18/3/2025 → hiển thị April 2024 đến March 2025
        // Mỗi tháng so sánh với cùng tháng năm trước (YoY)
        
        $anchorMonth = $endDate->copy()->startOfMonth();
        $startMonth = $anchorMonth->copy()->subMonths(11); // 12 tháng (bao gồm tháng anchor)
        $endMonthEnd = $anchorMonth->copy()->endOfMonth();

        // Query GMV cho 12 tháng hiện tại
        $gmvByMonth = DB::table('transactions')
            ->whereBetween('transactions.DATE', [$startMonth, $endMonthEnd])
            ->when(is_array($storeIds) && count($storeIds) > 0, function ($q) use ($storeIds) {
                $q->whereIn('transactions.StoreID', $storeIds);
            })
            ->selectRaw("FORMAT(transactions.DATE, 'yyyy-MM') as ym")
            ->selectRaw("SUM($amountExprSql) as gmv")
            ->groupBy(DB::raw("FORMAT(transactions.DATE, 'yyyy-MM')"))
            ->orderBy(DB::raw("FORMAT(transactions.DATE, 'yyyy-MM')"))
            ->pluck('gmv', 'ym');

        // Query GMV cho 12 tháng năm trước (để so sánh YoY)
        $prevYearStart = $startMonth->copy()->subYear();
        $prevYearEnd = $endMonthEnd->copy()->subYear();
        
        $gmvByMonthPrevYear = DB::table('transactions')
            ->whereBetween('transactions.DATE', [$prevYearStart, $prevYearEnd])
            ->when(is_array($storeIds) && count($storeIds) > 0, function ($q) use ($storeIds) {
                $q->whereIn('transactions.StoreID', $storeIds);
            })
            ->selectRaw("FORMAT(transactions.DATE, 'yyyy-MM') as ym")
            ->selectRaw("SUM($amountExprSql) as gmv")
            ->groupBy(DB::raw("FORMAT(transactions.DATE, 'yyyy-MM')"))
            ->orderBy(DB::raw("FORMAT(transactions.DATE, 'yyyy-MM')"))
            ->pluck('gmv', 'ym');

        $gmvLabels = [];
        $gmvValues = [];
        $gmvGrowth = [];

        $cursor = $startMonth->copy();

        for ($i = 0; $i < 12; $i++) {
            $ymKey = $cursor->format('Y-m');
            $label = $cursor->format('M Y'); // Ví dụ: Apr 2024, May 2024...

            $currentGmv = (float) ($gmvByMonth[$ymKey] ?? 0);
            
            // So sánh với cùng tháng năm trước
            $prevYearKey = $cursor->copy()->subYear()->format('Y-m');
            $prevYearGmv = (float) ($gmvByMonthPrevYear[$prevYearKey] ?? 0);

            $gmvLabels[] = $label;
            $gmvValues[] = $currentGmv;

            // Tính growth YoY (Year over Year)
            if ($prevYearGmv > 0) {
                $growth = (($currentGmv - $prevYearGmv) / $prevYearGmv) * 100;
            } else {
                $growth = 0;
            }

            $gmvGrowth[] = round($growth, 1);

            $cursor->addMonth();
        }

        $gmvEvolution = [
            'labels' => $gmvLabels,
            'gmv'    => $gmvValues,
            'growth' => $gmvGrowth,
        ];

        // 6. MODALAB SYNTHESIS – TỐI ƯU: 1 QUERY DUY NHẤT với CASE WHEN
        // Tính tất cả các mốc thời gian trong 1 query
        
        // Định nghĩa các mốc thời gian
        $anchorDayStart = $todayStart->format('Y-m-d H:i:s');
        $anchorDayEnd = $todayEnd->format('Y-m-d H:i:s');
        $yesterdayStart = $todayStart->copy()->subDay()->format('Y-m-d H:i:s');
        $yesterdayEnd = $todayEnd->copy()->subDay()->format('Y-m-d H:i:s');
        $weekAgoStart = $todayStart->copy()->subWeek()->format('Y-m-d H:i:s');
        $weekAgoEnd = $todayEnd->copy()->subWeek()->format('Y-m-d H:i:s');
        $yearAgoStart = $todayStart->copy()->subYear()->format('Y-m-d H:i:s');
        $yearAgoEnd = $todayEnd->copy()->subYear()->format('Y-m-d H:i:s');
        
        // SBY: từ đầu năm đến anchor
        $sbyStart = $endDate->copy()->startOfYear()->format('Y-m-d H:i:s');
        $sbyPrevStart = $endDate->copy()->startOfYear()->subYear()->format('Y-m-d H:i:s');
        $sbyPrevEnd = $todayEnd->copy()->subYear()->format('Y-m-d H:i:s');
        
        // SBM: từ đầu tháng đến anchor
        $sbmStart = $endDate->copy()->startOfMonth()->format('Y-m-d H:i:s');
        $sbmPrevStart = $endDate->copy()->startOfMonth()->subYear()->format('Y-m-d H:i:s');
        $sbmPrevEnd = $todayEnd->copy()->subYear()->format('Y-m-d H:i:s');
        
        // SBW: từ đầu tuần đến anchor
        $sbwStart = $endDate->copy()->startOfWeek(Carbon::MONDAY)->format('Y-m-d H:i:s');
        $sbwPrevStart = $endDate->copy()->startOfWeek(Carbon::MONDAY)->subYear()->format('Y-m-d H:i:s');
        $sbwPrevEnd = $todayEnd->copy()->subYear()->format('Y-m-d H:i:s');

        // Một query tính tất cả GMV với CASE WHEN
        $modalabQuery = DB::table('transactions')
            ->when(is_array($storeIds) && count($storeIds) > 0, function ($q) use ($storeIds) {
                $q->whereIn('transactions.StoreID', $storeIds);
            })
            ->selectRaw("
                SUM(CASE WHEN DATE BETWEEN '$anchorDayStart' AND '$anchorDayEnd' THEN $amountExprSql ELSE 0 END) as gmv_anchor,
                SUM(CASE WHEN DATE BETWEEN '$yesterdayStart' AND '$yesterdayEnd' THEN $amountExprSql ELSE 0 END) as gmv_d1,
                SUM(CASE WHEN DATE BETWEEN '$weekAgoStart' AND '$weekAgoEnd' THEN $amountExprSql ELSE 0 END) as gmv_w1,
                SUM(CASE WHEN DATE BETWEEN '$yearAgoStart' AND '$yearAgoEnd' THEN $amountExprSql ELSE 0 END) as gmv_y1,
                SUM(CASE WHEN DATE BETWEEN '$sbyStart' AND '$anchorDayEnd' THEN $amountExprSql ELSE 0 END) as gmv_sby,
                SUM(CASE WHEN DATE BETWEEN '$sbyPrevStart' AND '$sbyPrevEnd' THEN $amountExprSql ELSE 0 END) as gmv_sby_prev,
                SUM(CASE WHEN DATE BETWEEN '$sbmStart' AND '$anchorDayEnd' THEN $amountExprSql ELSE 0 END) as gmv_sbm,
                SUM(CASE WHEN DATE BETWEEN '$sbmPrevStart' AND '$sbmPrevEnd' THEN $amountExprSql ELSE 0 END) as gmv_sbm_prev,
                SUM(CASE WHEN DATE BETWEEN '$sbwStart' AND '$anchorDayEnd' THEN $amountExprSql ELSE 0 END) as gmv_sbw,
                SUM(CASE WHEN DATE BETWEEN '$sbwPrevStart' AND '$sbwPrevEnd' THEN $amountExprSql ELSE 0 END) as gmv_sbw_prev
            ")
            ->first();

        $gmvAnchor = (float) ($modalabQuery->gmv_anchor ?? 0);
        $gmvD1 = (float) ($modalabQuery->gmv_d1 ?? 0);
        $gmvW1 = (float) ($modalabQuery->gmv_w1 ?? 0);
        $gmvY1 = (float) ($modalabQuery->gmv_y1 ?? 0);
        $gmvSBY = (float) ($modalabQuery->gmv_sby ?? 0);
        $gmvSBYPrev = (float) ($modalabQuery->gmv_sby_prev ?? 0);
        $gmvSBM = (float) ($modalabQuery->gmv_sbm ?? 0);
        $gmvSBMPrev = (float) ($modalabQuery->gmv_sbm_prev ?? 0);
        $gmvSBW = (float) ($modalabQuery->gmv_sbw ?? 0);
        $gmvSBWPrev = (float) ($modalabQuery->gmv_sbw_prev ?? 0);

        // Tính growth
        $calcGrowth = fn($current, $prev) => $prev > 0 ? round((($current - $prev) / $prev) * 100, 1) : 0;

        $periods = [
            ['label' => 'Y-1', 'gmv' => $gmvAnchor, 'growth' => $calcGrowth($gmvAnchor, $gmvY1)],
            ['label' => 'SBY', 'gmv' => $gmvSBY, 'growth' => $calcGrowth($gmvSBY, $gmvSBYPrev)],
            ['label' => 'SBM', 'gmv' => $gmvSBM, 'growth' => $calcGrowth($gmvSBM, $gmvSBMPrev)],
            ['label' => 'W-1', 'gmv' => $gmvAnchor, 'growth' => $calcGrowth($gmvAnchor, $gmvW1)],
            ['label' => 'SBW', 'gmv' => $gmvSBW, 'growth' => $calcGrowth($gmvSBW, $gmvSBWPrev)],
            ['label' => 'D-1', 'gmv' => $gmvAnchor, 'growth' => $calcGrowth($gmvAnchor, $gmvD1)],
        ];

        $modalabSynthesis = [
            'labels' => collect($periods)->pluck('label'),
            'values' => collect($periods)->pluck('growth'),
            'gmv'    => collect($periods)->pluck('gmv'),
        ];

        // 7. SALES CHANNELS – PHÂN BỔ THEO PHƯƠNG THỨC THANH TOÁN (%)
        // Yêu cầu: % products sold theo Category trong ngày anchor, hiển thị % và GMV
        $channels = DB::table('transactions')
            ->join('products', 'transactions.ProductID', '=', 'products.ProductID')
            ->whereBetween('transactions.DATE', [$todayStart, $todayEnd])
            ->when(is_array($storeIds) && count($storeIds) > 0, function ($q) use ($storeIds) {
                $q->whereIn('transactions.StoreID', $storeIds);
            })
            ->select(
                'products.Category as category',
                DB::raw("SUM($amountExprSql) as gmv")
            )
            ->groupBy('products.Category')
            ->get();

        $totalChannels = $channels->sum('gmv');

        $channelLabels = [];
        $channelValues = [];
        $channelGmv = [];
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
            $label = $row->category ?: 'Unknown';

            $channelLabels[] = $label;

            $gmvVal = (float) $row->gmv;
            $channelGmv[] = $gmvVal;

            $percent = $totalChannels > 0 ? ($gmvVal / $totalChannels * 100) : 0;
            $channelValues[] = round($percent, 1);

            $channelColors[] = $palette[$colorIndex % count($palette)];
            $colorIndex++;
        }

        $salesChannels = [
            'labels' => $channelLabels,
            'values' => $channelValues,
            'gmv'    => $channelGmv,
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