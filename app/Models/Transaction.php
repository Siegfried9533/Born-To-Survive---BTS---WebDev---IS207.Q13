<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $table = 'transactions';

    // Bảng không có khóa tự tăng; dùng InvoiceID làm khóa chính logic
    protected $primaryKey = 'InvoiceID';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'InvoiceID',
        'InvoiceHASH',
        'Line',
        'CustomerID',
        'ProductID',
        'Size',
        'Color',
        'UnitPrice',
        'Quantity',
        'DATE',
        'DiscountID',
        'LineTotal',
        'StoreID',
        'EmployeeID',
        'Currency',
        'CurrencySymbol',
        'SKU',
        'TransactionType',
        'PaymentMethod',
        'InvoiceTotal',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductID', 'ProductID');
    }

    public function customer()
    {
        return $this->belongsTo(Customers::class, 'CustomerID', 'CustomerID');
    }

    public function store()
    {
        return $this->belongsTo(Store::class, 'StoreID', 'StoreID');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'EmployeeID', 'EmployeeID');
    }

    public function discount()
    {
        return $this->belongsTo(Discount::class, 'DiscountID', 'DiscountID');
    }
}
