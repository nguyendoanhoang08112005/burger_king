<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PaymentPlugin;
use Exception;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    public function createPaymentUrl(Order $order, string $gateway): string
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        if (in_array($gateway, ['cod', 'loyalty', 'loyalty_points'], true)) {
            return $frontendUrl . "/orders/tracking/" . $order->order_code;
        }

        $plugin = PaymentPlugin::where('key', $gateway)->where('is_active', true)->first();
        if (!$plugin) {
            throw new Exception(__('api.errors.payment_inactive'));
        }

        $config = $plugin->config ?? [];

        if ($gateway === 'vnpay') {
            $terminalCode = $config['vnp_TmnCode'] ?? env('VNPAY_TMN_CODE');
            $hashSecret = $config['vnp_HashSecret'] ?? env('VNPAY_HASH_SECRET');
            $paymentUrl = $config['vnp_Url'] ?? env('VNPAY_PAYMENT_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
            $returnUrl = !empty($config['vnp_ReturnUrl']) ? $config['vnp_ReturnUrl'] : env('VNPAY_RETURN_URL', $frontendUrl . '/orders/tracking/' . $order->order_code);

            if (!$terminalCode || !$hashSecret) {
                throw new Exception(__('api.errors.vnpay_not_configured'));
            }

            $params = [
                'vnp_Version' => '2.1.0',
                'vnp_TmnCode' => $terminalCode,
                'vnp_Amount' => (int) round($order->total * 100),
                'vnp_Command' => 'pay',
                'vnp_CreateDate' => now()->format('YmdHis'),
                'vnp_CurrCode' => 'VND',
                'vnp_IpAddr' => request()->ip(),
                'vnp_Locale' => app()->getLocale() === 'vi' ? 'vn' : 'en',
                'vnp_OrderInfo' => 'Payment for order ' . $order->order_code,
                'vnp_OrderType' => 'billpayment',
                'vnp_ReturnUrl' => $returnUrl,
                'vnp_TxnRef' => $order->order_code,
            ];
            ksort($params);
            $hashData = urldecode(http_build_query($params));
            $params['vnp_SecureHash'] = hash_hmac('sha512', $hashData, $hashSecret);

            return $paymentUrl . '?' . http_build_query($params);
        }

        if ($gateway === 'momo') {
            throw new Exception(__('api.errors.momo_not_implemented'));
        }

        throw new Exception(__('api.errors.payment_handler_missing', ['name' => $plugin->name]));
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
                'status' => 'confirmed'
            ]);

            $loyaltyService = new LoyaltyService();
            $loyaltyService->awardPointsForOrder($order);

            Log::info("Payment success for order: {$orderCode} via {$gateway}");
            return true;
        }

        $order->update([
            'payment_status' => 'unpaid',
            'status' => 'cancelled'
        ]);
        Log::info("Payment failed/cancelled for order: {$orderCode} via {$gateway}");
        return false;
    }
}
