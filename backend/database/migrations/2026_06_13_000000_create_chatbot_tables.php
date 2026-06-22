<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('chat_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('session_id')->unique();
            $table->string('language')->default('vi');
            $table->timestamps();
        });

        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->index();
            $table->enum('role', ['user', 'assistant']);
            $table->text('content');
            $table->json('actions')->nullable();
            $table->json('tool_calls')->nullable();
            $table->timestamps();
        });

        Schema::create('chat_caches', function (Blueprint $table) {
            $table->id();
            $table->text('question');
            $table->text('answer');
            $table->json('actions')->nullable();
            $table->string('language');
            $table->integer('hit_count')->default(0);
            $table->timestamp('last_hit_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_caches');
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_sessions');
    }
};
