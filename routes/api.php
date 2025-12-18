<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CustomersController;
use App\Http\Controllers\Api\SalesController;
use App\Http\Controllers\Api\ChatBoxController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\UserController;

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
Route::get('/products/categories', [ProductController::class, 'getCategories']);
Route::apiResource('products', ProductController::class);

Route::get('/stores/{id}/metrics', [AnalyticsController::class, 'getStoreMetrics']);
Route::get('/stores/{id}/employees', [StoreController::class, 'getEmployees']);
Route::put('/stores/{id}', [StoreController::class, 'update']);

Route::get('/dashboard/overview', [DashboardController::class, 'index']);

// ============================================================
// EXPORT
// ============================================================
Route::get('/export/{type}', [ExportController::class, 'export']);
