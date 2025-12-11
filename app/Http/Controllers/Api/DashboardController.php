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
        // 1. TÍNH TỔNG DOANH THU (Total Revenue) THÁNG HIỆN TẠI
        // Logic: Tổng (Số lượng * Đơn giá) - Giảm giá
        $totalRevenue = DB::table('invoice_lines')
            ->join('invoices', 'invoice_lines.InvoiceID', '=', 'invoices.InvoiceID')
            ->whereMonth('invoices.Date', Carbon::now()->month)
            ->whereYear('invoices.Date', Carbon::now()->year)
            ->sum(DB::raw('(invoice_lines.Quantity * invoice_lines.UnitPrice) - invoice_lines.Discount'));

        // 2. ĐƠN HÀNG MỚI (New Orders)
        // Logic: Đếm số lượng transaction được tạo trong ngày hôm nay
        $newOrders = DB::table('invoices')
            ->whereDate('Date', Carbon::today())
            ->count();

        // 3. SẢN PHẨM BÁN CHẠY (Top Products)
        // Logic: Join bảng chi tiết -> SKU -> Sản phẩm. Group by Tên sản phẩm và sắp xếp theo tổng số lượng bán.
        $topProducts = DB::table('invoice_lines')
            ->join('product_skus', 'invoice_lines.SKU', '=', 'product_skus.SKU')
            ->join('products', 'product_skus.ProdID', '=', 'products.ProdID')
            ->select(
                'products.ProdID as product_id',
                DB::raw('SUM(invoice_lines.Quantity) as total_sold'),
                DB::raw('SUM((invoice_lines.Quantity * invoice_lines.UnitPrice) - invoice_lines.Discount) as revenue_generated')
            )
            ->groupBy('products.ProdID')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        // 4. CẢNH BÁO (Alerts)
        $alerts = [];

        // Alert A: Các mã giảm giá (Discounts) sắp hết hạn trong 7 ngày tới
        $expiringDiscounts = DB::table('discounts')
            ->where('EndDate', '>=', Carbon::now())
            ->where('EndDate', '<=', Carbon::now()->addDays(7))
            ->select('Name', 'EndDate')
            ->get();

        foreach ($expiringDiscounts as $discount) {
            $alerts[] = [
                'type' => 'warning',
                'message' => "Mã giảm giá '{$discount->Name}' sẽ hết hạn vào " . Carbon::parse($discount->EndDate)->format('d/m/Y')
            ];
        }

        // Alert B: Giao dịch giá trị lớn bất thường (Ví dụ > 10,000,000) trong ngày
        // Cần subquery để tính tổng giá trị từng đơn hàng
        $highValueTrans = DB::table('invoice_lines')
            ->join('invoices', 'invoice_lines.invoiceid', '=', 'invoices.invoiceid')
            ->whereDate('invoices.Date', Carbon::today())
            ->select('invoices.invoiceid', DB::raw('SUM((Quantity * UnitPrice) - Discount) as total_val'))
            ->groupBy('invoices.invoiceid')
            ->having('total_val', '>', 10000000) // Ngưỡng ví dụ: 10 triệu
            ->count();

        if ($highValueTrans > 0) {
            $alerts[] = [
                'type' => 'info',
                'message' => "Hôm nay có {$highValueTrans} đơn hàng giá trị cao (trên 10tr)."
            ];
        }

        // 5. GMV EVOLUTION – TỔNG GMV 12 THÁNG GẦN NHẤT
        $startMonth = Carbon::now()->subMonths(11)->startOfMonth();
        $endMonth   = Carbon::now()->endOfMonth();

        $gmvByMonth = DB::table('invoice_lines')
            ->join('invoices', 'invoice_lines.InvoiceID', '=', 'invoices.InvoiceID')
            ->whereBetween('invoices.Date', [$startMonth, $endMonth])
            ->selectRaw('DATE_FORMAT(invoices.Date, "%Y-%m") as ym')
            ->selectRaw('SUM((invoice_lines.Quantity * invoice_lines.UnitPrice) - invoice_lines.Discount) as gmv')
            ->groupBy('ym')
            ->orderBy('ym')
            ->pluck('gmv', 'ym'); // [ '2025-01' => 12345, ... ]

        $gmvLabels = [];
        $gmvValues = [];
        $gmvGrowth = [];

        $cursor    = $startMonth->copy();
        $prevGmv   = null;

        for ($i = 0; $i < 12; $i++) {
            $ymKey = $cursor->format('Y-m');
            $label = $cursor->format('F'); // Ví dụ: January, February...

            $currentGmv = (float) ($gmvByMonth[$ymKey] ?? 0);

            $gmvLabels[] = $label;
            $gmvValues[] = $currentGmv;

            if ($prevGmv !== null && $prevGmv > 0) {
                $growth = (($currentGmv - $prevGmv) / $prevGmv) * 100;
            } else {
                $growth = 0;
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
        $categoryData = DB::table('invoice_lines')
            ->join('product_skus', 'invoice_lines.SKU', '=', 'product_skus.SKU')
            ->join('products', 'product_skus.ProdID', '=', 'products.ProdID')
            ->select(
                'products.Category as category',
                DB::raw('SUM((invoice_lines.Quantity * invoice_lines.UnitPrice) - invoice_lines.Discount) as revenue')
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
        $channels = DB::table('invoices')
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