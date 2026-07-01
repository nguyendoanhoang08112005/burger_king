<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\HasTranslations;

class ComboSet extends Model
{
    use HasFactory, HasTranslations;

    public array $translatable = ['name', 'description'];

    protected $fillable = [
        'name',
        'slug',
        'sku',
        'description',
        'image',
        'price',
        'sale_price',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function items()
    {
        return $this->hasMany(ComboItem::class, 'combo_id');
    }

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
