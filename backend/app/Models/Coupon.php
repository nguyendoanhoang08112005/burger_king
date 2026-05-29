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
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'used_count' => 'integer',
        'usage_limit' => 'integer',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function isValidFor($subtotal): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = Carbon::now();
        if ($this->starts_at && $now->lt($this->starts_at)) {
            return false;
        }

        if ($this->expires_at && $now->gt($this->expires_at)) {
            return false;
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return false;
        }

        if ($subtotal < $this->min_order) {
            return false;
        }

        return true;
    }

    public function calculateDiscount($subtotal): float
    {
        if (!$this->isValidFor($subtotal)) {
            return 0.0;
        }

        if ($this->type === 'free_ship') {
            return 0.0; // Handled separately in shipping fee
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
}
