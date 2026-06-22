<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;

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

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email|exists:users,email',
        ]);

        $otp = (string) mt_rand(100000, 999999);

        // Save OTP
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => \Illuminate\Support\Facades\Hash::make($otp),
                'created_at' => now(),
            ]
        );

        // Send Email
        \Illuminate\Support\Facades\Mail::raw(
            "Mã xác minh đặt lại mật khẩu Hamburger King của bạn là: {$otp}.\n" .
            "Mã này có hiệu lực trong vòng 15 phút.\n\n" .
            "Your Hamburger King password reset verification code is: {$otp}.\n" .
            "This code is valid for 15 minutes.",
            function ($message) use ($request) {
                $message->to($request->email)
                        ->subject('[Hamburger King] Mã xác minh đặt lại mật khẩu / Password Reset Code');
            }
        );

        return response()->json([
            'success' => true,
            'message' => __('api.messages.forgot_password_sent'),
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email|exists:users,email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            throw ValidationException::withMessages([
                'code' => [__('api.messages.otp_invalid_or_expired')],
            ]);
        }

        // Check expiry (15 mins)
        $expiryTime = \Carbon\Carbon::parse($record->created_at)->addMinutes(15);
        if ($expiryTime->isPast()) {
            \Illuminate\Support\Facades\DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->delete();
            throw ValidationException::withMessages([
                'code' => [__('api.messages.otp_expired_new_required')],
            ]);
        }

        // Verify OTP code
        if (!\Illuminate\Support\Facades\Hash::check($request->code, $record->token)) {
            throw ValidationException::withMessages([
                'code' => [__('api.messages.otp_incorrect')],
            ]);
        }

        // Update password
        $user = User::where('email', $request->email)->firstOrFail();
        $user->update([
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
        ]);

        // Clean up token
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => __('api.messages.reset_password_success'),
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|file|image|mimes:jpg,jpeg,png,webp,gif|max:2048',
        ], [
            'avatar.required' => __('api.messages.upload_image_required') ?? 'Please select an image file.',
            'avatar.image' => __('api.messages.upload_image_invalid') ?? 'The uploaded file is not a valid image.',
            'avatar.mimes' => __('api.messages.upload_image_invalid_type') ?? 'Unsupported image format.',
            'avatar.max' => __('api.messages.upload_image_too_large') ?? 'The image must not be larger than 2MB.',
        ]);

        $user = $request->user();

        if ($user->avatar) {
            $oldPath = str_replace(Storage::url(''), '', $user->avatar);
            Storage::disk('public')->delete($oldPath);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $url = Storage::url($path);

        $user->update(['avatar' => $url]);

        return response()->json([
            'success' => true,
            'message' => __('api.messages.avatar_updated') ?? 'Avatar updated successfully!',
            'avatar_url' => url($url),
            'user' => array_merge($user->toArray(), [
                'loyalty_balance' => $user->loyalty_balance,
                'addresses' => $user->addresses,
                'permissions' => $user->adminPermissions(),
            ]),
        ]);
    }
}
