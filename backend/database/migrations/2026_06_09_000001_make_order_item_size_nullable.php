<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement('ALTER TABLE order_items MODIFY size VARCHAR(255) NULL');
    }

    public function down(): void
    {
        DB::table('order_items')->whereNull('size')->update(['size' => 'M']);
        DB::statement("ALTER TABLE order_items MODIFY size VARCHAR(255) NOT NULL DEFAULT 'M'");
    }
};
