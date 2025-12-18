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
    protected $keyType = 'int';
    protected $fillable = [
        'DiscountID',
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
}