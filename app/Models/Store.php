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
    // Vì khóa chính là 'StoreID' (VD: "S001") chứ không phải 'id'
    protected $primaryKey = 'StoreID';

    // Vì khóa chính là Chuỗi (String), không phải số tự tăng (Auto-increment)
    public $incrementing = false;
    protected $keyType = 'string';

    // =========================================================
    // 3. KHAI BÁO CÁC CỘT ĐƯỢC PHÉP CHỈNH SỬA (Mass Assignment)
    // =========================================================
    protected $fillable = [
        'StoreID',
        'Name',
        'City',
        'Country',
        'ZIPCode',
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

    // Một Cửa hàng có nhiều Hóa đơn
    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'StoreID', 'StoreID');
    }
}