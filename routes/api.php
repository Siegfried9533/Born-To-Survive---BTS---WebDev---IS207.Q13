<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
// 1. QUAN TRỌNG: Phải Import Controller ở đây
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\ProductController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// 2. Định nghĩa Route của bạn ở đây
// Lưu ý: Tên hàm trong mảng [] phải khớp với tên hàm trong Controller
Route::get('/analytics/stores', [AnalyticsController::class, 'getAllStores']); 


// 1. Route lấy danh sách danh mục (đặt TRƯỚC route resource để tránh trùng lặp tham số)
Route::get('/products/categories', [ProductController::class, 'getCategories']);

// 2. Route CRUD chuẩn (Index, Store, Show, Update, Destroy)

Route::get('/analytics/products', [AnalyticsController::class, 'getProductAnalytics']);
