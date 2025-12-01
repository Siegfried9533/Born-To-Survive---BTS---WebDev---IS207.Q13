<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $table = 'messages';

    protected $fillable = [
        'sender_id', 
        'receiver_id', 
        'content', 
        'is_read'
    ];
    // Quan hệ với User (người gửi)
    public function sender() {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
