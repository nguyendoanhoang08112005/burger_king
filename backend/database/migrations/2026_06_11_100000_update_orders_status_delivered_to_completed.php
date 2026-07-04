<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // 1. Temporarily allow both 'delivered' and 'completed' in enum
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'completed', 'cancelled') NOT NULL DEFAULT 'pending'");
        } else if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE orders ALTER COLUMN status TYPE VARCHAR(255)");
            DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
            DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'completed', 'cancelled'))");
        }

        // 2. Add completed_at column if it doesn't exist
        if (!Schema::hasColumn('orders', 'completed_at')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->timestamp('completed_at')->nullable()->after('scheduled_at');
            });
        }

        // 3. Migrate any 'delivered' orders to 'completed' and set completed_at
        DB::statement("UPDATE orders SET status = 'completed', completed_at = updated_at WHERE status = 'delivered'");

        // 4. Redefine the enum to exclude 'delivered'
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled') NOT NULL DEFAULT 'pending'");
        } else if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE orders ALTER COLUMN status TYPE VARCHAR(255)");
            DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
            DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'))");
        }
    }

    public function down(): void
    {
        // 1. Allow 'delivered' again
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'completed', 'cancelled') NOT NULL DEFAULT 'pending'");
        } else if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE orders ALTER COLUMN status TYPE VARCHAR(255)");
            DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
            DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'completed', 'cancelled'))");
        }

        // 2. Revert 'completed' back to 'delivered'
        DB::statement("UPDATE orders SET status = 'delivered' WHERE status = 'completed'");

        // 3. Redefine ENUM to original state
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending'");
        } else if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE orders ALTER COLUMN status TYPE VARCHAR(255)");
            DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
            DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'))");
        }

        // 4. Drop column completed_at
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('completed_at');
        });
    }
};
