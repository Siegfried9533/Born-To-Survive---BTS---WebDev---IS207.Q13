<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * CREATE USER
     * POST /api/users
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'email'       => 'required|email|unique:ACCOUNT,Email',
            'username'    => 'required|string|unique:ACCOUNT,Username',
            'password'    => 'required|string|min:6',
            'employee_id' => 'required|integer|exists:employees,EmployeeID',
        ]);

        $user = User::create([
            'Username'   => $data['username'],
            'Email'      => $data['email'],
            'Password'   => Hash::make($data['password']),
            'EmployeeID' => $data['employee_id'],
        ]);

        return response()->json([
            'message' => 'Tạo user thành công',
            'user'    => [
                'id'       => $user->id,
                'username' => $user->Username,
                'email'    => $user->Email,
                'employee' => $user->employee,
            ],
        ], 201);
    }

    /**
     * UPDATE USER
     * PUT /api/users/{id}
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'email'    => 'sometimes|email|unique:ACCOUNT,Email,' . $user->id,
            'username' => 'sometimes|string|unique:ACCOUNT,Username,' . $user->id,
            'password' => 'sometimes|nullable|string|min:6',
        ]);

        if (isset($data['email'])) {
            $user->Email = $data['email'];
        }

        if (isset($data['username'])) {
            $user->Username = $data['username'];
        }

        if (!empty($data['password'])) {
            $user->Password = Hash::make($data['password']);
        }

        $user->save();

        return response()->json([
            'message' => 'Cập nhật user thành công',
            'user'    => [
                'id'       => $user->id,
                'username' => $user->Username,
                'email'    => $user->Email,
                'employee' => $user->employee,
            ],
        ]);
    }

    /**
     * DELETE USER
     * DELETE /api/users/{id}
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Xoá token của user trước
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Đã xoá user']);
    }

    /**
     * SEARCH USER
     * GET /api/users/search?keyword=...
     */
    public function search(Request $request)
    {
        $query = User::with('employee');

        if ($kw = $request->query('keyword')) {
            $query->where(function ($q) use ($kw) {
                $q->where('Username', 'like', "%{$kw}%")
                  ->orWhere('Email', 'like', "%{$kw}%");
            });
        }

        return response()->json($query->get()->map(function ($user) {
            return [
                'id'       => $user->id,
                'username' => $user->Username,
                'email'    => $user->Email,
                'employee' => $user->employee,
            ];
        }));
    }
}
