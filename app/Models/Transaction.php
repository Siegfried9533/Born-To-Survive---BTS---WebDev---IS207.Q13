<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    // Tên bảng trong database (phải chính xác)
    protected $table = 'transactions';

    // Khóa chính của bảng giao dịch
    protected $primaryKey = 'InvoiceID';

    // Các cột có thể thao tác
    protected $fillable = [
        'InvoiceID', 
        'StoreID', 
        'LineTotal', // <--- Cột quan trọng để tính tổng
        'CustomerID', 
        'ProductID', 
        'Quantity', 
        'DATE'
    ];
}