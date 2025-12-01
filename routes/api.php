<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PasswordResetController;
// ========== AUTH ==========

// Sign In
Route::post('/auth/login',  [AuthController::class, 'login']);

// Sign Out (cần token)
Route::post('/auth/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

// ========== PASSWORD RESET (PUBLIC) ==========
Route::post('/auth/forgot-password', [PasswordResetController::class, 'forgot']);
Route::post('/auth/reset-password',   [PasswordResetController::class, 'reset']);

// ========== NHÓM CẦN LOGIN ==========
Route::middleware('auth:sanctum')->group(function () {

    // ----- Manage User Accounts (Admin) -----
    Route::post('/users',           [UserController::class, 'store']);   // Create
    Route::put('/users/{id}',       [UserController::class, 'update']);  // Update
    Route::delete('/users/{id}',    [UserController::class, 'destroy']); // Delete
    Route::get('/users/search',     [UserController::class, 'search']);  // Search

    // ----- Manage Personal Profile -----
    Route::get('/profile',              [ProfileController::class, 'show']);          // Xem thông tin cá nhân
    Route::put('/profile/update',       [ProfileController::class, 'update']);        // Cập nhật thông tin profile
    Route::put('/profile/password',     [ProfileController::class, 'changePassword']); // Đổi mật khẩu
});
