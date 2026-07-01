<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order',
        'max_discount',
        'usage_limit',
        'used_count',
        'starts_at',
        'expires_at',
        'is_active',
        'show_at_checkout',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'used_count' => 'integer',
        'usage_limit' => 'integer',
        'is_active' => 'boolean',
        'show_at_checkout' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function getValidationError($subtotal): ?string
    {
        if (!$this->is_active) {
            return __('api.messages.coupon_invalid');
        }

        $now = Carbon::now();
        if ($this->starts_at && $now->lt($this->starts_at)) {
            return __('api.messages.coupon_not_started');
        }

        if ($this->expires_at && $now->gt($this->expires_at)) {
            return __('api.messages.coupon_expired');
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return __('api.messages.coupon_limit_reached');
        }

        if ($subtotal < $this->min_order) {
            return __('api.messages.coupon_min_order', ['min' => number_format($this->min_order) . 'đ']);
        }

        return null;
    }

    public function isValidFor($subtotal): bool
    {
        return $this->getValidationError($subtotal) === null;
    }

    public function calculateDiscount($subtotal, $shippingFee = 0.0): float
    {
        if (!$this->isValidFor($subtotal)) {
            return 0.0;
        }

        if ($this->type === 'free_ship') {
            return (float) $shippingFee;
        }

        if ($this->type === 'fixed') {
            return (float) min($this->value, $subtotal);
        }

        if ($this->type === 'percent') {
            $discount = ($subtotal * ($this->value / 100));
            if ($this->max_discount !== null) {
                $discount = min($discount, (float) $this->max_discount);
            }
            return (float) $discount;
        }

        return 0.0;
    }

    protected static function booted()
    {
        static::saved(function ($coupon) {
            try {
                \Illuminate\Support\Facades\DB::table('chat_caches')->delete();
            } catch (\Exception $e) {}
        });
        static::deleted(function ($coupon) {
            try {
                \Illuminate\Support\Facades\DB::table('chat_caches')->delete();
            } catch (\Exception $e) {}
        });
    }
}
