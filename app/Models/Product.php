<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB; 

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    // Khóa chính dùng ProductID (int, không tự tăng)
    protected $primaryKey = 'ProductID';
    public $incrementing = false;
    protected $keyType = 'int';

    // Các cột cho phép gán
    protected $fillable = [
        'ProductID',
        'Category',
        'SubCategory',
        'Description',
        'Color',
        'Size',
        'ProductCost',
    ];

    // Quan hệ: một sản phẩm có nhiều giao dịch
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'ProductID', 'ProductID');
    }
}