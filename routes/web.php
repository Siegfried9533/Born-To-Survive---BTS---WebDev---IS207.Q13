<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\ProductController;
Route::get('/', function () {
    return view('welcome');
});

Route::get('/index', function () {
    return view('index'); // Tên file view (không cần đuôi .blade.php)
});

Route::get('/overview', function () {
    return view('overview'); // Tên file view (không cần đuôi .blade.php)
});


Route::get('/profile', function () {
    return view('profile'); // Tên file view (không cần đuôi .blade.php)
});

Route::get('/top-stores', function () {
    return view('top-stores'); // Tên file view (không cần đuôi .blade.php)
});

Route::get('/top-products', function () {
    return view('top-products'); // Tên file view (không cần đuôi .blade.php)
});

Route::get('/top-category', function () {
    return view('top-category'); // Tên file view (không cần đuôi .blade.php)
});


Route::get('/app', function () {
    return view('app'); // Tên file view (không cần đuôi .blade.php)
});

Route::get('/top-stores', [AnalyticsController::class, 'viewTopStores'])->name('top-stores');

Route::get('/top-products', [ProductController::class, 'viewTopProducts'])->name('top-products');

Route::get('/top-category', [ProductController::class, 'viewTopCategory'])->name('top-category');

Route::get('/products', function () {
    return view('products'); // Tên file view (không cần đuôi .blade.php)
});


Route::get('/customers', function () {
    return view('pages.customers'); // Tên file view (không cần đuôi .blade.php)
})->name('customers');



Route::get('/overview', function () {
    return view('pages.overview'); // Tên file view (không cần đuôi .blade.php)
})->name('overview');

Route::get('/sales', function () {
    return view('pages.sales'); // Tên file view (không cần đuôi .blade.php)
})->name('sales');


Route::get('/report-customers', function () {
    return view('pages.report-customers'); // Tên file view (không cần đuôi .blade.php)
})->name('report-customers');

Route::get('/report-revenues', function () {
    return view('pages.report-revenues'); // Tên file view (không cần đuôi .blade.php)
})->name('report-revenues');

Route::get('/report-sales', function () {
    return view('pages.report-sales'); // Tên file view (không cần đuôi .blade.php)
})->name('report-sales');
