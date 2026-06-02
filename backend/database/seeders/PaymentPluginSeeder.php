<?php

namespace Database\Seeders;

use App\Models\PaymentPlugin;
use Illuminate\Database\Seeder;

class PaymentPluginSeeder extends Seeder
{
    public function run(): void
    {
        $plugins = [
            [
                'key' => 'vnpay',
                'name' => 'VNPay',
                'description' => 'Thanh toán qua cổng VNPay (ATM, Visa, MasterCard)',
                'icon' => 'vnpay',
                'config' => [
                    'vnp_TmnCode' => '',
                    'vnp_HashSecret' => '',
                    'vnp_Url' => 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
                    'vnp_ReturnUrl' => '',
                ],
                'sort_order' => 1,
            ],
            [
                'key' => 'momo',
                'name' => 'Ví MoMo',
                'description' => 'Thanh toán qua ví điện tử MoMo',
                'icon' => 'momo',
                'config' => [
                    'partner_code' => '',
                    'access_key' => '',
                    'secret_key' => '',
                    'endpoint' => 'https://test-payment.momo.vn/v2/gateway/api/create',
                ],
                'sort_order' => 2,
            ],
            [
                'key' => 'zalopay',
                'name' => 'ZaloPay',
                'description' => 'Thanh toán qua ví ZaloPay',
                'icon' => 'zalopay',
                'config' => [
                    'app_id' => '',
                    'key1' => '',
                    'key2' => '',
                    'endpoint' => 'https://sb-openapi.zalopay.vn/v2/create',
                ],
                'sort_order' => 3,
            ],
            [
                'key' => 'sepay',
                'name' => 'SePay',
                'description' => 'Thanh toán chuyển khoản thông minh qua SePay',
                'icon' => 'sepay',
                'config' => [
                    'api_key' => '',
                    'account_number' => '',
                    'bank_code' => '',
                    'webhook_secret' => '',
                ],
                'sort_order' => 4,
            ],
            [
                'key' => 'stripe',
                'name' => 'Stripe',
                'description' => 'Thanh toán quốc tế Visa/Mastercard qua Stripe',
                'icon' => 'stripe',
                'config' => [
                    'publishable_key' => '',
                    'secret_key' => '',
                    'webhook_secret' => '',
                ],
                'sort_order' => 5,
            ],
            [
                'key' => 'paypal',
                'name' => 'PayPal',
                'description' => 'Thanh toán quốc tế qua PayPal',
                'icon' => 'paypal',
                'config' => [
                    'client_id' => '',
                    'client_secret' => '',
                    'mode' => 'sandbox',
                ],
                'sort_order' => 6,
            ],
        ];

        foreach ($plugins as $plugin) {
            PaymentPlugin::updateOrCreate(
                ['key' => $plugin['key']],
                $plugin + ['is_active' => false]
            );
        }
    }
}
