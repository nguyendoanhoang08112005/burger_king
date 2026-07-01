<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderReview;
use App\Models\User;
use App\Models\Setting;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public function sendNewOrderNotification(Order $order): void
    {
        $order->loadMissing(['user', 'items', 'address']);
        $customerName = $order->address?->recipient_name
            ?? $order->user?->name
            ?? __('api.notifications.guest_customer');

        if (Setting::get('notification.bell_new_order', true)) {
            $admins = User::where('role', 'admin')->get()
                ->merge(User::permission('access.orders')->where('role', 'staff')->get())
                ->unique('id');
            foreach ($admins as $admin) {
                $admin->notifications()->create([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'type' => 'App\Notifications\AdminNewOrder',
                    'data' => json_encode([
                        'order_id' => $order->id,
                        'order_code' => $order->order_code,
                        'status' => $order->status,
                        'event_at' => now()->toISOString(),
                        'order_created_at' => $order->created_at?->toISOString(),
                        'customer_name' => $customerName,
                        'customer_phone' => $order->address?->phone,
                        'delivery_address' => $this->formatOrderAddress($order),
                        'payment_method' => $order->payment_method,
                        'payment_status' => $order->payment_status,
                        'delivery_type' => $order->delivery_type,
                        'items_count' => $order->items->sum('quantity'),
                        'subtotal' => (float) $order->subtotal,
                        'discount' => (float) $order->discount,
                        'shipping_fee' => (float) $order->shipping_fee,
                        'total' => (float) $order->total,
                        'note' => $order->note,
                        'title' => __('api.notifications.new_order_title'),
                        'body' => __('api.notifications.new_order_body', [
                            'code' => $order->order_code,
                            'customer' => $customerName,
                            'total' => number_format((float) $order->total, 0, ',', '.'),
                        ]),
                    ]),
                ]);
            }
        }

        // Email notification when order is created
        if (Setting::get('notification.email_order_created', true)) {
            try {
                $formattedTotal = number_format((float) $order->total, 0, ',', '.') . ' đ';
                
                // 1. Send confirmation email to Customer
                $customerEmail = $order->user?->email;
                if ($customerEmail) {
                    Mail::raw(
                        "Chào {$customerName},\n\n" .
                        "Đơn hàng #{$order->order_code} của bạn tại Hamburger King đã được đặt thành công!\n" .
                        "Tổng tiền thanh toán: {$formattedTotal}\n" .
                        "Hình thức nhận hàng: " . ($order->delivery_type === 'pickup' ? 'Tự đến lấy' : 'Giao hàng tận nơi') . "\n" .
                        "Phương thức thanh toán: " . strtoupper($order->payment_method) . "\n\n" .
                        "Cảm ơn bạn đã lựa chọn Hamburger King!\n\n" .
                        "-----------\n\n" .
                        "Hi {$customerName},\n\n" .
                        "Your order #{$order->order_code} at Hamburger King has been successfully placed!\n" .
                        "Total payment: {$formattedTotal}\n" .
                        "Delivery method: " . ($order->delivery_type === 'pickup' ? 'Pickup' : 'Delivery') . "\n" .
                        "Payment method: " . strtoupper($order->payment_method) . "\n\n" .
                        "Thank you for choosing Hamburger King!",
                        function ($message) use ($customerEmail, $order) {
                            $message->to($customerEmail)->subject("[Hamburger King] Đơn hàng #{$order->order_code} đã được đặt thành công / Order Confirmation");
                        }
                    );
                }

                // 2. Send notification email to Admin
                $adminEmail = Setting::get('notification.admin_email') 
                    ?? Setting::get('general.email');
                if ($adminEmail) {
                    Mail::raw(
                        "Thông báo từ hệ thống Hamburger King:\n\n" .
                        "Một đơn hàng mới #{$order->order_code} vừa được tạo bởi khách hàng {$customerName}.\n" .
                        "Tổng giá trị đơn hàng: {$formattedTotal}\n" .
                        "Phương thức thanh toán: " . strtoupper($order->payment_method) . "\n" .
                        "Ghi chú: " . ($order->note ?: 'Không có') . "\n\n" .
                        "Vui lòng truy cập trang quản trị để xác nhận và xử lý đơn hàng.\n\n" .
                        "-----------\n\n" .
                        "System Notification:\n\n" .
                        "A new order #{$order->order_code} has been created by customer {$customerName}.\n" .
                        "Total amount: {$formattedTotal}\n" .
                        "Payment method: " . strtoupper($order->payment_method) . "\n" .
                        "Note: " . ($order->note ?: 'None') . "\n\n" .
                        "Please login to the Admin Panel to review and process the order.",
                        function ($message) use ($adminEmail, $order) {
                            $message->to($adminEmail)->subject("[Hamburger King] Thông báo đơn hàng mới #{$order->order_code} / New Order Notification");
                        }
                    );
                }
            } catch (\Exception $e) {
                \Log::error("Failed to send order creation emails: " . $e->getMessage());
            }
        }
    }

    public function sendOrderStatusNotification(Order $order): void
    {
        $order->loadMissing(['user', 'items', 'address']);

        if (!$order->user_id) {
            return;
        }

        $user = User::find($order->user_id);
        if (!$user) {
            return;
        }

        $title = __("api.notifications.order_status_titles.{$order->status}");
        if ($title === "api.notifications.order_status_titles.{$order->status}") {
            $title = __('api.notifications.order_updated_title');
        }

        $body = __("api.notifications.order_status_bodies.{$order->status}", ['code' => $order->order_code]);
        if ($body === "api.notifications.order_status_bodies.{$order->status}") {
            $body = __('api.notifications.order_updated_body', ['code' => $order->order_code]);
        }

        $user->notifications()->create([
            'id' => \Illuminate\Support\Str::uuid(),
            'type' => 'App\Notifications\OrderStatusChanged',
            'data' => json_encode([
                'order_id' => $order->id,
                'order_code' => $order->order_code,
                'status' => $order->status,
                'event_at' => now()->toISOString(),
                'order_created_at' => $order->created_at?->toISOString(),
                'customer_name' => $order->address?->recipient_name ?? $order->user?->name,
                'customer_phone' => $order->address?->phone,
                'delivery_address' => $this->formatOrderAddress($order),
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'delivery_type' => $order->delivery_type,
                'items_count' => $order->items->sum('quantity'),
                'subtotal' => (float) $order->subtotal,
                'discount' => (float) $order->discount,
                'shipping_fee' => (float) $order->shipping_fee,
                'total' => (float) $order->total,
                'note' => $order->note,
                'title' => $title,
                'body' => $body,
            ]),
        ]);

        // Email notification when order status changes
        if (Setting::get('notification.email_order_status', true)) {
            try {
                $customerEmail = $user->email;
                if ($customerEmail) {
                    $statusLabelsVi = [
                        'pending'   => 'Chờ xác nhận',
                        'confirmed' => 'Đã xác nhận',
                        'preparing' => 'Đang chuẩn bị',
                        'delivering'=> 'Đang giao hàng',
                        'completed' => 'Đã hoàn thành',
                        'cancelled' => 'Đã bị hủy',
                    ];
                    $statusLabelsEn = [
                        'pending'   => 'Pending',
                        'confirmed' => 'Confirmed',
                        'preparing' => 'Preparing',
                        'delivering'=> 'Delivering',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                    ];

                    $statusVi = $statusLabelsVi[$order->status] ?? $order->status;
                    $statusEn = $statusLabelsEn[$order->status] ?? $order->status;
                    $customerName = $order->address?->recipient_name ?? $user->name;

                    Mail::raw(
                        "Chào {$customerName},\n\n" .
                        "Đơn hàng #{$order->order_code} của bạn đã được cập nhật trạng thái mới: {$statusVi}.\n\n" .
                        "Cảm ơn bạn đã lựa chọn Hamburger King!\n\n" .
                        "-----------\n\n" .
                        "Hi {$customerName},\n\n" .
                        "Your order #{$order->order_code} has been updated to new status: {$statusEn}.\n\n" .
                        "Thank you for choosing Hamburger King!",
                        function ($message) use ($customerEmail, $order, $statusVi) {
                            $message->to($customerEmail)->subject("[Hamburger King] Đơn hàng #{$order->order_code} cập nhật trạng thái: {$statusVi} / Order Status Update");
                        }
                    );
                }
            } catch (\Exception $e) {
                \Log::error("Failed to send order status update email: " . $e->getMessage());
            }
        }
    }

    public function sendNewUserNotification(User $user): void
    {
        if (Setting::get('notification.email_new_user', true)) {
            try {
                // 1. Send welcome email to User
                $customerEmail = $user->email;
                if ($customerEmail) {
                    Mail::raw(
                        "Chào {$user->name},\n\n" .
                        "Chào mừng bạn gia nhập vương quốc Burger! Tài khoản của bạn đã được đăng ký thành công tại Hamburger King.\n" .
                        "Email đăng nhập: {$customerEmail}\n\n" .
                        "Chúc bạn có những trải nghiệm tuyệt vời cùng Hamburger King!\n\n" .
                        "-----------\n\n" .
                        "Hi {$user->name},\n\n" .
                        "Welcome to the Burger kingdom! Your account has been successfully created at Hamburger King.\n" .
                        "Login Email: {$customerEmail}\n\n" .
                        "Have a delicious time with Hamburger King!",
                        function ($message) use ($customerEmail) {
                            $message->to($customerEmail)->subject("[Hamburger King] Đăng ký thành viên mới thành công / Welcome to Hamburger King");
                        }
                    );
                }

                // 2. Send notification email to Admin
                $adminEmail = Setting::get('notification.admin_email') 
                    ?? Setting::get('general.email');
                if ($adminEmail) {
                    Mail::raw(
                        "Thông báo từ hệ thống Hamburger King:\n\n" .
                        "Một thành viên mới vừa đăng ký tài khoản thành công.\n" .
                        "Họ và tên: {$user->name}\n" .
                        "Email: {$user->email}\n" .
                        "Số điện thoại: " . ($user->phone ?: 'Không cung cấp') . "\n" .
                        "Thời gian đăng ký: " . now()->format('H:i d/m/Y') . "\n\n" .
                        "-----------\n\n" .
                        "System Notification:\n\n" .
                        "A new user has registered successfully.\n" .
                        "Name: {$user->name}\n" .
                        "Email: {$user->email}\n" .
                        "Phone: " . ($user->phone ?: 'Not provided') . "\n" .
                        "Registered at: " . now()->format('H:i d/m/Y'),
                        function ($message) use ($adminEmail, $user) {
                            $message->to($adminEmail)->subject("[Hamburger King] Thành viên mới đăng ký: {$user->name} / New User Registration");
                        }
                    );
                }
            } catch (\Exception $e) {
                \Log::error("Failed to send user registration welcome/notification emails: " . $e->getMessage());
            }
        }
    }

    public function sendNewReviewNotification(Order $order, ?OrderReview $review): void
    {
        if (!$review) {
            return;
        }

        $order->loadMissing(['user', 'address', 'items']);
        $customerName = $order->address?->recipient_name
            ?? $order->user?->name
            ?? __('api.notifications.guest_customer');

        if (!\App\Models\Setting::get('notification.bell_new_review', true)) {
            return;
        }

        $admins = User::where('role', 'admin')->get()
            ->merge(User::permission('access.reviews')->where('role', 'staff')->get())
            ->unique('id');

        foreach ($admins as $admin) {
            $admin->notifications()->create([
                'id' => \Illuminate\Support\Str::uuid(),
                'type' => 'App\Notifications\AdminNewReview',
                'data' => json_encode([
                    'review_id' => $review->id,
                    'order_id' => $order->id,
                    'order_code' => $order->order_code,
                    'rating' => (int) $review->rating,
                    'customer_name' => $customerName,
                    'event_at' => now()->toISOString(),
                    'order_created_at' => $order->created_at?->toISOString(),
                    'items_count' => $order->items->sum('quantity'),
                    'title' => __('api.notifications.new_review_title'),
                    'body' => __('api.notifications.new_review_body', [
                        'code' => $order->order_code,
                        'customer' => $customerName,
                        'rating' => (int) $review->rating,
                    ]),
                ]),
            ]);
        }
    }

    private function formatOrderAddress(Order $order): ?string
    {
        if (!$order->address) {
            return null;
        }

        return collect([
            $order->address->street,
            $order->address->ward,
            $order->address->district,
            $order->address->province,
        ])->filter()->implode(', ');
    }
}
