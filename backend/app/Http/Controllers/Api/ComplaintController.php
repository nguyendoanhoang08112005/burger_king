<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderAddress;
use App\Models\Complaint;
use App\Models\ComplaintItem;
use App\Models\Product;
use App\Models\User;
use App\Models\LoyaltyPoint;
use App\Models\Setting;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ComplaintController extends Controller
{
    // Customer submits a complaint
    public function submit(Request $request, NotificationService $notificationService)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'type' => 'required|string|in:wrong_item,missing_item,bad_quality,late_delivery,shipper_attitude,other',
            'description' => 'required|string',
            'images' => 'nullable|array',
            'images.*' => 'required|string|url',
            'desired_resolution' => 'required|string|in:redeliver,refund_partial,refund_full,feedback_only',
            'items' => 'nullable|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.issue_type' => 'required|string|in:wrong,missing,bad_quality,other',
            'items.*.note' => 'nullable|string',
        ]);

        $user = $request->user();
        $order = Order::where('id', $request->order_id)->where('user_id', $user->id)->firstOrFail();

        // 1. Check order status is completed
        if ($order->status !== 'completed') {
            return response()->json(['message' => 'Chỉ có thể khiếu nại đối với đơn hàng đã hoàn thành.'], 422);
        }

        // 2. Check within complaint.expiry_hours
        $expiryHours = (int) Setting::get('complaint.expiry_hours', 24);
        $completionTime = $order->completed_at ?? $order->updated_at;
        if (Carbon::parse($completionTime)->addHours($expiryHours)->isPast()) {
            return response()->json(['message' => "Đã quá thời hạn khiếu nại đơn hàng (tối đa {$expiryHours} giờ)."], 422);
        }

        // 3. Check for any existing complaint (only allow complaining once)
        $hasComplaint = Complaint::where('order_id', $order->id)->exists();
        if ($hasComplaint) {
            return response()->json(['message' => 'Đơn hàng này đã được khiếu nại trước đó. Mỗi đơn hàng chỉ được khiếu nại tối đa một lần.'], 422);
        }

        // 4. Rate limit check: max 5 complaints per day per user
        $complaintsToday = Complaint::where('user_id', $user->id)
            ->where('created_at', '>=', now()->startOfDay())
            ->count();
        if ($complaintsToday >= 5) {
            return response()->json(['message' => 'Bạn đã đạt giới hạn tối đa 5 khiếu nại trong một ngày.'], 429);
        }

        $complaint = DB::transaction(function () use ($request, $user, $order, $notificationService) {
            // Create Complaint
            $complaint = Complaint::create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'status' => 'pending',
                'type' => $request->type,
                'description' => $request->description,
                'images' => $request->images ?? [],
                'desired_resolution' => $request->desired_resolution,
            ]);

            // Create Complaint Items if provided
            if (in_array($request->type, ['wrong_item', 'missing_item', 'bad_quality'], true) && !empty($request->items)) {
                foreach ($request->items as $item) {
                    $product = Product::findOrFail($item['product_id']);
                    ComplaintItem::create([
                        'complaint_id' => $complaint->id,
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'issue_type' => $item['issue_type'],
                        'note' => $item['note'] ?? null,
                    ]);

                    // Auto-flag check: If a product receives >= 3 complaints in the same day, trigger warning
                    $productComplaintsToday = ComplaintItem::where('product_id', $product->id)
                        ->where('created_at', '>=', now()->startOfDay())
                        ->count();

                    if ($productComplaintsToday >= 3) {
                        $this->triggerProductAutoFlag($product, $productComplaintsToday);
                    }
                }
            }

            return $complaint;
        });

        // Trigger real-time notifications for admin
        $this->notifyAdminsNewComplaint($order, $complaint, $notificationService);

        // Send email confirmation to user
        $this->sendUserComplaintConfirmationEmail($user, $order, $complaint);

        return response()->json([
            'success' => true,
            'message' => 'Gửi khiếu nại thành công! Chúng tôi sẽ phản hồi trong 24h.',
            'data' => $complaint->load('items'),
        ], 201);
    }

    // Admin lists complaints
    public function listComplaints(Request $request)
    {
        $query = Complaint::with(['user', 'order'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('order', function ($qo) use ($search) {
                    $qo->where('order_code', 'like', '%' . $search . '%');
                })->orWhereHas('user', function ($qu) use ($search) {
                    $qu->where('name', 'like', '%' . $search . '%');
                });
            });
        }

        $paginator = $query->paginate($request->get('per_page', 20));

        $items = collect($paginator->items())->map(function ($complaint) {
            $data = $complaint->toArray();
            $data['user'] = $complaint->user ? [
                'id' => $complaint->user->id,
                'name' => $complaint->user->name,
                'email' => $complaint->user->email,
            ] : null;
            $data['order'] = $complaint->order ? [
                'id' => $complaint->order->id,
                'order_code' => $complaint->order->order_code,
            ] : null;

            // SLA Countdown: 24h since creation
            $createdAt = Carbon::parse($complaint->created_at);
            $deadline = $createdAt->copy()->addHours(24);
            $secondsRemaining = max(0, now()->diffInSeconds($deadline, false));
            $data['sla_hours_remaining'] = round($secondsRemaining / 3600, 1);
            $data['is_overdue'] = now()->isAfter($deadline);

            return $data;
        })->all();

        return response()->json([
            'success' => true,
            'data' => $items,
            'meta' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ]
        ]);
    }

    // Admin details view
    public function show($id)
    {
        $complaint = Complaint::with(['user', 'order.items', 'items.product'])->findOrFail($id);

        $createdAt = Carbon::parse($complaint->created_at);
        $deadline = $createdAt->copy()->addHours(24);
        $secondsRemaining = max(0, now()->diffInSeconds($deadline, false));
        
        $data = $complaint->toArray();
        $data['sla_hours_remaining'] = round($secondsRemaining / 3600, 1);
        $data['is_overdue'] = now()->isAfter($deadline);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    // Admin processes a complaint
    public function process(Request $request, $id, NotificationService $notificationService)
    {
        $complaint = Complaint::findOrFail($id);

        $request->validate([
            'status' => 'required|string|in:reviewing,resolved,rejected',
            'resolution_type' => 'required_if:status,resolved,rejected|string|in:redeliver,refund,voucher,apology,rejected',
            'resolution_note' => 'required_if:status,resolved,rejected|string',
            'admin_note' => 'nullable|string',
            'refund_amount' => 'required_if:resolution_type,refund|numeric|min:0',
        ]);

        $originalOrder = $complaint->order;
        $customer = $complaint->user;

        DB::transaction(function () use ($request, $complaint, $originalOrder, $customer) {
            $complaint->status = $request->status;
            $complaint->admin_note = $request->admin_note;

            if ($request->status === 'reviewing') {
                $complaint->save();
                return;
            }

            // Status is resolved or rejected
            $complaint->resolution_type = $request->resolution_type;
            $complaint->resolution_note = $request->resolution_note;
            $complaint->resolved_at = now();
            $complaint->save();

            // Resolution Action logic
            if ($request->resolution_type === 'redeliver') {
                $this->createRedeliveryOrder($originalOrder, $complaint);
            } elseif ($request->resolution_type === 'refund') {
                // Mark original order payment status as refunded
                $originalOrder->payment_status = 'refunded';
                $originalOrder->save();

                // Revert loyalty points if user has earned points from original order
                $refundAmount = (float) $request->refund_amount;
                $pointsToReverse = (int) floor($refundAmount / 10000);

                if ($pointsToReverse > 0 && $originalOrder->user_id) {
                    $earnedPoints = LoyaltyPoint::where('order_id', $originalOrder->id)
                        ->where('user_id', $originalOrder->user_id)
                        ->where('type', 'earn')
                        ->first();

                    if ($earnedPoints) {
                        LoyaltyPoint::create([
                            'user_id' => $originalOrder->user_id,
                            'points' => min($pointsToReverse, $earnedPoints->points),
                            'type' => 'redeem', // Reversal/deduction
                            'description' => "Thu hồi điểm hoàn tiền khiếu nại đơn " . $originalOrder->order_code,
                            'order_id' => $originalOrder->id,
                        ]);
                    }
                }
            }
        });

        // Notify Customer about status change
        $this->notifyCustomerComplaintUpdate($customer, $originalOrder, $complaint, $notificationService);

        // Send email update to customer
        $this->sendUserComplaintUpdateEmail($customer, $originalOrder, $complaint);

        return response()->json([
            'success' => true,
            'message' => 'Xử lý khiếu nại thành công!',
            'data' => $complaint->fresh(['user', 'order', 'items']),
        ]);
    }

    // Pending counts on sidebar
    public function getPendingCount()
    {
        $count = Complaint::where('status', 'pending')->count();
        return response()->json([
            'success' => true,
            'count' => $count,
        ]);
    }

    // Complaints count by status
    public function getCounts()
    {
        $pending = Complaint::where('status', 'pending')->count();
        $reviewing = Complaint::where('status', 'reviewing')->count();
        $resolved = Complaint::where('status', 'resolved')->count();
        $rejected = Complaint::where('status', 'rejected')->count();
        $total = $pending + $reviewing + $resolved + $rejected;

        return response()->json([
            'success' => true,
            'counts' => [
                'pending' => $pending,
                'reviewing' => $reviewing,
                'resolved' => $resolved,
                'rejected' => $rejected,
                'total' => $total,
            ]
        ]);
    }

    // Helper: Trigger warning notification if product gets >= 3 complaints today
    private function triggerProductAutoFlag(Product $product, int $count)
    {
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notifications()->create([
                'id' => (string) Str::uuid(),
                'type' => 'App\Notifications\ProductComplaintWarning',
                'data' => json_encode([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'complaints_count' => $count,
                    'title' => 'Cảnh báo sản phẩm bị khiếu nại nhiều',
                    'body' => "Sản phẩm {$product->name} đã nhận {$count} khiếu nại trong ngày hôm nay. Vui lòng xem xét tạm ẩn sản phẩm.",
                    'event_at' => now()->toISOString(),
                ]),
            ]);
        }
    }

    // Helper: Notify admins of new complaint
    private function notifyAdminsNewComplaint(Order $order, Complaint $complaint, NotificationService $notificationService)
    {
        $customerName = $order->address?->recipient_name ?? $order->user?->name ?? 'Khách hàng';
        $admins = User::where('role', 'admin')->get()
            ->merge(User::permission('access.orders')->where('role', 'staff')->get())
            ->unique('id');

        $typeLabels = [
            'wrong_item' => 'Sai món',
            'missing_item' => 'Thiếu món',
            'bad_quality' => 'Chất lượng kém',
            'late_delivery' => 'Giao hàng trễ',
            'shipper_attitude' => 'Thái độ shipper',
            'other' => 'Vấn đề khác',
        ];
        $typeStr = $typeLabels[$complaint->type] ?? 'Khác';

        foreach ($admins as $admin) {
            $admin->notifications()->create([
                'id' => (string) Str::uuid(),
                'type' => 'App\Notifications\AdminNewComplaint',
                'data' => json_encode([
                    'complaint_id' => $complaint->id,
                    'order_id' => $order->id,
                    'order_code' => $order->order_code,
                    'customer_name' => $customerName,
                    'title' => 'Khiếu nại mới',
                    'body' => "Đơn hàng {$order->order_code} có khiếu nại mới về [{$typeStr}]. Người thực hiện: {$customerName}.",
                    'event_at' => now()->toISOString(),
                ]),
            ]);
        }
    }

    // Helper: Notify customer of complaint status update
    private function notifyCustomerComplaintUpdate(User $user, Order $order, Complaint $complaint, NotificationService $notificationService)
    {
        $statusLabels = [
            'reviewing' => 'Đang được xem xét',
            'resolved' => 'Đã giải quyết',
            'rejected' => 'Đã từ chối',
        ];
        $statusStr = $statusLabels[$complaint->status] ?? $complaint->status;

        $user->notifications()->create([
            'id' => (string) Str::uuid(),
            'type' => 'App\Notifications\ComplaintStatusChanged',
            'data' => json_encode([
                'complaint_id' => $complaint->id,
                'order_id' => $order->id,
                'order_code' => $order->order_code,
                'status' => $complaint->status,
                'title' => 'Cập nhật khiếu nại đơn ' . $order->order_code,
                'body' => "Khiếu nại của bạn cho đơn hàng {$order->order_code} đã được chuyển sang trạng thái: [{$statusStr}]. Phản hồi: {$complaint->resolution_note}",
                'event_at' => now()->toISOString(),
            ]),
        ]);
    }

    // Helper: Create redelivery order (Total=0, copies items & address)
    private function createRedeliveryOrder(Order $originalOrder, Complaint $complaint)
    {
        $originalOrder->loadMissing(['items', 'address']);

        // Create Master Order
        $redeliveryOrder = Order::create([
            'user_id' => $originalOrder->user_id,
            'order_code' => 'HBK-REDEL-' . strtoupper(Str::random(8)),
            'status' => 'pending',
            'payment_method' => 'cod', // Free redelivery order
            'payment_status' => 'paid',
            'subtotal' => 0.00,
            'discount' => 0.00,
            'shipping_fee' => 0.00,
            'total' => 0.00,
            'note' => "Giao lại từ khiếu nại của đơn #" . $originalOrder->order_code,
            'delivery_type' => $originalOrder->delivery_type,
            'scheduled_at' => null,
        ]);

        // Copy complaint items (matching details from original order item where possible)
        $complaintItems = $complaint->items;
        foreach ($complaintItems as $cItem) {
            $matchingItem = $originalOrder->items->firstWhere('product_id', $cItem->product_id);

            OrderItem::create([
                'order_id' => $redeliveryOrder->id,
                'product_id' => $cItem->product_id,
                'product_name' => $cItem->product_name,
                'product_sku' => $matchingItem?->product_sku ?? '',
                'size' => $matchingItem?->size,
                'size_sku' => $matchingItem?->size_sku,
                'price' => 0.00,
                'quantity' => $matchingItem?->quantity ?? 1,
                'toppings' => $matchingItem?->toppings ?? [],
                'subtotal' => 0.00,
            ]);
        }

        // Copy address if delivery
        if ($originalOrder->delivery_type === 'delivery' && $originalOrder->address) {
            $addr = $originalOrder->address;
            OrderAddress::create([
                'order_id' => $redeliveryOrder->id,
                'recipient_name' => $addr->recipient_name,
                'phone' => $addr->phone,
                'province' => $addr->province,
                'district' => $addr->district,
                'ward' => $addr->ward,
                'street' => $addr->street,
                'lat' => $addr->lat,
                'lng' => $addr->lng,
            ]);
        }
    }

    // Helper: Mock mail triggers
    private function sendUserComplaintConfirmationEmail(User $user, Order $order, Complaint $complaint)
    {
        try {
            $email = $user->email;
            if ($email) {
                Mail::raw("Hamburger King đã tiếp nhận khiếu nại của bạn cho đơn hàng #{$order->order_code}. Chúng tôi sẽ xử lý và phản hồi lại bạn sớm nhất trong vòng 24h.", function ($message) use ($email, $order) {
                    $message->to($email)->subject("Tiếp nhận khiếu nại đơn hàng #{$order->order_code}");
                });
            }
        } catch (\Exception $e) {
            \Log::error("Failed to send complaint confirmation email: " . $e->getMessage());
        }
    }

    private function sendUserComplaintUpdateEmail(User $user, Order $order, Complaint $complaint)
    {
        try {
            $email = $user->email;
            if ($email) {
                $statusLabels = [
                    'reviewing' => 'Đang được xem xét',
                    'resolved' => 'Đã giải quyết',
                    'rejected' => 'Đã từ chối',
                ];
                $statusStr = $statusLabels[$complaint->status] ?? $complaint->status;

                Mail::raw("Khiếu nại cho đơn hàng #{$order->order_code} của bạn đã cập nhật trạng thái mới: {$statusStr}.\nPhản hồi từ cửa hàng: {$complaint->resolution_note}", function ($message) use ($email, $order) {
                    $message->to($email)->subject("Cập nhật trạng thái khiếu nại đơn hàng #{$order->order_code}");
                });
            }
        } catch (\Exception $e) {
            \Log::error("Failed to send complaint update email: " . $e->getMessage());
        }
    }
}
