<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\HasTranslations;

class Banner extends Model
{
    use HasFactory, HasTranslations;

    public array $translatable = ['title', 'subtitle'];

    protected $fillable = [
        'title',
        'subtitle',
        'image',
        'link',
        'position',
        'sort_order',
        'is_active',
        'starts_at',
        'expires_at',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::saved(function () {
            try {
                \Illuminate\Support\Facades\Cache::forget('homepage_data');
            } catch (\Exception $e) {}
        });
        static::deleted(function () {
            try {
                \Illuminate\Support\Facades\Cache::forget('homepage_data');
            } catch (\Exception $e) {}
        });
    }
}
