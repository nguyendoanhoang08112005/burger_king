<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Setting;

return new class extends Migration {
    public function up(): void
    {
        $settings = [
            ['review', 'review.expiry_days', 7, 'number', true],
            ['complaint', 'complaint.expiry_hours', 24, 'number', true],
            ['review', 'review.bonus_points', 10, 'number', true],
            ['review', 'review.auto_approve_stars', false, 'boolean', false],
            ['complaint', 'complaint.notification_email', 'admin@hamburgerking.com', 'text', false],
            ['review', 'review.email_reminder', false, 'boolean', false],
        ];

        foreach ($settings as [$group, $key, $value, $type, $isPublic]) {
            Setting::set($key, $value, [
                'group' => $group,
                'type' => $type,
                'is_public' => $isPublic,
            ]);
        }
    }

    public function down(): void
    {
        $keys = [
            'review.expiry_days',
            'complaint.expiry_hours',
            'review.bonus_points',
            'review.auto_approve_stars',
            'complaint.notification_email',
            'review.email_reminder',
        ];

        foreach ($keys as $key) {
            \App\Models\Setting::where('key', $key)->delete();
            \App\Models\Setting::clearCache($key);
        }
    }
};
