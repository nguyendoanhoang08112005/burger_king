<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatCache extends Model
{
    protected $table = 'chat_caches';

    protected $fillable = [
        'question',
        'answer',
        'actions',
        'language',
        'hit_count',
        'last_hit_at',
    ];

    protected $casts = [
        'actions' => 'array',
        'last_hit_at' => 'datetime',
    ];
}
