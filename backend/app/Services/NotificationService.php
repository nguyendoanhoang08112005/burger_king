<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

class NotificationService
{
    public function sendOrderStatusNotification(Order $order): void
    {
        if (!$order->user_id) {
            return;
        }

        $user = User::find($order->user_id);
        if (!$user) {
            return;
        }

        $statusTitles = [
            'pending' => 'Đơn hàng đang chờ xử lý 🍔',
            'confirmed' => 'Đơn hàng đã được xác nhận! ✅',
            'preparing' => 'Bếp đang nướng bánh cho bạn! 🔥',
            'delivering' => 'Hamburger đang trên đường giao tới! 🚴‍♂️',
            'delivered' => 'Giao hàng thành công! Hãy thưởng thức thôi! 🎉',
            'cancelled' => 'Đơn hàng đã bị hủy ❌',
        ];

        $statusBodies = [
            'pending' => "Cảm ơn bạn đã đặt hàng tại Hamburger King. Đơn hàng {$order->order_code} đang chờ hệ thống xác nhận.",
            'confirmed' => "Đơn hàng {$order->order_code} của bạn đã được xác nhận thành công và chuyển qua bếp nấu.",
            'preparing' => "Đầu bếp của Hamburger King đang nướng thịt và đóng gói bánh của bạn.",
            'delivering' => "Shipper đang giao nóng hổi bánh Hamburger của đơn hàng {$order->order_code} tới địa chỉ của bạn.",
            'delivered' => "Đơn hàng {$order->order_code} đã được giao thành công. Hãy thưởng thức chiếc Hamburger thơm ngon nhé!",
            'cancelled' => "Đơn hàng {$order->order_code} của bạn đã được hủy bỏ. Liên hệ CSKH nếu có thắc mắc.",
        ];

        $title = $statusTitles[$order->status] ?? 'Cập nhật đơn hàng';
        $body = $statusBodies[$order->status] ?? "Đơn hàng {$order->order_code} đã cập nhật trạng thái.";

        // Create standard Laravel Database Notification
        $user->notifications()->create([
            'id' => \Illuminate\Support\Str::uuid(),
            'type' => 'App\Notifications\OrderStatusChanged',
            'data' => json_encode([
                'order_code' => $order->order_code,
                'status' => $order->status,
                'title' => $title,
                'body' => $body,
            ]),
        ]);
    }
}
