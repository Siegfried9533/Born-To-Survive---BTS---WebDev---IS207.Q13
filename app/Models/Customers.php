<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customers extends Model
{
    use HasFactory;

    protected $table = 'customers';
    protected $primaryKey = 'CustomerID';
    protected $keyType = 'int';   // BigInt nhưng không tự tăng
    public $incrementing = false;

    // Cho phép gán dữ liệu hàng loạt
    protected $fillable = [
        'CustomerID',
        'Name',
        'Email',
        'Telephone',
        'City',
        'Country',
        'Gender',
        'DateOfBirth',
        'JobTitle',
    ];

    // Một khách hàng có nhiều giao dịch
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'CustomerID', 'CustomerID');
    }
}
