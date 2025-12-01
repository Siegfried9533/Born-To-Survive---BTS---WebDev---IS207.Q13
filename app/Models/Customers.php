<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customers extends Model
{
    use HasFactory;
    protected $table = 'customers';
    protected $primaryKey = 'CusID'; // Khai báo khóa chính
    protected $keyType = 'string';   // Kiểu dữ liệu là string
    public $incrementing = false;    // Tắt chế độ tự tăng ID
    //Cho phép gán dữ liệu hàng loạt (Mass Assignment)
    protected $fillable = ['CusID', 'Name', 'Phone', 'Email', 'City', 'JobTitle'];

     //Định nghĩa quan hệ: Một Customer có nhiều Invoice
    public function invoices() {
        return $this->hasMany(Invoices::class, 'CusID', 'CusID');
        //CusID làm FK trỏ về CusID của customers
    }
}
