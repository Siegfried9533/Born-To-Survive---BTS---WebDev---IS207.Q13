<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $table = 'employees';

    // Cấu hình khóa chính (Quan trọng)
    protected $primaryKey = 'EmpID';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['EmpID', 'Name', 'Position', 'StoreID'];
}