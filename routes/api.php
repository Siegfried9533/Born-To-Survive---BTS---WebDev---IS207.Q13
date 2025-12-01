<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CustomersController;
use App\Http\Controllers\Api\SalesController;
use App\Http\Controllers\Api\ChatBoxController;

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StoreController;

// API Routes - analytics, customers, sales, chatbox
Route::prefix('analytics')->group(function () {
    Route::get('/customers', [CustomersController::class, 'index']);
    Route::get('/sales', [SalesController::class, 'index']);
});

Route::prefix('customers')->group(function () {
    Route::get('/search', [CustomersController::class, 'search']);
});

Route::prefix('chat')->group(function () {
    Route::post('/ask', [ChatBoxController::class, 'ask']);
    Route::get('/history', [ChatBoxController::class, 'history']);
    Route::get('/suggestions', [ChatBoxController::class, 'suggestions']);
    Route::delete('/history/clear', [ChatBoxController::class, 'clearHistory']);
});

// API Routes - products, stores, employees
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/analytics/stores', [AnalyticsController::class, 'getAllStores']); 
Route::get('/products/categories', [ProductController::class, 'getCategories']);
Route::get('/products/categories/summary', [ProductController::class, 'getCategorySummary']);
Route::get('/products/product/summary', [ProductController::class, 'getProductAnalyticsFiltered']);

Route::apiResource('products', ProductController::class);

Route::get('/stores/dashboard/summary', [StoreController::class, 'getDashboardSummary']);

Route::get('/analytics/products', [AnalyticsController::class, 'getProductAnalytics']);
Route::get('/stores/{id}/metrics', [AnalyticsController::class, 'getStoreMetrics']);


Route::get('/stores/{id}/employees', [StoreController::class, 'getEmployees']);
Route::put('/stores/{id}', [StoreController::class, 'update']);