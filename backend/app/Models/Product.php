<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Traits\HasTranslations;

class Product extends Model
{
    use HasFactory, SoftDeletes, HasTranslations;

    public array $translatable = [
        'name',
        'description',
        'short_description',
    ];

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'sku',
        'description',
        'short_description',
        'base_price',
        'sale_price',
        'thumbnail',
        'is_featured',
        'is_available',
        'sort_order',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'is_featured' => 'boolean',
        'is_available' => 'boolean',
        'sort_order' => 'integer',
    ];

    /* Relationships */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function sizes()
    {
        return $this->hasMany(ProductSize::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class)->where('is_approved', true);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    /* Custom Accessors */
    public function getDiscountPercentageAttribute(): int
    {
        if ($this->sale_price && $this->sale_price < $this->base_price) {
            $diff = $this->base_price - $this->sale_price;
            return (int) round(($diff / $this->base_price) * 100);
        }
        return 0;
    }

    public function getActivePriceAttribute()
    {
        return $this->sale_price ?? $this->base_price;
    }
}
