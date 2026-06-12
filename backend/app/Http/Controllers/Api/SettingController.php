<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\ShippingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
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

    public function index()
    {
        $settings = Cache::remember('settings_admin_index', 3600, function () {
            return Setting::orderBy('group')
                ->orderBy('key')
                ->get()
                ->groupBy('group')
                ->map(fn ($group) => $group->mapWithKeys(
                    fn (Setting $setting) => [str($setting->key)->after('.')->toString() => $setting->parsed_value]
                ));
        });

        return response()->json(['success' => true, 'data' => $settings]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
        ]);

        $dynamicSettings = [
            'general.branch_id' => ['type' => 'number', 'is_public' => false],
            'general.logo_width' => ['type' => 'number', 'is_public' => true],
            'general.logo_height' => ['type' => 'number', 'is_public' => true],
            'general.favicon_width' => ['type' => 'number', 'is_public' => true],
            'general.favicon_height' => ['type' => 'number', 'is_public' => true],
        ];

        DB::transaction(function () use ($request, $dynamicSettings) {
            foreach ($request->settings as $key => $value) {
                $setting = Setting::where('key', $key)->first();
                if (!$setting && !array_key_exists($key, $dynamicSettings)) {
                    continue;
                }

                $dynamicConfig = $dynamicSettings[$key] ?? [];
                Setting::set($key, $value, [
                    'group' => $setting?->group ?? str($key)->before('.')->toString(),
                    'type' => $setting?->type ?? ($dynamicConfig['type'] ?? 'text'),
                    'is_public' => $setting?->is_public ?? ($dynamicConfig['is_public'] ?? false),
                ]);
            }
        });

        Cache::forget('settings_admin_index');
        foreach (['vi', 'en'] as $loc) {
            Cache::forget("public_settings_{$loc}");
        }

        return response()->json([
            'success' => true,
            'message' => 'Da luu cai dat thanh cong!',
        ]);
    }

    public function locales()
    {
        $codes = Setting::get('localization.languages', ['vi', 'en']);
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
            'data' => [
                'locales' => $locales,
                'default' => $default,
                'available' => self::LANGUAGE_CATALOG,
            ],
        ]);
    }

    public function addLocale(Request $request)
    {
        $data = $request->validate([
            'locale' => 'required|string|max:10',
        ]);

        $code = strtolower($data['locale']);
        $codes = Setting::get('localization.languages', ['vi', 'en']);
        $codes = is_array($codes) ? $codes : ['vi', 'en'];

        if (!in_array($code, $codes, true)) {
            $codes[] = $code;
        }

        Setting::set('localization.languages', array_values(array_unique($codes)), [
            'group' => 'localization',
            'type' => 'json',
            'is_public' => true,
        ]);

        if (!Setting::get('localization.default_language')) {
            Setting::set('localization.default_language', $code, [
                'group' => 'localization',
                'type' => 'select',
                'is_public' => true,
            ]);
        }

        return $this->locales();
    }

    public function setDefaultLocale(Request $request, string $locale)
    {
        $codes = Setting::get('localization.languages', ['vi', 'en']);
        $codes = is_array($codes) ? $codes : ['vi', 'en'];

        if (!in_array($locale, $codes, true)) {
            return response()->json(['success' => false, 'message' => 'Locale is not enabled.'], 422);
        }

        Setting::set('localization.default_language', $locale, [
            'group' => 'localization',
            'type' => 'select',
            'is_public' => true,
        ]);

        return $this->locales();
    }

    public function deleteLocale(string $locale)
    {
        $default = Setting::get('localization.default_language', 'vi');
        if ($locale === $default) {
            return response()->json(['success' => false, 'message' => 'Cannot delete the default locale.'], 422);
        }

        $codes = Setting::get('localization.languages', ['vi', 'en']);
        $codes = is_array($codes) ? $codes : ['vi', 'en'];
        $codes = array_values(array_filter($codes, fn ($code) => $code !== $locale));

        if (!$codes) {
            $codes = [$default];
        }

        Setting::set('localization.languages', $codes, [
            'group' => 'localization',
            'type' => 'json',
            'is_public' => true,
        ]);

        return $this->locales();
    }

    private function languageRow(string $code, string $default): array
    {
        $match = collect(self::LANGUAGE_CATALOG)->firstWhere('code', $code);

        return [
            'code' => $code,
            'name' => $match['name'] ?? strtoupper($code),
            'is_default' => $code === $default,
        ];
    }

    public function publicSettings()
    {
        $locale = app()->getLocale();
        $cacheKey = "public_settings_{$locale}";

        $data = Cache::remember($cacheKey, 3600, function () use ($locale) {
            return Setting::where('is_public', true)
                ->get()
                ->mapWithKeys(function (Setting $setting) use ($locale) {
                    $value = $setting->parsed_value;
                    if (is_array($value) && (isset($value['vi']) || isset($value['en']))) {
                        $value = $value[$locale] ?? $value['vi'] ?? reset($value) ?? '';
                    }
                    return [$setting->key => $value];
                })
                ->toArray();
        });

        return response()->json(['data' => $data]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|file|mimes:jpg,jpeg,png,webp,gif,svg,ico|max:4096',
            'type' => 'required|in:logo,favicon',
        ], [
            'image.required' => __('api.messages.upload_image_required'),
            'image.file' => __('api.messages.upload_image_invalid'),
            'image.mimes' => __('api.messages.upload_image_invalid_type'),
            'image.max' => __('api.messages.upload_image_too_large'),
        ]);

        $path = $request->file('image')->store("settings/{$request->type}", 'public');
        $url = Storage::url($path);

        $key = match ($request->type) {
            'logo' => 'general.logo',
            'favicon' => 'general.favicon',
        };

        Setting::set($key, $url);
        Cache::forget('settings_admin_index');
        foreach (['vi', 'en'] as $loc) {
            Cache::forget("public_settings_{$loc}");
        }

        return response()->json([
            'success' => true,
            'data' => ['url' => url($url)],
            'url' => url($url),
        ]);
    }

    public function testEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        try {
            Mail::raw('Hamburger King test email.', function ($message) use ($request) {
                $message->to($request->email)->subject('Hamburger King test email');
            });

            return response()->json(['success' => true, 'message' => 'Email test da duoc gui!']);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function calculateShipping(Request $request, ShippingService $shippingService)
    {
        $request->validate([
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'order_amount' => 'required|numeric|min:0',
            'address' => 'nullable|array',
        ]);

        return response()->json([
            'success' => true,
            'data' => $shippingService->calculate(
                (float) $request->order_amount,
                $request->filled('lat') ? (float) $request->lat : null,
                $request->filled('lng') ? (float) $request->lng : null,
                $request->address
            ),
        ]);
    }
}
