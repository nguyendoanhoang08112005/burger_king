<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Locale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LocaleController extends Controller
{
    /**
     * Display a listing of the active locales and available options.
     */
    public function index(): JsonResponse
    {
        $this->ensureDefaultLocalesExist();

        $locales = Locale::orderBy('sort_order')->get();
        $configLanguages = config('languages', []);

        $active = $locales->map(function (Locale $locale) {
            return [
                'id'          => $locale->id,
                'code'        => $locale->code,
                'name'        => $locale->name,
                'native_name' => $locale->native_name,
                'flag'        => $locale->flag,
                'is_active'   => $locale->is_active,
                'is_default'  => $locale->is_default,
                'sort_order'  => $locale->sort_order,
                'progress'    => $this->getLocaleProgress($locale->code),
            ];
        });

        $activeCodes = $locales->pluck('code')->toArray();
        $available = [];

        foreach ($configLanguages as $code => $info) {
            if (!in_array($code, $activeCodes, true)) {
                $available[] = [
                    'code'        => $code,
                    'name'        => $info['name'],
                    'native_name' => $info['native'],
                    'flag'        => $info['flag'],
                ];
            }
        }

        return response()->json([
            'active'    => $active,
            'available' => $available,
            'success'   => true,
            'data'      => [
                'locales'   => $active,
                'available' => $available,
                'active'    => $active,
            ]
        ]);
    }

    /**
     * Store a newly created locale in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $code = strtolower($request->input('code'));
        $configLanguages = config('languages', []);

        if (!array_key_exists($code, $configLanguages)) {
            return response()->json([
                'message' => 'Ngôn ngữ không được hỗ trợ trong hệ thống.'
            ], 422);
        }

        if (Locale::where('code', $code)->exists()) {
            return response()->json([
                'message' => 'Ngôn ngữ này đã được thêm từ trước.'
            ], 422);
        }

        $info = $configLanguages[$code];
        
        $maxSort = Locale::max('sort_order') ?? 0;

        $locale = Locale::create([
            'code'        => $code,
            'name'        => $info['name'],
            'native_name' => $info['native'],
            'flag'        => $info['flag'],
            'is_active'   => true,
            'is_default'  => false,
            'sort_order'  => $maxSort + 1,
        ]);

        $this->ensureDefaultLocalesExist();
        $this->createTranslationFile($code);

        // Clear settings cache
        Cache::forget("public_settings_vi");
        Cache::forget("public_settings_en");
        Cache::forget("public_settings_{$code}");

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm ngôn ngữ thành công!',
            'locale'  => $locale,
        ]);
    }

    /**
     * Set a locale as default.
     */
    public function setDefault(string $code): JsonResponse
    {
        $locale = Locale::where('code', $code)->firstOrFail();

        Locale::query()->update(['is_default' => false]);
        $locale->update(['is_default' => true]);

        // Clear settings and localization cache
        $this->clearAllLocaleCache();

        return response()->json([
            'success' => true,
            'message' => "Đã đặt {$locale->name} làm ngôn ngữ mặc định!",
            'default' => $code,
        ]);
    }

    /**
     * Remove the specified locale from storage.
     */
    public function destroy(string $code): JsonResponse
    {
        $locale = Locale::where('code', $code)->firstOrFail();

        if ($locale->is_default || $code === 'vi') {
            return response()->json([
                'message' => 'Không thể xóa ngôn ngữ mặc định'
            ], 403);
        }

        $locale->delete();

        // Optional: delete json file
        $filePath = public_path("locales/{$code}/translation.json");
        if (file_exists($filePath)) {
            @unlink($filePath);
            @rmdir(public_path("locales/{$code}"));
        }

        $this->clearAllLocaleCache();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa ngôn ngữ thành công!',
        ]);
    }

    /**
     * Get translations for a specific locale.
     */
    public function getTranslations(string $code)
    {
        $this->ensureDefaultLocalesExist();

        // Get system default locale
        $defaultLocale = Locale::where('is_default', true)->first();
        if (!$defaultLocale) {
            $defaultLocale = Locale::where('code', 'vi')->first() ?? Locale::first();
        }

        $defaultCode = $defaultLocale ? $defaultLocale->code : 'vi';
        $defaultName = $defaultLocale ? $defaultLocale->name : 'Tiếng Việt';
        $defaultFlag = $defaultLocale ? $defaultLocale->flag : '🇻🇳';

        $filePath = public_path("locales/{$code}/translation.json");
        $sourcePath = public_path("locales/{$defaultCode}/translation.json");

        $translations = [];
        if (file_exists($filePath)) {
            $translations = json_decode(file_get_contents($filePath), true) ?? [];
        }

        $sourceTranslations = [];
        if (file_exists($sourcePath)) {
            $sourceTranslations = json_decode(file_get_contents($sourcePath), true) ?? [];
        } else {
            // Fallback to vi if default locale file doesn't exist
            $viPath = public_path("locales/vi/translation.json");
            if (file_exists($viPath)) {
                $sourceTranslations = json_decode(file_get_contents($viPath), true) ?? [];
                $defaultCode = 'vi';
                $defaultName = 'Tiếng Việt';
                $defaultFlag = '🇻🇳';
            }
        }

        $flatTranslations = $this->flattenKeys($translations);
        $flatSourceTranslations = $this->flattenKeys($sourceTranslations);

        return response()->json([
            'data' => [
                'code'                => $code,
                'translations'        => $flatTranslations,
                'source_code'         => $defaultCode,
                'source_name'         => $defaultName,
                'source_flag'         => $defaultFlag,
                'source_translations' => $flatSourceTranslations,
                // Maintain backward compatibility
                'source_vi'           => $flatSourceTranslations,
                'progress'            => $this->calcProgress($flatTranslations, $flatSourceTranslations),
            ]
        ]);
    }

    /**
     * Update translations for a specific locale.
     */
    public function updateTranslations(Request $request, string $code): JsonResponse
    {
        if ($code === 'vi') {
            return response()->json([
                'message' => 'Không thể sửa ngôn ngữ mặc định qua đây'
            ], 403);
        }

        Locale::where('code', $code)->firstOrFail();

        $filePath = public_path("locales/{$code}/translation.json");

        $current = [];
        if (file_exists($filePath)) {
            $current = json_decode(file_get_contents($filePath), true) ?? [];
        }

        $translations = $request->input('translations', []);
        $merged = $this->array_merge_recursive_distinct($current, $translations);

        $path = dirname($filePath);
        if (!is_dir($path)) {
            mkdir($path, 0755, true);
        }

        file_put_contents(
            $filePath,
            json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );

        // Clear i18n caches
        Cache::forget("translations_{$code}");
        $this->clearAllLocaleCache();

        return response()->json([
            'message' => 'Đã lưu bản dịch!',
            'locale'  => $code,
        ]);
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Ensure vi and en translation files exist in backend/public/locales.
     */
    private function ensureDefaultLocalesExist(): void
    {
        $backendPath = public_path('locales');
        $frontendPath = base_path('../frontend/public/locales');

        foreach (['vi', 'en'] as $lang) {
            $backendFile = "{$backendPath}/{$lang}/translation.json";
            if (!file_exists($backendFile)) {
                $frontendFile = "{$frontendPath}/{$lang}/translation.json";
                if (file_exists($frontendFile)) {
                    if (!is_dir("{$backendPath}/{$lang}")) {
                        mkdir("{$backendPath}/{$lang}", 0755, true);
                    }
                    copy($frontendFile, $backendFile);
                } else {
                    if (!is_dir("{$backendPath}/{$lang}")) {
                        mkdir("{$backendPath}/{$lang}", 0755, true);
                    }
                    file_put_contents($backendFile, json_encode([], JSON_PRETTY_PRINT));
                }
            }
        }
    }

    /**
     * Create blank translation file using EN (or VI) as template.
     */
    private function createTranslationFile(string $code): void
    {
        $path = public_path("locales/{$code}");

        if (!is_dir($path)) {
            mkdir($path, 0755, true);
        }

        $filePath = "{$path}/translation.json";

        if (file_exists($filePath)) {
            return;
        }

        $enFile = public_path('locales/en/translation.json');
        if (file_exists($enFile)) {
            $enContent = json_decode(file_get_contents($enFile), true);
            $template = $enContent;
        } else {
            $viFile = public_path('locales/vi/translation.json');
            $viContent = json_decode(file_get_contents($viFile), true);
            $template = $viContent;
        }

        file_put_contents(
            $filePath,
            json_encode($template, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );
    }

    /**
     * Recursively set all array values to empty string.
     */
    private function emptyValues(array $data): array
    {
        $result = [];
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $result[$key] = $this->emptyValues($value);
            } else {
                $result[$key] = '';
            }
        }
        return $result;
    }

    /**
     * Flatten nested array to dot notation.
     */
    private function flattenKeys(array $data, string $prefix = ''): array
    {
        $result = [];
        foreach ($data as $key => $value) {
            $fullKey = $prefix ? "{$prefix}.{$key}" : $key;
            if (is_array($value)) {
                $result = array_merge(
                    $result,
                    $this->flattenKeys($value, $fullKey)
                );
            } else {
                $result[$fullKey] = $value;
            }
        }
        return $result;
    }

    /**
     * Calculate translation progress percentage.
     */
    private function calcProgress(array $flatTranslations, array $flatSource): int
    {
        if (empty($flatSource)) {
            return 0;
        }

        $translated = count(array_filter(
            $flatSource,
            fn($key) => !empty($flatTranslations[$key]),
            ARRAY_FILTER_USE_KEY
        ));

        return (int) round(($translated / count($flatSource)) * 100);
    }

    /**
     * Calculate overall locale progress for list API.
     */
    private function getLocaleProgress(string $code): int
    {
        if ($code === 'vi') {
            return 100;
        }

        $filePath = public_path("locales/{$code}/translation.json");
        $viPath = public_path("locales/vi/translation.json");

        if (!file_exists($viPath)) {
            return 0;
        }

        $viContent = json_decode(@file_get_contents($viPath), true) ?? [];
        $viFlat = $this->flattenKeys($viContent);

        if (empty($viFlat)) {
            return 100;
        }

        if (!file_exists($filePath)) {
            return 0;
        }

        $currentContent = json_decode(@file_get_contents($filePath), true) ?? [];
        $currentFlat = $this->flattenKeys($currentContent);

        return $this->calcProgress($currentFlat, $viFlat);
    }

    /**
     * Recursively merge two arrays, distinct.
     */
    private function array_merge_recursive_distinct(array &$array1, array &$array2): array
    {
        $merged = $array1;
        foreach ($array2 as $key => &$value) {
            if (is_array($value) && isset($merged[$key]) && is_array($merged[$key])) {
                $merged[$key] = $this->array_merge_recursive_distinct($merged[$key], $value);
            } else {
                $merged[$key] = $value;
            }
        }
        return $merged;
    }

    /**
     * Clear settings cache for all languages.
     */
    private function clearAllLocaleCache(): void
    {
        $locales = Locale::pluck('code')->toArray();
        foreach ($locales as $code) {
            Cache::forget("public_settings_{$code}");
        }
        Cache::forget("public_settings_vi");
        Cache::forget("public_settings_en");
        
        // Also clear settings_admin_index cache to sync UI settings
        Cache::forget('settings_admin_index');
    }

    /**
     * Serve public translation file, with fallback mechanisms.
     */
    public function servePublicTranslation(string $locale, string $ns): JsonResponse
    {
        $this->ensureDefaultLocalesExist();
        
        $filePath = public_path("locales/{$locale}/{$ns}.json");
        if (!file_exists($filePath)) {
            // Fallback to en
            $filePath = public_path("locales/en/{$ns}.json");
            if (!file_exists($filePath)) {
                // Fallback to vi
                $filePath = public_path("locales/vi/{$ns}.json");
            }
        }

        $content = [];
        if (file_exists($filePath)) {
            $content = json_decode(@file_get_contents($filePath), true) ?? [];
        }

        return response()->json($content);
    }
}
