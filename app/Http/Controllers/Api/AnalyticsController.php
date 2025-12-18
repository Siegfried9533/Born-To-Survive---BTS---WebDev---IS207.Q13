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
            ->leftJoin('transactions', 'products.ProductID', '=', 'transactions.ProductID');

        // 3. Áp dụng bộ lọc (Chỉ lọc nếu người dùng có gửi tham số)
        
        // Lọc theo danh mục
        if ($category) {
            $query->where('products.Category', 'like', '%' . $category . '%');
        }

        // Lọc theo ngày bắt đầu
        if ($fromDate) {
            $query->whereDate('transactions.DATE', '>=', $fromDate);
        }

        // Lọc theo ngày kết thúc
        if ($toDate) {
            $query->whereDate('transactions.DATE', '<=', $toDate);
        }

        // 4. Chọn cột và Tính toán (Giữ nguyên logic cũ)
        $products = $query->select(
                'products.ProductID',
                'products.Description as ProductName',
                'products.Category',
                'products.SubCategory',
                DB::raw('COALESCE(SUM(transactions.Quantity), 0) as total_sold'),
                DB::raw('COALESCE(SUM(CASE WHEN transactions.LineTotal IS NOT NULL THEN transactions.LineTotal ELSE (transactions.UnitPrice * transactions.Quantity) END), 0) as revenue')
            )
            ->groupBy('products.ProductID', 'products.Description', 'products.Category', 'products.SubCategory')
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
        $metrics = DB::table('transactions')
            ->where('transactions.StoreID', $id)
            ->select(
                DB::raw('COUNT(DISTINCT transactions.InvoiceID) as total_orders'),
                DB::raw('COALESCE(SUM(CASE WHEN transactions.LineTotal IS NOT NULL THEN transactions.LineTotal ELSE (transactions.UnitPrice * transactions.Quantity) END), 0) as total_revenue')
            )
            ->first();

        // Tính AOV (Average Order Value - Giá trị trung bình mỗi đơn)
        $aov = $metrics->total_orders > 0 
            ? $metrics->total_revenue / $metrics->total_orders 
            : 0;

        // Đếm số nhân viên
        $employeeCount = DB::table('employees')->where('StoreID', $id)->count();

        // Tìm sản phẩm bán chạy nhất của riêng Shop này
        $topProduct = DB::table('transactions')
            ->join('products', 'transactions.ProductID', '=', 'products.ProductID')
            ->where('transactions.StoreID', $id)
            ->select('products.Description', DB::raw('SUM(transactions.Quantity) as sold_qty'))
            ->groupBy('products.ProductID', 'products.Description')
            ->orderByDesc('sold_qty')
            ->first();

        return response()->json([
            'status' => 'success',
            'store_info' => [
                'id' => $store->StoreID,
                'name' => $store->StoreName,
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