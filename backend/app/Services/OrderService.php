<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderAddress;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\ProductTopping;
use App\Models\Coupon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Exception;

class OrderService
{
    public function calculateShippingFee($subtotal, ?Coupon $coupon, $deliveryType): float
    {
        if ($deliveryType === 'pickup') {
            return 0.00;
        }

        // Free shipping for orders above 300,000 VND
        if ($subtotal >= 300000) {
            return 0.00;
        }

        // Free shipping coupon
        if ($coupon && $coupon->type === 'free_ship' && $coupon->isValidFor($subtotal)) {
            return 0.00;
        }

        return 15000.00; // Flat shipping rate: 15,000 VND
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
                    throw new Exception("Sản phẩm {$product->name} hiện đang hết hàng.");
                }

                $price = $product->active_price;

                // Handle size extra price
                if (!empty($item['size'])) {
                    $sizeModel = ProductSize::where('product_id', $product->id)
                        ->where('size', $item['size'])
                        ->first();
                    if ($sizeModel) {
                        $price += $sizeModel->extra_price;
                    }
                }

                // Handle toppings extra prices
                $toppingsList = [];
                $toppingPriceSum = 0.00;
                if (!empty($item['toppings'])) {
                    foreach ($item['toppings'] as $toppingId) {
                        $topping = ProductTopping::findOrFail($toppingId);
                        if (!$topping->is_available) {
                            throw new Exception("Topping {$topping->name} hiện đang hết hàng.");
                        }
                        $toppingsList[] = [
                            'id' => $topping->id,
                            'name' => $topping->name,
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
                    'size' => $item['size'] ?? 'M',
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
            $shippingFee = $this->calculateShippingFee($subtotal, $couponModel, $data['delivery_type']);

            // 4. Calculate total
            $total = max(0.00, $subtotal - $discount + $shippingFee);

            // 5. Check if user is paying with loyalty points
            if ($user && !empty($data['use_loyalty_points']) && $data['payment_method'] === 'loyalty') {
                $pointsNeeded = (int) ($total / 100); // 1 point = 100 VND
                $userBalance = $user->loyalty_balance;
                if ($userBalance < $pointsNeeded) {
                    throw new Exception("Điểm tích lũy không đủ để thực hiện thanh toán này (Cần {$pointsNeeded} điểm, có {$userBalance} điểm).");
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
                    'size' => $item['size'],
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
            if ($user && !empty($data['use_loyalty_points']) && $data['payment_method'] === 'loyalty') {
                $pointsNeeded = (int) (($subtotal - $discount + $shippingFee) / 100);
                if ($pointsNeeded > 0) {
                    $user->loyaltyPoints()->create([
                        'points' => $pointsNeeded,
                        'type' => 'redeem',
                        'description' => "Thanh toán đơn hàng {$order->order_code}",
                        'order_id' => $order->id
                    ]);
                }
            }

            return $order;
        });
    }
}
