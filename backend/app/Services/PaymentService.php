<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    public function createPaymentUrl(Order $order, string $gateway): string
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        
        // Under local dev, we redirect to a unified visual Mock Payment gateway on the React app
        // This is robust, immediately interactive, and doesn't require actual sandbox keys to test.
        if (in_array($gateway, ['vnpay', 'momo'])) {
            return $frontendUrl . "/checkout/payment-mock?" . http_build_query([
                'order_code' => $order->order_code,
                'amount' => (float) $order->total,
                'gateway' => $gateway,
            ]);
        }

        // COD doesn't need external redirection
        return $frontendUrl . "/orders/tracking/" . $order->order_code;
    }

    public function processCallback(string $orderCode, string $gateway, string $status): bool
    {
        $order = Order::where('order_code', $orderCode)->first();
        if (!$order) {
            Log::error("Payment callback failed: Order {$orderCode} not found.");
            return false;
        }

        if ($status === 'success') {
            $order->update([
                'payment_status' => 'paid',
                'status' => 'confirmed' // advance status automatically upon paid
            ]);

            // Award loyalty points
            $loyaltyService = new LoyaltyService();
            $loyaltyService->awardPointsForOrder($order);

            Log::info("Payment success for order: {$orderCode} via {$gateway}");
            return true;
        } else {
            $order->update([
                'payment_status' => 'unpaid',
                'status' => 'cancelled'
            ]);
            Log::info("Payment failed/cancelled for order: {$orderCode} via {$gateway}");
            return false;
        }
    }
}
