<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{

    /**
     * 1. GET /api/products
     * Lấy danh sách sản phẩm (Có phân trang)
     */
    public function index(Request $request)
    {
        // Khởi tạo query
        $query = Product::query();
        
        // Lọc theo Danh mục
        if ($request->has('category')) {
            $query->where('Category', $request->category);
        }

        // Sắp xếp sản phẩm mới nhất lên đầu
        // Lưu ý: Đảm bảo bảng products có timestamps (created_at)
        return response()->json([
            'status' => 'success',
            'data' => $query->orderByDesc('created_at')->paginate(10)
        ]);
    }
    
    /**
     * 3b. GET /api/products/subcategories
     * Lấy danh sách SubCategory + Tổng doanh thu (delta_gmv)
     * Hành vi giống getCategories nhưng nhóm theo SubCategory
     */
    public function getSubCategories(Request $request)
    {
        try {
            // Tạo bảng tạm tổng doanh thu theo ProductID (có thể lọc theo cửa hàng và ngày)
            $transStats = \DB::table('transactions')
                ->select(
                    'ProductID',
                    \DB::raw('SUM(LineTotal) as total_revenue')
                );

            if ($request->has('stores')) {
                $ids = array_values(array_filter(array_map('trim', explode(',', $request->query('stores')))));
                if (!empty($ids)) {
                    $transStats->whereIn('StoreID', $ids);
                }
            }
            if ($request->has('from_date')) {
                $transStats->whereDate('DATE', '>=', $request->query('from_date'));
            }
            if ($request->has('to_date')) {
                $transStats->whereDate('DATE', '<=', $request->query('to_date'));
            }

            $transStats = $transStats->groupBy('ProductID');

            // Join products với bảng tạm và gom nhóm theo SubCategory
            $subs = \DB::table('products')
                ->leftJoinSub($transStats, 'stats', function ($join) {
                    $join->on('products.ProductID', '=', 'stats.ProductID');
                })
                ->select(
                    'products.SubCategory',
                    \DB::raw('COUNT(products.ProductID) as product_count'),
                    \DB::raw('COALESCE(SUM(stats.total_revenue), 0) as delta_gmv')
                )
                ->whereNotNull('products.SubCategory')
                ->where('products.SubCategory', '!=', '')
            ;

            // Optional: allow filtering by parent categories
            if ($request->has('categories')) {
                $cats = array_values(array_filter(array_map('trim', explode(',', $request->query('categories')))));
                if (!empty($cats)) {
                    $subs = $subs->whereIn('products.Category', $cats);
                }
            }

            $subs = $subs->groupBy('products.SubCategory')
                         ->orderByDesc('delta_gmv')
                         ->get();

            return response()->json([
                'status' => 'success',
                'data' => $subs
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in getSubCategories:', ['error' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * 2. POST /api/products
     * Tạo sản phẩm mới
     */
    public function store(Request $request)
    {
        // Validate dữ liệu đầu vào theo DB mới
        $validator = Validator::make($request->all(), [
            // ProductID là số nguyên, bắt buộc nhập (vì migration dùng integer()->primary())
            'ProductID' => 'required|integer|unique:products,ProductID', 
            'Description' => 'required|string|max:255',
            'Category' => 'required|string|max:255',
            'SubCategory' => 'nullable|string|max:255',
            'Color' => 'nullable|string|max:255',
            'Size' => 'nullable|string|max:255',
            'ProductCost' => 'integer|min:0' // Tên cột mới là ProductCost
        ], [
            'ProductID.unique' => 'Mã ID sản phẩm này đã tồn tại!',
            'ProductID.required' => 'Vui lòng nhập mã ID sản phẩm.',
            'ProductID.integer' => 'Mã sản phẩm phải là số nguyên.'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        // Lưu vào Database
        try {
            $product = Product::create($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Tạo sản phẩm thành công',
                'data' => $product
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

/**
     * 3. GET /api/products/categories
     * Tối ưu hóa: Dùng leftJoinSub để tính toán trước khi Group
     */
    /**
     * 3. GET /api/products/categories
     * Lấy danh sách Category + Tổng doanh thu (delta_gmv)
     */
    public function getCategories(Request $request)
    {
        try {
            // BƯỚC 1: Tạo bảng tạm tính tổng tiền cho TỪNG SẢN PHẨM trước
            // Giúp giảm tải cho database thay vì phải cộng hàng triệu dòng lúc Group By Category
            $transStats = \DB::table('transactions')
                ->select(
                    'ProductID',
                    \DB::raw('SUM(LineTotal) as total_revenue')
                );

            // Apply optional filters to transactions aggregation (stores, date range)
            // Query params: stores (csv of StoreID), from_date, to_date
            if ($request->has('stores')) {
                $ids = array_values(array_filter(array_map('trim', explode(',', $request->query('stores')))));
                if (!empty($ids)) {
                    $transStats->whereIn('StoreID', $ids);
                }
            }
            if ($request->has('from_date')) {
                $transStats->whereDate('DATE', '>=', $request->query('from_date'));
            }
            if ($request->has('to_date')) {
                $transStats->whereDate('DATE', '<=', $request->query('to_date'));
            }

            $transStats = $transStats->groupBy('ProductID');

            // BƯỚC 2: Join bảng Products với bảng tạm ở trên để gom nhóm theo Category
            $categories = \DB::table('products')
                // Join với subquery
                ->leftJoinSub($transStats, 'stats', function ($join) {
                    $join->on('products.ProductID', '=', 'stats.ProductID');
                })
                ->select(
                    'products.Category',
                    
                    // Đếm số lượng sản phẩm trong category
                    \DB::raw('COUNT(products.ProductID) as product_count'),
                    
                    // Tổng doanh thu (Cộng dồn từ doanh thu từng sản phẩm)
                    \DB::raw('COALESCE(SUM(stats.total_revenue), 0) as delta_gmv')
                )
                // Loại bỏ category rỗng
                ->whereNotNull('products.Category')
                ->where('products.Category', '!=', '')
                // Optional: if client passes categories, filter the result to those categories
                ;

            if ($request->has('categories')) {
                $cats = array_values(array_filter(array_map('trim', explode(',', $request->query('categories')))));
                if (!empty($cats)) {
                    $categories = $categories->whereIn('products.Category', $cats);
                }
            }

            $categories = $categories->groupBy('products.Category')
                ->orderByDesc('delta_gmv') // Sắp xếp doanh thu cao nhất lên đầu
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in getCategories:', ['error' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
    
    /**
     * 4. GET /api/products/{id}
     * Xem chi tiết 1 sản phẩm
     */
    public function show($id)
    {
        // Database mới không còn bảng product_skus riêng biệt
        // (Thông tin Size/Color nằm ngay trong Products hoặc Transactions)
        // Nên chỉ cần lấy thông tin Product cơ bản
        
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['status' => 'error', 'message' => 'Không tìm thấy sản phẩm'], 404);
        }

        return response()->json(['status' => 'success', 'data' => $product]);
    }
}