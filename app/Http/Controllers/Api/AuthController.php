<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Đăng nhập
     * POST /api/auth/login
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // Tìm user theo Email (bảng ACCOUNT)
        $user = User::where('Email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->Password)) {
            return response()->json(['message' => 'Sai email hoặc mật khẩu'], 401);
        }

        // Xoá token cũ
        $user->tokens()->delete();

        // Tạo token mới
        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => [
                'id'       => $user->id,
                'username' => $user->Username,
                'email'    => $user->Email,
                'employee' => $user->employee,
            ],
        ]);
    }

    /**
     * Đăng xuất
     * POST /api/auth/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Đăng xuất thành công']);
    }

    /**
     * Lấy thông tin user hiện tại
     * GET /api/auth/me
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'id'       => $user->id,
            'username' => $user->Username,
            'email'    => $user->Email,
            'employee' => $user->employee,
        ]);
    }

    /**
     * Đổi mật khẩu
     * POST /api/auth/change-password
     */
    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        // Kiểm tra mật khẩu hiện tại
        if (!Hash::check($data['current_password'], $user->Password)) {
            return response()->json(['message' => 'Mật khẩu hiện tại không đúng'], 400);
        }

        // Cập nhật mật khẩu mới
        $user->Password = Hash::make($data['new_password']);
        $user->save();

        return response()->json(['message' => 'Đổi mật khẩu thành công']);
    }

    /**
     * Quên mật khẩu - Gửi email reset
     * POST /api/auth/forgot-password
     */
    public function forgotPassword(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('Email', $data['email'])->first();

        if (!$user) {
            // Vẫn trả về success để không lộ thông tin user tồn tại
            return response()->json(['message' => 'Nếu email tồn tại, bạn sẽ nhận được link reset mật khẩu']);
        }

        // Tạo token reset
        $token = Str::random(64);

        // Lưu vào bảng password_reset_tokens
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $data['email']],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        // TODO: Gửi email chứa link reset password
        // Mail::to($data['email'])->send(new ResetPasswordMail($token));

        return response()->json([
            'message' => 'Nếu email tồn tại, bạn sẽ nhận được link reset mật khẩu',
            'token' => $token, // Chỉ dùng cho development, xóa khi production
        ]);
    }

    /**
     * Reset mật khẩu
     * POST /api/auth/reset-password
     */
    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'token'    => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        // Kiểm tra token
        $record = DB::table('password_reset_tokens')
            ->where('email', $data['email'])
            ->first();

        if (!$record || !Hash::check($data['token'], $record->token)) {
            return response()->json(['message' => 'Token không hợp lệ hoặc đã hết hạn'], 400);
        }

        // Kiểm tra token có hết hạn không (1 giờ)
        $createdAt = \Carbon\Carbon::parse($record->created_at);
        if ($createdAt->addHour()->isPast()) {
            return response()->json(['message' => 'Token đã hết hạn'], 400);
        }

        // Cập nhật mật khẩu
        $user = User::where('Email', $data['email'])->first();
        if (!$user) {
            return response()->json(['message' => 'User không tồn tại'], 404);
        }

        $user->Password = Hash::make($data['password']);
        $user->save();

        // Xóa token đã dùng
        DB::table('password_reset_tokens')->where('email', $data['email'])->delete();

        return response()->json(['message' => 'Đặt lại mật khẩu thành công']);
    }

    /**
     * Cập nhật profile
     * PUT /api/auth/profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'username' => 'sometimes|string|max:255|unique:ACCOUNT,Username,' . $user->id,
            'email'    => 'sometimes|email|max:255|unique:ACCOUNT,Email,' . $user->id,
        ]);

        if (isset($data['username'])) {
            $user->Username = $data['username'];
        }

        if (isset($data['email'])) {
            $user->Email = $data['email'];
        }

        $user->save();

        return response()->json([
            'message' => 'Cập nhật profile thành công',
            'user'    => [
                'id'       => $user->id,
                'username' => $user->Username,
                'email'    => $user->Email,
                'employee' => $user->employee,
            ],
        ]);
    }
}
