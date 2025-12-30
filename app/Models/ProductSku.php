<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductSku extends Model
{
    use HasFactory;
    protected $table = 'product_skus';

    protected $primaryKey = 'SKU';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'SKU',
        'Color',
        'Size',
        'ProdID', // Khóa ngoại trỏ về bảng products
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'ProdID', 'ProdID');
    }

    public function invoiceLines()
    {
        return $this->hasMany(InvoiceLines::class, 'SKU', 'SKU');
    }
}