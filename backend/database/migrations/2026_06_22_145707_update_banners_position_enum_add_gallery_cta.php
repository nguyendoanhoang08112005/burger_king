<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE banners MODIFY position ENUM('hero', 'blog_hero', 'popup', 'sidebar', 'gallery', 'cta') NOT NULL DEFAULT 'hero'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE banners SET position = 'hero' WHERE position IN ('gallery', 'cta')");
        DB::statement("ALTER TABLE banners MODIFY position ENUM('hero', 'blog_hero', 'popup', 'sidebar') NOT NULL DEFAULT 'hero'");
    }
};
