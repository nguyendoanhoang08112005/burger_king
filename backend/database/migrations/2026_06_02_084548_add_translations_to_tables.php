<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create translations table
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->string('locale', 10);           // 'vi', 'en'
            $table->string('translatable_type');    // Model class
            $table->unsignedBigInteger('translatable_id');
            $table->string('field');                // 'name','description',...
            $table->longText('value')->nullable();
            $table->timestamps();

            $table->unique([
                'locale',
                'translatable_type', 
                'translatable_id',
                'field'
            ], 'translations_unique');

            $table->index([
                'translatable_type',
                'translatable_id'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('translations');
    }
};
