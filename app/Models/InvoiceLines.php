<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceLines extends Model
{
    use HasFactory;

    protected $table = 'invoice_lines';

    public $incrementing = false;
    protected $primaryKey = null; 

    protected $fillable = [
        'InvoiceID', 
        'Line', 
        'SKU', 
        'Quantity', 
        'UnitPrice', 
        'Discount'
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class, 'InvoiceID', 'InvoiceID');
    }

}
