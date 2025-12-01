<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    protected $table = 'STORES';
    protected $primaryKey = 'StoreID';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['StoreID', 'Name', 'City', 'Country', 'ZIPCode', 'Latitude', 'Longitude'];
}