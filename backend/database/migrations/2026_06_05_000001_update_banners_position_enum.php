<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE banners MODIFY position ENUM('hero', 'blog_hero', 'popup', 'sidebar') NOT NULL DEFAULT 'hero'");
        } else if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE banners ALTER COLUMN position TYPE VARCHAR(255)");
            DB::statement("ALTER TABLE banners DROP CONSTRAINT IF EXISTS banners_position_check");
            DB::statement("ALTER TABLE banners ADD CONSTRAINT banners_position_check CHECK (position IN ('hero', 'blog_hero', 'popup', 'sidebar'))");
        }
    }

    public function down(): void
    {
        DB::statement("UPDATE banners SET position = 'hero' WHERE position = 'blog_hero'");
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE banners MODIFY position ENUM('hero', 'popup', 'sidebar') NOT NULL DEFAULT 'hero'");
        } else if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE banners ALTER COLUMN position TYPE VARCHAR(255)");
            DB::statement("ALTER TABLE banners DROP CONSTRAINT IF EXISTS banners_position_check");
            DB::statement("ALTER TABLE banners ADD CONSTRAINT banners_position_check CHECK (position IN ('hero', 'popup', 'sidebar'))");
        }
    }
};
