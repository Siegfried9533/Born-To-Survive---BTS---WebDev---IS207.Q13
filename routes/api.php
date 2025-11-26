<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
// 1. QUAN TRỌNG: Phải Import Controller ở đây
use App\Http\Controllers\Api\AnalyticsController;

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
// Route::get('/analytics/stores', [AnalyticsController::class, 'getAllStores']);

// // Alias: giữ API cũ `/api/stores` để tránh lỗi 404 nếu client gọi đường dẫn cũ
// Route::get('/stores', [AnalyticsController::class, 'getAllStores']);