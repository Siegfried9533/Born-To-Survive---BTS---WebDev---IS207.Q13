<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoices extends Model
{
    use HasFactory;
    protected $table = 'invoices';
    protected $primaryKey = 'InvoiceID';
    protected $keyType = 'string';
    public $incrementing = false; // Tắt chế độ tự tăng ID

    protected $dates = ['Date']; // Để Laravel xử lý ngày tháng

    // Định nghĩa quan hệ: Một Invoice có nhiều InvoiceLine
    public function invoiceLines() {
        return $this->hasMany(InvoiceLine::class, 'InvoiceID', 'InvoiceID');
    }
    
    // Định nghĩa quan hệ: Một Invoice thuộc về một Customer
    public function customer() {
        return $this->belongsTo(Customer::class, 'CusID', 'CusID');
    }
}
