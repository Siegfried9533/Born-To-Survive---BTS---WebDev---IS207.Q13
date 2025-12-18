<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB; // <--- CÓ DÒNG NÀY CHƯA?

class Store extends Model
{
    use HasFactory;

    // 1. Khai báo tên bảng (đề phòng Laravel tự suy diễn sai)
    protected $table = 'stores';

    // =========================================================
    // 2. CẤU HÌNH KHÓA CHÍNH (QUAN TRỌNG NHẤT)
    // =========================================================
    // Khóa chính là StoreID (int, không tự tăng)
    protected $primaryKey = 'StoreID';
    public $incrementing = false;
    protected $keyType = 'int';

    // =========================================================
    // 3. KHAI BÁO CÁC CỘT ĐƯỢC PHÉP CHỈNH SỬA (Mass Assignment)
    // =========================================================
    protected $fillable = [
        'StoreID',
        'Country',
        'City',
        'StoreName',
        'NumberOfEmployee',
        'ZipCode',
        'Latitude',
        'Longitude'
    ];

    // =========================================================
    // 4. KHAI BÁO MỐI QUAN HỆ (RELATIONSHIPS)
    // =========================================================
    
    // Một Cửa hàng có nhiều Nhân viên
    public function employees()
    {
        return $this->hasMany(Employee::class, 'StoreID', 'StoreID');
    }

    // Một Cửa hàng có nhiều giao dịch
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'StoreID', 'StoreID');
    }
}