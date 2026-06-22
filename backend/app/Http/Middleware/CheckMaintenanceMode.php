<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Setting;

class CheckMaintenanceMode
{
    public function handle(Request $request, Closure $next): Response
    {
        $maintenanceMode = Setting::get('general.maintenance_mode', false);

        if ($maintenanceMode) {
            $bypass = $request->is('api/admin/*') || 
                      $request->is('admin/*') || 
                      $request->is('api/settings/public') || 
                      $request->is('settings/public') || 
                      $request->is('api/locales/*') || 
                      $request->is('locales/*') || 
                      $request->is('up') || 
                      $request->is('api/up');

            if (!$bypass) {
                $message = Setting::get('general.maintenance_message');
                $locale = app()->getLocale();
                $messageText = 'Website đang bảo trì, vui lòng quay lại sau.';
                if ($message) {
                    if (is_array($message)) {
                        $messageText = $message[$locale] ?? ($message['vi'] ?? ($message['en'] ?? 'Website đang bảo trì.'));
                    } elseif (is_string($message)) {
                        $decoded = json_decode($message, true);
                        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                            $messageText = $decoded[$locale] ?? ($decoded['vi'] ?? ($decoded['en'] ?? 'Website đang bảo trì.'));
                        } else {
                            $messageText = $message;
                        }
                    }
                }

                return response()->json([
                    'maintenance' => true,
                    'message' => $messageText,
                ], 503);
            }
        }

        return $next($request);
    }
}
