<?php
namespace App\Http\Controllers\Api; 
use App\Http\Controllers\Controller; 
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // Tìm user theo Email
        $user = User::where('Email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->Password)) {
            return response()->json(['message' => 'Sai email hoặc mật khẩu'], 401);
        }

        // Xoá token cũ (nếu bạn muốn 1 user chỉ có 1 token hoạt động)
        $user->tokens()->delete();

        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user->load('employee'),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Đăng xuất thành công']);
    }
}
