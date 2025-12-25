<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Store;

class AnalyticsController extends Controller
{
    /**
     * NÂNG CẤP: Phân tích sản phẩm
     * Cho phép AI gọi nội bộ để lấy dữ liệu phân tích
     */
    public function getProductAnalytics(Request $request, $isInternal = false)
    {
        // 1. Lấy tham số
        $category = $request->query('category') ?? $request->input('category');
        $storesParam = $request->query('stores'); // CSV of StoreID
        $fromDate = $request->query('from_date') ?? $request->input('from_date');
        $toDate   = $request->query('to_date') ?? $request->input('to_date');

        $query = DB::table('products')
            ->leftJoin('transactions', 'products.ProductID', '=', 'transactions.ProductID');

        if ($category) {
            $cats = array_values(array_filter(array_map('trim', explode(',', $category))));
            if (!empty($cats)) {
                $query->whereIn('products.Category', $cats);
            }
        }

        if ($storesParam) {
            $ids = array_values(array_filter(array_map('trim', explode(',', $storesParam))));
            if (!empty($ids)) {
                $query->whereIn('transactions.StoreID', $ids);
            }
        }

        if ($fromDate) {
            $query->whereDate('transactions.DATE', '>=', $fromDate);
        }
        if ($toDate) {
            $query->whereDate('transactions.DATE', '<=', $toDate);
        }

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
            ->limit(10) // Giới hạn 10 để AI không bị quá tải token
            ->get();

        // NẾU GỌI NỘI BỘ TỪ AI SERVICE
        if ($isInternal) {
            return $products;
        }

        return response()->json([
            'status' => 'success',
            'filters' => compact('category', 'storesParam', 'fromDate', 'toDate'),
            'data' => $products
        ]);
    }

    /**
     * NÂNG CẤP: KPI Cửa hàng
     */
    public function getStoreMetrics($id, $isInternal = false)
    {
        $store = DB::table('stores')->where('StoreID', $id)->first();
        if (!$store) {
            return $isInternal ? null : response()->json(['error' => 'Store not found'], 404);
        }

        $metrics = DB::table('transactions')
            ->where('transactions.StoreID', $id)
            ->select(
                DB::raw('COUNT(DISTINCT transactions.InvoiceID) as total_orders'),
                DB::raw('COALESCE(SUM(CASE WHEN transactions.LineTotal IS NOT NULL THEN transactions.LineTotal ELSE (transactions.UnitPrice * transactions.Quantity) END), 0) as total_revenue')
            )
            ->first();

        $aov = $metrics->total_orders > 0 ? $metrics->total_revenue / $metrics->total_orders : 0;
        $employeeCount = DB::table('employees')->where('StoreID', $id)->count();

        $topProduct = DB::table('transactions')
            ->join('products', 'transactions.ProductID', '=', 'products.ProductID')
            ->where('transactions.StoreID', $id)
            ->select('products.Description', DB::raw('SUM(transactions.Quantity) as sold_qty'))
            ->groupBy('products.ProductID', 'products.Description')
            ->orderByDesc('sold_qty')
            ->first();

        $result = [
            'store_name' => $store->StoreName,
            'city' => $store->City,
            'kpis' => [
                'revenue' => (float)$metrics->total_revenue,
                'orders'  => (int)$metrics->total_orders,
                'aov'     => round($aov, 2),
                'staff'   => $employeeCount,
                'top_item' => $topProduct ? $topProduct->Description : 'N/A'
            ]
        ];

        return $isInternal ? $result : response()->json(['status' => 'success', 'data' => $result]);
    }

    public function getAllStores()
    {
        $stores = Store::select('StoreID', 'StoreName', 'City')->get();
        return response()->json(['status' => 'success', 'data' => $stores]);
    }
}
