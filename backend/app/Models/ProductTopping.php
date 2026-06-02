<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductTopping extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
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
}
