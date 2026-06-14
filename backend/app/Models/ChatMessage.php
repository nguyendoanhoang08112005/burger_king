<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    protected $fillable = [
        'session_id',
        'role',
        'content',
        'actions',
        'tool_calls',
    ];

    protected $casts = [
        'actions' => 'array',
        'tool_calls' => 'array',
    ];

    public function session()
    {
        return $this->belongsTo(ChatSession::class, 'session_id', 'session_id');
    }
}
