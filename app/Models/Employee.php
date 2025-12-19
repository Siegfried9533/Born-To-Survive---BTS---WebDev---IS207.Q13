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

    // Relationship: Một Employee thuộc về một Store
    public function store()
    {
        return $this->belongsTo(Store::class, 'StoreID', 'StoreID');
    }

    // Relationship: Một Employee có nhiều Transactions
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'EmployeeID', 'EmployeeID');
    }
}