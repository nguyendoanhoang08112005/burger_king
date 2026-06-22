<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminPermission
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || (!$user->isAdmin() && !$user->isStaff())) {
            abort(403, __('api.messages.unauthorized'));
        }

        if ($user->isAdmin()) {
            return $next($request);
        }

        $segment = $request->segment(3);
        $module = match ($segment) {
            'dashboard' => 'dashboard',
            'translations' => 'languages',
            'payment-plugins' => 'payments',
            'upload' => 'products',
            default => $segment,
        };

        $hasPermission = $module && $user->can("access.{$module}");
        if ($module === 'dashboard' && $request->is('api/admin/dashboard/revenue-chart') && $user->can('access.reports')) {
            $hasPermission = true;
        }
        if ($request->isMethod('GET')) {
            $hasPermission = $hasPermission
                || ($module === 'products' && $user->can('access.combos'))
                || ($module === 'categories' && ($user->can('access.products') || $user->can('access.toppings')))
                || ($module === 'users' && $user->can('access.loyalty'))
                || ($module === 'orders' && $user->can('access.dashboard'));
        }

        if (!$hasPermission) {
            abort(403, __('api.messages.unauthorized'));
        }

        return $next($request);
    }
}
