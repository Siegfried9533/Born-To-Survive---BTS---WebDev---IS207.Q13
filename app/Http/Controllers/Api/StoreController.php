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
    public function index()
    {
        // Sử dụng Query Builder + Raw SQL Subquery
        $stores = \DB::table('stores')
            ->select(
                'stores.StoreID',
                'stores.StoreName',
                'stores.City',
                'stores.Country',
                'stores.ZipCode',
                'stores.NumberOfEmployee',
                'stores.Latitude',
                'stores.Longitude',
                // Subquery 1: Tính tổng tiền trực tiếp
                \DB::raw('(SELECT COALESCE(SUM(LineTotal), 0) FROM transactions WHERE transactions.StoreID = stores.StoreID) as revenue'),
                // Subquery 2: Đếm nhân viên trực tiếp
                \DB::raw('(SELECT COUNT(*) FROM employees WHERE employees.StoreID = stores.StoreID) as total_employees')
            )
            ->orderBy('stores.StoreName', 'asc')
            // Dùng paginate thay vì get() để tránh load 1 cục
            ->paginate(20); 

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
}