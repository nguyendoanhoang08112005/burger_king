<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\HasTranslations;

class ProductTopping extends Model
{
    use HasFactory, HasTranslations;

    public array $translatable = ['name'];

    protected $fillable = [
        'name',
        'sku',
        'price',
        'image',
        'is_available',
        'category',
        'category_ids',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
        'category_ids' => 'array',
    ];

    protected static function booted()
    {
        $clear = function ($topping) {
            try {
                \Illuminate\Support\Facades\Cache::forget('public_toppings_all');
                if ($topping->category_ids) {
                    foreach ($topping->category_ids as $cid) {
                        \Illuminate\Support\Facades\Cache::forget('public_toppings_' . $cid);
                    }
                }
            } catch (\Exception $e) {}
        };
        static::saved($clear);
        static::deleted($clear);
    }
}
