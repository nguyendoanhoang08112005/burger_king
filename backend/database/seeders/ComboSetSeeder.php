<?php

namespace Database\Seeders;

use App\Models\ComboSet;
use App\Models\ComboItem;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ComboSetSeeder extends Seeder
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
        DB::transaction(function () {
            $products = Product::pluck('id', 'slug');

            // ─── Whopper Combo ─────────────────────────
            $whopper = ComboSet::updateOrCreate(
                ['slug' => 'whopper-combo-set'],
                [
                    'sku'         => 'CMB-WHOPPER-COMBO-SET',
                    'name'        => $this->trans('Combo Whopper', 'Whopper Combo'),
                    'description' => $this->trans(
                        'Combo tiết kiệm nhất cho fan Whopper! 1 Whopper huyền thoại nướng lửa hồng + 1 French Fries cỡ M giòn vàng + 1 Coca-Cola cỡ M mát lạnh. Tiết kiệm tới 20% so với mua lẻ.',
                        'Best value combo for Whopper fans! 1 legendary flame-grilled Whopper + 1 golden French Fries (M) + 1 refreshing Coca-Cola (M). Save up to 20% compared to individual items.'
                    ),
                    'image'       => 'https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&q=80&w=400',
                    'price'       => 119000,
                    'is_active'   => true,
                ]
            );

            $whopper->items()->delete();
            ComboItem::create(['combo_id' => $whopper->id, 'product_id' => $products['whopper'],      'quantity' => 1, 'size' => 'S']);
            ComboItem::create(['combo_id' => $whopper->id, 'product_id' => $products['french-fries'],  'quantity' => 1, 'size' => 'M']);
            ComboItem::create(['combo_id' => $whopper->id, 'product_id' => $products['coca-cola'],     'quantity' => 1, 'size' => 'M']);

            // ─── Chicken Combo ─────────────────────────
            $chicken = ComboSet::updateOrCreate(
                ['slug' => 'chicken-combo-set'],
                [
                    'sku'         => 'CMB-CHICKEN-COMBO-SET',
                    'name'        => $this->trans('Combo Gà Giòn', 'Chicken Combo'),
                    'description' => $this->trans(
                        'Combo gà giòn ngon lành! 1 Crispy Chicken chiên giòn rụm + 1 French Fries cỡ M + 1 Sprite cỡ M thanh mát. Tiết kiệm hơn mua lẻ 20% — bữa ăn chất lượng giá hời.',
                        'Tasty crispy chicken combo! 1 golden Crispy Chicken + 1 French Fries (M) + 1 refreshing Sprite (M). Save 20% off individual prices — a high-quality meal at a great price.'
                    ),
                    'image'       => 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&q=80&w=400',
                    'price'       => 99000,
                    'is_active'   => true,
                ]
            );

            $chicken->items()->delete();
            ComboItem::create(['combo_id' => $chicken->id, 'product_id' => $products['crispy-chicken'], 'quantity' => 1, 'size' => 'S']);
            ComboItem::create(['combo_id' => $chicken->id, 'product_id' => $products['french-fries'],   'quantity' => 1, 'size' => 'M']);
            ComboItem::create(['combo_id' => $chicken->id, 'product_id' => $products['sprite'],          'quantity' => 1, 'size' => 'M']);

            // ─── Family Combo ──────────────────────────
            $family = ComboSet::updateOrCreate(
                ['slug' => 'family-combo-set'],
                [
                    'sku'         => 'CMB-FAMILY-COMBO-SET',
                    'name'        => $this->trans('Combo Gia Đình', 'Family Combo'),
                    'description' => $this->trans(
                        'Bữa tiệc gia đình trọn vẹn cho 4 người! 2 Whopper + 2 Crispy Chicken + 4 French Fries cỡ L + 4 Drinks cỡ L. Siêu tiết kiệm giảm tới 20% — đầm ấm bên bàn ăn burger.',
                        'A complete family feast for 4! 2 Whoppers + 2 Crispy Chickens + 4 French Fries (L) + 4 Drinks (L). Save up to 20% — enjoy warm moments over delicious burgers.'
                    ),
                    'image'       => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=400',
                    'price'       => 479000,
                    'is_active'   => true,
                ]
            );

            $family->items()->delete();
            ComboItem::create(['combo_id' => $family->id, 'product_id' => $products['whopper'],       'quantity' => 2, 'size' => 'S']);
            ComboItem::create(['combo_id' => $family->id, 'product_id' => $products['crispy-chicken'],'quantity' => 2, 'size' => 'S']);
            ComboItem::create(['combo_id' => $family->id, 'product_id' => $products['french-fries'],  'quantity' => 4, 'size' => 'L']);
            ComboItem::create(['combo_id' => $family->id, 'product_id' => $products['coca-cola'],     'quantity' => 4, 'size' => 'L']);

            // ─── Kids Meal ─────────────────────────────
            $kids = ComboSet::updateOrCreate(
                ['slug' => 'kids-meal-set'],
                [
                    'sku'         => 'CMB-KIDS-MEAL-SET',
                    'name'        => $this->trans('Phần Ăn Bé Yêu', 'Kids Meal'),
                    'description' => $this->trans(
                        'Combo vui nhộn dành riêng cho bé! 1 Kids Burger phần nhỏ + 1 Kids Fries giòn ngon + 1 Juice Box trái cây tự nhiên. Bữa ăn bổ dưỡng vừa vặn cho các thiên thần nhỏ.',
                        'Fun combo made just for kids! 1 mini Kids Burger + 1 crispy Kids Fries + 1 natural fruit Juice Box. A nutritious and perfectly portioned meal for your little ones.'
                    ),
                    'image'       => 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=400',
                    'price'       => 75000,
                    'is_active'   => true,
                ]
            );

            $kids->items()->delete();
            ComboItem::create(['combo_id' => $kids->id, 'product_id' => $products['kids-burger'],  'quantity' => 1, 'size' => 'S']);
            ComboItem::create(['combo_id' => $kids->id, 'product_id' => $products['kids-fries'],   'quantity' => 1, 'size' => 'S']);
            ComboItem::create(['combo_id' => $kids->id, 'product_id' => $products['juice-box'],    'quantity' => 1, 'size' => 'S']);
        });
    }
}
