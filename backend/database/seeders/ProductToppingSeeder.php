<?php

namespace Database\Seeders;

use App\Models\ProductTopping;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductToppingSeeder extends Seeder
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
        $categoryIds = Category::pluck('id', 'slug');
        $forCategories = fn (array $slugs) => collect($slugs)
            ->map(fn ($slug) => (int) ($categoryIds[$slug] ?? 0))
            ->filter()
            ->values()
            ->all();

        $sauceCategories = $forCategories(['burgers', 'chicken', 'sides', 'wraps-sandwiches', 'combo-meals', 'kids-menu']);
        $cheeseCategories = $forCategories(['burgers', 'wraps-sandwiches', 'combo-meals', 'kids-menu']);
        $veggieCategories = $forCategories(['burgers', 'salads', 'wraps-sandwiches']);
        $meatCategories = $forCategories(['burgers', 'wraps-sandwiches', 'combo-meals']);

        $toppings = [
            // ═══ SAUCES ═══
            [
                'name'         => $this->trans('Sốt BBQ Đặc Biệt', 'Special BBQ Sauce'),
                'price'        => 5000,
                'category'     => 'sauce',
                'category_ids'  => $sauceCategories,
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => $this->trans('Sốt Mayonnaise', 'Mayonnaise Sauce'),
                'price'        => 5000,
                'category'     => 'sauce',
                'category_ids'  => $sauceCategories,
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => $this->trans('Sốt Cay Sriracha', 'Spicy Sriracha Sauce'),
                'price'        => 5000,
                'category'     => 'sauce',
                'category_ids'  => $sauceCategories,
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => $this->trans('Sốt Mù Tạt Mật Ong', 'Honey Mustard Sauce'),
                'price'        => 5000,
                'category'     => 'sauce',
                'category_ids'  => $sauceCategories,
                'image'        => null,
                'is_available' => true,
            ],

            // ═══ CHEESE ═══
            [
                'name'         => $this->trans('Phô Mai Cheddar', 'Cheddar Cheese'),
                'price'        => 10000,
                'category'     => 'cheese',
                'category_ids'  => $cheeseCategories,
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => $this->trans('Phô Mai Xanh', 'Blue Cheese'),
                'price'        => 12000,
                'category'     => 'cheese',
                'category_ids'  => $cheeseCategories,
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => $this->trans('Phô Mai Mozzarella', 'Mozzarella Cheese'),
                'price'        => 10000,
                'category'     => 'cheese',
                'category_ids'  => $cheeseCategories,
                'image'        => null,
                'is_available' => true,
            ],

            // ═══ VEGGIES ═══
            [
                'name'         => $this->trans('Thêm Rau Xà Lách', 'Extra Lettuce'),
                'price'        => 5000,
                'category'     => 'veggie',
                'category_ids'  => $veggieCategories,
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => $this->trans('Thêm Cà Chua', 'Extra Tomato'),
                'price'        => 5000,
                'category'     => 'veggie',
                'category_ids'  => $veggieCategories,
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => $this->trans('Thêm Dưa Chuột Muối', 'Extra Pickles'),
                'price'        => 5000,
                'category'     => 'veggie',
                'category_ids'  => $veggieCategories,
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => $this->trans('Thêm Hành Tây', 'Extra Onion'),
                'price'        => 5000,
                'category'     => 'veggie',
                'category_ids'  => $veggieCategories,
                'image'        => null,
                'is_available' => true,
            ],

            // ═══ MEAT ═══
            [
                'name'         => $this->trans('Thêm Thịt Bò Patty', 'Extra Beef Patty'),
                'price'        => 25000,
                'category'     => 'meat',
                'category_ids'  => $meatCategories,
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => $this->trans('Thêm Bacon', 'Extra Bacon'),
                'price'        => 20000,
                'category'     => 'meat',
                'category_ids'  => $meatCategories,
                'image'        => null,
                'is_available' => true,
            ],
            [
                'name'         => $this->trans('Thêm Trứng Ốp La', 'Extra Fried Egg'),
                'price'        => 15000,
                'category'     => 'meat',
                'category_ids'  => $meatCategories,
                'image'        => null,
                'is_available' => true,
            ],
        ];

        DB::transaction(function () use ($toppings) {
            foreach ($toppings as $topping) {
                $topping['sku'] = 'TOP-' . Str::upper(Str::slug($topping['name']['en'] ?? $topping['name']['vi']));
                // Find existing using JSON path comparison or key check
                $existing = ProductTopping::get()->first(function ($t) use ($topping) {
                    return $t->getTranslation('name', 'vi') === $topping['name']['vi'];
                });

                if ($existing) {
                    $existing->update($topping);
                } else {
                    ProductTopping::create($topping);
                }
            }
        });
    }
}
