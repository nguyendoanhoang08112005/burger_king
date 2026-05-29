<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('product_toppings', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 12, 2);
            $table->string('image')->nullable();
            $table->boolean('is_available')->default(true);
            $table->enum('category', ['sauce', 'cheese', 'veggie', 'meat']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_toppings');
    }
};
