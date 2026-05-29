<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderAddress extends Model
{
    use HasFactory;

    protected $table = 'order_address';

    protected $fillable = [
        'order_id',
        'recipient_name',
        'phone',
        'province',
        'district',
        'ward',
        'street',
        'lat',
        'lng',
    ];

    protected $casts = [
        'lat' => 'decimal:8',
        'lng' => 'decimal:8',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
