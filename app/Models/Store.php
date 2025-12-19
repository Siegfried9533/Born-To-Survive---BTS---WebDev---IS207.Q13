<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HasFactory;

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

    // Quan hệ: 1 Store có nhiều Transaction
    public function transactions()
    {
        // tham số 2: Khóa ngoại bên bảng transactions
        // tham số 3: Khóa chính bên bảng stores
        return $this->hasMany(Transaction::class, 'StoreID', 'StoreID');
    }

    // Quan hệ: 1 Store có nhiều Employee
    public function employees()
    {
        return $this->hasMany(Employee::class, 'StoreID', 'StoreID');
    }
}