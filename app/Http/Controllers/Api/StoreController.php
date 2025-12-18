<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StoreController extends Controller
{
/**
     * 1. Lấy danh sách tất cả cửa hàng (Kèm Doanh số & Số nhân viên)
     * GET /api/stores
     */
    public function index(Request $request)
    {
        // Nhận filter từ query params
        $categoryParam = $request->query('category'); // CSV of categories
        $storesParam = $request->query('stores'); // CSV of StoreID
        $sort = $request->query('sort');

        // Sử dụng Query Builder + Raw SQL Subquery
        // Chuẩn bị SQL cho catSelected (doanh thu chỉ cho các category được filter)
        $catSelectedSql = '(SELECT 0) as catSelected';
        if ($categoryParam) {
            $cats = array_values(array_filter(array_map('trim', explode(',', $categoryParam))));
            if (!empty($cats)) {
                // Quote each category value to avoid SQL injection
                $quoted = array_map(function($c) { return \DB::getPdo()->quote($c); }, $cats);
                $inList = implode(',', $quoted);
                $catSelectedSql = "(SELECT COALESCE(SUM(t.LineTotal), 0) FROM transactions t JOIN products p ON t.ProductID = p.ProductID WHERE t.StoreID = stores.StoreID AND p.Category IN ({$inList})) as catSelected";
            }
        }

        $storesQuery = \DB::table('stores')
            ->select(
                'stores.StoreID',
                'stores.StoreName',
                'stores.City',
                'stores.Country',
                'stores.ZipCode',
                'stores.NumberOfEmployee',
                'stores.Latitude',
                'stores.Longitude',
                // Subquery 1: Tính tổng tiền trực tiếp (hiện tính trên toàn bộ transactions)
                \DB::raw('(SELECT COALESCE(SUM(LineTotal), 0) FROM transactions WHERE transactions.StoreID = stores.StoreID) as revenue'),
                // Subquery 2: Đếm nhân viên trực tiếp
                \DB::raw('(SELECT COUNT(*) FROM employees WHERE employees.StoreID = stores.StoreID) as total_employees'),
                // Subquery 3: Doanh thu cho các category được chọn (catSelected)
                \DB::raw($catSelectedSql)
            );

        // Áp dụng filter: stores list
        if ($storesParam) {
            $ids = array_values(array_filter(array_map('trim', explode(',', $storesParam))));
            if (!empty($ids)) {
                $storesQuery->whereIn('stores.StoreID', $ids);
            }
        }

        // Áp dụng filter: category (kiểm tra tồn tại giao dịch có sản phẩm cùng category)
        if ($categoryParam) {
            $cats = array_values(array_filter(array_map('trim', explode(',', $categoryParam))));
            if (!empty($cats)) {
                $storesQuery->whereExists(function($q) use ($cats) {
                    $q->select(\DB::raw(1))
                      ->from('transactions')
                      ->join('products', 'transactions.ProductID', '=', 'products.ProductID')
                      ->whereRaw('transactions.StoreID = stores.StoreID')
                      ->whereIn('products.Category', $cats);
                });
            }
        }

        // Sắp xếp
        if ($sort) {
            if (in_array($sort, ['revenue', 'revenue_desc'])) {
                $storesQuery->orderByDesc('revenue');
            } elseif ($sort === 'revenue_asc') {
                $storesQuery->orderBy('revenue', 'asc');
            } else {
                $storesQuery->orderBy('stores.StoreName', 'asc');
            }
        } else {
            $storesQuery->orderBy('stores.StoreName', 'asc');
        }

        // Dùng paginate
        $stores = $storesQuery->paginate(20);

        return response()->json([
            'status' => 'success',

            // 1. Trả về mảng dữ liệu thuần (để Table hiển thị được ngay)
            'data' => $stores->items(), 

            // 2. Gửi kèm thông tin phân trang (để bạn làm nút Next/Prev)
            'pagination' => [
                'total' => $stores->total(),
                'per_page' => $stores->perPage(),
                'current_page' => $stores->currentPage(),
                'last_page' => $stores->lastPage(),
                'from' => $stores->firstItem(),
                'to' => $stores->lastItem()
            ]
        ]);
    }

    /**
     * 2. Xem chi tiết 1 Store + Doanh thu
     */
    public function show($id)
    {
        $store = Store::withSum('transactions', 'LineTotal')
                      ->withCount('employees')
                      ->find($id);

        if (!$store) {
            return response()->json(['status' => 'error', 'message' => 'Không tìm thấy cửa hàng'], 404);
        }

        // Gán doanh thu vào biến dễ đọc
        $revenue = $store->transactions_sum_line_total ?? 0;
        $store->revenue = (float) $revenue;

        // Xóa biến tạm của Laravel cho API gọn gàng
        $store->makeHidden(['transactions_sum_line_total']);

        return response()->json(['status' => 'success', 'data' => $store]);
    }

    public function update(Request $request, $id)
    {
        $store = Store::find($id);

        if (!$store) {
            return response()->json(['status' => 'error', 'message' => 'Không tìm thấy cửa hàng'], 404);
        }

        $validator = Validator::make($request->all(), [
            'StoreName' => 'string|max:255',
            'City'      => 'string|max:255',
            'Country'   => 'string|max:255', 
            'ZipCode'   => 'string|max:255',
            'NumberOfEmployee' => 'integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $store->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Cập nhật cửa hàng thành công',
            'data' => $store
        ]);
    }

    /**
     * 4. Lấy danh sách nhân viên
     * GET /api/stores/{id}/employees
     */
    public function getEmployees($id)
    {
        // Tối ưu: Dùng with('employees') để load 1 lần thay vì Lazy Load
        $store = Store::with('employees')->find($id);

        if (!$store) {
            return response()->json(['status' => 'error', 'message' => 'Không tìm thấy cửa hàng'], 404);
        }

        return response()->json([
            'status' => 'success',
            'store_name' => $store->StoreName, 
            'count' => $store->employees->count(),
            'data' => $store->employees
        ]);
    }
    
    /**
     * 5. Trả về danh sách cửa hàng thuần (dùng cho dropdown)
     * GET /api/stores
     */
    public function listAll()
    {
        $stores = Store::select('StoreID', 'StoreName', 'City')->orderBy('StoreName', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $stores
        ]);
    }
    
}