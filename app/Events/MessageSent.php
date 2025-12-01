<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message; // Dữ liệu này sẽ được gửi sang Frontend
    public function __construct()
    {
        $this->message = $message;    
    }

    public function broadcastOn(): array
    {
        // Gửi vào kênh riêng của người nhận: chat.{receiver_id}
        // Ví dụ: gửi cho user có ID=5 thì kênh là "chat.5"
        return [
            new Channel('chat.' . $this->message->receiver_id),
        ];
    }
    
    // Tên sự kiện để Frontend lắng nghe
    public function broadcastAs()
    {
        return 'message.sent';
    }
}
