<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * Sử dụng bảng ACCOUNT trong SQL Server
     */
    protected $table = 'ACCOUNT';

    /**
     * Primary key
     */
    protected $primaryKey = 'id';

    /**
     * Column names mapping (SQL Server dùng PascalCase)
     */
    protected $fillable = [
        'Username',
        'Email',
        'Password',
        'EmployeeID',
    ];

    /**
     * Hidden attributes
     */
    protected $hidden = [
        'Password',
        'remember_token',
    ];

    /**
     * Disable timestamps vì bảng ACCOUNT không có created_at/updated_at
     */
    public $timestamps = false;

    /**
     * Override: Laravel mặc định tìm cột 'password', ta dùng 'Password'
     */
    public function getAuthPassword()
    {
        return $this->Password;
    }

    /**
     * Relationship: User belongs to an Employee
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class, 'EmployeeID', 'EmployeeID');
    }
}
