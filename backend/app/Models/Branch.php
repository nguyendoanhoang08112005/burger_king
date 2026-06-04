<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\HasTranslations;

class Branch extends Model
{
    use HasFactory, HasTranslations;

    public array $translatable = ['name', 'address'];

    protected $fillable = [
        'name',
        'address',
        'phone',
        'lat',
        'lng',
        'open_time',
        'close_time',
        'is_active',
    ];

    protected $casts = [
        'lat' => 'decimal:8',
        'lng' => 'decimal:8',
        'is_active' => 'boolean',
    ];
}
