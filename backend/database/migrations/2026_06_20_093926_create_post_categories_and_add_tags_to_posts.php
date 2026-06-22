<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('post_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');         // JSON translatable: {"vi":"...", "en":"..."}
            $table->string('slug')->unique();
            $table->string('color', 20)->default('#D62300'); // hex color for badge
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->json('tags')->nullable()->after('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_categories');
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn('tags');
        });
    }
};
