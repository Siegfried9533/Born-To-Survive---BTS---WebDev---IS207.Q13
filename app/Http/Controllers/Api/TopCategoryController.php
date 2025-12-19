<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TopCategoryController extends Controller
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
        // Subquery: transactions (lọc SỚM + không dùng whereDate)
        $transStats = \DB::table('transactions')
            ->select(
                'ProductID',
                \DB::raw('SUM(LineTotal) as total_revenue')
            );

        if ($request->filled('stores')) {
            $ids = array_filter(array_map('trim', explode(',', $request->query('stores'))));
            $transStats->whereIn('StoreID', $ids);
        }

        if ($request->filled('from_date')) {
            $transStats->where('DATE', '>=', $request->query('from_date'));
        }

        if ($request->filled('to_date')) {
            $transStats->where('DATE', '<=', $request->query('to_date'));
        }

        $transStats->groupBy('ProductID');

        // Products: lọc TRƯỚC
        $products = \DB::table('products')
            ->select('ProductID', 'SubCategory')
            ->whereNotNull('SubCategory')
            ->where('SubCategory', '!=', '');

        if ($request->filled('categories')) {
            $cats = array_filter(array_map('trim', explode(',', $request->query('categories'))));
            $products->whereIn('Category', $cats);
        }

        // Join + group
        $subs = \DB::table(\DB::raw("({$products->toSql()}) as p"))
            ->mergeBindings($products)
            ->leftJoinSub($transStats, 'stats', function ($join) {
                $join->on('p.ProductID', '=', 'stats.ProductID');
            })
            ->select(
                'p.SubCategory',
                \DB::raw('COUNT(p.ProductID) as product_count'),
                \DB::raw('COALESCE(SUM(stats.total_revenue), 0) as delta_gmv')
            )
            ->groupBy('p.SubCategory')
            ->orderByDesc('delta_gmv')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $subs
        ]);

    } catch (\Exception $e) {
        \Log::error('Error in getSubCategories:', ['error' => $e->getMessage()]);
        return response()->json(['status' => 'error'], 500);
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
        $query = \DB::table('transactions as t')
            ->join('products as p', 'p.ProductID', '=', 't.ProductID')
            ->select(
                'p.Category',
                \DB::raw('COUNT(DISTINCT p.ProductID) as product_count'),
                \DB::raw('SUM(t.LineTotal) as delta_gmv')
            )
            ->whereNotNull('p.Category')
            ->where('p.Category', '!=', '');

        // Filter store
        if ($request->filled('stores')) {
            $ids = array_filter(array_map('trim', explode(',', $request->query('stores'))));
            $query->whereIn('t.StoreID', $ids);
        }

        // Filter date (RẤT QUAN TRỌNG: không dùng whereDate)
        if ($request->filled('from_date')) {
            $query->where('t.DATE', '>=', $request->query('from_date'));
        }
        if ($request->filled('to_date')) {
            $query->where('t.DATE', '<=', $request->query('to_date'));
        }

        // Filter categories
        if ($request->filled('categories')) {
            $cats = array_filter(array_map('trim', explode(',', $request->query('categories'))));
            $query->whereIn('p.Category', $cats);
        }

        $categories = $query
            ->groupBy('p.Category')
            ->orderByDesc('delta_gmv')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $categories
        ]);

    } catch (\Exception $e) {
        \Log::error('Error in getCategories', ['error' => $e->getMessage()]);
        return response()->json(['status' => 'error'], 500);
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