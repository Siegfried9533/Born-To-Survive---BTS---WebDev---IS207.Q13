<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class StoreController extends Controller
{
    /**
     * 0. Lấy dữ liệu Store và Category theo yêu cầu
     * GET /api/stores/dashboard/summary?stores=S001,S002&categories=Thời%20trang,Điện%20tử
     * 
     * Query params:
     *   - stores: comma-separated store IDs (optional, max 3)
     *   - categories: comma-separated category names (optional)
     * 
     * Response:
     * {
     *   "status": "success",
     *   "summary": { "stores_count": 2, "categories_count": 2 },
     *   "stores": [
     *     {
     *       "store": { "StoreID": "S001", "Name": "Store 1", ... },
     *       "categories": [
     *         { "Category": "Thời trang", "revenue": 12345 },
     *         { "Category": "Điện tử", "revenue": 54321 }
     *       ]
     *     }
     *   ],
     *   "categories": [
     *     { "Category": "Thời trang", "product_count": 8, "delta_gmv": 90390134 },
     *     { "Category": "Điện tử", "product_count": 7, "delta_gmv": 65517578 }
     *   ]
     * }
     */
    public function getDashboardSummary(Request $request)
    {
        try {
            // 1. Lấy danh sách store từ query param
            $storeIds = [];
            if ($request->has('stores')) {
                $storeIds = array_slice(array_filter(array_map('trim', explode(',', $request->query('stores')))), 0, 3);
            }

            // 2. Lấy danh sách category từ query param
            $categories = [];
            if ($request->has('categories')) {
                $categories = array_filter(array_map('trim', explode(',', $request->query('categories'))));
            }

            // 3. Lấy dữ liệu Stores
            $storeQuery = Store::query();
            if (!empty($storeIds)) {
                $storeQuery->whereIn('StoreID', $storeIds);
            }
            $stores = $storeQuery->orderByDesc('StoreID')->get();

            // 4. Lấy dữ liệu Categories với metrics
            $categoryQuery = DB::table('products')
                ->select(
                    'products.Category',
                    DB::raw('COUNT(DISTINCT products.ProdID) as product_count'),
                    DB::raw('COALESCE(SUM((invoice_lines.Quantity * invoice_lines.UnitPrice) - invoice_lines.Discount), 0) as delta_gmv'),
                    DB::raw('COALESCE(SUM(CASE WHEN invoices.TransactionType IS NULL OR invoices.TransactionType = "In-Store" THEN (invoice_lines.Quantity * invoice_lines.UnitPrice) - invoice_lines.Discount ELSE 0 END), 0) as instore_gmv')
                )
                ->whereNotNull('products.Category')
                ->leftJoin('product_skus', 'products.ProdID', '=', 'product_skus.ProdID')
                ->leftJoin('invoice_lines', 'product_skus.SKU', '=', 'invoice_lines.SKU')
                ->leftJoin('invoices', 'invoice_lines.InvoiceID', '=', 'invoices.InvoiceID');

            // Filter by categories if provided
            if (!empty($categories)) {
                $categoryQuery->whereIn('products.Category', $categories);
            }

            $categoriesData = $categoryQuery
                ->groupBy('products.Category')
                ->orderByDesc('delta_gmv')
                ->get();

            // 5. Lấy metrics cho mỗi store (nếu có)
            $storesWithMetrics = [];
            if ($stores->count() > 0) {
                foreach ($stores as $store) {
                    // Tính doanh thu theo category cho store này
                    $storeCategories = DB::table('products')
                        ->select(
                            'products.Category',
                            DB::raw('COALESCE(SUM((invoice_lines.Quantity * invoice_lines.UnitPrice) - invoice_lines.Discount), 0) as revenue')
                        )
                        ->whereNotNull('products.Category')
                        ->leftJoin('product_skus', 'products.ProdID', '=', 'product_skus.ProdID')
                        ->leftJoin('invoice_lines', 'product_skus.SKU', '=', 'invoice_lines.SKU')
                        ->leftJoin('invoices', 'invoice_lines.InvoiceID', '=', 'invoices.InvoiceID')
                        ->where('invoices.StoreID', $store->StoreID);

                    if (!empty($categories)) {
                        $storeCategories->whereIn('products.Category', $categories);
                    }

                    $storeCategoryData = $storeCategories
                        ->groupBy('products.Category')
                        ->orderByDesc('revenue')
                        ->get();

                    $storesWithMetrics[] = [
                        'store' => $store,
                        'categories' => $storeCategoryData
                    ];
                }
            }

            return response()->json([
                'status' => 'success',
                'summary' => [
                    'stores_count' => $stores->count(),
                    'categories_count' => $categoriesData->count()
                ],
                'stores' => $storesWithMetrics,
                'categories' => $categoriesData
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in getDashboardSummary:', ['error' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * 1. Cập nhật thông tin cửa hàng
     * PUT /api/stores/{id}
     */
    public function update(Request $request, $id)
    {
        $store = Store::find($id);

        if (!$store) {
            return response()->json(['status' => 'error', 'message' => 'Không tìm thấy cửa hàng'], 404);
        }

        // Validate
        $validator = Validator::make($request->all(), [
            'Name' => 'string|max:255',
            'City' => 'string|max:50',
            'ZIPCode' => 'string|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        // Cập nhật (chỉ cập nhật trường nào được gửi lên)
        $store->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Cập nhật cửa hàng thành công',
            'data' => $store
        ]);
    }

    /**
     * 2. Lấy danh sách nhân viên của 1 cửa hàng
     * GET /api/stores/{id}/employees
     */
    public function getEmployees($id)
    {
        $store = Store::find($id);

        if (!$store) {
            return response()->json(['status' => 'error', 'message' => 'Không tìm thấy cửa hàng'], 404);
        }

        // Dùng quan hệ hasMany đã khai báo trong Model Store
        $employees = $store->employees;

        return response()->json([
            'status' => 'success',
            'store_name' => $store->Name,
            'count' => $employees->count(),
            'data' => $employees
        ]);
    }
}
