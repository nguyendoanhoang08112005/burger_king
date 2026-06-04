<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['general', 'general.store_name', 'Hamburger King', 'text', true],
            ['general', 'general.store_tagline', 'Burger Lua Hong - Dam Da Vi Khoi', 'text', true],
            ['general', 'general.store_description', 'Hamburger King phuc vu burger nuong lua, combo gia dinh va do an nhanh chat luong cao.', 'text', true],
            ['general', 'general.hotline', '1900 9999', 'text', true],
            ['general', 'general.email', env('MAIL_FROM_ADDRESS', 'hello@example.com'), 'text', true],
            ['general', 'general.address', '120 Le Loi, Ben Nghe, Quan 1, TP. Ho Chi Minh', 'text', true],
            ['general', 'general.logo', null, 'image', true],
            ['general', 'general.favicon', null, 'image', true],
            ['general', 'general.facebook_url', '', 'text', true],
            ['general', 'general.instagram_url', '', 'text', true],
            ['general', 'general.youtube_url', '', 'text', true],
            ['general', 'general.tiktok_url', '', 'text', true],
            ['general', 'general.zalo_url', '', 'text', true],
            ['general', 'general.maintenance_mode', false, 'boolean', true],
            ['general', 'general.maintenance_message', 'Website dang bao tri, vui long quay lai sau.', 'text', true],
            ['general', 'general.google_maps_key', '', 'text', false],

            ['shipping', 'shipping.method', 'distance', 'select', true],
            ['shipping', 'shipping.base_fee', 15000, 'number', true],
            ['shipping', 'shipping.per_km_fee', 5000, 'number', true],
            ['shipping', 'shipping.free_from_amount', 300000, 'number', true],
            ['shipping', 'shipping.max_distance_km', 20, 'number', true],
            ['shipping', 'shipping.store_address', '120 Le Loi, Ben Nghe, Quan 1, TP. Ho Chi Minh', 'text', false],
            ['shipping', 'shipping.store_lat', 10.771971, 'number', false],
            ['shipping', 'shipping.store_lng', 106.698372, 'number', false],
            ['shipping', 'shipping.distance_tiers', [
                ['max_km' => 2, 'fee' => 15000],
                ['max_km' => 5, 'fee' => 25000],
                ['max_km' => 10, 'fee' => 35000],
                ['max_km' => 20, 'fee' => 50000],
            ], 'json', false],
            ['shipping', 'shipping.estimated_time', '30-45 phut', 'text', true],

            ['appearance', 'appearance.primary_color', '#D62300', 'color', true],
            ['appearance', 'appearance.secondary_color', '#FFC72C', 'color', true],
            ['appearance', 'appearance.font_family', 'DM Sans', 'select', true],
            ['appearance', 'appearance.hero_image', null, 'image', true],
            ['appearance', 'appearance.og_image', null, 'image', true],

            ['notification', 'notification.email_order_created', true, 'boolean', false],
            ['notification', 'notification.email_order_status', true, 'boolean', false],
            ['notification', 'notification.email_new_user', true, 'boolean', false],
            ['notification', 'notification.admin_email', env('NOTIFICATION_ADMIN_EMAIL', env('MAIL_FROM_ADDRESS', 'hello@example.com')), 'text', false],
            ['notification', 'notification.email_driver', 'smtp', 'select', false],
            ['notification', 'notification.smtp_host', '', 'text', false],
            ['notification', 'notification.smtp_port', 587, 'number', false],
            ['notification', 'notification.smtp_username', '', 'text', false],
            ['notification', 'notification.smtp_password', '', 'text', false],
            ['notification', 'notification.smtp_encryption', 'tls', 'select', false],

            ['localization', 'localization.default_language', 'vi', 'select', true],
            ['localization', 'localization.languages', ['vi', 'en'], 'json', true],
            ['localization', 'localization.timezone', 'Asia/Ho_Chi_Minh', 'select', true],
            ['localization', 'localization.currency', 'VND', 'select', true],
            ['localization', 'localization.currency_symbol', 'd', 'text', true],
            ['localization', 'localization.currency_position', 'after', 'select', true],
            ['localization', 'localization.date_format', 'dd/MM/yyyy', 'select', true],
            ['localization', 'localization.number_format', 'dot', 'select', true],

            ['seo', 'seo.meta_title', 'Hamburger King - Burger Lua Hong', 'text', true],
            ['seo', 'seo.meta_description', 'Thuong thuc burger lua hong, ga gion va combo hap dan tai Hamburger King.', 'text', true],
            ['seo', 'seo.meta_keywords', 'burger, hamburger, fast food, hamburger king', 'text', true],
            ['seo', 'seo.google_analytics', '', 'text', false],
            ['seo', 'seo.facebook_pixel', '', 'text', false],
            ['seo', 'seo.robots_txt', "User-agent: *\nAllow: /", 'text', false],

            ['loyalty', 'loyalty.enabled', true, 'boolean', true],
            ['loyalty', 'loyalty.points_per_vnd', 1000, 'number', true],
            ['loyalty', 'loyalty.vnd_per_point', 100, 'number', true],
            ['loyalty', 'loyalty.min_redeem_points', 50, 'number', true],
            ['loyalty', 'loyalty.expiry_days', 365, 'number', true],
        ];

        foreach ($settings as [$group, $key, $value, $type, $isPublic]) {
            Setting::set($key, $value, [
                'group' => $group,
                'type' => $type,
                'is_public' => $isPublic,
            ]);
        }
    }
}
