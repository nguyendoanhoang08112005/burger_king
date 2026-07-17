<?php

namespace App\Providers;

use App\Models\Setting;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * Dynamically configure the mailer from database settings on every boot,
     * so SMTP credentials saved via the admin panel take effect immediately
     * without touching .env or restarting the server.
     */
    public function boot(): void
    {
        // Define rate limiters for protection against DDoS and brute-force attacks
        \Illuminate\Support\Facades\RateLimiter::for('api', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by($request->ip());
        });

        \Illuminate\Support\Facades\RateLimiter::for('auth', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(10)->by($request->ip());
        });

        \Illuminate\Support\Facades\RateLimiter::for('chatbot', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(10)->by($request->ip());
        });

        try {
            if (!Schema::hasTable('settings')) {
                return;
            }

            // Register global homepage cache clearing listeners on key models
            $homepageModels = [
                \App\Models\Banner::class,
                \App\Models\Category::class,
                \App\Models\Product::class,
                \App\Models\ComboSet::class,
                \App\Models\Post::class,
                \App\Models\Branch::class,
                \App\Models\Review::class,
            ];

            foreach ($homepageModels as $modelClass) {
                if (class_exists($modelClass)) {
                    $modelClass::saved(function () {
                        Setting::clearHomepageCache();
                    });
                    $modelClass::deleted(function () {
                        Setting::clearHomepageCache();
                    });
                }
            }

            $host = Setting::get('notification.smtp_host');
            if (!$host) {
                return;
            }

            $driver     = Setting::get('notification.email_driver', 'smtp');
            $port       = Setting::get('notification.smtp_port', 587);
            $username   = Setting::get('notification.smtp_username');
            $password   = Setting::get('notification.smtp_password');
            $encryption = Setting::get('notification.smtp_encryption', 'tls');
            $storeEmail = $this->scalarSetting(Setting::get('general.email'));
            $adminEmail = $this->scalarSetting(Setting::get('notification.admin_email'));
            $storeName  = $this->scalarSetting(Setting::get('general.store_name')) ?: 'Hamburger King';

            config([
                'mail.default'                 => $driver,
                'mail.mailers.smtp.host'       => $host,
                'mail.mailers.smtp.port'       => (int) $port,
                'mail.mailers.smtp.username'   => $username,
                'mail.mailers.smtp.password'   => $password,
                'mail.mailers.smtp.encryption' => $encryption === 'none' ? null : $encryption,
                'mail.from.address'            => $storeEmail ?: $adminEmail ?: 'hello@example.com',
                'mail.from.name'               => $storeName,
            ]);
        } catch (\Exception) {
            // Silently skip if the DB is unavailable (e.g. during migrations or fresh installs).
        }
    }

    /**
     * Safely extract a scalar string from a setting value that may be
     * a translatable array such as ["vi" => "...", "en" => "..."].
     */
    private function scalarSetting(mixed $value): string
    {
        if (is_array($value)) {
            $locale = app()->getLocale();
            return (string) ($value[$locale] ?? $value['vi'] ?? $value['en'] ?? reset($value) ?? '');
        }

        return (string) ($value ?? '');
    }
}
