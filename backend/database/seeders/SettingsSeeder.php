<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['general', 'general.store_name', ['vi' => 'Hamburger King', 'en' => 'Hamburger King'], 'json', true],
            ['general', 'general.store_tagline', ['vi' => 'Burger Lửa Hồng - Đậm Đà Vị Khói', 'en' => 'Flame-Grilled Burger - Bold Smoky Flavor'], 'json', true],
            ['general', 'general.store_description', ['vi' => 'Hamburger King phục vụ burger nướng lửa, combo gia đình và đồ ăn nhanh chất lượng cao.', 'en' => 'Hamburger King serves flame-grilled burgers, family combos, and high-quality fast food.'], 'json', true],
            ['general', 'general.hotline', '1900 9999', 'text', true],
            ['general', 'general.email', env('MAIL_FROM_ADDRESS', 'hello@example.com'), 'text', true],
            ['general', 'general.address', ['vi' => '120 Lê Lợi, Bến Nghé, Quận 1, TP. Hồ Chí Minh', 'en' => '120 Le Loi, Ben Nghe Ward, District 1, Ho Chi Minh City'], 'json', true],
            ['general', 'general.branch_id', null, 'number', false],
            ['general', 'general.logo', null, 'image', true],
            ['general', 'general.logo_width', 260, 'number', true],
            ['general', 'general.logo_height', 64, 'number', true],
            ['general', 'general.favicon', null, 'image', true],
            ['general', 'general.favicon_width', 56, 'number', true],
            ['general', 'general.favicon_height', 56, 'number', true],
            ['general', 'general.admin_logo', null, 'image', true],
            ['general', 'general.admin_logo_width', 260, 'number', true],
            ['general', 'general.admin_logo_height', 64, 'number', true],
            ['general', 'general.admin_favicon', null, 'image', true],
            ['general', 'general.admin_favicon_width', 56, 'number', true],
            ['general', 'general.admin_favicon_height', 56, 'number', true],
            ['general', 'general.facebook_url', '', 'text', true],
            ['general', 'general.instagram_url', '', 'text', true],
            ['general', 'general.youtube_url', '', 'text', true],
            ['general', 'general.tiktok_url', '', 'text', true],
            ['general', 'general.zalo_url', '', 'text', true],
            ['general', 'general.maintenance_mode', false, 'boolean', true],
            ['general', 'general.maintenance_message', ['vi' => 'Website đang bảo trì, vui lòng quay lại sau.', 'en' => 'Website is under maintenance, please check back later.'], 'json', true],
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
            ['shipping', 'shipping.estimated_time', '30-45 phút', 'text', true],
 
            ['appearance', 'appearance.primary_color', '#D62300', 'color', true],
            ['appearance', 'appearance.secondary_color', '#FFC72C', 'color', true],
            ['appearance', 'appearance.font_family', 'DM Sans', 'select', true],
 
            ['notification', 'notification.email_order_created', true, 'boolean', false],
            ['notification', 'notification.email_order_status', true, 'boolean', false],
            ['notification', 'notification.email_new_user', true, 'boolean', false],
            ['notification', 'notification.bell_new_order', true, 'boolean', false],
            ['notification', 'notification.bell_new_review', true, 'boolean', false],
            ['notification', 'notification.bell_new_contact', true, 'boolean', false],
            ['notification', 'notification.bell_new_newsletter', true, 'boolean', false],
            ['notification', 'notification.bell_new_complaint', true, 'boolean', false],
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
 
            ['seo', 'seo.meta_title', ['vi' => 'Hamburger King - Burger Lửa Hồng', 'en' => 'Hamburger King - Flame-Grilled Burger'], 'json', true],
            ['seo', 'seo.meta_description', ['vi' => 'Thưởng thức burger lửa hồng, gà giòn và combo hấp dẫn tại Hamburger King.', 'en' => 'Enjoy flame-grilled burgers, crispy chicken, and delicious combos at Hamburger King.'], 'json', true],
            ['seo', 'seo.meta_keywords', ['vi' => 'burger, hamburger, fast food, hamburger king', 'en' => 'burger, hamburger, fast food, hamburger king'], 'json', true],
            ['seo', 'seo.google_analytics', '', 'text', false],
            ['seo', 'seo.facebook_pixel', '', 'text', false],
            ['seo', 'seo.robots_txt', "User-agent: *\nAllow: /", 'text', false],
 
            ['loyalty', 'loyalty.enabled', true, 'boolean', true],
            ['loyalty', 'loyalty.points_per_vnd', 1000, 'number', true],
            ['loyalty', 'loyalty.vnd_per_point', 100, 'number', true],
            ['loyalty', 'loyalty.min_redeem_points', 50, 'number', true],
            ['loyalty', 'loyalty.expiry_days', 365, 'number', true],

            // Stats section
            ['homepage', 'homepage.stats', [
                ['label_vi' => 'Khách hàng', 'label_en' => 'Customers', 'value' => '8K+', 'icon' => 'users'],
                ['label_vi' => 'Món ăn', 'label_en' => 'Menu Items', 'value' => '60+', 'icon' => 'utensils'],
                ['label_vi' => 'Hài lòng', 'label_en' => 'Satisfaction', 'value' => '80%', 'icon' => 'star'],
                ['label_vi' => 'Đánh giá', 'label_en' => 'Reviews', 'value' => '600+', 'icon' => 'message'],
            ], 'json', true],

            // Experience section
            ['homepage', 'homepage.exp_image', '', 'text', true],
            ['homepage', 'homepage.exp_title_vi', 'Trải Nghiệm Tuyệt Vời Với Chất Lượng Cao Cấp', 'text', true],
            ['homepage', 'homepage.exp_title_en', 'Exceptional Experience With Premium Quality', 'text', true],
            ['homepage', 'homepage.exp_desc_vi', 'Mỗi chiếc burger được làm thủ công từ nguyên liệu tươi ngon nhất...', 'text', true],
            ['homepage', 'homepage.exp_desc_en', 'Every burger is handcrafted from the freshest ingredients...', 'text', true],
            ['homepage', 'homepage.exp_person_name', 'Nguyễn Văn A', 'text', true],
            ['homepage', 'homepage.exp_person_role_vi', 'Bếp trưởng', 'text', true],
            ['homepage', 'homepage.exp_person_role_en', 'Head Chef', 'text', true],

            // Features section (4 icons)
            ['homepage', 'homepage.features', [
                ['icon' => 'flame', 'title_vi' => 'Đồ Ăn Ngon', 'title_en' => 'Delicious Food', 'desc_vi' => 'Burger nướng lửa hồng chuẩn vị', 'desc_en' => 'Flame grilled to perfection'],
                ['icon' => 'leaf', 'title_vi' => 'Nguyên Liệu Tươi', 'title_en' => 'Fresh Ingredients', 'desc_vi' => '100% nguyên liệu tươi sạch', 'desc_en' => '100% fresh and clean ingredients'],
                ['icon' => 'smile', 'title_vi' => 'Phục Vụ Tận Tâm', 'title_en' => 'Friendly Service', 'desc_vi' => 'Đội ngũ nhiệt tình, chuyên nghiệp', 'desc_en' => 'Enthusiastic and professional team'],
                ['icon' => 'zap', 'title_vi' => 'Giao Hàng Nhanh', 'title_en' => 'Fast Delivery', 'desc_vi' => 'Giao hàng trong 30-45 phút', 'desc_en' => 'Delivery in 30-45 minutes'],
            ], 'json', true],

            // Celebration/Catering section
            ['homepage', 'homepage.catering_title_vi', 'Phục Vụ Mọi Dịp Đặc Biệt', 'text', true],
            ['homepage', 'homepage.catering_title_en', 'Catering For Every Celebration', 'text', true],
            ['homepage', 'homepage.catering_desc_vi', 'Từ tiệc sinh nhật đến sự kiện công ty...', 'text', true],
            ['homepage', 'homepage.catering_desc_en', 'From birthday parties to corporate events...', 'text', true],
            ['homepage', 'homepage.catering_images', [], 'json', true],
            ['homepage', 'homepage.catering_btn_vi', 'Đặt Tiệc Ngay', 'text', true],
            ['homepage', 'homepage.catering_btn_en', 'Book Now', 'text', true],
            ['homepage', 'homepage.catering_btn_link', '/contact', 'text', true],

            // FAQ
            ['homepage', 'homepage.faqs', [
                ['q_vi' => 'Có giao hàng tận nơi không?', 'q_en' => 'Do you offer home delivery?', 'a_vi' => 'Có, chúng tôi giao hàng trong bán kính 20km...', 'a_en' => 'Yes, we deliver within 20km radius...'],
                ['q_vi' => 'Nguyên liệu có tươi không?', 'q_en' => 'Are your ingredients fresh?', 'a_vi' => '100% nguyên liệu được nhập hàng ngày...', 'a_en' => '100% ingredients are sourced daily...'],
                ['q_vi' => 'Có thể tùy chỉnh món không?', 'q_en' => 'Can I customize my meal?', 'a_vi' => 'Có, bạn có thể chọn size và topping...', 'a_en' => 'Yes, you can choose size and toppings...'],
                ['q_vi' => 'Có phục vụ tiệc không?', 'q_en' => 'Do you offer catering services?', 'a_vi' => 'Có, liên hệ hotline để đặt tiệc...', 'a_en' => 'Yes, contact our hotline to book...'],
            ], 'json', true],

            // CTA Banner
            ['homepage', 'homepage.cta_title_vi', 'ĐÓI BỤNG RỒI? CHÚNG TÔI SẴN SÀNG!', 'text', true],
            ['homepage', 'homepage.cta_title_en', 'HUNGRY? WE\'RE READY!', 'text', true],
            ['homepage', 'homepage.cta_image', '', 'text', true],
            ['homepage', 'homepage.cta_btn_vi', 'Đặt Hàng Ngay', 'text', true],
            ['homepage', 'homepage.cta_btn_en', 'Order Now', 'text', true],
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
