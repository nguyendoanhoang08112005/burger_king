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

        DB::transaction(function () use ($request) {
            foreach ($request->settings as $key => $value) {
                $setting = Setting::where('key', $key)->first();
                if (!$setting) {
                    continue;
                }

                Setting::set($key, $value, [
                    'group' => $setting->group,
                    'type' => $setting->type,
                    'is_public' => $setting->is_public,
                ]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Da luu cai dat thanh cong!',
        ]);
    }

    public function publicSettings()
    {
        $data = Cache::remember('public_settings', 3600, function () {
            return Setting::where('is_public', true)
                ->get()
                ->mapWithKeys(fn (Setting $setting) => [$setting->key => $setting->parsed_value]);
        });

        return response()->json(['data' => $data]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:4096',
            'type' => 'required|in:logo,favicon,hero,og',
        ]);

        $path = $request->file('image')->store("settings/{$request->type}", 'public');
        $url = Storage::url($path);

        $key = match ($request->type) {
            'logo' => 'general.logo',
            'favicon' => 'general.favicon',
            'hero' => 'appearance.hero_image',
            'og' => 'appearance.og_image',
        };

        Setting::set($key, $url);

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
        ]);

        return response()->json([
            'success' => true,
            'data' => $shippingService->calculate(
                (float) $request->order_amount,
                $request->filled('lat') ? (float) $request->lat : null,
                $request->filled('lng') ? (float) $request->lng : null
            ),
        ]);
    }
}
