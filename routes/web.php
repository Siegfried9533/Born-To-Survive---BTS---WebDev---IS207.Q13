<?php

use Illuminate\Support\Facades\Route;

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