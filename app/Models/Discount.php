<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    use HasFactory;

    protected $table = 'discounts';

    protected $primaryKey = 'DiscountID';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'DiscountID',
        'Name',
        'Description',
        'DiscountRate', // Tỷ lệ giảm (VD: 0.1)
        'Category',
        'SubCategory',
        'StartDate',
        'EndDate',
    ];

    protected $casts = [
        'DiscountRate' => 'float',
        'StartDate' => 'datetime', // Tự động chuyển thành đối tượng Carbon (xử lý ngày tháng)
        'EndDate' => 'datetime',
    ];
    
    public function invoiceLines()
    {
        return $this->hasMany(InvoiceLine::class, 'DiscountID', 'DiscountID');
    }
}