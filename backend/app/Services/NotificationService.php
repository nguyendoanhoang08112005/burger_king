<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderReview;
use App\Models\User;

class NotificationService
{
    public function sendNewOrderNotification(Order $order): void
    {
        $order->loadMissing(['user', 'items', 'address']);
        $customerName = $order->address?->recipient_name
            ?? $order->user?->name
            ?? __('api.notifications.guest_customer');

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
