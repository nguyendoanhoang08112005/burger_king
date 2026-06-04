<?php

namespace App\Services;

use App\Models\Order;
use App\Models\LoyaltyPoint;

class LoyaltyService
{
    public function awardPointsForOrder(Order $order): void
    {
        // 1. Only award points to registered customers
        if (!$order->user_id) {
            return;
        }

        // 2. Prevent duplicate awards
        $alreadyAwarded = LoyaltyPoint::where('order_id', $order->id)
            ->where('user_id', $order->user_id)
            ->where('type', 'earn')
            ->exists();

        if ($alreadyAwarded) {
            return;
        }

        // 3. Calculate points: 1 point for every 10,000 VND spent on subtotal
        // We award points on the subtotal (minus discount)
        $netSpent = max(0, $order->subtotal - $order->discount);
        $points = (int) ($netSpent / 10000);

        if ($points > 0) {
            LoyaltyPoint::create([
                'user_id' => $order->user_id,
                'points' => $points,
                'type' => 'earn',
                'description' => __('api.loyalty.earned_order', ['code' => $order->order_code]),
                'order_id' => $order->id
            ]);
        }
    }

    public function refundPointsForCancelledOrder(Order $order): void
    {
        if (!$order->user_id) {
            return;
        }

        // 1. If user spent points on this order, we refund them back
        $redeemedPoints = LoyaltyPoint::where('order_id', $order->id)
            ->where('user_id', $order->user_id)
            ->where('type', 'redeem')
            ->first();

        if ($redeemedPoints) {
            LoyaltyPoint::create([
                'user_id' => $order->user_id,
                'points' => $redeemedPoints->points,
                'type' => 'earn', // treat refund as points earned/returned
                'description' => __('api.loyalty.refund_cancelled_order', ['code' => $order->order_code]),
                'order_id' => $order->id
            ]);
        }

        // 2. If user earned points from this order, we deduct/reverse them
        $earnedPoints = LoyaltyPoint::where('order_id', $order->id)
            ->where('user_id', $order->user_id)
            ->where('type', 'earn')
            ->first();

        if ($earnedPoints) {
            LoyaltyPoint::create([
                'user_id' => $order->user_id,
                'points' => $earnedPoints->points,
                'type' => 'redeem', // deduct points by redeeming them back
                'description' => __('api.loyalty.revoke_cancelled_order', ['code' => $order->order_code]),
                'order_id' => $order->id
            ]);
        }
    }
}
