<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_sku',
        'size',
        'size_sku',
        'price',
        'quantity',
        'toppings',
        'subtotal',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
        'subtotal' => 'decimal:2',
        'toppings' => 'array', // automatically cast selected toppings array to JSON
    ];

    public function getToppingsAttribute($value)
    {
        $toppings = is_string($value) ? json_decode($value, true) : $value;
        if (!is_array($toppings)) {
            return [];
        }

        try {
            static $toppingsCache = null;
            if ($toppingsCache === null) {
                $toppingsCache = \App\Models\ProductTopping::all()->keyBy('id');
            }

            foreach ($toppings as &$topping) {
                if (isset($topping['id']) && isset($toppingsCache[$topping['id']])) {
                    $toppingModel = $toppingsCache[$topping['id']];
                    // Retrieve translation for current locale
                    $topping['name'] = $toppingModel->name;
                }
            }
        } catch (\Exception $e) {
            // Keep original if it fails
        }

        return $toppings;
    }

    public function order()

    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
