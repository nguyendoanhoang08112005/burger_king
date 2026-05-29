<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderAddress;
use App\Models\Review;
use App\Models\Product;
use App\Models\LoyaltyPoint;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🧪 Generating test data...');

        // Ensure customer role exists
        $customerRole = Role::firstOrCreate(['name' => 'customer']);

        // ─── 1. Generate 20 sample users with addresses ───
        $this->command->info('👤 Creating 20 test users with addresses...');

        $provinces = ['Thành phố Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'];
        $districts = [
            'Thành phố Hồ Chí Minh' => ['Quận 1', 'Quận 3', 'Quận 7', 'Quận Bình Thạnh', 'Quận Phú Nhuận', 'Quận Tân Bình'],
            'Hà Nội'                 => ['Quận Hoàn Kiếm', 'Quận Ba Đình', 'Quận Cầu Giấy', 'Quận Đống Đa'],
            'Đà Nẵng'               => ['Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà'],
        ];
        $wards = ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường 7', 'Phường 10', 'Phường 14', 'Phường Bến Nghé', 'Phường Tân Định'];
        $streets = ['120 Lê Lợi', '45 Nguyễn Huệ', '88 Trần Hưng Đạo', '256 Hai Bà Trưng', '12 Pasteur', '99 Võ Văn Tần', '34 Lý Tự Trọng', '67 Nguyễn Thị Minh Khai', '200 Điện Biên Phủ', '150 Cách Mạng Tháng 8'];

        $users = User::factory(20)->create();

        foreach ($users as $user) {
            $user->assignRole($customerRole);

            $province = fake()->randomElement($provinces);
            $district = fake()->randomElement($districts[$province]);

            // Create 1-2 addresses per user
            $addressCount = fake()->numberBetween(1, 2);
            for ($a = 0; $a < $addressCount; $a++) {
                Address::create([
                    'user_id'        => $user->id,
                    'label'          => $a === 0 ? 'Nhà riêng' : 'Văn phòng',
                    'recipient_name' => $user->name,
                    'phone'          => $user->phone,
                    'province'       => $province,
                    'district'       => $district,
                    'ward'           => fake()->randomElement($wards),
                    'street'         => fake()->randomElement($streets),
                    'is_default'     => $a === 0,
                ]);
            }

            // Add some loyalty points
            LoyaltyPoint::create([
                'user_id'     => $user->id,
                'points'      => fake()->numberBetween(50, 200),
                'type'        => 'earn',
                'description' => 'Điểm thưởng chào mừng thành viên mới',
            ]);
        }

        // ─── 2. Generate 50 sample orders ───
        $this->command->info('📦 Creating 50 test orders...');

        $products       = Product::all();
        $statuses       = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'];
        $paymentMethods = ['vnpay', 'momo', 'cod'];
        $allUsers       = User::where('role', 'customer')->get();

        if ($allUsers->isEmpty() || $products->isEmpty()) {
            $this->command->warn('⚠️  No customers or products found. Skipping order generation.');
            return;
        }

        for ($i = 0; $i < 50; $i++) {
            $user          = $allUsers->random();
            $status        = fake()->randomElement($statuses);
            $paymentMethod = fake()->randomElement($paymentMethods);
            $paymentStatus = $status === 'delivered' ? 'paid' : ($status === 'cancelled' ? 'unpaid' : fake()->randomElement(['unpaid', 'paid']));
            $deliveryType  = fake()->randomElement(['delivery', 'pickup']);

            // Pick 1-4 random products for this order
            $orderProducts = $products->random(fake()->numberBetween(1, 4));
            $subtotal      = 0;
            $itemsData     = [];

            foreach ($orderProducts as $product) {
                $quantity  = fake()->numberBetween(1, 3);
                $price     = $product->sale_price ?? $product->base_price;
                $lineTotal = $price * $quantity;
                $subtotal += $lineTotal;

                $itemsData[] = [
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'size'         => fake()->randomElement(['S', 'M', 'L']),
                    'price'        => $price,
                    'quantity'     => $quantity,
                    'toppings'     => null,
                    'subtotal'     => $lineTotal,
                ];
            }

            $discount    = fake()->boolean(30) ? round($subtotal * fake()->randomFloat(2, 0.05, 0.15), -3) : 0;
            $shippingFee = $deliveryType === 'delivery' ? fake()->randomElement([15000, 20000, 25000]) : 0;
            $total       = max(0, $subtotal - $discount + $shippingFee);

            $order = Order::create([
                'user_id'        => $user->id,
                'order_code'     => 'HBK-' . strtoupper(Str::random(8)),
                'status'         => $status,
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentStatus,
                'subtotal'       => $subtotal,
                'discount'       => $discount,
                'shipping_fee'   => $shippingFee,
                'total'          => $total,
                'note'           => fake()->boolean(40) ? fake()->randomElement([
                    'Giao trước 12h trưa nhé',
                    'Không hành tây',
                    'Thêm tương ớt',
                    'Gọi trước khi giao',
                    'Để trước cửa phòng 302',
                ]) : null,
                'delivery_type'  => $deliveryType,
                'created_at'     => fake()->dateTimeBetween('-3 months', 'now'),
            ]);

            // Create order items
            foreach ($itemsData as $item) {
                OrderItem::create(array_merge($item, ['order_id' => $order->id]));
            }

            // Create order address for delivery orders
            if ($deliveryType === 'delivery') {
                $userAddress = $user->addresses()->first();
                OrderAddress::create([
                    'order_id'       => $order->id,
                    'recipient_name' => $userAddress ? $userAddress->recipient_name : $user->name,
                    'phone'          => $userAddress ? $userAddress->phone : $user->phone,
                    'province'       => $userAddress ? $userAddress->province : 'Thành phố Hồ Chí Minh',
                    'district'       => $userAddress ? $userAddress->district : 'Quận 1',
                    'ward'           => $userAddress ? $userAddress->ward : 'Phường Bến Nghé',
                    'street'         => $userAddress ? $userAddress->street : '120 Lê Lợi',
                ]);
            }

            // Add loyalty points for delivered orders
            if ($status === 'delivered') {
                LoyaltyPoint::create([
                    'user_id'     => $user->id,
                    'points'      => (int) floor($total / 10000),
                    'type'        => 'earn',
                    'description' => 'Tích điểm đơn hàng ' . $order->order_code,
                    'order_id'    => $order->id,
                ]);
            }
        }

        // ─── 3. Generate 100 sample reviews ───
        $this->command->info('⭐ Creating 100 test reviews...');

        $deliveredOrders = Order::where('status', 'delivered')->with('items')->get();
        $reviewComments  = [
            'Burger ngon lắm, thịt bò mọng nước, phô mai béo ngậy!',
            'Giao hàng nhanh, đóng gói cẩn thận, sẽ order lại.',
            'Khoai tây giòn tan, sốt rất ngon. Highly recommended!',
            'Hương vị đậm đà, xứng đáng đồng tiền bát gạo.',
            'Gà chiên giòn rụm, ăn kèm sốt BBQ tuyệt vời.',
            'Combo tiết kiệm thật sự, gia đình rất thích.',
            'Bánh mì mềm thơm, nhân đầy ắp, portion size lớn.',
            'Nước uống mát lạnh, thêm đá vừa đủ. Perfect!',
            'Lần đầu thử, sẽ quay lại ủng hộ thường xuyên.',
            'Milkshake rất mịn, vị ngọt vừa phải, recommend!',
            'Wrap gà cuộn đẹp mắt, ăn rất tiện khi đi làm.',
            'Salad tươi mát, sốt Caesar đậm đà, rau giòn ngọt.',
            'Apple pie nóng giòn, nhân táo quế thơm phức nức mũi.',
            'Đồ ăn ngon, nhân viên phục vụ nhiệt tình, 5 sao!',
            'Whopper luôn là best seller, lần nào ăn cũng thấy ngon.',
        ];

        $reviewCount = 0;
        foreach ($deliveredOrders as $order) {
            if ($reviewCount >= 100) break;

            foreach ($order->items as $item) {
                if ($reviewCount >= 100) break;

                // 70% chance to leave a review for each item
                if (!fake()->boolean(70)) continue;

                // Check no duplicate review
                $exists = Review::where('user_id', $order->user_id)
                    ->where('product_id', $item->product_id)
                    ->where('order_id', $order->id)
                    ->exists();

                if ($exists) continue;

                Review::create([
                    'user_id'     => $order->user_id,
                    'product_id'  => $item->product_id,
                    'order_id'    => $order->id,
                    'rating'      => fake()->numberBetween(3, 5),
                    'comment'     => fake()->randomElement($reviewComments),
                    'images'      => null,
                    'is_approved' => fake()->boolean(85),
                ]);

                $reviewCount++;
            }
        }

        $this->command->info("✅ Test data seeded: 20 users, 50 orders, {$reviewCount} reviews.");
    }
}
