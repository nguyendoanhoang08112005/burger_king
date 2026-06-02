<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'thumbnail',
        'category',
        'author',
        'read_time',
        'video_url',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'read_time' => 'integer',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];
}
