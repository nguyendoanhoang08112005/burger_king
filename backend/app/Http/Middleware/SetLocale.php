<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = 'vi'; // default

        // 1. Check query parameter e.g., ?lang=en
        if ($request->has('lang')) {
            $locale = $request->query('lang');
        } 
        // 2. Check Accept-Language header
        elseif ($request->hasHeader('Accept-Language')) {
            $acceptLanguage = $request->header('Accept-Language');
            // Extract the first locale code (e.g. en, vi)
            $locales = explode(',', $acceptLanguage);
            if (!empty($locales[0])) {
                $locale = strtolower(trim(substr($locales[0], 0, 2)));
            }
        }

        // Validate locale is either 'vi' or 'en'
        if (in_array($locale, ['vi', 'en'])) {
            app()->setLocale($locale);
        } else {
            app()->setLocale('vi');
        }

        return $next($request);
    }
}
