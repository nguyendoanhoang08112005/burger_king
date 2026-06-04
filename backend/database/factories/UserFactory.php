<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        $name = fake()->name();

        return [
            'name'              => $name,
            'email'             => fake()->unique()->safeEmail(),
            'phone'             => '09' . fake()->numerify('########'),
            'avatar'            => 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=D62300&color=fff',
            'role'              => 'customer',
            'email_verified_at' => now(),
            'password'          => static::$password ??= Hash::make(Str::random(32)),
            'remember_token'    => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
        ]);
    }

    public function staff(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'staff',
        ]);
    }
}
