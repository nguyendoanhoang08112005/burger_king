<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'customer',
        ]);

        $user->assignRole('customer');

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => __('api.messages.auth_registered'),
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => array_merge($user->toArray(), [
                'loyalty_balance' => $user->loyalty_balance,
                'permissions' => $user->adminPermissions(),
            ]),
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::withTrashed()->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('api.messages.auth_invalid')],
            ]);
        }

        if ($user->trashed()) {
            return response()->json([
                'message' => __('api.messages.auth_account_locked'),
                'code' => 'ACCOUNT_LOCKED',
            ], 423);
        }

        // Revoke old tokens
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => __('api.messages.auth_login'),
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => array_merge($user->toArray(), [
                'loyalty_balance' => $user->loyalty_balance,
                'permissions' => $user->adminPermissions(),
            ]),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => __('api.messages.auth_logout'),
        ]);
    }

    public function profile(Request $request)
    {
        $user = $request->user();
        return response()->json(array_merge($user->toArray(), [
            'loyalty_balance' => $user->loyalty_balance,
            'addresses' => $user->addresses,
            'permissions' => $user->adminPermissions(),
        ]));
    }

    public function updateProfile(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $user = $request->user();
        $user->update($data);
        $user->refresh();

        return response()->json([
            'message' => __('api.messages.profile_updated'),
            'user' => array_merge($user->toArray(), [
                'loyalty_balance' => $user->loyalty_balance,
                'addresses' => $user->addresses,
                'permissions' => $user->adminPermissions(),
            ]),
        ]);
    }

    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => [__('api.messages.current_password_invalid')],
            ]);
        }

        $user->update([
            'password' => Hash::make($data['password']),
        ]);

        return response()->json([
            'message' => __('api.messages.password_changed'),
        ]);
    }
}
