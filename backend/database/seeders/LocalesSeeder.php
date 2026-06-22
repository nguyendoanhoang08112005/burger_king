<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocalesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('locales')->updateOrInsert(
            ['code' => 'vi'],
            [
                'name'        => 'Tiếng Việt',
                'native_name' => 'Tiếng Việt',
                'flag'        => '🇻🇳',
                'is_active'   => true,
                'is_default'  => true,
                'sort_order'  => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]
        );

        DB::table('locales')->updateOrInsert(
            ['code' => 'en'],
            [
                'name'        => 'English',
                'native_name' => 'English',
                'flag'        => '🇺🇸',
                'is_active'   => true,
                'is_default'  => false,
                'sort_order'  => 2,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]
        );
    }
}
