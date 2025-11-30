<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

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
        
        // Tính năng lọc theo Danh mục (nếu có gửi lên ?category=Ao)
        if ($request->has('category')) {
            $query->where('Category', $request->category);
        }

        // Lấy danh sách và phân trang (10 sản phẩm/trang)
        // orderByDesc('created_at') để sản phẩm mới nhất lên đầu
        return response()->json([
            'status' => 'success',
            'data' => $query->orderByDesc('created_at')->paginate(10)
        ]);
    }

    /**
     * 2. POST /api/products
     * Tạo sản phẩm mới
     */
    public function store(Request $request)
    {
        // Validate dữ liệu đầu vào
        $validator = Validator::make($request->all(), [
            'ProdID' => 'required|string|max:10|unique:products,ProdID', // ID không được trùng
            'Description' => 'required|string|max:255',
            'Category' => 'required|string',
            'ProductionCost' => 'integer|min:0'
        ], [
            'ProdID.unique' => 'Mã sản phẩm này đã tồn tại!',
            'ProdID.required' => 'Vui lòng nhập mã sản phẩm.'
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
     * Lấy danh sách các Category với doanh thu (Delta GMV + InStore GMV)
     */
    public function getCategories()
    {
        try {
            // Lấy danh mục với Delta GMV (tổng doanh thu) và InStore GMV (doanh thu trong cửa hàng)
            // Delta GMV = Tổng doanh thu từ tất cả các hóa đơn
            // InStore GMV = Tổng doanh thu từ các hóa đơn có TransactionType = "In-Store" (nếu khả dụng)
            $categories = DB::table('products')
                ->select(
                    'products.Category',
                    DB::raw('COUNT(DISTINCT products.ProdID) as product_count'),
                    DB::raw('COALESCE(SUM((invoice_lines.Quantity * invoice_lines.UnitPrice) - invoice_lines.Discount), 0) as delta_gmv'),
                    // InStore GMV: tính tổng doanh thu (nếu không có TransactionType hoặc = "In-Store")
                    DB::raw('COALESCE(SUM(CASE WHEN invoices.TransactionType IS NULL OR invoices.TransactionType = "In-Store" THEN (invoice_lines.Quantity * invoice_lines.UnitPrice) - invoice_lines.Discount ELSE 0 END), 0) as instore_gmv')
                )
                ->whereNotNull('products.Category')
                ->leftJoin('product_skus', 'products.ProdID', '=', 'product_skus.ProdID')
                ->leftJoin('invoice_lines', 'product_skus.SKU', '=', 'invoice_lines.SKU')
                ->leftJoin('invoices', 'invoice_lines.InvoiceID', '=', 'invoices.InvoiceID')
                ->groupBy('products.Category')
                ->orderByDesc('delta_gmv')
                ->get();
            
            \Log::info('Categories API response:', ['categories' => $categories, 'count' => count($categories)]);
            
            return response()->json(['status' => 'success', 'data' => $categories]);
        } catch (\Exception $e) {
            \Log::error('Error in getCategories:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * 4. GET /api/products/{id}
     * Xem chi tiết 1 sản phẩm
     */
    public function show($id)
    {
        // Tìm và nạp luôn danh sách biến thể (SKUs) của sản phẩm đó
        $product = Product::with('skus')->find($id);

        if (!$product) {
            return response()->json(['status' => 'error', 'message' => 'Không tìm thấy sản phẩm'], 404);
        }

        return response()->json(['status' => 'success', 'data' => $product]);
    }
}