<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // ========== CREATE USER ==========
    // POST /api/users
    public function store(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email|unique:ACCOUNT,Email',
            'password' => 'required|string|min:6',
            'name'     => 'required|string',
            'role'     => 'required|string',
            'store_id' => 'required|string',
        ]);

        return DB::transaction(function () use ($data) {

            // Tạo Employee mới (EmpID random 6 ký tự)
            $emp = Employee::create([
                'EmpID'    => Str::upper(Str::random(6)),
                'Name'     => $data['name'],
                'Position' => $data['role'],
                'StoreID'  => $data['store_id'],
            ]);

            // Tạo Account (User)
            $user = User::create([
                // Dùng email làm Username cho đồng bộ (nếu bạn vẫn cần cột Username)
                'Username' => $data['email'],
                'Email'    => $data['email'],
                'Password' => Hash::make($data['password']),
                'EmpID'    => $emp->EmpID,
            ]);

            return response()->json($user->load('employee'), 201);
        });
    }

    // ========== UPDATE USER ==========
    // PUT /api/users/{id}
    public function update(Request $request, $id)
    {
        $user = User::with('employee')->findOrFail($id);

        $data = $request->validate([
            'email'    => 'sometimes|email|unique:ACCOUNT,Email,' . $user->id,
            'password' => 'sometimes|nullable|string|min:6',
            'name'     => 'sometimes|string',
            'role'     => 'sometimes|string',
            'store_id' => 'sometimes|string',
        ]);

        // Cập nhật Email (và Username nếu bạn muốn sync)
        if (isset($data['email'])) {
            $user->Email    = $data['email'];
            $user->Username = $data['email']; // hoặc giữ Username cũ nếu bạn thích
        }

        // Cập nhật password nếu có truyền
        if (!empty($data['password'])) {
            $user->Password = Hash::make($data['password']);
        }

        if (isset($data['store_id'])) {
            // nếu ACCOUNT có cột StoreID thì set ở đây, còn không thì bỏ
        }

        $user->save();

        // Cập nhật thông tin Employee
        $emp = $user->employee;
        if ($emp) {
            $emp->update([
                'Name'     => $data['name']     ?? $emp->Name,
                'Position' => $data['role']     ?? $emp->Position,
                'StoreID'  => $data['store_id'] ?? $emp->StoreID,
            ]);
        }

        return response()->json($user->load('employee'));
    }

    // ========== DELETE USER ==========
    // DELETE /api/users/{id}
    public function destroy($id)
    {
        $user = User::with('employee')->findOrFail($id);

        $emp = $user->employee;

        // Xoá token của user trước
        $user->tokens()->delete();

        $user->delete();

        // Nếu muốn xoá luôn employee (cân nhắc khoá ngoại)
        // if ($emp) {
        //     $emp->delete();
        // }

        return response()->json(['message' => 'Đã xoá user']);
    }

    // ========== SEARCH USER ==========
    // GET /api/users/search?keyword=...&role=...&store_id=...
    public function search(Request $request)
    {
        $query = Employee::with('account');

        if ($kw = $request->query('keyword')) {
            $query->where(function ($q) use ($kw) {
                $q->where('Name', 'like', "%{$kw}%")
                  ->orWhereHas('account', function ($sub) use ($kw) {
                      $sub->where('Email', 'like', "%{$kw}%")
                          ->orWhere('Username', 'like', "%{$kw}%");
                  });
            });
        }

        if ($role = $request->query('role')) {
            $query->where('Position', $role);
        }

        if ($store = $request->query('store_id')) {
            $query->where('StoreID', $store);
        }

        return response()->json($query->get());
    }
}
