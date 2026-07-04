<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE order_items MODIFY size VARCHAR(255) NULL');
        } else if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE order_items ALTER COLUMN size DROP NOT NULL');
        }
    }

    public function down(): void
    {
        DB::table('order_items')->whereNull('size')->update(['size' => 'M']);
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE order_items MODIFY size VARCHAR(255) NOT NULL DEFAULT 'M'");
        } else if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE order_items ALTER COLUMN size SET NOT NULL, ALTER COLUMN size SET DEFAULT 'M'");
        }
    }
};
