<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            [
                'title'      => 'BURGER LỬA HỒNG — ĐẬM ĐÀ VỊ KHÓI',
                'subtitle'   => 'Trải nghiệm dòng burger cao cấp nướng bằng tay ngập tràn nhân thịt bò Mỹ tươi. Đặt ngay để thưởng thức hương vị huyền thoại.',
                'image'      => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=1200',
                'link'       => '/menu',
                'position'   => 'hero',
                'sort_order' => 1,
                'is_active'  => true,
                'starts_at'  => now(),
                'expires_at' => now()->addYear(),
            ],
            [
                'title'      => 'GIÒN RỤM THƠM NGON — THỬ NGAY COMBO KHỦNG',
                'subtitle'   => 'Tiết kiệm lên tới 20% khi đặt mua Combo Feast siêu hấp dẫn. Burger + Fries + Drinks — trọn bộ chỉ từ 99.000đ.',
                'image'      => 'https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&q=80&w=1200',
                'link'       => '/combos',
                'position'   => 'hero',
                'sort_order' => 2,
                'is_active'  => true,
                'starts_at'  => now(),
                'expires_at' => now()->addYear(),
            ],
            [
                'title'      => 'NHẬP MÃ KINGWELCOME — GIẢM 20% ĐƠN ĐẦU TIÊN',
                'subtitle'   => 'Đặt hàng online ngay hôm nay và nhập mã KINGWELCOME để nhận ưu đãi giảm 20% cho đơn hàng đầu tiên của bạn. Áp dụng đơn từ 100.000đ.',
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
                Banner::updateOrCreate(
                    ['title' => $banner['title']],
                    $banner
                );
            }
        });
    }
}
