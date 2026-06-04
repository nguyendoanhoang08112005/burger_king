<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderAddress;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\ProductTopping;
use App\Models\Coupon;
use App\Models\Setting;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Exception;

class OrderService
{
    public function calculateShippingFee($subtotal, ?Coupon $coupon, $deliveryType, ?array $address = null): float
    {
        if ($deliveryType === 'pickup') {
            return 0.00;
        }

        // Free shipping coupon
        if ($coupon && $coupon->type === 'free_ship' && $coupon->isValidFor($subtotal)) {
            return 0.00;
        }

        $result = app(ShippingService::class)->calculate(
            (float) $subtotal,
            isset($address['lat']) ? (float) $address['lat'] : null,
            isset($address['lng']) ? (float) $address['lng'] : null
        );

        if (!empty($result['out_of_range'])) {
            throw new Exception($result['message'] ?? __('api.errors.delivery_out_of_range'));
        }

        return (float) ($result['fee'] ?? 0);
    }

    public function createOrder($user, array $data): Order
    {
        return DB::transaction(function () use ($user, $data) {
            $subtotal = 0.00;
            $itemsData = [];

            // 1. Calculate items subtotal and validate items
            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                if (!$product->is_available) {
                    throw new Exception(__('api.errors.product_unavailable', ['name' => $product->name]));
                }

                $price = $product->sale_price ?? $product->base_price;

                // Handle size extra price
                $sizeModel = null;
                if (!empty($item['size'])) {
                    $sizeModel = ProductSize::where('product_id', $product->id)
                        ->where('size', $item['size'])
                        ->first();
                    if ($sizeModel) {
                        $price += $sizeModel->extra_price;
                    }
                }
                $selectedSize = $item['size'] ?? 'M';
                $sizeSku = $sizeModel?->sku ?? ($product->sku ? "{$product->sku}-{$selectedSize}" : null);

                // Handle toppings extra prices
                $toppingsList = [];
                $toppingPriceSum = 0.00;
                if (!empty($item['toppings'])) {
                    foreach ($item['toppings'] as $toppingId) {
                        $topping = ProductTopping::findOrFail($toppingId);
                        if (!$topping->is_available) {
                            throw new Exception(__('api.errors.topping_unavailable', ['name' => $topping->name]));
                        }
                        $allowedCategoryIds = $topping->category_ids ?? [];
                        if (!empty($allowedCategoryIds) && !in_array((int) $product->category_id, array_map('intval', $allowedCategoryIds), true)) {
                            throw new Exception(__('api.errors.topping_not_applicable', ['topping' => $topping->name, 'product' => $product->name]));
                        }
                        $toppingsList[] = [
                            'id' => $topping->id,
                            'name' => $topping->name,
                            'sku' => $topping->sku,
                            'price' => (float) $topping->price
                        ];
                        $toppingPriceSum += $topping->price;
                    }
                }

                $itemUnitPrice = $price + $toppingPriceSum;
                $itemSubtotal = $itemUnitPrice * $item['quantity'];
                $subtotal += $itemSubtotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'size' => $selectedSize,
                    'size_sku' => $sizeSku,
                    'price' => $itemUnitPrice,
                    'quantity' => $item['quantity'],
                    'toppings' => $toppingsList,
                    'subtotal' => $itemSubtotal
                ];
            }

            // 2. Validate Coupon and calculate discount
            $discount = 0.00;
            $couponModel = null;
            if (!empty($data['coupon_code'])) {
                $couponModel = Coupon::where('code', $data['coupon_code'])->first();
                if ($couponModel && $couponModel->isValidFor($subtotal)) {
                    $discount = $couponModel->calculateDiscount($subtotal);
                    $couponModel->increment('used_count');
                }
            }

            // 3. Calculate shipping fee
            $shippingFee = $this->calculateShippingFee($subtotal, $couponModel, $data['delivery_type'], $data['address'] ?? null);

            // 4. Calculate total
            $total = max(0.00, $subtotal - $discount + $shippingFee);

            // 5. Check if user is paying with loyalty points
            $isLoyaltyPayment = in_array($data['payment_method'], ['loyalty', 'loyalty_points'], true);
            $loyaltyPointsNeeded = 0;
            if ($user && ($isLoyaltyPayment || !empty($data['use_loyalty_points']))) {
                $vndPerPoint = max(1, (float) Setting::get('loyalty.vnd_per_point', 100));
                $pointsNeeded = (int) ceil($total / $vndPerPoint);
                $loyaltyPointsNeeded = $pointsNeeded;
                $userBalance = $user->loyalty_balance;
                if ($userBalance < $pointsNeeded) {
                    throw new Exception(__('api.errors.loyalty_insufficient', ['needed' => $pointsNeeded, 'current' => $userBalance]));
                }
                // Loyalty Points payment logic
                $discount = $total;
                $total = 0.00;
            }

            // 6. Create Master Order
            $order = Order::create([
                'user_id' => $user ? $user->id : null,
                'order_code' => 'HBK-' . strtoupper(Str::random(10)),
                'status' => 'pending',
                'payment_method' => $data['payment_method'],
                'payment_status' => ($total == 0.00) ? 'paid' : 'unpaid',
                'subtotal' => $subtotal,
                'discount' => $discount,
                'shipping_fee' => $shippingFee,
                'total' => $total,
                'note' => $data['note'] ?? null,
                'delivery_type' => $data['delivery_type'],
                'scheduled_at' => !empty($data['scheduled_at']) ? $data['scheduled_at'] : null,
            ]);

            // 7. Save Order Items
            foreach ($itemsData as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'product_sku' => $item['product_sku'],
                    'size' => $item['size'],
                    'size_sku' => $item['size_sku'],
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'toppings' => $item['toppings'],
                    'subtotal' => $item['subtotal']
                ]);
            }

            // 8. Save Order Address (if delivery)
            if ($data['delivery_type'] === 'delivery' && !empty($data['address'])) {
                $addr = $data['address'];
                OrderAddress::create([
                    'order_id' => $order->id,
                    'recipient_name' => $addr['recipient_name'],
                    'phone' => $addr['phone'],
                    'province' => $addr['province'],
                    'district' => $addr['district'],
                    'ward' => $addr['ward'],
                    'street' => $addr['street'],
                    'lat' => $addr['lat'] ?? null,
                    'lng' => $addr['lng'] ?? null,
                ]);
            }

            // 9. Debit Loyalty Points if user paid via points
            if ($user && ($isLoyaltyPayment || !empty($data['use_loyalty_points']))) {
                if ($loyaltyPointsNeeded > 0) {
                    $user->loyaltyPoints()->create([
                        'points' => $loyaltyPointsNeeded,
                        'type' => 'redeem',
                        'description' => __('api.loyalty.redeem_order', ['code' => $order->order_code]),
                        'order_id' => $order->id
                    ]);
                }
            }

            return $order;
        });
    }
}
