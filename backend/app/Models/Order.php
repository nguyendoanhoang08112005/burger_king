<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'order_code',
        'status',
        'payment_method',
        'payment_status',
        'subtotal',
        'discount',
        'shipping_fee',
        'total',
        'note',
        'delivery_type',
        'scheduled_at',
        'completed_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'total' => 'decimal:2',
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::updating(function ($order) {
            if ($order->isDirty('status') && $order->status === 'completed') {
                $order->completed_at = now();
            }
        });
    }

    /* Relationships */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function address()
    {
        return $this->hasOne(OrderAddress::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function loyaltyPoints()
    {
        return $this->hasMany(LoyaltyPoint::class);
    }

    public function orderReview()
    {
        return $this->hasOne(OrderReview::class);
    }

    public function productReviews()
    {
        return $this->hasMany(ProductReview::class);
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }

    public function activeComplaint()
    {
        return $this->hasOne(Complaint::class)->whereIn('status', ['pending', 'reviewing']);
    }
}
