<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CustomersController;
use App\Http\Controllers\Api\SalesController;
use App\Http\Controllers\Api\ChatBoxController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\ExportController;
// ============================================================
// AUTH ROUTES (Public - không cần token)
// ============================================================
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [PasswordResetController::class, 'forgot']);
    Route::post('/reset-password', [PasswordResetController::class, 'reset']);
});

// ============================================================
// AUTH ROUTES (Protected - cần token)
// ============================================================
Route::prefix('auth')->middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
});

// ============================================================
// USER MANAGEMENT (Protected)
// ============================================================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user()->load('employee');
    });

    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::get('/users/search', [UserController::class, 'search']);
});

// ============================================================
// ANALYTICS ROUTES
// ============================================================
Route::prefix('analytics')->group(function () {
    Route::get('/customers', [CustomersController::class, 'index']);
    Route::get('/sales', [SalesController::class, 'index']);
    Route::get('/stores', [AnalyticsController::class, 'getAllStores']);
    Route::get('/products', [AnalyticsController::class, 'getProductAnalytics']);
});

Route::prefix('customers')->group(function () {
    Route::get('/search', [CustomersController::class, 'search']);
});

// ============================================================
// CHATBOX ROUTES
// ============================================================
Route::prefix('chat')->group(function () {
    Route::post('/ask', [ChatBoxController::class, 'ask']);
    Route::get('/history', [ChatBoxController::class, 'history']);
    Route::get('/suggestions', [ChatBoxController::class, 'suggestions']);
    Route::delete('/history/clear', [ChatBoxController::class, 'clearHistory']);
});

// ============================================================
// PRODUCTS, STORES, DASHBOARD
// ============================================================
// API Routes - products, stores, employees
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/analytics/stores', [StoreController::class, 'index']);
// Minimal stores list used by frontend dropdowns
Route::get('/stores', [StoreController::class, 'listAll']);
Route::get('/products/categories', [ProductController::class, 'getCategories']);
Route::get('/products/subcategories', [ProductController::class, 'getSubCategories']);
Route::apiResource('products', ProductController::class);

Route::get('/stores/{id}/metrics', [AnalyticsController::class, 'getStoreMetrics']);
Route::get('/stores/{id}/employees', [StoreController::class, 'getEmployees']);
Route::put('/stores/{id}', [StoreController::class, 'update']);

Route::get('/dashboard/overview', [DashboardController::class, 'index']);

// API chung để export CSV: /api/export/{type}
// Hỗ trợ trước: customers, stores, products, invoices
Route::get('/export/{type}', [ExportController::class, 'export']);
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
// ============================================================
// EXPORT
// ============================================================
Route::get('/export/{type}', [ExportController::class, 'export']);
