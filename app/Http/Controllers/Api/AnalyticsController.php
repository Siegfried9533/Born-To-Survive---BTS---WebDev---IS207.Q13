<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Store;

class AnalyticsController extends Controller
{
    /**
     * 1. Thống kê hiệu suất sản phẩm
     * Logic mới: Join bảng transactions trực tiếp với products
     */
  public function getProductAnalytics(Request $request)
{
    // 1. Khởi tạo Query Builder
    // Join bảng transactions với products để lấy thông tin chi tiết sản phẩm
    $query = DB::table('transactions')
        ->join('products', 'transactions.ProductID', '=', 'products.ProductID');

    // 2. Chọn cột và Tính toán (Select & Aggregate)
    $products = $query->select(
            'products.ProductID',
            'products.Description as ProductName',
            'products.Category',
            'products.SubCategory',
            
            // Tổng số lượng bán
            DB::raw('COALESCE(SUM(transactions.Quantity), 0) as total_sold'),
            
            // Tổng doanh thu
            DB::raw('COALESCE(SUM(transactions.LineTotal), 0) as revenue')
        )
        // Group by tất cả các cột không nằm trong hàm tổng hợp (SUM)
        ->groupBy(
            'products.ProductID', 
            'products.Description', 
            'products.Category', 
            'products.SubCategory'
        )
        // Sắp xếp theo doanh thu giảm dần
        ->orderByDesc('revenue')
        ->get();

    // 3. Trả về kết quả JSON
    return response()->json([
        'status' => 'success',
        'data'   => $products
    ]);
}

    // /**
    //  * 2. Chi tiết KPI của 1 cửa hàng
    //  * Logic mới: Dùng bảng transactions để tính toán
    //  */
    // public function getStoreMetrics($id)
    // {
    //     // 1. Lấy thông tin Store (Cột tên mới là StoreName)
    //     $store = DB::table('stores')->where('StoreID', $id)->first();
        
    //     if (!$store) {
    //         return response()->json(['error' => 'Store not found'], 404);
    //     }

    //     // 2. Tính toán các chỉ số từ bảng transactions
    //     $metrics = DB::table('transactions')
    //         ->where('StoreID', $id)
    //         ->select(
    //             // Đếm số đơn hàng (Dựa trên InvoiceID hoặc InvoiceHASH)
    //             DB::raw('COUNT(DISTINCT InvoiceID) as total_orders'),
                
    //             // Tổng doanh thu
    //             DB::raw('COALESCE(SUM(LineTotal), 0) as total_revenue')
    //         )
    //         ->first();

    //     // 3. Tính AOV (Giá trị trung bình đơn)
    //     $totalRevenue = $metrics ? $metrics->total_revenue : 0;
    //     $totalOrders = $metrics ? $metrics->total_orders : 0;
        
    //     $aov = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

    //     // 4. Đếm số nhân viên (Logic cũ vẫn đúng)
    //     $employeeCount = DB::table('employees')->where('StoreID', $id)->count();

    //     // 5. Tìm sản phẩm bán chạy nhất của Shop này
    //     $topProduct = DB::table('transactions')
    //         ->join('products', 'transactions.ProductID', '=', 'products.ProductID')
    //         ->where('transactions.StoreID', $id)
    //         ->select(
    //             'products.Description', 
    //             DB::raw('SUM(transactions.Quantity) as sold_qty')
    //         )
    //         ->groupBy('products.ProductID', 'products.Description')
    //         ->orderByDesc('sold_qty')
    //         ->first();

    //     return response()->json([
    //         'status' => 'success',
    //         'store_info' => [
    //             'id' => $store->StoreID,
    //             'name' => $store->StoreName, // Đã đổi từ Name -> StoreName
    //             'city' => $store->City
    //         ],
    //         'kpis' => [
    //             'total_revenue' => (float)$totalRevenue,
    //             'total_orders'  => (int)$totalOrders,
    //             'aov'           => round($aov, 2),
    //             'total_employees' => $employeeCount,
    //             'best_selling_product' => $topProduct ? $topProduct->Description : 'N/A'
    //         ]
    //     ]);
    // }

    // /**
    //  * 3. Lấy danh sách tất cả cửa hàng
    //  */
    // public function getAllStores()
    // {
    //     // Model Store đã được cập nhật ở bước trước
    //     $stores = Store::orderBy('StoreName', 'asc')->get();
        
    //     return response()->json([
    //         'status' => 'success',
    //         'data' => $stores
    //     ]);
    // }
}