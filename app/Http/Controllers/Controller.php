<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Api\AnalyticsController;

use Illuminate\Support\Facades\Route;

// Đường dẫn sẽ là: http://duan.test/api/analytics/products
Route::get('/analytics/products', [AnalyticsController::class, 'getProductAnalytics']);
// Lấy danh sách so sánh tất cả cửa hàng
Route::get('/analytics/stores', [AnalyticsController::class, 'getStoreComparison']);

// Lấy chi tiết KPI của một cửa hàng (Ví dụ: /api/stores/S001/metrics)
Route::get('/stores/{id}/metrics', [AnalyticsController::class, 'getStoreMetrics']);

// Route lấy danh sách Store (Dùng chung Controller Analytics để test)
Route::get('/stores', [AnalyticsController::class, 'getAllStores']);