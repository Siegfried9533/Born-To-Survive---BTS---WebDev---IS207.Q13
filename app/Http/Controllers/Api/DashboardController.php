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
        // 1. Tính TỔNG DOANH THU (Total Revenue)
        // Logic: Tổng (Số lượng * Đơn giá) - Giảm giá
        // Lấy doanh thu của tháng hiện tại
        $totalRevenue = DB::table('invoice_lines')
            ->join('invoices', 'invoice_lines.invoiceid', '=', 'invoices.invoiceid')
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

        // Trả về JSON format
        return response()->json([
            'total_revenue' => (float) $totalRevenue,
            'new_orders'    => (int) $newOrders,
            'top_products'  => $topProducts,
            'alerts'        => $alerts
        ]);
    }
}