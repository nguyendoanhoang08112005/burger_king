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
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // 'contact', 'newsletter'
            $table->string('name')->nullable();
            $table->string('phone')->nullable();
            $table->string('email');
            $table->text('message')->nullable();
            $table->string('status')->default('pending'); // 'pending', 'read', 'replied'
            $table->text('admin_note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
