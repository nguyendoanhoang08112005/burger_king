<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
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
        $categories = [
            [
                'name'        => $this->trans('Burgers Bò Mỹ', 'Burgers'),
                'slug'        => 'burgers',
                'description' => $this->trans(
                    'Dòng burger cao cấp nướng lửa hồng với thịt bò Mỹ nhập khẩu, phô mai béo ngậy và sốt đặc trưng Hamburger King.',
                    'Premium flame-grilled burgers with imported US beef, melted cheese and signature Hamburger King sauce.'
                ),
                'image'       => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
                'sort_order'  => 1,
                'is_active'   => true,
            ],
            [
                'name'        => $this->trans('Gà Giòn & Ăn Kèm', 'Chicken'),
                'slug'        => 'chicken',
                'description' => $this->trans(
                    'Gà rán giòn rụm chiên vàng óng, gà viên nuggets thơm phức và cánh gà sốt đặc biệt đậm đà.',
                    'Crispy golden fried chicken, aromatic nuggets and chicken wings with rich signature sauce.'
                ),
                'image'       => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=400',
                'sort_order'  => 2,
                'is_active'   => true,
            ],
            [
                'name'        => $this->trans('Khoai Tây & Ăn Kèm', 'Sides'),
                'slug'        => 'sides',
                'description' => $this->trans(
                    'Khoai tây chiên giòn tan, hành tây vòng chiên xù, phô mai que kéo sợi và nhiều món ăn kèm hấp dẫn.',
                    'Crispy french fries, crunchy onion rings, pull-apart mozzarella sticks and other delicious side dishes.'
                ),
                'image'       => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400',
                'sort_order'  => 3,
                'is_active'   => true,
            ],
            [
                'name'        => $this->trans('Salads Tươi', 'Salads'),
                'slug'        => 'salads',
                'description' => $this->trans(
                    'Salad tươi mát cùng rau xanh organic, sốt Caesar truyền thống và gà nướng cao cấp — lựa chọn thanh nhẹ cho thực khách.',
                    'Fresh organic green salad, traditional Caesar dressing and grilled chicken — a light choice for diners.'
                ),
                'image'       => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400',
                'sort_order'  => 4,
                'is_active'   => true,
            ],
            [
                'name'        => $this->trans('Wraps & Sandwiches', 'Wraps & Sandwiches'),
                'slug'        => 'wraps-sandwiches',
                'description' => $this->trans(
                    'Cuốn wrap tortilla mềm mại nhân gà nướng, rau tươi và sốt đặc biệt — bữa ăn tiện lợi nhưng đầy đủ dinh dưỡng.',
                    'Soft tortilla wraps filled with grilled chicken, fresh veggies and special sauce — a convenient yet nutritious meal.'
                ),
                'image'       => 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=400',
                'sort_order'  => 5,
                'is_active'   => true,
            ],
            [
                'name'        => $this->trans('Thức Uống', 'Drinks'),
                'slug'        => 'drinks',
                'description' => $this->trans(
                    'Nước giải khát mát lạnh sảng khoái, milkshake kem mịn và cà phê đậm đà — hoàn hảo đi kèm mọi bữa burger.',
                    'Refreshing iced drinks, smooth milkshakes and rich coffee — perfect to accompany any burger.'
                ),
                'image'       => 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400',
                'sort_order'  => 6,
                'is_active'   => true,
            ],
            [
                'name'        => $this->trans('Tráng Miệng', 'Desserts'),
                'slug'        => 'desserts',
                'description' => $this->trans(
                    'Tráng miệng ngọt ngào với sundae kem mát, bánh brownie socola đậm vị và apple pie giòn rụm thơm nức.',
                    'Sweet desserts with cool ice cream sundae, rich chocolate brownie and warm crispy apple pie.'
                ),
                'image'       => 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400',
                'sort_order'  => 7,
                'is_active'   => true,
            ],
            [
                'name'        => $this->trans('Combo Tiết Kiệm', 'Combo Meals'),
                'slug'        => 'combo-meals',
                'description' => $this->trans(
                    'Combo tiết kiệm lên tới 20% — burger + khoai tây + nước ngọt, bữa ăn trọn vẹn chỉ trong một lựa chọn duy nhất.',
                    'Save up to 20% with combos — burger + fries + drink, a complete meal in a single option.'
                ),
                'image'       => 'https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&q=80&w=400',
                'sort_order'  => 8,
                'is_active'   => true,
            ],
            [
                'name'        => $this->trans('Thực Đơn Trẻ Em', 'Kids Menu'),
                'slug'        => 'kids-menu',
                'description' => $this->trans(
                    'Thực đơn dành riêng cho bé yêu với phần ăn vừa vặn, hương vị nhẹ nhàng và bổ dưỡng cho các nhà vô địch nhí.',
                    'Menu designed for kids with perfect portions, mild flavors and nutrition for little champions.'
                ),
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
