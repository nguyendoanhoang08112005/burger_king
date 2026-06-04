<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BannerSeeder extends Seeder
{
    private function trans($vi, $en = null)
    {
        return [
            'vi' => $vi,
            'en' => $en ?? $vi,
        ];
    }

    public function run(): void
    {
        $banners = [
            [
                'title'      => $this->trans('BURGER LỬA HỒNG — ĐẬM ĐÀ VỊ KHÓI', 'FLAME-GRILLED BURGER — BOLD SMOKY FLAVOR'),
                'subtitle'   => $this->trans(
                    'Trải nghiệm dòng burger cao cấp nướng bằng tay ngập tràn nhân thịt bò Mỹ tươi. Đặt ngay để thưởng thức hương vị huyền thoại.',
                    'Experience premium hand-crafted burgers packed with fresh US beef. Order now to taste the legend.'
                ),
                'image'      => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=1200',
                'link'       => '/menu',
                'position'   => 'hero',
                'sort_order' => 1,
                'is_active'  => true,
                'starts_at'  => now(),
                'expires_at' => now()->addYear(),
            ],
            [
                'title'      => $this->trans('GIÒN RỤM THƠM NGON — THỬ NGAY COMBO KHỦNG', 'CRISPY & TASTY — TRY COMBO FEAST NOW'),
                'subtitle'   => $this->trans(
                    'Tiết kiệm lên tới 20% khi đặt mua Combo Feast siêu hấp dẫn. Burger + Fries + Drinks — trọn bộ chỉ từ 99.000đ.',
                    'Save up to 20% on the delicious Combo Feast. Burger + Fries + Drink — starting from only 99,000 VND.'
                ),
                'image'      => 'https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&q=80&w=1200',
                'link'       => '/combos',
                'position'   => 'hero',
                'sort_order' => 2,
                'is_active'  => true,
                'starts_at'  => now(),
                'expires_at' => now()->addYear(),
            ],
            [
                'title'      => $this->trans('NHẬP MÃ KINGWELCOME — GIẢM 20% ĐƠN ĐẦU TIÊN', 'USE CODE KINGWELCOME — 20% OFF FIRST ORDER'),
                'subtitle'   => $this->trans(
                    'Đặt hàng online ngay hôm nay và nhập mã KINGWELCOME để nhận ưu đãi giảm 20% cho đơn hàng đầu tiên của bạn. Áp dụng đơn từ 100.000đ.',
                    'Order online today and use code KINGWELCOME to get 20% off your first order. Minimum order 100,000 VND.'
                ),
                'image'      => 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=1200',
                'link'       => '/menu',
                'position'   => 'hero',
                'sort_order' => 3,
                'is_active'  => true,
                'starts_at'  => now(),
                'expires_at' => now()->addMonths(6),
            ],
        ];

        DB::transaction(function () use ($banners) {
            foreach ($banners as $banner) {
                // Find existing using JSON path comparison or key check
                $existing = Banner::get()->first(function ($b) use ($banner) {
                    return $b->getTranslation('title', 'vi') === $banner['title']['vi'];
                });

                if ($existing) {
                    $existing->update($banner);
                } else {
                    Banner::create($banner);
                }
            }
        });
    }
}
