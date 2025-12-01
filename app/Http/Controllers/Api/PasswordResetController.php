<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PasswordResetController extends Controller
{
    // POST /api/auth/forgot-password
    public function forgot(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('Email', $data['email'])->first();

        if (! $user) {
            // Có thể trả chung 200 cho bảo mật, nhưng dev thì báo rõ cho dễ debug
            return response()->json(['message' => 'Email không tồn tại trong hệ thống'], 404);
        }

        $plainToken = Str::random(64);

        // Lưu token (hash lại cho an toàn)
        DB::table('password_resets')->updateOrInsert(
            ['email' => $user->Email],
            [
                'token'      => Hash::make($plainToken),
                'created_at' => now(),
            ]
        );

        // THỰC TẾ: gửi email chứa link reset (bỏ qua trong scope bài này)

        // DEV: trả token + email về FE để redirect sang trang reset-pwd.html
        return response()->json([
            'message' => 'Đã tạo yêu cầu reset mật khẩu',
            'email'   => $user->Email,
            'token'   => $plainToken, // CHỈ nên dùng trong DEV / nội bộ
        ]);
    }

    // POST /api/auth/reset-password
    public function reset(Request $request)
    {
        $data = $request->validate([
            'email'                 => 'required|email',
            'token'                 => 'required|string',
            'password'              => 'required|string|min:6|confirmed', // cần password_confirmation
        ]);

        $record = DB::table('password_resets')
            ->where('email', $data['email'])
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Yêu cầu reset mật khẩu không tồn tại'], 400);
        }

        // Kiểm tra hết hạn (VD: 60 phút)
        $created = Carbon::parse($record->created_at);
        if ($created->lt(now()->subMinutes(60))) {
            return response()->json(['message' => 'Token đã hết hạn, vui lòng tạo yêu cầu mới'], 400);
        }

        // Kiểm tra token
        if (! Hash::check($data['token'], $record->token)) {
            return response()->json(['message' => 'Token không hợp lệ'], 400);
        }

        $user = User::where('Email', $data['email'])->first();

        if (! $user) {
            return response()->json(['message' => 'Người dùng không tồn tại'], 404);
        }

        // Cập nhật mật khẩu mới
        $user->Password = Hash::make($data['password']);
        $user->save();

        // Xoá token reset đã dùng
        DB::table('password_resets')->where('email', $data['email'])->delete();

        // Option: revoke tất cả access token hiện tại
        $user->tokens()->delete();

        return response()->json(['message' => 'Đặt lại mật khẩu thành công']);
    }
}
