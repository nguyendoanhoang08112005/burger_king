<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComboItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'combo_id',
        'product_id',
        'quantity',
        'size',
    ];

    public function combo()
    {
        return $this->belongsTo(ComboSet::class, 'combo_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
