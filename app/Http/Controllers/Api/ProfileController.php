<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    // GET /api/profile
    public function show(Request $request)
    {
        return response()->json(
            $request->user()->load('employee')
        );
    }

    // PUT /api/profile/update
    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => 'sometimes|string',
            // nếu bạn thêm cột khác cho EMPLOYEES như Phone, Email thì khai báo thêm ở đây
        ]);

        $user = $request->user();
        $emp  = $user->employee;

        if (! $emp) {
            return response()->json(['message' => 'Không tìm thấy thông tin nhân viên'], 404);
        }

        $emp->update([
            'Name' => $data['name'] ?? $emp->Name,
        ]);

        return response()->json($user->load('employee'));
    }

    // PUT /api/profile/password
    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'old_pass' => 'required|string',
            'new_pass' => 'required|string|min:6',
        ]);

        $user = $request->user();

        if (! Hash::check($data['old_pass'], $user->Password)) {
            return response()->json(['message' => 'Mật khẩu cũ không đúng'], 400);
        }

        // Hash the new password before saving (ensure consistency with login checks)
        $user->Password = \Illuminate\Support\Facades\Hash::make($data['new_pass']);
        $user->save();

        return response()->json(['message' => 'Đổi mật khẩu thành công']);
    }
}
