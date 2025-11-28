<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('auth.sign-up');
});
// auth
Route::view('/auth/sign-up', 'auth.sign-up');
Route::view('/auth/reset-pwd', 'auth.reset-pwd');
Route::view('/auth/forgot-pwd', 'auth.forgot-pwd');
//customer
Route::view('/customers/customers', 'customers.customers');
Route::view('/customers/report-customers', 'customers.report-customers');
//dashboard
Route::view('/dashboard/overview', 'dashboard.overview');
Route::view('/dashboard/gauge', 'dashboard.gauge');
Route::view('/dashboard/top-category', 'dashboard.top-category');
Route::view('/dashboard/top-products', 'dashboard.top-products');
Route::view('/dashboard/top-stores', 'dashboard.top-stores');
//profile
Route::view('/profile', 'profile.profile');
//revenue
Route::view('/revenue/report-revenues', 'revenue.report-revenues');
//sales
Route::view('/sales/report-sales', 'sales.report-sales');
Route::view('/sales/sales', 'sales.sales');

// Serve fake-data files from database/fake-data (safe whitelist)
Route::get('/fake-data/{filename}', function ($filename) {
    $allowed = [
        'overview-data.txt',
        'growth-data.txt',
        'top-category-data.txt',
        'top-products-data.txt',
        'customers-data.txt',
        'stores-data.txt',
    ];

    if (! in_array($filename, $allowed, true)) {
        abort(404);
    }

    $path = database_path('fake-data/' . $filename);
    if (! file_exists($path)) {
        abort(404);
    }

    return response()->file($path, ['Content-Type' => 'text/plain']);
})->where('filename', '[A-Za-z0-9_\-\.]+');