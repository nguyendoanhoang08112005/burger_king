<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = [
        'group',
        'key',
        'value',
        'type',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("setting_{$key}", 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            return $setting ? $setting->parsed_value : $default;
        });
    }

    public static function set(string $key, mixed $value, ?array $meta = null): void
    {
        $type = $meta['type'] ?? static::where('key', $key)->value('type') ?? static::inferType($value);

        static::updateOrCreate(
            ['key' => $key],
            [
                'group' => $meta['group'] ?? str($key)->before('.')->toString(),
                'value' => static::serializeValue($value, $type),
                'type' => $type,
                'is_public' => $meta['is_public'] ?? static::where('key', $key)->value('is_public') ?? false,
            ]
        );

        static::clearCache($key);
    }

    public static function getGroup(string $group): array
    {
        return Cache::remember("settings_group_{$group}", 3600, function () use ($group) {
            return static::where('group', $group)
                ->get()
                ->mapWithKeys(fn (Setting $setting) => [$setting->key => $setting->parsed_value])
                ->toArray();
        });
    }

    public static function clearCache(?string $key = null): void
    {
        if ($key) {
            Cache::forget("setting_{$key}");
            Cache::forget('settings_group_' . str($key)->before('.')->toString());
        }
        Cache::forget('settings_admin_index');
        foreach (['vi', 'en'] as $loc) {
            Cache::forget("public_settings_{$loc}");
        }
    }

    public function getParsedValueAttribute(): mixed
    {
        return match ($this->type) {
            'boolean' => filter_var($this->value, FILTER_VALIDATE_BOOLEAN),
            'number' => is_numeric($this->value) ? (float) $this->value : 0,
            'json' => json_decode($this->value ?: 'null', true),
            default => $this->value,
        };
    }

    public static function serializeValue(mixed $value, string $type): ?string
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => $value ? '1' : '0',
            'json' => is_string($value) ? $value : json_encode($value, JSON_UNESCAPED_UNICODE),
            default => (string) $value,
        };
    }

    private static function inferType(mixed $value): string
    {
        return match (true) {
            is_bool($value) => 'boolean',
            is_numeric($value) => 'number',
            is_array($value) => 'json',
            default => 'text',
        };
    }
}
