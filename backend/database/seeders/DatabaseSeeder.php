<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Branch;
use App\Models\LoyaltyPoint;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
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
        $permissions = collect(config('admin_permissions'))
            ->map(fn (string $module) => Permission::firstOrCreate(['name' => "access.{$module}"]));
        $adminRole->syncPermissions($permissions);

        $adminSeed = [
            'email' => env('SEED_ADMIN_EMAIL', 'admin@hamburgerking.com'),
            'name' => env('SEED_ADMIN_NAME', 'Admin User'),
            'password' => env('SEED_ADMIN_PASSWORD') ?: '12345678',
            'phone' => env('SEED_ADMIN_PHONE', '0900000000'),
        ];
        $staffSeed = [
            'email' => env('SEED_STAFF_EMAIL', 'staff@hamburgerking.com'),
            'name' => env('SEED_STAFF_NAME', 'Store Manager'),
            'password' => env('SEED_STAFF_PASSWORD') ?: '12345678',
            'phone' => env('SEED_STAFF_PHONE', '0900000001'),
        ];
        $customerSeed = [
            'email' => env('SEED_CUSTOMER_EMAIL', 'customer@hamburgerking.com'),
            'name' => env('SEED_CUSTOMER_NAME', 'Demo Customer'),
            'password' => env('SEED_CUSTOMER_PASSWORD') ?: '12345678',
            'phone' => env('SEED_CUSTOMER_PHONE', '0900000002'),
        ];

        // Admin
        $admin = User::firstOrCreate(
            ['email' => $adminSeed['email']],
            [
                'name'              => $adminSeed['name'],
                'password'          => bcrypt($adminSeed['password']),
                'phone'             => $adminSeed['phone'],
                'role'              => 'admin',
                'email_verified_at' => now(),
            ]
        );
        if (!$admin->hasRole('admin')) $admin->assignRole($adminRole);

        // Staff
        $staff = User::firstOrCreate(
            ['email' => $staffSeed['email']],
            [
                'name'              => $staffSeed['name'],
                'password'          => bcrypt($staffSeed['password']),
                'phone'             => $staffSeed['phone'],
                'role'              => 'staff',
                'email_verified_at' => now(),
            ]
        );
        if (!$staff->hasRole('staff')) $staff->assignRole($staffRole);
        if ($staff->getPermissionNames()->isEmpty()) {
            $staff->syncPermissions($permissions->filter(fn (Permission $permission) => in_array($permission->name, [
                'access.dashboard',
                'access.orders',
                'access.products',
                'access.categories',
                'access.combos',
                'access.toppings',
                'access.notifications',
            ], true)));
        }

        // Demo Customer
        $customer = User::firstOrCreate(
            ['email' => $customerSeed['email']],
            [
                'name'              => $customerSeed['name'],
                'password'          => bcrypt($customerSeed['password']),
                'phone'             => $customerSeed['phone'],
                'avatar'            => 'https://ui-avatars.com/api/?name=' . urlencode($customerSeed['name']) . '&background=D62300&color=fff',
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
                    'recipient_name' => $customerSeed['name'],
                    'phone'          => $customerSeed['phone'],
                    'province'       => 'Thành phố Hồ Chí Minh',
                    'district'       => 'Quận 1',
                    'ward'           => 'Phường Bến Nghé',
                    'street'         => '120 Lê Lợi',
                    'is_default'     => true,
                ],
                [
                    'label'          => 'Văn phòng',
                    'recipient_name' => $customerSeed['name'],
                    'phone'          => $customerSeed['phone'],
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
                ['points' => 100, 'type' => 'earn',   'description' => __('api.loyalty.welcome_bonus')],
                ['points' => 50,  'type' => 'earn',   'description' => __('api.loyalty.demo_order')],
                ['points' => 20,  'type' => 'redeem', 'description' => __('api.loyalty.previous_order_redeem')],
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
            BlogSeeder::class,             // 9. Blog posts (5)
            PaymentPluginSeeder::class,    // 10. Payment plugins
            SettingsSeeder::class,         // 11. Site settings
            LocalesSeeder::class,          // 12. Locales settings
        ]);

        // ═══════════════════════════════════════════
        // 9. Seed Store Branches
        // ═══════════════════════════════════════════
        $branches = [
            [
                'name'       => ['vi' => 'Chi Nhánh Quận 1 — Hamburger King Lê Lợi', 'en' => 'District 1 Branch — Hamburger King Le Loi'],
                'address'    => ['vi' => '120-122 Lê Lợi, Bến Nghé, Quận 1, TP. Hồ Chí Minh', 'en' => '120-122 Le Loi, Ben Nghe Ward, District 1, Ho Chi Minh City'],
                'phone'      => '028 3822 9999',
                'lat'        => 10.771971,
                'lng'        => 106.698372,
                'open_time'  => '08:00:00',
                'close_time' => '23:00:00',
                'is_active'  => true,
            ],
            [
                'name'       => ['vi' => 'Chi Nhánh Quận 3 — Hamburger King Điện Biên Phủ', 'en' => 'District 3 Branch — Hamburger King Dien Bien Phu'],
                'address'    => ['vi' => '345 Điện Biên Phủ, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh', 'en' => '345 Dien Bien Phu, Vo Thi Sau Ward, District 3, Ho Chi Minh City'],
                'phone'      => '028 3933 8888',
                'lat'        => 10.781232,
                'lng'        => 106.685324,
                'open_time'  => '08:00:00',
                'close_time' => '22:30:00',
                'is_active'  => true,
            ],
            [
                'name'       => ['vi' => 'Chi Nhánh Quận 2 — Hamburger King Thảo Điền', 'en' => 'District 2 Branch — Hamburger King Thao Dien'],
                'address'    => ['vi' => '45 Xuân Thủy, Thảo Điền, Quận 2, TP. Hồ Chí Minh', 'en' => '45 Xuan Thuy, Thao Dien, District 2, Ho Chi Minh City'],
                'phone'      => '028 3519 7777',
                'lat'        => 10.803120,
                'lng'        => 106.729110,
                'open_time'  => '09:00:00',
                'close_time' => '23:30:00',
                'is_active'  => true,
            ],
        ];

        foreach ($branches as $branch) {
            Branch::updateOrCreate(
                ['phone' => $branch['phone']],
                $branch
            );
        }
    }
}
