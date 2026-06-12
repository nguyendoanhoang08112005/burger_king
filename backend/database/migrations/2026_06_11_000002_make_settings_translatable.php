<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\Setting;

return new class extends Migration {
    public function up(): void
    {
        $keys = [
            'general.store_name' => [
                'vi' => 'Hamburger King',
                'en' => 'Hamburger King',
            ],
            'general.store_tagline' => [
                'vi' => 'Burger Lửa Hồng - Đậm Đà Vị Khói',
                'en' => 'Flame-Grilled Burger - Bold Smoky Flavor',
            ],
            'general.store_description' => [
                'vi' => 'Hamburger King phục vụ burger nướng lửa, combo gia đình và đồ ăn nhanh chất lượng cao.',
                'en' => 'Hamburger King serves flame-grilled burgers, family combos, and high-quality fast food.',
            ],
            'general.address' => [
                'vi' => '120 Lê Lợi, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
                'en' => '120 Le Loi, Ben Nghe Ward, District 1, Ho Chi Minh City',
            ],
            'general.maintenance_message' => [
                'vi' => 'Website đang bảo trì, vui lòng quay lại sau.',
                'en' => 'Website is under maintenance, please check back later.',
            ],
            'seo.meta_title' => [
                'vi' => 'Hamburger King - Burger Lửa Hồng',
                'en' => 'Hamburger King - Flame-Grilled Burger',
            ],
            'seo.meta_description' => [
                'vi' => 'Thưởng thức burger lửa hồng, gà giòn và combo hấp dẫn tại Hamburger King.',
                'en' => 'Enjoy flame-grilled burgers, crispy chicken, and delicious combos at Hamburger King.',
            ],
            'seo.meta_keywords' => [
                'vi' => 'burger, hamburger, fast food, hamburger king',
                'en' => 'burger, hamburger, fast food, hamburger king',
            ],
        ];

        foreach ($keys as $key => $trans) {
            $setting = DB::table('settings')->where('key', $key)->first();
            if ($setting) {
                $viVal = $setting->value;
                // Check if already json
                $decoded = json_decode($viVal, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded) && (isset($decoded['vi']) || isset($decoded['en']))) {
                    continue;
                }

                $newTrans = [
                    'vi' => $viVal ?: $trans['vi'],
                    'en' => $trans['en'],
                ];

                DB::table('settings')->where('key', $key)->update([
                    'type' => 'json',
                    'value' => json_encode($newTrans, JSON_UNESCAPED_UNICODE),
                ]);
            }
        }

        Setting::clearCache();
    }

    public function down(): void
    {
        // Down migration can revert them to plain text VI value if needed
    }
};
