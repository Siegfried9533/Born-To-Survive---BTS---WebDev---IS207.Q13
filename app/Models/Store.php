<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HasFactory;

    protected $table = 'stores';

    // Cấu hình khóa chính (Quan trọng để join đúng)
    protected $primaryKey = 'StoreID';
    public $incrementing = false; // ID tự nhập (hoặc true nếu tự tăng, nhưng false an toàn hơn cho logic của bạn)
    protected $keyType = 'int';

    protected $fillable = [
        'StoreID', 'StoreName', 'City', 'Country', 'ZipCode', 'NumberOfEmployee', 'Latitude', 'Longitude'
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