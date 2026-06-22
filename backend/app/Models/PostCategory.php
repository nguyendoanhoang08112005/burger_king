<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTranslations;

class PostCategory extends Model
{
    use HasFactory, HasTranslations;

    public array $translatable = ['name'];

    protected $fillable = [
        'name',
        'slug',
        'color',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_active'  => 'boolean',
    ];

    public function posts()
    {
        return $this->hasMany(Post::class, 'category', 'slug');
    }
}
