<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE banners MODIFY position ENUM('hero', 'blog_hero', 'popup', 'sidebar') NOT NULL DEFAULT 'hero'");
    }

    public function down(): void
    {
        DB::statement("UPDATE banners SET position = 'hero' WHERE position = 'blog_hero'");
        DB::statement("ALTER TABLE banners MODIFY position ENUM('hero', 'popup', 'sidebar') NOT NULL DEFAULT 'hero'");
    }
};
