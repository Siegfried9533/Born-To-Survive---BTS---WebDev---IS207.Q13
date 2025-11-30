<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CustomersController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\ChatBoxController;

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

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