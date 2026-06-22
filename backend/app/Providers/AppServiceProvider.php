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
        try {
            if (!Schema::hasTable('settings')) {
                return;
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
