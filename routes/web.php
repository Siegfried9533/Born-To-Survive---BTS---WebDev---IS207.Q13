<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\ProductController;
// ============================================================
// ROOT: Redirect đến trang đăng nhập
// ============================================================
Route::get('/', function () {
    return redirect()->route('auth.login');
});

// ============================================================
// AUTH VIEWS
// ============================================================
Route::view('/login', 'auth.login')->name('auth.login');
Route::view('/sign-up', 'auth.sign-up')->name('auth.signup');
Route::view('/forgot-password', 'auth.forgot-password')->name('auth.forgot-password');
Route::view('/reset-password', 'auth.reset-password')->name('auth.reset-password');

// ============================================================
// PROTECTED ROUTES (Cần đăng nhập)
// ============================================================
Route::middleware(['web'])->group(function () {
    
    // CUSTOMER VIEWS
    Route::view('/customers/customers', 'customers.customers')->name('customers.index');
    Route::view('/customers/report-customers', 'customers.report-customers')->name('reports.customers');

    // DASHBOARD VIEWS
    Route::view('/dashboard/overview', 'dashboard.overview')->name('dashboard.overview');
    Route::view('/dashboard/gauge', 'dashboard.gauge')->name('dashboard.gauge');
    Route::view('/dashboard/top-category', 'dashboard.top-category')->name('products.top-category');
    Route::view('/dashboard/top-products', 'dashboard.top-products')->name('products.top-products');
    Route::view('/dashboard/top-stores', 'dashboard.top-stores')->name('top-stores');

    // PROFILE VIEW
    Route::view('/profile', 'profile.profile')->name('profile');

    // REVENUE VIEWS
    Route::view('/revenue/report-revenues', 'revenue.report-revenues')->name('reports.revenues');

    // SALES VIEWS
    Route::view('/sales/report-sales', 'sales.report-sales')->name('reports.sales');
    Route::view('/sales/sales', 'sales.sales')->name('sales.index');
});

// ============================================================
// SERVE FAKE-DATA FILES
// ============================================================
Route::get('/fake-data/{filename}', function ($filename) {
    $allowed = [
        'overview-data.txt',
        'growth-data.txt',
        'top-category-data.txt',
        'top-products-data.txt',
        'customers-data.txt',
        'stores-data.txt',
    ];

    if (!in_array($filename, $allowed, true)) {
        abort(404);
    }

    $path = database_path('fake-data/' . $filename);
    if (!file_exists($path)) {
        abort(404);
    }

    return response()->file($path, ['Content-Type' => 'text/plain']);
})->where('filename', '[A-Za-z0-9_\-\.]+');

// ============================================================
// SERVE BLADE PARTIALS
// ============================================================
Route::get('/components/{name}', function ($name) {
    $allowed = ['header', 'footer', 'sidebar', 'filter'];
    if (!in_array($name, $allowed, true)) {
        abort(404);
    }

    return view('partials.' . $name);
})->where('name', '[a-zA-Z0-9_-]+');
