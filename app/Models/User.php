<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'ACCOUNT';

    // Legacy table doesn't use Laravel timestamps
    public $timestamps = false;

    protected $fillable = [
        'Username',
        'Email',
        'Password',
        'EmpID',
    ];

    protected $hidden = [
        'Password',
        'remember_token',
    ];

    public function getAuthPassword()
    {
        return $this->Password;
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'EmpID', 'EmpID');
    }
}
