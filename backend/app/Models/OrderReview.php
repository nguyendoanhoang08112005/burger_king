<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'delivery_rating',
        'packaging_rating',
        'overall_rating',
        'comment',
        'is_approved',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function productReviews()
    {
        return $this->hasMany(ProductReview::class);
    }
}
