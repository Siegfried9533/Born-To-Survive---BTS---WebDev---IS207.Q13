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

