<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductSize;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSizeSeeder extends Seeder
{
    public function run(): void
    {
        // Products that get S / M / L drink/side sizes
        $smlProducts = [
            'french-fries',
            'onion-rings',
            'mozzarella-sticks',
            'hash-browns',
            'corn-cup',
            'coca-cola',
            'sprite',
            'fanta',
            'iced-tea',
            'coffee',
            'milkshake-chocolate',
            'milkshake-vanilla',
            'milkshake-strawberry',
            'kids-fries',
        ];

        // Products that get piece-count sizes (6 / 9 / 12)
        $pieceProducts = [
            'chicken-nuggets-6',
            'chicken-wings-6',
        ];

        DB::transaction(function () use ($smlProducts, $pieceProducts) {
            // S / M / L sizes for drinks, sides, fries
            foreach ($smlProducts as $slug) {
                $product = Product::where('slug', $slug)->first();
                if (!$product) continue;

                foreach ([
                    ['size' => 'S', 'extra_price' => 0],
                    ['size' => 'M', 'extra_price' => 5000],
                    ['size' => 'L', 'extra_price' => 10000],
                ] as $size) {
                    ProductSize::updateOrCreate(
                        ['product_id' => $product->id, 'size' => $size['size']],
                        ['sku' => "{$product->sku}-{$size['size']}", 'extra_price' => $size['extra_price'], 'is_available' => true]
                    );
                }
            }

            // 6pc / 9pc / 12pc sizes for nuggets and wings
            // We map piece-count to enum S/M/L since the DB uses enum('S','M','L','XL')
            // S = 6 miếng (base), M = 9 miếng, L = 12 miếng
            foreach ($pieceProducts as $slug) {
                $product = Product::where('slug', $slug)->first();
                if (!$product) continue;

                foreach ([
                    ['size' => 'S', 'extra_price' => 0],        // 6 miếng (base)
                    ['size' => 'M', 'extra_price' => 20000],    // 9 miếng
                    ['size' => 'L', 'extra_price' => 35000],    // 12 miếng
                ] as $size) {
                    ProductSize::updateOrCreate(
                        ['product_id' => $product->id, 'size' => $size['size']],
                        ['sku' => "{$product->sku}-{$size['size']}", 'extra_price' => $size['extra_price'], 'is_available' => true]
                    );
                }
            }
        });
    }
}
