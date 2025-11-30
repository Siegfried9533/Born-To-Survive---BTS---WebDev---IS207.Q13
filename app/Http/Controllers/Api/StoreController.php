<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StoreController extends Controller
{
    // ... Giữ lại hàm index() cũ nếu có ...

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