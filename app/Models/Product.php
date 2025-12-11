<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB; 

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    // 1. Cấu hình Khóa chính (BẮT BUỘC VỚI DB CỦA BẠN)
    protected $primaryKey = 'ProdID'; // Tên cột khóa chính
    public $incrementing = false;     // Tắt chế độ tự tăng (Auto-increment)
    protected $keyType = 'string';    // Khai báo kiểu dữ liệu là chuỗi

    // 2. Cho phép gán dữ liệu hàng loạt (Mass Assignment)
    protected $fillable = [
        'ProdID',
        'Category',
        'SubCategory',
        'Description',
        'ProductionCost'
    ];

    // 3. Định nghĩa quan hệ với SKU (1 Sản phẩm có nhiều biến thể)
    // Để sau này muốn lấy sản phẩm kèm các size/màu thì chỉ cần gọi ->with('skus')
    public function skus()
    {
        return $this->hasMany(ProductSku::class, 'ProdID', 'ProdID');
    }
}