<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $table = 'employees';

    // Cấu hình khóa chính (Quan trọng)
    protected $primaryKey = 'EmployeeID';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = ['EmployeeID', 'StoreID', 'Name', 'Position'];

    public function store()
    {
        return $this->belongsTo(Store::class, 'StoreID', 'StoreID');
    }
}