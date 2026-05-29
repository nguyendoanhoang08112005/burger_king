<?php

namespace Database\Seeders;

use App\Models\ProductTopping;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductToppingSeeder extends Seeder
{
    public function run(): void
    {
        $toppings = [
            // ═══ SAUCES ═══
            [
                'name'         => 'Sốt BBQ Đặc Biệt',
                'price'        => 5000,
                'category'     => 'sauce',
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => 'Sốt Mayonnaise',
                'price'        => 5000,
                'category'     => 'sauce',
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => 'Sốt Cay Sriracha',
                'price'        => 5000,
                'category'     => 'sauce',
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => 'Sốt Mù Tạt Mật Ong',
                'price'        => 5000,
                'category'     => 'sauce',
                'image'        => null,
                'is_available' => true,
            ],

            // ═══ CHEESE ═══
            [
                'name'         => 'Phô Mai Cheddar',
                'price'        => 10000,
                'category'     => 'cheese',
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => 'Phô Mai Xanh',
                'price'        => 12000,
                'category'     => 'cheese',
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => 'Phô Mai Mozzarella',
                'price'        => 10000,
                'category'     => 'cheese',
                'image'        => null,
                'is_available' => true,
            ],

            // ═══ VEGGIES ═══
            [
                'name'         => 'Thêm Rau Xà Lách',
                'price'        => 5000,
                'category'     => 'veggie',
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => 'Thêm Cà Chua',
                'price'        => 5000,
                'category'     => 'veggie',
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => 'Thêm Dưa Chuột Muối',
                'price'        => 5000,
                'category'     => 'veggie',
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => 'Thêm Hành Tây',
                'price'        => 5000,
                'category'     => 'veggie',
                'image'        => null,
                'is_available' => true,
            ],

            // ═══ MEAT ═══
            [
                'name'         => 'Thêm Thịt Bò Patty',
                'price'        => 25000,
                'category'     => 'meat',
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => 'Thêm Bacon',
                'price'        => 20000,
                'category'     => 'meat',
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => 'Thêm Trứng Ốp La',
                'price'        => 15000,
                'category'     => 'meat',
                'image'        => null,
                'is_available' => true,
            ],
        ];

        DB::transaction(function () use ($toppings) {
            foreach ($toppings as $topping) {
                ProductTopping::updateOrCreate(
                    ['name' => $topping['name']],
                    $topping
                );
            }
        });
    }
}
