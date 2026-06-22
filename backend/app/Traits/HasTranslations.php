<?php

namespace App\Traits;

use App\Models\Translation;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasTranslations
{
    protected array $pendingTranslations = [];

    /**
     * Boot the trait.
     */
    protected static function bootHasTranslations()
    {
        static::saving(function ($model) {
            foreach ($model->translatable ?? [] as $field) {
                if (isset($model->pendingTranslations[$field])) {
                    $val = $model->pendingTranslations[$field];
                    // Save default/vi translation to the main table column
                    if (is_array($val)) {
                        $model->attributes[$field] = $val['vi'] ?? reset($val) ?? null;
                    } else {
                        $model->attributes[$field] = $val;
                    }
                }
            }
        });

        static::saved(function ($model) {
            if (!empty($model->pendingTranslations)) {
                foreach ($model->pendingTranslations as $field => $value) {
                    if (is_array($value)) {
                        $model->setTranslations($field, $value);
                    } elseif ($value !== null) {
                        $locale = app()->getLocale();
                        $model->setTranslation($field, $locale, (string) $value);
                    }
                }
                // Clear pending translations
                $model->pendingTranslations = [];
            }
        });
    }

    /**
     * Lấy bản dịch 1 field
     */
    public function getTranslation(string $field, string $locale = null): ?string
    {
        $locale = $locale ?? app()->getLocale();

        // Tìm trong translations đã load
        if ($this->relationLoaded('translations')) {
            $translation = $this->translations
                ->where('locale', $locale)
                ->where('field', $field)
                ->first();

            if ($translation) {
                return $translation->value;
            }
        } else {
            // Query thẳng nếu chưa load
            $translation = Translation::where([
                'translatable_type' => static::class,
                'translatable_id'   => $this->id,
                'locale'            => $locale,
                'field'             => $field,
            ])->value('value');

            if ($translation) {
                return $translation;
            }
        }

        // Fallback về vi
        if ($locale !== 'vi') {
            return $this->getTranslation($field, 'vi');
        }

        // Fallback về attribute gốc nếu có (trong trường hợp cột vẫn còn)
        return $this->attributes[$field] ?? null;
    }

    /**
     * Lấy tất cả translations của 1 field
     */
    public function getTranslations(string $field): array
    {
        $result = ['vi' => null, 'en' => null];

        if ($this->relationLoaded('translations')) {
            foreach ($this->translations as $t) {
                if ($t->field === $field) {
                    $result[$t->locale] = $t->value;
                }
            }
        } else {
            $rows = Translation::where([
                'translatable_type' => static::class,
                'translatable_id'   => $this->id,
                'field'             => $field,
            ])->get();

            foreach ($rows as $t) {
                $result[$t->locale] = $t->value;
            }
        }

        // Ensure default/vi fallback from main table if not present in translation table
        if (empty($result['vi']) && !empty($this->attributes[$field])) {
            $result['vi'] = $this->attributes[$field];
        }

        return $result;
    }

    /**
     * Lưu translations từ array
     */
    public function setTranslations(string $field, array $data): void
    {
        foreach ($data as $locale => $value) {
            if ($value === null) {
                Translation::where([
                    'translatable_type' => static::class,
                    'translatable_id'   => $this->id,
                    'locale'            => $locale,
                    'field'             => $field,
                ])->delete();
            } else {
                Translation::updateOrCreate(
                    [
                        'translatable_type' => static::class,
                        'translatable_id'   => $this->id,
                        'locale'            => $locale,
                        'field'             => $field,
                    ],
                    ['value' => $value]
                );
            }
        }
    }

    /**
     * Lưu 1 locale
     */
    public function setTranslation(string $field, string $locale, string $value): void
    {
        Translation::updateOrCreate(
            [
                'translatable_type' => static::class,
                'translatable_id'   => $this->id,
                'locale'            => $locale,
                'field'             => $field,
            ],
            ['value' => $value]
        );
    }

    /**
     * Relationship morphMany
     */
    public function translations(): MorphMany
    {
        return $this->morphMany(Translation::class, 'translatable');
    }

    /**
     * Check có bản dịch locale không
     */
    public function hasTranslation(string $locale, string $field = 'name'): bool
    {
        return $this->translations()
            ->where('locale', $locale)
            ->where('field', $field)
            ->whereNotNull('value')
            ->where('value', '!=', '')
            ->exists();
    }

    /**
     * Magic getter
     */
    public function getAttribute($key)
    {
        if (in_array($key, $this->translatable ?? [])) {
            if (isset($this->pendingTranslations[$key])) {
                $pending = $this->pendingTranslations[$key];
                if (is_array($pending)) {
                    $locale = app()->getLocale();
                    return $pending[$locale] ?? $pending['vi'] ?? null;
                }
                return $pending;
            }
            return $this->getTranslation($key);
        }
        return parent::getAttribute($key);
    }

    /**
     * Magic setter
     */
    public function setAttribute($key, $value)
    {
        if (in_array($key, $this->translatable ?? [])) {
            $this->pendingTranslations[$key] = $value;
            return $this;
        }
        return parent::setAttribute($key, $value);
    }

    /**
     * Override toArray to handle translations serialization
     */
    public function toArray()
    {
        $attributes = parent::toArray();
        $isAdmin = request()->is('api/admin/*') || request()->is('admin/*') || request()->header('X-Admin-Request');

        if ($isAdmin) {
            $translations = [];
            $activeLocales = \Illuminate\Support\Facades\Cache::remember('active_locale_codes', 3600, function () {
                try {
                    if (\Illuminate\Support\Facades\Schema::hasTable('locales')) {
                        return \App\Models\Locale::where('is_active', true)->pluck('code')->toArray();
                    }
                } catch (\Throwable $e) {}
                return ['vi', 'en'];
            });
            foreach ($this->translatable as $field) {
                $transMap = $this->getTranslations($field);
                $attributes[$field] = $transMap;
                $translations[$field] = $transMap;

                foreach ($activeLocales as $loc) {
                    $attributes[$field . '_' . $loc] = $transMap[$loc] ?? null;
                }
            }
            $attributes['translations'] = $translations;
        } else {
            $locale = app()->getLocale();
            foreach ($this->translatable as $field) {
                $attributes[$field] = $this->getTranslation($field, $locale);
            }
        }

        return $attributes;
    }
}
