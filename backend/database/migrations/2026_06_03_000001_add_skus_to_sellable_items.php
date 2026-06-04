<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('sku')->nullable()->unique()->after('slug');
        });

        Schema::table('product_sizes', function (Blueprint $table) {
            $table->string('sku')->nullable()->unique()->after('size');
        });

        Schema::table('combo_sets', function (Blueprint $table) {
            $table->string('sku')->nullable()->unique()->after('slug');
        });

        Schema::table('product_toppings', function (Blueprint $table) {
            $table->string('sku')->nullable()->unique()->after('name');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->string('product_sku')->nullable()->after('product_name');
            $table->string('size_sku')->nullable()->after('size');
        });

        DB::table('products')->orderBy('id')->each(function ($product) {
            DB::table('products')->where('id', $product->id)->update([
                'sku' => $this->makeSku('PRD', $product->slug ?: $product->name, $product->id),
            ]);
        });

        DB::table('product_sizes')
            ->join('products', 'product_sizes.product_id', '=', 'products.id')
            ->select('product_sizes.id', 'product_sizes.size', 'products.sku as product_sku')
            ->orderBy('product_sizes.id')
            ->each(function ($row) {
                DB::table('product_sizes')->where('id', $row->id)->update([
                    'sku' => "{$row->product_sku}-{$row->size}",
                ]);
            });

        DB::table('combo_sets')->orderBy('id')->each(function ($combo) {
            DB::table('combo_sets')->where('id', $combo->id)->update([
                'sku' => $this->makeSku('CMB', $combo->slug ?: $combo->name, $combo->id),
            ]);
        });

        DB::table('product_toppings')->orderBy('id')->each(function ($topping) {
            DB::table('product_toppings')->where('id', $topping->id)->update([
                'sku' => $this->makeSku('TOP', $topping->name, $topping->id),
            ]);
        });

        DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('order_items.id', 'order_items.size', 'products.sku as product_sku')
            ->orderBy('order_items.id')
            ->each(function ($row) {
                DB::table('order_items')->where('id', $row->id)->update([
                    'product_sku' => $row->product_sku,
                    'size_sku' => $row->size ? "{$row->product_sku}-{$row->size}" : null,
                ]);
            });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['product_sku', 'size_sku']);
        });

        Schema::table('product_toppings', function (Blueprint $table) {
            $table->dropUnique(['sku']);
            $table->dropColumn('sku');
        });

        Schema::table('combo_sets', function (Blueprint $table) {
            $table->dropUnique(['sku']);
            $table->dropColumn('sku');
        });

        Schema::table('product_sizes', function (Blueprint $table) {
            $table->dropUnique(['sku']);
            $table->dropColumn('sku');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['sku']);
            $table->dropColumn('sku');
        });
    }

    private function makeSku(string $prefix, ?string $source, int $id): string
    {
        $base = Str::upper(Str::slug($source ?: (string) $id, '-'));
        return "{$prefix}-{$base}-{$id}";
    }
};
