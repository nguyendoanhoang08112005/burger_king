<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AccountLockTest extends TestCase
{
    use RefreshDatabase;

    public function test_locked_account_receives_a_specific_login_error(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
        ]);
        $user->delete();

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ])
            ->assertStatus(423)
            ->assertJson(['code' => 'ACCOUNT_LOCKED']);
    }

    public function test_existing_token_is_rejected_and_revoked_after_account_is_locked(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;
        $user->delete();

        $this->withToken($token)
            ->getJson('/api/profile')
            ->assertStatus(423)
            ->assertJson(['code' => 'ACCOUNT_LOCKED']);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_type' => User::class,
            'tokenable_id' => $user->id,
        ]);
    }
}
