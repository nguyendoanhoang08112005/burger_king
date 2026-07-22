<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    // ─── Constants ─────────────────────────────────────────────────────────────

    private const MAIL_SETTING_KEYS = [
        'notification.email_driver',
        'notification.smtp_host',
        'notification.smtp_port',
        'notification.smtp_username',
        'notification.smtp_password',
        'notification.smtp_encryption',
    ];

    private const SENSITIVE_SETTING_KEYS = [
        'notification.smtp_password',
    ];

    /** Settings that may be created on-the-fly (not seeded). */
    private const DYNAMIC_SETTINGS = [
        'general.branch_id'          => ['type' => 'number', 'is_public' => false],
        'general.logo'               => ['type' => 'image',  'is_public' => true],
        'general.logo_width'         => ['type' => 'number', 'is_public' => true],
        'general.logo_height'        => ['type' => 'number', 'is_public' => true],
        'general.favicon'            => ['type' => 'image',  'is_public' => true],
        'general.favicon_width'      => ['type' => 'number', 'is_public' => true],
        'general.favicon_height'     => ['type' => 'number', 'is_public' => true],
        'general.admin_logo'         => ['type' => 'image',  'is_public' => true],
        'general.admin_logo_width'   => ['type' => 'number', 'is_public' => true],
        'general.admin_logo_height'  => ['type' => 'number', 'is_public' => true],
        'general.admin_favicon'      => ['type' => 'image',  'is_public' => true],
        'general.admin_favicon_width'  => ['type' => 'number', 'is_public' => true],
        'general.admin_favicon_height' => ['type' => 'number', 'is_public' => true],
        'appearance.footer_hotline'          => ['type' => 'text',   'is_public' => true],
        'appearance.footer_email'            => ['type' => 'text',   'is_public' => true],
        'appearance.footer_address'          => ['type' => 'json',   'is_public' => true],
        'appearance.footer_hours'            => ['type' => 'json',   'is_public' => true],
        'appearance.header_nav_home'         => ['type' => 'json',   'is_public' => true],
        'appearance.header_nav_home_url'     => ['type' => 'text',   'is_public' => true],
        'appearance.header_nav_menu'         => ['type' => 'json',   'is_public' => true],
        'appearance.header_nav_menu_url'     => ['type' => 'text',   'is_public' => true],
        'appearance.header_nav_branches'     => ['type' => 'json',   'is_public' => true],
        'appearance.header_nav_branches_url' => ['type' => 'text',   'is_public' => true],
        'appearance.header_nav_blog'         => ['type' => 'json',   'is_public' => true],
        'appearance.header_nav_blog_url'     => ['type' => 'text',   'is_public' => true],
        'appearance.footer_brand_desc'       => ['type' => 'json',   'is_public' => true],
        'appearance.footer_menu_title'       => ['type' => 'json',   'is_public' => true],
        'appearance.footer_contact_title'    => ['type' => 'json',   'is_public' => true],
        'appearance.footer_newsletter_title' => ['type' => 'json',   'is_public' => true],
        'appearance.footer_newsletter_desc'  => ['type' => 'json',   'is_public' => true],
        'appearance.footer_copyright'        => ['type' => 'text',   'is_public' => true],
        'appearance.footer_credit'           => ['type' => 'text',   'is_public' => true],
        'appearance.footer_link1_text'       => ['type' => 'json',   'is_public' => true],
        'appearance.footer_link1_url'        => ['type' => 'text',   'is_public' => true],
        'appearance.footer_link2_text'       => ['type' => 'json',   'is_public' => true],
        'appearance.footer_link2_url'        => ['type' => 'text',   'is_public' => true],
        'appearance.footer_link3_text'       => ['type' => 'json',   'is_public' => true],
        'appearance.footer_link3_url'        => ['type' => 'text',   'is_public' => true],
        'appearance.footer_link4_text'       => ['type' => 'json',   'is_public' => true],
        'appearance.footer_link4_url'        => ['type' => 'text',   'is_public' => true],
        'notification.bell_new_order'        => ['type' => 'boolean', 'is_public' => false],
        'notification.bell_new_review'       => ['type' => 'boolean', 'is_public' => false],
        'notification.bell_new_contact'      => ['type' => 'boolean', 'is_public' => false],
        'notification.bell_new_newsletter'   => ['type' => 'boolean', 'is_public' => false],
        'notification.bell_new_complaint'    => ['type' => 'boolean', 'is_public' => false],
        'homepage.categories_subtitle' => ['type' => 'json',   'is_public' => true],
        'homepage.categories_title'    => ['type' => 'json',   'is_public' => true],
        'homepage.deal_subtitle'       => ['type' => 'json',   'is_public' => true],
        'homepage.deal_title'          => ['type' => 'json',   'is_public' => true],
        'homepage.deal_desc'           => ['type' => 'json',   'is_public' => true],
        'homepage.deal1_image'         => ['type' => 'image',  'is_public' => true],
        'homepage.deal1_type'          => ['type' => 'text',   'is_public' => true],
        'homepage.deal1_id'            => ['type' => 'number', 'is_public' => true],
        'homepage.deal2_image'         => ['type' => 'image',  'is_public' => true],
        'homepage.deal2_type'          => ['type' => 'text',   'is_public' => true],
        'homepage.deal2_id'            => ['type' => 'number', 'is_public' => true],
        'homepage.deal3_image'         => ['type' => 'image',  'is_public' => true],
        'homepage.deal3_type'          => ['type' => 'text',   'is_public' => true],
        'homepage.deal3_id'            => ['type' => 'number', 'is_public' => true],
        'homepage.featured_subtitle'   => ['type' => 'json',   'is_public' => true],
        'homepage.featured_title'      => ['type' => 'json',   'is_public' => true],
        'homepage.gallery_badge'       => ['type' => 'json',   'is_public' => true],
        'homepage.gallery_title'       => ['type' => 'json',   'is_public' => true],
        'homepage.gallery_images'      => ['type' => 'json',   'is_public' => true],
        'homepage.blog_badge'          => ['type' => 'json',   'is_public' => true],
        'homepage.blog_title'          => ['type' => 'json',   'is_public' => true],
        'homepage.faqs'                => ['type' => 'json',   'is_public' => true],
        'homepage.cta_title'           => ['type' => 'json',   'is_public' => true],
        'homepage.cta_image'           => ['type' => 'image',  'is_public' => true],
        'homepage.cta_btn'             => ['type' => 'json',   'is_public' => true],
        'localization.default_to_vietnam' => ['type' => 'boolean', 'is_public' => true],
    ];

    private const LANGUAGE_CATALOG = [
        ['code' => 'af', 'name' => 'Afrikaans'],
        ['code' => 'am', 'name' => 'አማርኛ'],
        ['code' => 'ar', 'name' => 'العربية المغربية'],
        ['code' => 'az', 'name' => 'گؤنی آذربایجان'],
        ['code' => 'be', 'name' => 'Беларуская мова'],
        ['code' => 'bg', 'name' => 'български'],
        ['code' => 'en', 'name' => 'English'],
        ['code' => 'fr', 'name' => 'Français'],
        ['code' => 'ja', 'name' => '日本語'],
        ['code' => 'ko', 'name' => '한국어'],
        ['code' => 'th', 'name' => 'ไทย'],
        ['code' => 'vi', 'name' => 'Tiếng Việt'],
        ['code' => 'zh', 'name' => '中文'],
    ];

    // ─── Settings CRUD ─────────────────────────────────────────────────────────

    public function index(): JsonResponse
    {
        $settings = Cache::remember('settings_admin_index', 3600, function () {
            return Setting::orderBy('group')
                ->orderBy('key')
                ->get()
                ->groupBy('group')
                ->map(fn ($group) => $group->mapWithKeys(
                    fn (Setting $s) => [str($s->key)->after('.')->toString() => $s->parsed_value]
                ));
        });

        return response()->json(['success' => true, 'data' => $settings]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate(['settings' => 'required|array']);

        try {
            DB::transaction(function () use ($request) {
                // Temporarily disable model events (like saved/deleted hooks that clear chatbot cache)
                // during batch updates to prevent hundreds of repetitive SQL queries.
                Setting::withoutEvents(function () use ($request) {
                    foreach ($request->settings as $key => $value) {
                        // Skip blank sensitive values to preserve the stored secret.
                        if (in_array($key, self::SENSITIVE_SETTING_KEYS, true) && ($value === '' || $value === null)) {
                            continue;
                        }

                        $setting       = Setting::where('key', $key)->first();
                        $dynamicConfig = self::DYNAMIC_SETTINGS[$key] ?? null;

                        // Only persist known or explicitly allowed dynamic keys.
                        if (!$setting && !$dynamicConfig) {
                            continue;
                        }

                        // Pass false to clearCache parameter to prevent clearing cache 50+ times repetitively
                        Setting::set($key, $value, [
                            'group'     => $setting?->group     ?? str($key)->before('.')->toString(),
                            'type'      => $setting?->type      ?? ($dynamicConfig['type']      ?? 'text'),
                            'is_public' => $setting?->is_public ?? ($dynamicConfig['is_public'] ?? false),
                        ], false);
                    }
                });
            });
        } catch (\Throwable $e) {
            Log::error('Settings update failed', [
                'userId' => auth()->id(),
                'error'  => $e->getMessage(),
            ]);

            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        // Clear all database settings caching once after all updates are persisted.
        Setting::clearCache();

        // Invalidate the chatbot cache once at the end of all settings updates.
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('chat_caches')) {
                DB::table('chat_caches')->delete();
            }
        } catch (\Exception $e) {
            Log::warning('Failed to invalidate chat cache during settings batch update: ' . $e->getMessage());
        }

        return response()->json(['success' => true, 'message' => 'Settings saved successfully.']);
    }

    // ─── Image upload ──────────────────────────────────────────────────────────

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|file|mimes:jpg,jpeg,png,webp,gif,svg,ico|max:4096',
            'type'  => 'required|in:logo,favicon,admin_logo,admin_favicon',
        ], [
            'image.required' => __('api.messages.upload_image_required'),
            'image.file'     => __('api.messages.upload_image_invalid'),
            'image.mimes'    => __('api.messages.upload_image_invalid_type'),
            'image.max'      => __('api.messages.upload_image_too_large'),
        ]);

        $path = $request->file('image')->store("settings/{$request->type}", 'public');
        $url  = Storage::url($path);

        $key = match ($request->type) {
            'logo'          => 'general.logo',
            'favicon'       => 'general.favicon',
            'admin_logo'    => 'general.admin_logo',
            'admin_favicon' => 'general.admin_favicon',
        };

        Setting::set($key, $url);
        Setting::clearCache();

        return response()->json([
            'success' => true,
            'data'    => ['url' => url($url)],
            'url'     => url($url),
        ]);
    }

    // ─── Public settings ───────────────────────────────────────────────────────

    public function publicSettings(): JsonResponse
    {
        $locale   = app()->getLocale();
        $cacheKey = "public_settings_{$locale}";

        $data = Cache::remember($cacheKey, 3600, function () use ($locale) {
            $settingsData = Setting::where('is_public', true)
                ->get()
                ->mapWithKeys(function (Setting $setting) use ($locale) {
                    $value = $setting->parsed_value;
                    if (is_array($value) && (isset($value['vi']) || isset($value['en']))) {
                        $value = $value[$locale] ?? '';
                    }
                    return [$setting->key => $value];
                })
                ->toArray();

            $settingsData['supported_locales'] = \App\Models\Locale::where('is_active', true)
                ->orderBy('sort_order')
                ->get(['code', 'name', 'native_name', 'flag', 'is_default'])
                ->toArray();

            $settingsData['default_locale'] = \App\Models\Locale::where('is_default', true)
                ->value('code') ?? 'vi';

            return $settingsData;
        });

        return response()->json(['data' => $data]);
    }

    // ─── Mail ──────────────────────────────────────────────────────────────────

    public function testEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'settings' => 'nullable|array',
        ]);

        try {
            if ($request->filled('settings')) {
                $this->applyMailConfig($request->settings);
            }

            Mail::raw('Hamburger King – this is a test email to verify your SMTP configuration.', function ($message) use ($request) {
                $message->to($request->email)->subject('Hamburger King – Test Email');
            });

            if ($request->filled('settings')) {
                $this->persistMailSettings($request->settings);
            }

            return response()->json(['success' => true, 'message' => 'Test email sent successfully.']);
        } catch (\Throwable $e) {
            Log::error('Test email failed', [
                'userId' => auth()->id(),
                'error'  => $e->getMessage(),
            ]);

            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    private function applyMailConfig(array $settings): void
    {
        $host = $settings['notification.smtp_host'] ?? Setting::get('notification.smtp_host');
        if (!$host) {
            throw new \RuntimeException('SMTP Host is not configured.');
        }

        $password = $settings['notification.smtp_password'] ?? null;
        if ($password === '' || $password === null) {
            $password = Setting::get('notification.smtp_password');
        }

        $driver     = $settings['notification.email_driver'] ?? Setting::get('notification.email_driver', 'smtp');
        $port       = $settings['notification.smtp_port']    ?? Setting::get('notification.smtp_port', 587);
        $username   = $settings['notification.smtp_username']  ?? Setting::get('notification.smtp_username');
        $encryption = $settings['notification.smtp_encryption'] ?? Setting::get('notification.smtp_encryption', 'tls');
        $storeEmail = $this->scalarSetting(Setting::get('general.email'));
        $adminEmail = $this->scalarSetting(Setting::get('notification.admin_email'));
        $storeName  = $this->scalarSetting(Setting::get('general.store_name')) ?: 'Hamburger King';

        Config::set([
            'mail.default'                 => $driver,
            'mail.mailers.smtp.host'       => $host,
            'mail.mailers.smtp.port'       => (int) $port,
            'mail.mailers.smtp.username'   => $username,
            'mail.mailers.smtp.password'   => $password,
            'mail.mailers.smtp.encryption' => $encryption === 'none' ? null : $encryption,
            'mail.from.address'            => $storeEmail ?: $adminEmail ?: 'hello@example.com',
            'mail.from.name'               => $storeName,
        ]);

        Mail::purge($driver);
    }

    private function persistMailSettings(array $settings): void
    {
        DB::transaction(function () use ($settings) {
            foreach (self::MAIL_SETTING_KEYS as $key) {
                if (!array_key_exists($key, $settings)) {
                    continue;
                }

                $value = $settings[$key];
                if (in_array($key, self::SENSITIVE_SETTING_KEYS, true) && ($value === '' || $value === null)) {
                    continue;
                }

                $setting = Setting::where('key', $key)->first();
                if (!$setting) {
                    continue;
                }

                Setting::set($key, $value, [
                    'group'     => $setting->group,
                    'type'      => $setting->type,
                    'is_public' => $setting->is_public,
                ]);
            }
        });

        Setting::clearCache();
    }

    // ─── Localization ──────────────────────────────────────────────────────────

    public function locales(): JsonResponse
    {
        $codes   = Setting::get('localization.languages', ['vi', 'en']);
        $default = Setting::get('localization.default_language', 'vi');

        if (!is_array($codes)) {
            $codes = ['vi', 'en'];
        }

        $locales = collect($codes)
            ->filter()
            ->unique()
            ->map(fn ($code) => $this->languageRow($code, $default))
            ->values();

        return response()->json([
            'success' => true,
            'data'    => [
                'locales'   => $locales,
                'default'   => $default,
                'available' => self::LANGUAGE_CATALOG,
            ],
        ]);
    }

    public function addLocale(Request $request): JsonResponse
    {
        $data = $request->validate(['locale' => 'required|string|max:10']);

        $code  = strtolower($data['locale']);
        $codes = Setting::get('localization.languages', ['vi', 'en']);
        $codes = is_array($codes) ? $codes : ['vi', 'en'];

        if (!in_array($code, $codes, true)) {
            $codes[] = $code;
        }

        Setting::set('localization.languages', array_values(array_unique($codes)), [
            'group' => 'localization', 'type' => 'json', 'is_public' => true,
        ]);

        if (!Setting::get('localization.default_language')) {
            Setting::set('localization.default_language', $code, [
                'group' => 'localization', 'type' => 'select', 'is_public' => true,
            ]);
        }

        return $this->locales();
    }

    public function setDefaultLocale(Request $request, string $locale): JsonResponse
    {
        $codes = Setting::get('localization.languages', ['vi', 'en']);
        $codes = is_array($codes) ? $codes : ['vi', 'en'];

        if (!in_array($locale, $codes, true)) {
            return response()->json(['success' => false, 'message' => 'Locale is not enabled.'], 422);
        }

        Setting::set('localization.default_language', $locale, [
            'group' => 'localization', 'type' => 'select', 'is_public' => true,
        ]);

        return $this->locales();
    }

    public function deleteLocale(string $locale): JsonResponse
    {
        $default = Setting::get('localization.default_language', 'vi');

        if ($locale === $default) {
            return response()->json(['success' => false, 'message' => 'Cannot delete the default locale.'], 422);
        }

        $codes = Setting::get('localization.languages', ['vi', 'en']);
        $codes = is_array($codes) ? $codes : ['vi', 'en'];
        $codes = array_values(array_filter($codes, fn ($code) => $code !== $locale));

        Setting::set('localization.languages', $codes ?: [$default], [
            'group' => 'localization', 'type' => 'json', 'is_public' => true,
        ]);

        return $this->locales();
    }

    // ─── Shipping ──────────────────────────────────────────────────────────────

    public function calculateShipping(Request $request, ShippingService $shippingService): JsonResponse
    {
        $request->validate([
            'lat'          => 'nullable|numeric',
            'lng'          => 'nullable|numeric',
            'order_amount' => 'required|numeric|min:0',
            'address'      => 'nullable|array',
        ]);

        return response()->json([
            'success' => true,
            'data'    => $shippingService->calculate(
                (float) $request->order_amount,
                $request->filled('lat') ? (float) $request->lat : null,
                $request->filled('lng') ? (float) $request->lng : null,
                $request->address
            ),
        ]);
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Safely extract a scalar string from a setting that may be stored as a
     * translatable array such as ["vi" => "...", "en" => "..."].
     */
    private function scalarSetting(mixed $value): string
    {
        if (is_array($value)) {
            $locale = app()->getLocale();
            return (string) ($value[$locale] ?? $value['vi'] ?? $value['en'] ?? reset($value) ?? '');
        }

        return (string) ($value ?? '');
    }

    private function languageRow(string $code, string $default): array
    {
        $match = collect(self::LANGUAGE_CATALOG)->firstWhere('code', $code);

        return [
            'code'       => $code,
            'name'       => $match['name'] ?? strtoupper($code),
            'is_default' => $code === $default,
        ];
    }
}
