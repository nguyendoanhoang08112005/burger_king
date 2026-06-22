<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\HasTranslations;
use App\Models\PostTag;

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
        'tags',
        'author',
        'read_time',
        'video_url',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'tags'         => 'array',
        'read_time'    => 'integer',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    protected $appends = ['tags_details'];

    public function postCategory()
    {
        return $this->belongsTo(PostCategory::class, 'category', 'slug');
    }

    public function getTagsDetailsAttribute()
    {
        $tags = $this->tags;
        if (!is_array($tags)) return [];

        $lang = request()->header('Accept-Language') ?? request()->input('ref_lang') ?? app()->getLocale();
        $lang = substr($lang, 0, 2);

        return PostTag::whereIn('slug', $tags)->get()->map(function($tag) use ($lang) {
            return [
                'slug' => $tag->slug,
                'name' => $tag->getTranslation('name', $lang) ?: $tag->name,
            ];
        });
    }

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
