<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('post_tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        // Bảo toàn dữ liệu: Quét tag cũ trong posts và import vào post_tags
        try {
            $posts = DB::table('posts')->whereNotNull('tags')->get();
            $tags = [];
            foreach ($posts as $post) {
                $postTags = json_decode($post->tags, true);
                if (is_array($postTags)) {
                    foreach ($postTags as $tag) {
                        $tag = trim($tag);
                        if ($tag !== '') {
                            $tags[] = $tag;
                        }
                    }
                }
            }
            $dictionary = [
                'burger'          => ['vi' => 'Burger', 'en' => 'Burger'],
                'flame-grilled'   => ['vi' => 'Nướng lửa hồng', 'en' => 'Flame-grilled'],
                'beef'            => ['vi' => 'Thịt bò', 'en' => 'Beef'],
                'cooking-tips'    => ['vi' => 'Mẹo nấu ăn', 'en' => 'Cooking Tips'],
                'anniversary'     => ['vi' => 'Kỷ niệm', 'en' => 'Anniversary'],
                'milestone'       => ['vi' => 'Cột mốc', 'en' => 'Milestone'],
                'brand-story'     => ['vi' => 'Câu chuyện thương hiệu', 'en' => 'Brand Story'],
                'vietnam'         => ['vi' => 'Việt Nam', 'en' => 'Vietnam'],
                'combo'           => ['vi' => 'Combo', 'en' => 'Combo'],
                'discount'        => ['vi' => 'Giảm giá', 'en' => 'Discount'],
                'family-meal'     => ['vi' => 'Bữa ăn gia đình', 'en' => 'Family Meal'],
                'promotion'       => ['vi' => 'Khuyến mãi', 'en' => 'Promotion'],
                'ingredients'     => ['vi' => 'Nguyên liệu', 'en' => 'Ingredients'],
                'farm-to-table'   => ['vi' => 'Từ trang trại đến bàn ăn', 'en' => 'Farm to Table'],
                'fresh-veggies'   => ['vi' => 'Rau củ tươi', 'en' => 'Fresh Veggies'],
                'quality'         => ['vi' => 'Chất lượng', 'en' => 'Quality'],
                'review'          => ['vi' => 'Đánh giá', 'en' => 'Review'],
                'double-whopper'  => ['vi' => 'Double Whopper', 'en' => 'Double Whopper'],
                'burger-review'   => ['vi' => 'Đánh giá burger', 'en' => 'Burger Review'],
                'signature'       => ['vi' => 'Món đặc trưng', 'en' => 'Signature'],
            ];

            $uniqueTags = array_unique($tags);
            foreach ($uniqueTags as $tag) {
                $slug = Str::slug($tag);
                if (!$slug) {
                    $slug = preg_replace('/[^a-z0-9]+/i', '-', strtolower($tag));
                    $slug = trim($slug, '-');
                }
                
                $exists = DB::table('post_tags')->where('slug', $slug)->exists();
                if (!$exists && $slug !== '') {
                    $viName = $dictionary[$slug]['vi'] ?? $tag;
                    $enName = $dictionary[$slug]['en'] ?? $tag;

                    $tagId = DB::table('post_tags')->insertGetId([
                        'name' => $viName,
                        'slug' => $slug,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    DB::table('translations')->insert([
                        [
                            'locale' => 'vi',
                            'translatable_type' => \App\Models\PostTag::class,
                            'translatable_id' => $tagId,
                            'field' => 'name',
                            'value' => $viName,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ],
                        [
                            'locale' => 'en',
                            'translatable_type' => \App\Models\PostTag::class,
                            'translatable_id' => $tagId,
                            'field' => 'name',
                            'value' => $enName,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error("Failed to migrate existing post tags: " . $e->getMessage());
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_tags');
    }
};
