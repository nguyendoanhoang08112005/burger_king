<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\HasTranslations;

class Post extends Model
{
    use HasFactory, HasTranslations;

    public array $translatable = ['title', 'excerpt', 'content'];

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

    protected static function booted()
    {
        static::saved(function () {
            try {
                \Illuminate\Support\Facades\Cache::forget('homepage_data');
                \Illuminate\Support\Facades\Cache::forget('featured_posts');
            } catch (\Exception $e) {}
        });
        static::deleted(function () {
            try {
                \Illuminate\Support\Facades\Cache::forget('homepage_data');
                \Illuminate\Support\Facades\Cache::forget('featured_posts');
            } catch (\Exception $e) {}
        });
    }
}
