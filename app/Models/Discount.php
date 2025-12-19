<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    use HasFactory;

    protected $table = 'discounts';

    protected $primaryKey = 'DiscountID';
    public $incrementing = true; // FIXED: DiscountID is auto-increment in migration
    protected $keyType = 'int';
    protected $fillable = [
        'Discount',
        'Start',
        'End',
        'Description',
        'Category',
        'SubCategory',
    ];

    protected $casts = [
        'Discount' => 'float',
        'Start' => 'datetime',
        'End' => 'datetime',
    ];

    // Relationship: Một Discount có nhiều Transactions
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'DiscountID', 'DiscountID');
    }
}
