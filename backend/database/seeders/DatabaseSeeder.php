<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductSize;
use App\Models\ProductTopping;
use App\Models\ComboSet;
use App\Models\ComboItem;
use App\Models\Coupon;
use App\Models\Branch;
use App\Models\Banner;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Roles and Spatie Permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $adminRole = Role::create(['name' => 'admin']);
        $staffRole = Role::create(['name' => 'staff']);
        $customerRole = Role::create(['name' => 'customer']);

        // 2. Seed Users
        $admin = User::create([
            'name' => 'Burger King Admin',
            'email' => 'admin@hamburgerking.com',
            'password' => bcrypt('Admin@123'),
            'phone' => '0987654321',
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
        $admin->assignRole($adminRole);

        $staff = User::create([
            'name' => 'Store Manager',
            'email' => 'staff@hamburgerking.com',
            'password' => bcrypt('Staff@123'),
            'phone' => '0912345678',
            'role' => 'staff',
            'email_verified_at' => now(),
        ]);
        $staff->assignRole($staffRole);

        $customer = User::create([
            'name' => 'Nguyễn Minh Quân',
            'email' => 'customer@example.com',
            'password' => bcrypt('Customer@123'),
            'phone' => '0909090909',
            'role' => 'customer',
            'avatar' => 'https://ui-avatars.com/api/?name=Nguyen+Quan&background=D62300&color=fff',
            'email_verified_at' => now(),
        ]);
        $customer->assignRole($customerRole);

        // Seed some customer addresses
        $customer->addresses()->createMany([
            [
                'label' => 'Nhà riêng',
                'recipient_name' => 'Nguyễn Minh Quân',
                'phone' => '0909090909',
                'province' => 'Thành phố Hồ Chí Minh',
                'district' => 'Quận 1',
                'ward' => 'Phường Bến Nghé',
                'street' => '120 Lê Lợi',
                'is_default' => true,
            ],
            [
                'label' => 'Văn phòng',
                'recipient_name' => 'Nguyễn Minh Quân',
                'phone' => '0909090909',
                'province' => 'Thành phố Hồ Chí Minh',
                'district' => 'Quận 3',
                'ward' => 'Phường Võ Thị Sáu',
                'street' => '345 Điện Biên Phủ',
                'is_default' => false,
            ]
        ]);

        // Seed customer loyalty points balance (150 earned, 20 redeemed = 130 net balance)
        $customer->loyaltyPoints()->createMany([
            ['points' => 100, 'type' => 'earn', 'description' => 'Điểm thưởng chào mừng thành viên mới'],
            ['points' => 50, 'type' => 'earn', 'description' => 'Tích lũy từ đơn hàng thử nghiệm'],
            ['points' => 20, 'type' => 'redeem', 'description' => 'Đổi điểm giảm giá đơn hàng trước']
        ]);

        // 3. Seed Categories
        $catBeef = Category::create([
            'name' => 'Burgers Bò',
            'slug' => 'burgers-bo',
            'description' => 'Các loại burger nhân bò Mỹ nướng lửa hồng thơm ngon mọng nước.',
            'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
            'sort_order' => 1
        ]);

        $catChicken = Category::create([
            'name' => 'Burgers Gà',
            'slug' => 'burgers-ga',
            'description' => 'Burgers phi lê gà chiên giòn rụm hoặc áp chảo thơm nức mũi.',
            'image' => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=400',
            'sort_order' => 2
        ]);

        $catSides = Category::create([
            'name' => 'Món Ăn Kèm',
            'slug' => 'mon-an-kem',
            'description' => 'Khoai tây chiên giòn, phô mai que béo ngậy cùng nhiều món ăn kèm siêu hấp dẫn.',
            'image' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400',
            'sort_order' => 3
        ]);

        $catDrinks = Category::create([
            'name' => 'Đồ Uống',
            'slug' => 'do-uong',
            'description' => 'Nước giải khát có ga mát lạnh sảng khoái.',
            'image' => 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400',
            'sort_order' => 4
        ]);

        // 4. Seed Products
        // Beef Burgers
        $p1 = Product::create([
            'category_id' => $catBeef->id,
            'name' => 'Double Cheese King Burger',
            'slug' => 'double-cheese-king-burger',
            'description' => 'Chiếc burger siêu khổng lồ với hai lớp thịt bò Mỹ nướng lửa hồng đậm đà vị khói, kết hợp với hai lát phô mai Cheddar béo ngậy, dưa chuột muối chua giòn rụm, hành tây và sốt BBQ đặc trưng của Hamburger King.',
            'short_description' => 'Burger 2 lớp bò nướng kèm phô mai Cheddar kép béo ngậy.',
            'base_price' => 149000,
            'sale_price' => 129000,
            'thumbnail' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
            'is_featured' => true,
            'is_available' => true,
            'sort_order' => 1
        ]);

        $p2 = Product::create([
            'category_id' => $catBeef->id,
            'name' => 'Classic Beef Burger',
            'slug' => 'classic-beef-burger',
            'description' => 'Hương vị truyền thống tinh tế. Nhân thịt bò nướng thơm giòn, kết hợp xà lách tươi sạch, hành tây xào caramel ngọt dịu, dưa muối và sốt mayonnaise béo thanh.',
            'short_description' => 'Hương vị burger bò nướng truyền thống thơm ngon.',
            'base_price' => 99000,
            'sale_price' => null,
            'thumbnail' => 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=80&w=400',
            'is_featured' => false,
            'is_available' => true,
            'sort_order' => 2
        ]);

        // Chicken Burgers
        $p3 = Product::create([
            'category_id' => $catChicken->id,
            'name' => 'Spicy Chicken Crunch',
            'slug' => 'spicy-chicken-crunch',
            'description' => 'Phi lê ức gà tẩm bột chiên xù giòn rụm bên ngoài nhưng vẫn giữ độ mềm mọng nước bên trong, phủ đẫm sốt cay cay Hàn Quốc, xà lách giòn ngọt cắt nhỏ và lát phô mai Cheddar.',
            'short_description' => 'Ức gà chiên xù giòn tan cùng sốt cay đậm đà.',
            'base_price' => 89000,
            'sale_price' => 79000,
            'thumbnail' => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=400',
            'is_featured' => true,
            'is_available' => true,
            'sort_order' => 1
        ]);

        // Sides
        $p4 = Product::create([
            'category_id' => $catSides->id,
            'name' => 'Khoai Tây Chiên King Fries',
            'slug' => 'khoai-tay-chien-king-fries',
            'description' => 'Khoai tây cắt thanh nhập khẩu vàng óng chiên giòn tan rắc muối biển tinh khiết. Món ăn kèm hoàn hảo cho mọi thực đơn burger.',
            'short_description' => 'Khoai tây vàng giòn, món ăn kèm lý tưởng.',
            'base_price' => 39000,
            'thumbnail' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400',
            'is_available' => true,
            'sort_order' => 1
        ]);

        $p5 = Product::create([
            'category_id' => $catSides->id,
            'name' => 'Phô Mai Que Cheese Sticks',
            'slug' => 'pho-mai-que-cheese-sticks',
            'description' => '4 thanh phô mai Mozzarella bọc bột chiên giòn tan, kéo sợi béo ngậy chấm kèm sốt tương cà chua chua ngọt ngọt tuyệt đỉnh.',
            'short_description' => 'Phô mai que chiên xù kéo sợi béo ngậy cực cuốn.',
            'base_price' => 49000,
            'thumbnail' => 'https://images.unsplash.com/photo-1531749668029-2db88e4b76ce?auto=format&fit=crop&q=80&w=400',
            'is_available' => true,
            'sort_order' => 2
        ]);

        // Drinks
        $p6 = Product::create([
            'category_id' => $catDrinks->id,
            'name' => 'Coca Cola Lon',
            'slug' => 'coca-cola-lon',
            'description' => 'Nước ngọt có ga lon 330ml ướp lạnh, xua tan cơn khát nhanh chóng.',
            'short_description' => 'Coca Cola lon 330ml lạnh sảng khoái.',
            'base_price' => 25000,
            'thumbnail' => 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400',
            'is_available' => true,
            'sort_order' => 1
        ]);

        // 5. Seed Product Images (for detail galleries)
        $p1->images()->createMany([
            ['image_url' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400', 'alt_text' => 'Góc nghiêng Double Cheese', 'sort_order' => 1],
            ['image_url' => 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=400', 'alt_text' => 'Bề mặt nướng bò Mỹ', 'sort_order' => 2],
            ['image_url' => 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=80&w=400', 'alt_text' => 'Lớp phô mai chảy', 'sort_order' => 3],
        ]);

        $p3->images()->createMany([
            ['image_url' => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=400', 'alt_text' => 'Spicy Chicken Crunch góc trực diện', 'sort_order' => 1],
            ['image_url' => 'https://images.unsplash.com/photo-1513185158878-8d8c2a2a3e3d?auto=format&fit=crop&q=80&w=400', 'alt_text' => 'Chi tiết da gà giòn tan', 'sort_order' => 2],
        ]);

        // 6. Seed Product Sizes (S, M, L, XL)
        foreach ([$p1, $p2, $p3] as $p) {
            ProductSize::create(['product_id' => $p->id, 'size' => 'S', 'extra_price' => 0.00]);
            ProductSize::create(['product_id' => $p->id, 'size' => 'M', 'extra_price' => 15000.00]);
            ProductSize::create(['product_id' => $p->id, 'size' => 'L', 'extra_price' => 30000.00]);
            ProductSize::create(['product_id' => $p->id, 'size' => 'XL', 'extra_price' => 50000.00]);
        }

        // 7. Seed Product Toppings
        ProductTopping::create(['name' => 'Phô Mai Cheddar Lá', 'price' => 10000.00, 'category' => 'cheese', 'image' => '🧀']);
        ProductTopping::create(['name' => 'Thịt Xông Khói Giòn', 'price' => 15000.00, 'category' => 'meat', 'image' => '🥓']);
        ProductTopping::create(['name' => 'Hành Tây Xào Caramel', 'price' => 5000.00, 'category' => 'veggie', 'image' => '🧅']);
        ProductTopping::create(['name' => 'Sốt BBQ Đặc Biệt', 'price' => 5000.00, 'category' => 'sauce', 'image' => '🏺']);

        // 8. Seed Combo Sets
        $combo1 = ComboSet::create([
            'name' => 'Combo King Duo Feast',
            'slug' => 'combo-king-duo-feast',
            'description' => 'Bữa tiệc no nê cho hai người. Bao gồm 1 Double Cheese King Burger, 1 Spicy Chicken Crunch, 1 Khoai Tây Chiên cỡ vừa và 2 Coca Cola mát lạnh.',
            'image' => 'https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&q=80&w=400',
            'price' => 239000,
            'is_active' => true
        ]);

        ComboItem::create(['combo_id' => $combo1->id, 'product_id' => $p1->id, 'quantity' => 1, 'size' => 'M']);
        ComboItem::create(['combo_id' => $combo1->id, 'product_id' => $p3->id, 'quantity' => 1, 'size' => 'S']);
        ComboItem::create(['combo_id' => $combo1->id, 'product_id' => $p4->id, 'quantity' => 1, 'size' => 'M']);
        ComboItem::create(['combo_id' => $combo1->id, 'product_id' => $p6->id, 'quantity' => 2, 'size' => 'S']);

        // 9. Seed Coupons
        Coupon::create([
            'code' => 'KINGWELCOME',
            'type' => 'percent',
            'value' => 20.00,
            'min_order' => 100000.00,
            'max_discount' => 50000.00,
            'usage_limit' => 1000,
            'starts_at' => now(),
            'expires_at' => now()->addMonths(6),
        ]);

        Coupon::create([
            'code' => 'FREEBURGER',
            'type' => 'fixed',
            'value' => 50000.00,
            'min_order' => 200000.00,
            'usage_limit' => 100,
            'starts_at' => now(),
            'expires_at' => now()->addMonths(3),
        ]);

        Coupon::create([
            'code' => 'FREESHIP',
            'type' => 'free_ship',
            'value' => 15000.00,
            'min_order' => 100000.00,
            'usage_limit' => 2000,
            'starts_at' => now(),
            'expires_at' => now()->addMonths(12),
        ]);

        // 10. Seed Banners
        Banner::create([
            'title' => 'BURGER LỬA HỒNG - ĐẬM ĐÀ VỊ KHÓI',
            'subtitle' => 'Trải nghiệm dòng burger cao cấp nướng bằng tay ngập tràn nhân thịt bò Mỹ tươi.',
            'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=1200',
            'link' => '/menu',
            'position' => 'hero',
            'sort_order' => 1
        ]);

        Banner::create([
            'title' => 'GIÒN RÚM THƠM NGON - THỬ NGAY COMBO KHỦNG',
            'subtitle' => 'Tiết kiệm lên tới 35% khi đặt mua Combo Feast siêu hấp dẫn tại bếp online.',
            'image' => 'https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&q=80&w=1200',
            'link' => '/menu?category=combo-tiet-kiem',
            'position' => 'hero',
            'sort_order' => 2
        ]);

        // 11. Seed Store Branches
        Branch::create([
            'name' => 'Chi Nhánh Quận 1 - Hamburger King Lê Lợi',
            'address' => '120-122 Lê Lợi, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
            'phone' => '028 3822 9999',
            'lat' => 10.771971,
            'lng' => 106.698372,
            'open_time' => '08:00:00',
            'close_time' => '23:00:00',
            'is_active' => true
        ]);

        Branch::create([
            'name' => 'Chi Nhánh Quận 3 - Hamburger King Điện Biên Phủ',
            'address' => '345 Điện Biên Phủ, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh',
            'phone' => '028 3933 8888',
            'lat' => 10.781232,
            'lng' => 106.685324,
            'open_time' => '08:00:00',
            'close_time' => '22:30:00',
            'is_active' => true
        ]);

        Branch::create([
            'name' => 'Chi Nhánh Quận 2 - Hamburger King Thảo Điền',
            'address' => '45 Xuân Thủy, Thảo Điền, Quận 2, TP. Hồ Chí Minh',
            'phone' => '028 3519 7777',
            'lat' => 10.803120,
            'lng' => 106.729110,
            'open_time' => '09:00:00',
            'close_time' => '23:30:00',
            'is_active' => true
        ]);
    }
}
