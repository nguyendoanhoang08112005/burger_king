<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Translation extends Model
{
    protected $fillable = [
        'locale',
        'translatable_type',
        'translatable_id',
        'field',
        'value',
    ];

    /**
     * Get the owning translatable model.
     */
    public function translatable(): MorphTo
    {
        return $this->morphTo();
    }
}
