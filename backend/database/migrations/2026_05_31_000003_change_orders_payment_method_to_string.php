<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration {
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY payment_method VARCHAR(50) NOT NULL");
            return;
        }

        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_method', 50)->change();
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY payment_method ENUM('vnpay','momo','cod','loyalty') NOT NULL");
        } else if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE orders ALTER COLUMN payment_method TYPE VARCHAR(255)");
            DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check");
            DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('vnpay','momo','cod','loyalty'))");
        }
    }
};
