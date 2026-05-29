<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Branch;
use App\Models\LoyaltyPoint;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Run: php artisan db:seed
     *
     * Execution order:
     *  1. Roles & core users (admin, staff, customer)
     *  2. CategorySeeder        → 9 categories
     *  3. ProductSeeder         → 42 products
     *  4. ProductSizeSeeder     → S/M/L sizes for applicable products
     *  5. ProductToppingSeeder  → 14 toppings (sauce, cheese, veggie, meat)
     *  6. ComboSetSeeder        → 4 combo sets with linked items
     *  7. CouponSeeder          → 5 discount codes
     *  8. BannerSeeder          → 3 hero banners
     *  9. Branches              → 3 store branches
     */
    public function run(): void
    {
        // ═══════════════════════════════════════════
        // 1. Seed Roles and Core Users
        // ═══════════════════════════════════════════
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $adminRole    = Role::firstOrCreate(['name' => 'admin']);
        $staffRole    = Role::firstOrCreate(['name' => 'staff']);
        $customerRole = Role::firstOrCreate(['name' => 'customer']);

        // Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@hamburgerking.com'],
            [
                'name'              => 'Burger King Admin',
                'password'          => bcrypt('Admin@123'),
                'phone'             => '0987654321',
                'role'              => 'admin',
                'email_verified_at' => now(),
            ]
        );
        if (!$admin->hasRole('admin')) $admin->assignRole($adminRole);

        // Staff
        $staff = User::firstOrCreate(
            ['email' => 'staff@hamburgerking.com'],
            [
                'name'              => 'Store Manager',
                'password'          => bcrypt('Staff@123'),
                'phone'             => '0912345678',
                'role'              => 'staff',
                'email_verified_at' => now(),
            ]
        );
        if (!$staff->hasRole('staff')) $staff->assignRole($staffRole);

        // Demo Customer
        $customer = User::firstOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name'              => 'Nguyễn Minh Quân',
                'password'          => bcrypt('Customer@123'),
                'phone'             => '0909090909',
                'avatar'            => 'https://ui-avatars.com/api/?name=Nguyen+Quan&background=D62300&color=fff',
                'role'              => 'customer',
                'email_verified_at' => now(),
            ]
        );
        if (!$customer->hasRole('customer')) $customer->assignRole($customerRole);

        // Customer addresses
        if ($customer->addresses()->count() === 0) {
            $customer->addresses()->createMany([
                [
                    'label'          => 'Nhà riêng',
                    'recipient_name' => 'Nguyễn Minh Quân',
                    'phone'          => '0909090909',
                    'province'       => 'Thành phố Hồ Chí Minh',
                    'district'       => 'Quận 1',
                    'ward'           => 'Phường Bến Nghé',
                    'street'         => '120 Lê Lợi',
                    'is_default'     => true,
                ],
                [
                    'label'          => 'Văn phòng',
                    'recipient_name' => 'Nguyễn Minh Quân',
                    'phone'          => '0909090909',
                    'province'       => 'Thành phố Hồ Chí Minh',
                    'district'       => 'Quận 3',
                    'ward'           => 'Phường Võ Thị Sáu',
                    'street'         => '345 Điện Biên Phủ',
                    'is_default'     => false,
                ]
            ]);
        }

        // Customer loyalty points
        if ($customer->loyaltyPoints()->count() === 0) {
            $customer->loyaltyPoints()->createMany([
                ['points' => 100, 'type' => 'earn',   'description' => 'Điểm thưởng chào mừng thành viên mới'],
                ['points' => 50,  'type' => 'earn',   'description' => 'Tích lũy từ đơn hàng thử nghiệm'],
                ['points' => 20,  'type' => 'redeem', 'description' => 'Đổi điểm giảm giá đơn hàng trước'],
            ]);
        }

        // ═══════════════════════════════════════════
        // 2-8. Call individual seeders in strict order
        // ═══════════════════════════════════════════
        $this->call([
            CategorySeeder::class,         // 2. Categories (9)
            ProductSeeder::class,          // 3. Products (42)
            ProductSizeSeeder::class,      // 4. Product Sizes (S/M/L)
            ProductToppingSeeder::class,   // 5. Product Toppings (14)
            ComboSetSeeder::class,         // 6. Combo Sets (4)
            CouponSeeder::class,           // 7. Coupons (5)
            BannerSeeder::class,           // 8. Banners (3)
        ]);

        // ═══════════════════════════════════════════
        // 9. Seed Store Branches
        // ═══════════════════════════════════════════
        $branches = [
            [
                'name'       => 'Chi Nhánh Quận 1 — Hamburger King Lê Lợi',
                'address'    => '120-122 Lê Lợi, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
                'phone'      => '028 3822 9999',
                'lat'        => 10.771971,
                'lng'        => 106.698372,
                'open_time'  => '08:00:00',
                'close_time' => '23:00:00',
                'is_active'  => true,
            ],
            [
                'name'       => 'Chi Nhánh Quận 3 — Hamburger King Điện Biên Phủ',
                'address'    => '345 Điện Biên Phủ, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh',
                'phone'      => '028 3933 8888',
                'lat'        => 10.781232,
                'lng'        => 106.685324,
                'open_time'  => '08:00:00',
                'close_time' => '22:30:00',
                'is_active'  => true,
            ],
            [
                'name'       => 'Chi Nhánh Quận 2 — Hamburger King Thảo Điền',
                'address'    => '45 Xuân Thủy, Thảo Điền, Quận 2, TP. Hồ Chí Minh',
                'phone'      => '028 3519 7777',
                'lat'        => 10.803120,
                'lng'        => 106.729110,
                'open_time'  => '09:00:00',
                'close_time' => '23:30:00',
                'is_active'  => true,
            ],
        ];

        foreach ($branches as $branch) {
            Branch::firstOrCreate(
                ['phone' => $branch['phone']],
                $branch
            );
        }
    }
}
