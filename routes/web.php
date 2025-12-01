<?php

use Illuminate\Support\Facades\Route;

// 1. Route cho trang chủ (Để fix lỗi 404 bạn đang gặp)
Route::get('/', function () {
    return '<h1>Xin chào! Laravel đã chạy thành công trên BTSWebDev!</h1>';
});

// 2. Route test Database (Giữ lại để bạn check kết nối)
Route::get('/test-db', function () {
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        return 'Kết nối Database RetailDB thành công!';
    } catch (\Exception $e) {
        return 'Lỗi kết nối: ' . $e->getMessage();
    }
});