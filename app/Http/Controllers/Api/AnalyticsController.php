<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // Nhớ import thư viện DB
use App\Models\Store;


class AnalyticsController extends Controller
{

    public function getProductAnalytics(Request $request)
    {
        // 1. Lấy tham số từ URL (nếu không có thì mặc định là null)
        $category = $request->query('category');
        $fromDate = $request->query('from_date');
        $toDate   = $request->query('to_date');

        // 2. Bắt đầu Query Builder
        $query = DB::table('products')
            // Join sang SKU
            ->leftJoin('product_skus', 'products.ProdID', '=', 'product_skus.ProdID')
            // Join sang Invoice Lines
            ->leftJoin('invoice_lines', 'product_skus.SKU', '=', 'invoice_lines.SKU')
            // MỚI: Join sang Invoices để lấy ngày tháng
            ->leftJoin('invoices', 'invoice_lines.InvoiceID', '=', 'invoices.InvoiceID');

        // 3. Áp dụng bộ lọc (Chỉ lọc nếu người dùng có gửi tham số)
        
        // Lọc theo danh mục
        if ($category) {
            $query->where('products.Category', 'like', '%' . $category . '%');
        }

        // Lọc theo ngày bắt đầu
        if ($fromDate) {
            $query->whereDate('invoices.Date', '>=', $fromDate);
        }

        // Lọc theo ngày kết thúc
        if ($toDate) {
            $query->whereDate('invoices.Date', '<=', $toDate);
        }

        // 4. Chọn cột và Tính toán (Giữ nguyên logic cũ)
        $products = $query->select(
                'products.ProdID',
                'products.Description as ProductName',
                'products.Category',
                DB::raw('COALESCE(SUM(invoice_lines.Quantity), 0) as total_sold'),
                DB::raw('COALESCE(SUM((invoice_lines.Quantity * invoice_lines.UnitPrice) - invoice_lines.Discount), 0) as revenue')
            )
            ->groupBy('products.ProdID', 'products.Description', 'products.Category')
            ->orderByDesc('revenue')
            ->get();

        return response()->json([
            'status' => 'success',
            'filters' => [
                'category' => $category,
                'from_date' => $fromDate,
                'to_date' => $toDate
            ],
            'data' => $products
        ]);
    }
    // // 1. API: So sánh hiệu suất các cửa hàng (Ranking)
    // public function getStoreComparison()
    // {
    //     // Logic: Join Store -> Invoice -> InvoiceLines để tính tiền
    //     // Trong AnalyticsController.php
    //     $stores = DB::table('stores')
    //         ->leftJoin(...)
    //         ->select(
    //             'stores.StoreID',
    //             'stores.Name',
    //             'stores.City',
    //             'stores.Country',      // <--- Thêm dòng này
    //             'stores.ZIPCode',      // <--- Thêm dòng này
    //             'stores.Latitude',     // <--- Thêm dòng này
    //             'stores.Longitude',    // <--- Thêm dòng này
    //             DB::raw('COUNT...'),
    //             DB::raw('SUM...')
    //         )
    //         // ...

    //     // Thêm trường "Rank" (Xếp hạng) vào kết quả
    //     $rankedStores = $stores->map(function ($item, $index) {
    //         $item->rank = $index + 1; // Rank 1, 2, 3...
    //         return $item;
    //     });

    //     return response()->json([
    //         'status' => 'success',
    //         'data' => $rankedStores
    //     ]);
    // }

    // 2. API: Chi tiết KPI của 1 cửa hàng cụ thể
    public function getStoreMetrics($id)
    {
        // Kiểm tra store có tồn tại không
        $store = DB::table('stores')->where('StoreID', $id)->first();
        if (!$store) {
            return response()->json(['error' => 'Store not found'], 404);
        }

        // Tính toán các chỉ số cơ bản
        $metrics = DB::table('invoices')
            ->join('invoice_lines', 'invoices.InvoiceID', '=', 'invoice_lines.InvoiceID')
            ->where('invoices.StoreID', $id) // Chỉ lấy của shop này
            ->select(
                DB::raw('COUNT(DISTINCT invoices.InvoiceID) as total_orders'),
                DB::raw('COALESCE(SUM((invoice_lines.Quantity * invoice_lines.UnitPrice) - invoice_lines.Discount), 0) as total_revenue')
            )
            ->first();

        // Tính AOV (Average Order Value - Giá trị trung bình mỗi đơn)
        $aov = $metrics->total_orders > 0 
            ? $metrics->total_revenue / $metrics->total_orders 
            : 0;

        // Đếm số nhân viên
        $employeeCount = DB::table('employees')->where('StoreID', $id)->count();

        // Tìm sản phẩm bán chạy nhất của riêng Shop này
        $topProduct = DB::table('invoice_lines')
            ->join('invoices', 'invoice_lines.InvoiceID', '=', 'invoices.InvoiceID') // Nối để lấy StoreID
            ->join('product_skus', 'invoice_lines.SKU', '=', 'product_skus.SKU')
            ->join('products', 'product_skus.ProdID', '=', 'products.ProdID')
            ->where('invoices.StoreID', $id)
            ->select('products.Description', DB::raw('SUM(invoice_lines.Quantity) as sold_qty'))
            ->groupBy('products.ProdID', 'products.Description')
            ->orderByDesc('sold_qty')
            ->first();

        return response()->json([
            'status' => 'success',
            'store_info' => [
                'id' => $store->StoreID,
                'name' => $store->Name,
                'city' => $store->City
            ],
            'kpis' => [
                'total_revenue' => (float)$metrics->total_revenue,
                'total_orders'  => (int)$metrics->total_orders,
                'aov'           => round($aov, 2), // Làm tròn 2 số thập phân
                'total_employees' => $employeeCount,
                'best_selling_product' => $topProduct ? $topProduct->Description : 'N/A'
            ]
        ]);
    }
    public function getAllStores()
    {
        // Dùng Query Builder lấy dữ liệu trực tiếp cho nhanh
        $stores = Store::all();
        return response()->json([
            'status' => 'success',
            'data' => $stores
        ]);
    }
}