<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentPlugin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PaymentPluginController extends Controller
{
    public function activePlugins()
    {
        $plugins = Cache::remember('active_payment_plugins', 600, function () {
            return PaymentPlugin::where('is_active', true)
                ->orderBy('sort_order')
                ->get(['key', 'name', 'description', 'icon'])
                ->toArray();
        });

        $translatedPlugins = array_map(function ($plugin) {
            $nameKey = "api.payments.{$plugin['key']}_name";
            $descKey = "api.payments.{$plugin['key']}_description";
            if (\Illuminate\Support\Facades\Lang::has($nameKey)) {
                $plugin['name'] = __($nameKey);
            }
            if (\Illuminate\Support\Facades\Lang::has($descKey)) {
                $plugin['description'] = __($descKey);
            }
            return $plugin;
        }, $plugins);

        return response()->json([
            'data' => array_merge($this->defaultMethods(), $translatedPlugins),
        ]);
    }

    public function index()
    {
        $plugins = PaymentPlugin::orderBy('sort_order')->get()->map(function (PaymentPlugin $plugin) {
            $plugin->config = $this->maskConfig($plugin->config ?? []);

            $nameKey = "api.payments.{$plugin->key}_name";
            $descKey = "api.payments.{$plugin->key}_description";
            if (\Illuminate\Support\Facades\Lang::has($nameKey)) {
                $plugin->name = __($nameKey);
            }
            if (\Illuminate\Support\Facades\Lang::has($descKey)) {
                $plugin->description = __($descKey);
            }

            return $plugin;
        });

        return response()->json([
            'data' => array_merge($this->defaultAdminMethods(), $plugins->toArray()),
        ]);
    }

    public function toggle(string $key)
    {
        $plugin = PaymentPlugin::where('key', $key)->firstOrFail();
        $plugin->update(['is_active' => !$plugin->is_active]);
        Cache::forget('active_payment_plugins');

        return response()->json([
            'data' => $plugin,
            'message' => $plugin->is_active
                ? __('api.messages.payment_plugin_enabled', ['name' => $plugin->name])
                : __('api.messages.payment_plugin_disabled', ['name' => $plugin->name]),
        ]);
    }

    public function updateConfig(Request $request, string $key)
    {
        $plugin = PaymentPlugin::where('key', $key)->firstOrFail();
        $payload = $request->validate([
            'config' => 'required|array',
        ]);

        $incoming = collect($payload['config'])
            ->reject(fn ($value) => is_string($value) && str_contains($value, '•'))
            ->toArray();

        $plugin->update([
            'config' => array_merge($plugin->config ?? [], $incoming),
        ]);

        Cache::forget('active_payment_plugins');

        return response()->json([
            'data' => $plugin,
            'message' => __('api.messages.payment_config_saved'),
        ]);
    }

    private function defaultMethods(): array
    {
        return [
            [
                'key' => 'cod',
                'name' => __('api.payments.cod_name'),
                'description' => __('api.payments.cod_description'),
                'icon' => 'cod',
                'is_default' => true,
            ],
            [
                'key' => 'loyalty_points',
                'name' => __('api.payments.loyalty_name'),
                'description' => __('api.payments.loyalty_description'),
                'icon' => 'loyalty',
                'is_default' => true,
            ],
        ];
    }

    private function defaultAdminMethods(): array
    {
        return [
            [
                'key' => 'cod',
                'name' => 'COD',
                'description' => __('api.payments.default_description'),
                'icon' => 'cod',
                'is_active' => true,
                'is_default' => true,
            ],
            [
                'key' => 'loyalty_points',
                'name' => __('api.payments.loyalty_admin_name'),
                'description' => __('api.payments.default_description'),
                'icon' => 'loyalty',
                'is_active' => true,
                'is_default' => true,
            ],
        ];
    }

    private function maskConfig(array $config): array
    {
        return collect($config)->mapWithKeys(function ($value, $key) {
            $sensitive = str_contains(strtolower($key), 'secret')
                || str_contains(strtolower($key), 'key')
                || str_contains(strtolower($key), 'token');

            if (!$sensitive || !$value) {
                return [$key => $value];
            }

            $value = (string) $value;
            return [$key => substr($value, 0, 4) . str_repeat('•', max(0, strlen($value) - 4))];
        })->toArray();
    }
}
