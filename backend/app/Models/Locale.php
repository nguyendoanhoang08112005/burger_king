<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Locale extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
        'name',
        'native_name',
        'flag',
        'is_active',
        'is_default',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active'  => 'boolean',
        'is_default' => 'boolean',
        'sort_order' => 'integer',
    ];
}
