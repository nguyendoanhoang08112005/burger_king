<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Create order_reviews table
        Schema::create('order_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained('orders')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('delivery_rating'); // 1-5
            $table->unsignedTinyInteger('packaging_rating'); // 1-5
            $table->unsignedTinyInteger('overall_rating'); // 1-5
            $table->text('comment')->nullable();
            $table->boolean('is_approved')->default(false);
            $table->timestamps();
        });

        // 2. Create product_reviews table
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_review_id')->constrained('order_reviews')->cascadeOnDelete();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating'); // 1-5
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['order_id', 'product_id', 'user_id']);
        });

        // 3. Create complaints table
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['pending', 'reviewing', 'resolved', 'rejected'])->default('pending');
            $table->string('type'); // wrong_item, missing_item, bad_quality, late_delivery, shipper_attitude, other
            $table->text('description');
            $table->json('images')->nullable(); // holds array of image URLs (max 5)
            $table->string('desired_resolution'); // redeliver, refund_partial, refund_full, feedback_only
            $table->string('resolution_type')->nullable(); // redeliver, refund, voucher, apology, rejected
            $table->text('resolution_note')->nullable(); // message to user
            $table->text('admin_note')->nullable(); // internal admin note
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        // 4. Create complaint_items table
        Schema::create('complaint_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained('complaints')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('product_name'); // snapshot product name
            $table->string('issue_type'); // wrong, missing, bad_quality, other
            $table->text('note')->nullable(); // item-specific note
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_items');
        Schema::dropIfExists('complaints');
        Schema::dropIfExists('product_reviews');
        Schema::dropIfExists('order_reviews');
    }
};
