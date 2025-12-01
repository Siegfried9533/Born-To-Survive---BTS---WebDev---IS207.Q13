<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    // This table does not use Laravel's created_at/updated_at timestamps
    public $timestamps = false;
    protected $table = 'EMPLOYEES';
    protected $primaryKey = 'EmpID';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'EmpID',
        'Name',
        'Position',
        'StoreID',
    ];

    public function account()
    {
        return $this->hasOne(User::class, 'EmpID', 'EmpID');
    }
}
