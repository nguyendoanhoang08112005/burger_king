<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            [
                'code'         => 'KINGWELCOME',
                'type'         => 'percent',
                'value'        => 20.00,
                'min_order'    => 100000.00,
                'max_discount' => 50000.00,
                'usage_limit'  => 1000,
                'used_count'   => 0,
                'starts_at'    => now(),
                'expires_at'   => now()->addMonths(6),
                'is_active'    => true,
            ],
            [
                'code'         => 'FREEBURGER',
                'type'         => 'fixed',
                'value'        => 50000.00,
                'min_order'    => 200000.00,
                'max_discount' => null,
                'usage_limit'  => 100,
                'used_count'   => 0,
                'starts_at'    => now(),
                'expires_at'   => now()->addMonths(3),
                'is_active'    => true,
            ],
            [
                'code'         => 'FREESHIP',
                'type'         => 'free_ship',
                'value'        => 15000.00,
                'min_order'    => 100000.00,
                'max_discount' => null,
                'usage_limit'  => 2000,
                'used_count'   => 0,
                'starts_at'    => now(),
                'expires_at'   => now()->addMonths(12),
                'is_active'    => true,
            ],
            [
                'code'         => 'BURGER30',
                'type'         => 'percent',
                'value'        => 30.00,
                'min_order'    => 250000.00,
                'max_discount' => 80000.00,
                'usage_limit'  => 500,
                'used_count'   => 0,
                'starts_at'    => now(),
                'expires_at'   => now()->addMonths(2),
                'is_active'    => true,
            ],
            [
                'code'         => 'COMBOKING',
                'type'         => 'fixed',
                'value'        => 30000.00,
                'min_order'    => 150000.00,
                'max_discount' => null,
                'usage_limit'  => 300,
                'used_count'   => 0,
                'starts_at'    => now(),
                'expires_at'   => now()->addMonths(4),
                'is_active'    => true,
            ],
        ];

        DB::transaction(function () use ($coupons) {
            foreach ($coupons as $coupon) {
                Coupon::updateOrCreate(
                    ['code' => $coupon['code']],
                    $coupon
                );
            }
        });
    }
}
