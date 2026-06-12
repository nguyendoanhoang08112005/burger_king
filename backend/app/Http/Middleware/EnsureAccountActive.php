<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return $next($request);
        }

        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken || $accessToken->tokenable_type !== User::class) {
            return $next($request);
        }

        $user = User::withTrashed()->find($accessToken->tokenable_id);

        if ($user?->trashed()) {
            $user->tokens()->delete();

            return response()->json([
                'message' => __('api.messages.auth_account_locked'),
                'code' => 'ACCOUNT_LOCKED',
            ], 423);
        }

        return $next($request);
    }
}
