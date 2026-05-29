<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name'        => 'Burgers',
                'slug'        => 'burgers',
                'description' => 'Dòng burger cao cấp nướng lửa hồng với thịt bò Mỹ nhập khẩu, phô mai béo ngậy và sốt đặc trưng Hamburger King.',
                'image'       => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
                'sort_order'  => 1,
                'is_active'   => true,
            ],
            [
                'name'        => 'Chicken',
                'slug'        => 'chicken',
                'description' => 'Gà rán giòn rụm chiên vàng óng, gà viên nuggets thơm phức và cánh gà sốt đặc biệt đậm đà.',
                'image'       => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=400',
                'sort_order'  => 2,
                'is_active'   => true,
            ],
            [
                'name'        => 'Sides',
                'slug'        => 'sides',
                'description' => 'Khoai tây chiên giòn tan, hành tây vòng chiên xù, phô mai que kéo sợi và nhiều món ăn kèm hấp dẫn.',
                'image'       => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400',
                'sort_order'  => 3,
                'is_active'   => true,
            ],
            [
                'name'        => 'Salads',
                'slug'        => 'salads',
                'description' => 'Salad tươi mát cùng rau xanh organic, sốt Caesar truyền thống và gà nướng cao cấp — lựa chọn thanh nhẹ cho thực khách.',
                'image'       => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400',
                'sort_order'  => 4,
                'is_active'   => true,
            ],
            [
                'name'        => 'Wraps & Sandwiches',
                'slug'        => 'wraps-sandwiches',
                'description' => 'Cuốn wrap tortilla mềm mại nhân gà nướng, rau tươi và sốt đặc biệt — bữa ăn tiện lợi nhưng đầy đủ dinh dưỡng.',
                'image'       => 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=400',
                'sort_order'  => 5,
                'is_active'   => true,
            ],
            [
                'name'        => 'Drinks',
                'slug'        => 'drinks',
                'description' => 'Nước giải khát mát lạnh sảng khoái, milkshake kem mịn và cà phê đậm đà — hoàn hảo đi kèm mọi bữa burger.',
                'image'       => 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400',
                'sort_order'  => 6,
                'is_active'   => true,
            ],
            [
                'name'        => 'Desserts',
                'slug'        => 'desserts',
                'description' => 'Tráng miệng ngọt ngào với sundae kem mát, bánh brownie socola đậm vị và apple pie giòn rụm thơm nức.',
                'image'       => 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400',
                'sort_order'  => 7,
                'is_active'   => true,
            ],
            [
                'name'        => 'Combo Meals',
                'slug'        => 'combo-meals',
                'description' => 'Combo tiết kiệm lên tới 20% — burger + khoai tây + nước ngọt, bữa ăn trọn vẹn chỉ trong một lựa chọn duy nhất.',
                'image'       => 'https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&q=80&w=400',
                'sort_order'  => 8,
                'is_active'   => true,
            ],
            [
                'name'        => 'Kids Menu',
                'slug'        => 'kids-menu',
                'description' => 'Thực đơn dành riêng cho bé yêu với phần ăn vừa vặn, hương vị nhẹ nhàng và bổ dưỡng cho các nhà vô địch nhí.',
                'image'       => 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=400',
                'sort_order'  => 9,
                'is_active'   => true,
            ],
        ];

        DB::transaction(function () use ($categories) {
            foreach ($categories as $cat) {
                Category::updateOrCreate(
                    ['slug' => $cat['slug']],
                    $cat
                );
            }
        });
    }
}
