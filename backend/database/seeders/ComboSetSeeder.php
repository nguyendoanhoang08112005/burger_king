<?php

namespace Database\Seeders;

use App\Models\ComboSet;
use App\Models\ComboItem;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ComboSetSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $products = Product::pluck('id', 'slug');

            // ─── Whopper Combo ─────────────────────────
            // Whopper (89k) + Fries M (29k+5k=34k) + Coca M (25k+5k=30k) = 153k
            // Combo price: 153k × 0.80 ≈ 122k → round to 119,000
            $whopper = ComboSet::updateOrCreate(
                ['slug' => 'whopper-combo-set'],
                [
                    'name'        => 'Whopper Combo',
                    'description' => 'Combo tiết kiệm nhất cho fan Whopper! 1 Whopper huyền thoại nướng lửa hồng + 1 French Fries cỡ M giòn vàng + 1 Coca-Cola cỡ M mát lạnh. Tiết kiệm tới 20% so với mua lẻ.',
                    'image'       => 'https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&q=80&w=400',
                    'price'       => 119000,
                    'is_active'   => true,
                ]
            );

            // Clear old combo items before re-seeding
            $whopper->items()->delete();
            ComboItem::create(['combo_id' => $whopper->id, 'product_id' => $products['whopper'],      'quantity' => 1, 'size' => 'S']);
            ComboItem::create(['combo_id' => $whopper->id, 'product_id' => $products['french-fries'],  'quantity' => 1, 'size' => 'M']);
            ComboItem::create(['combo_id' => $whopper->id, 'product_id' => $products['coca-cola'],     'quantity' => 1, 'size' => 'M']);

            // ─── Chicken Combo ─────────────────────────
            // Crispy Chicken (65k) + Fries M (29k+5k=34k) + Sprite M (25k+5k=30k) = 129k
            // Combo price: 129k × 0.80 ≈ 103k → round to 99,000
            $chicken = ComboSet::updateOrCreate(
                ['slug' => 'chicken-combo-set'],
                [
                    'name'        => 'Chicken Combo',
                    'description' => 'Combo gà giòn ngon lành! 1 Crispy Chicken chiên giòn rụm + 1 French Fries cỡ M + 1 Sprite cỡ M thanh mát. Tiết kiệm hơn mua lẻ 20% — bữa ăn chất lượng giá hời.',
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
            // 2×Whopper (178k) + 2×Crispy Chicken (130k) + 4×Fries L (4×39k=156k) + 4×Coca L (4×35k=140k) = 604k
            // Combo price: 604k × 0.80 ≈ 483k → round to 479,000
            $family = ComboSet::updateOrCreate(
                ['slug' => 'family-combo-set'],
                [
                    'name'        => 'Family Combo',
                    'description' => 'Bữa tiệc gia đình trọn vẹn cho 4 người! 2 Whopper + 2 Crispy Chicken + 4 French Fries cỡ L + 4 Drinks cỡ L. Siêu tiết kiệm giảm tới 20% — đầm ấm bên bàn ăn burger.',
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
            // Kids Burger (55k) + Kids Fries (19k) + Juice Box (20k) = 94k
            // Combo price: 94k × 0.80 ≈ 75k → round to 75,000
            $kids = ComboSet::updateOrCreate(
                ['slug' => 'kids-meal-set'],
                [
                    'name'        => 'Kids Meal',
                    'description' => 'Combo vui nhộn dành riêng cho bé! 1 Kids Burger phần nhỏ + 1 Kids Fries giòn ngon + 1 Juice Box trái cây tự nhiên. Bữa ăn bổ dưỡng vừa vặn cho các thiên thần nhỏ.',
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
