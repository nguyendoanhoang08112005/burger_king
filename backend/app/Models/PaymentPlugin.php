<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentPlugin extends Model
{
    protected $fillable = [
        'key',
        'name',
        'description',
        'icon',
        'is_active',
        'config',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'config' => 'array',
    ];
}
