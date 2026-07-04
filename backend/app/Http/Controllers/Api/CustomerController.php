<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ComboSet;
use App\Models\Banner;
use App\Models\Branch;
use App\Models\Address;
use App\Models\Order;
use App\Models\Coupon;
use App\Models\ProductTopping;
use App\Models\Wishlist;
use App\Models\Review;
use App\Models\Setting;
use App\Services\OrderService;
use App\Services\PaymentService;
use App\Services\LoyaltyService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Exception;

class CustomerController extends Controller
{
    // --- PUBLIC ENDPOINTS ---

    private function markWishlisted($products, $user): void
    {
        if (!$user) {
            return;
        }

        $collection = $products instanceof \Illuminate\Support\Collection ? $products : collect([$products]);
        $productIds = $collection->pluck('id')->filter()->values();

        if ($productIds->isEmpty()) {
            return;
        }

        $wishlistIds = Wishlist::where('user_id', $user->id)
            ->whereIn('product_id', $productIds)
            ->pluck('product_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $wishlistMap = array_flip($wishlistIds);

        $collection->each(function ($product) use ($wishlistMap) {
            $product->setAttribute('wishlisted', isset($wishlistMap[(int) $product->id]));
        });
    }

    public function products(Request $request)
    {
        $key = 'products_' . md5(json_encode($request->all()) . '_' . ($request->user('sanctum')?->id ?? 'guest'));

        $products = \Illuminate\Support\Facades\Cache::remember($key, 900, function () use ($request) {
            $query = Product::with([
                'category:id,name,slug',
                'sizes:id,product_id,size,extra_price,is_available'
            ])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->where('is_available', true);

            // Filter by category id when provided. Empty/all means "all products".
            if ($request->filled('category_id') && $request->category_id !== 'all') {
                $query->where('category_id', $request->category_id);
            } elseif ($request->filled('category') && $request->category !== 'all') {
                $query->whereHas('category', function($q) use ($request) {
                    $q->where('slug', $request->category);
                });
            }

            // Search Query
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            if ($request->boolean('featured') || $request->boolean('is_featured')) {
                $query->where('is_featured', true);
            }

            if ($request->filled('exclude')) {
                $query->where('id', '!=', $request->exclude);
            }

            // Sort Orders
            $sortBy = $request->get('sort_by', 'sort_order');
            if ($sortBy === 'price_asc') {
                $query->orderByRaw('COALESCE(sale_price, base_price) ASC');
            } elseif ($sortBy === 'price_desc') {
                $query->orderByRaw('COALESCE(sale_price, base_price) DESC');
            } elseif ($sortBy === 'newest') {
                $query->orderBy('created_at', 'DESC');
            } else {
                $query->orderBy('sort_order', 'ASC');
            }

            $query->select(['id', 'category_id', 'name', 'slug', 'sku', 'base_price', 'sale_price', 'thumbnail', 'is_featured', 'is_available', 'sort_order']);

            if ($request->filled('limit')) {
                return $query->limit((int) $request->limit)->get();
            }

            return $query->paginate($request->get('per_page', 9));
        });

        $user = $request->user('sanctum');
        if ($user) {
            $itemsToMark = $products instanceof \Illuminate\Pagination\LengthAwarePaginator ? $products->getCollection() : $products;
            $this->markWishlisted($itemsToMark, $user);
        }

        return response()->json($products);
    }

    public function productDetail(Request $request, $slug)
    {
        $product = Product::with([
            'category:id,name,slug',
            'images',
            'sizes:id,product_id,size,extra_price,is_available'
        ])
        ->withCount('reviews')
        ->withAvg('reviews', 'rating')
        ->where('slug', $slug)
        ->firstOrFail();

        $this->markWishlisted($product, $request->user('sanctum'));

        return response()->json($product);
    }

    public function categories()
    {
        $categories = \Illuminate\Support\Facades\Cache::remember('public_categories', 3600, function () {
            return Category::where('is_active', true)->orderBy('sort_order')->select(['id', 'name', 'slug', 'image', 'is_active', 'sort_order'])->get();
        });
        return response()->json($categories);
    }

    public function toppings(Request $request)
    {
        $categoryId = $request->filled('category_id') ? (int) $request->category_id : null;
        $key = 'public_toppings_' . ($categoryId ?? 'all');

        $toppings = \Illuminate\Support\Facades\Cache::remember($key, 3600, function () use ($categoryId) {
            $query = ProductTopping::where('is_available', true);
            if ($categoryId) {
                $query->where(function ($q) use ($categoryId) {
                    $q->whereNull('category_ids')
                        ->orWhereJsonLength('category_ids', 0)
                        ->orWhereJsonContains('category_ids', $categoryId);
                });
            }
            return $query->orderBy('category')->orderBy('name')->get();
        });

        return response()->json($toppings);
    }

    public function combos()
    {
        $combos = \Illuminate\Support\Facades\Cache::remember('public_combos', 1800, function () {
            return ComboSet::with('items.product:id,name,thumbnail')
                ->where('is_active', true)
                ->select(['id', 'name', 'slug', 'description', 'image', 'price', 'is_active'])
                ->get();
        });
        return response()->json($combos);
    }

    public function banners()
    {
        $banners = \Illuminate\Support\Facades\Cache::remember('public_banners', 1800, function () {
            return Banner::where('is_active', true)->orderBy('sort_order')->select(['id', 'title', 'subtitle', 'image', 'link', 'position', 'sort_order', 'is_active'])->get();
        });
        return response()->json($banners);
    }

    public function branches()
    {
        $branches = \Illuminate\Support\Facades\Cache::remember('public_branches', 3600, function () {
            return Branch::where('is_active', true)->select(['id', 'name', 'address', 'phone', 'open_time', 'close_time', 'lat', 'lng', 'is_active'])->get();
        });
        return response()->json($branches);
    }

    // --- SECURE CUSTOMER ENDPOINTS ---

    // Addresses CRUD
    public function listAddresses(Request $request)
    {
        return response()->json($request->user()->addresses()->orderBy('is_default', 'desc')->get());
    }

    public function addAddress(Request $request)
    {
        $request->validate([
            'label' => 'required|string',
            'recipient_name' => 'required|string',
            'phone' => 'required|string',
            'province' => 'required|string',
            'district' => 'required|string',
            'ward' => 'required|string',
            'street' => 'required|string',
            'is_default' => 'nullable|boolean',
        ]);

        $user = $request->user();

        // If making default, reset others
        if ($request->is_default) {
            $user->addresses()->update(['is_default' => false]);
        }

        $address = $user->addresses()->create([
            'label' => $request->label,
            'recipient_name' => $request->recipient_name,
            'phone' => $request->phone,
            'province' => $request->province,
            'district' => $request->district,
            'ward' => $request->ward,
            'street' => $request->street,
            'is_default' => $request->is_default ?? false,
        ]);

        return response()->json($address, 201);
    }

    public function updateAddress(Request $request, $id)
    {
        $data = $request->validate([
            'label' => 'required|string',
            'recipient_name' => 'required|string',
            'phone' => 'required|string',
            'province' => 'required|string',
            'district' => 'required|string',
            'ward' => 'required|string',
            'street' => 'required|string',
            'is_default' => 'nullable|boolean',
        ]);

        $user = $request->user();
        $address = $user->addresses()->findOrFail($id);

        if ($request->boolean('is_default')) {
            $user->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update([
            'label' => $data['label'],
            'recipient_name' => $data['recipient_name'],
            'phone' => $data['phone'],
            'province' => $data['province'],
            'district' => $data['district'],
            'ward' => $data['ward'],
            'street' => $data['street'],
            'is_default' => $request->boolean('is_default'),
        ]);

        return response()->json($address->fresh());
    }

    public function deleteAddress(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $address->delete();

        return response()->json(['message' => __('api.messages.address_deleted')]);
    }

    // Wishlists
    public function wishlist(Request $request)
    {
        return response()->json($request->user()->wishlists()->with(['product.category', 'product.sizes'])->get());
    }

    public function toggleWishlist(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $user = $request->user();
        $wishlist = Wishlist::where('user_id', $user->id)->where('product_id', $request->product_id)->first();

        if ($wishlist) {
            $wishlist->delete();
            return response()->json(['message' => __('api.messages.wishlist_removed'), 'wishlisted' => false]);
        } else {
            Wishlist::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id
            ]);
        return response()->json(['message' => __('api.messages.wishlist_added'), 'wishlisted' => true]);
        }
    }

    // Apply Coupon
    public function applyCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
            'shipping_fee' => 'nullable|numeric|min:0'
        ]);

        $coupon = Coupon::where('code', $request->code)->first();

        if (!$coupon) {
            return response()->json(['message' => __('api.messages.coupon_invalid')], 422);
        }

        $error = $coupon->getValidationError($request->subtotal);
        if ($error) {
            return response()->json(['message' => $error], 422);
        }

        $shippingFee = (float) $request->input('shipping_fee', 0.0);
        $discount = $coupon->calculateDiscount($request->subtotal, $shippingFee);

        return response()->json([
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => (float) $coupon->value,
            'max_discount' => $coupon->max_discount !== null ? (float) $coupon->max_discount : null,
            'discount' => (float) $discount,
            'message' => __('api.messages.coupon_applied')
        ]);
    }

    // List Active Coupons for Checkout
    public function activeCoupons()
    {
        $now = now();
        $coupons = Coupon::where('is_active', true)
            ->where('show_at_checkout', true)
            ->where(function ($query) use ($now) {
                $query->whereNull('starts_at')
                      ->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($query) use ($now) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>=', $now);
            })
            ->where(function ($query) {
                $query->whereNull('usage_limit')
                      ->orWhereColumn('used_count', '<', 'usage_limit');
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($coupons);
    }

    // Checkout
    public function checkout(Request $request, OrderService $orderService, PaymentService $paymentService, NotificationService $notificationService)
    {
        $request->validate([
            'delivery_type' => 'required|in:delivery,pickup',
            'payment_method' => 'required|in:vnpay,momo,cod,loyalty,loyalty_points,stripe,paypal,sepay,zalopay',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.size' => 'nullable|string',
            'items.*.toppings' => 'nullable|array',
            'coupon_code' => 'nullable|string',
            'note' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
            'address' => 'required_if:delivery_type,delivery|array',
            'address.recipient_name' => 'required_if:delivery_type,delivery|string',
            'address.phone' => 'required_if:delivery_type,delivery|string',
            'address.province' => 'required_if:delivery_type,delivery|string',
            'address.district' => 'required_if:delivery_type,delivery|string',
            'address.ward' => 'required_if:delivery_type,delivery|string',
            'address.street' => 'required_if:delivery_type,delivery|string',
        ]);

        try {
            $user = $request->user('sanctum');
            $order = $orderService->createOrder($user, $request->all());
            $notificationService->sendNewOrderNotification($order);

            // Generate Payment URLs
            $paymentUrl = $paymentService->createPaymentUrl($order, $request->payment_method);

            return response()->json([
                'message' => __('api.messages.order_created'),
                'order' => $order->load(['items', 'address']),
                'payment_url' => $paymentUrl
            ], 201);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // Orders History & Detail
    public function orders(Request $request)
    {
        return response()->json(
            $request->user()->orders()
                ->with(['items', 'reviews'])
                ->orderBy('created_at', 'desc')
                ->paginate(10)
        );
    }

    public function orderDetail(Request $request, $code)
    {
        $order = Order::with(['items', 'address', 'orderReview', 'productReviews', 'complaints'])
            ->where('order_code', $code)
            ->firstOrFail();

        // Security check
        if ($order->user_id && $order->user_id !== $request->user()->id) {
            abort(403, __('api.messages.order_forbidden'));
        }

        return response()->json($order);
    }

    public function cancelOrder(Request $request, $code, LoyaltyService $loyaltyService, NotificationService $notificationService)
    {
        $order = $request->user()->orders()->where('order_code', $code)->firstOrFail();

        if ($order->status !== 'pending') {
            return response()->json(['message' => __('api.messages.order_cancel_only_pending')], 400);
        }

        $order->update([
            'status' => 'cancelled'
        ]);

        // Refund points if spent
        $loyaltyService->refundPointsForCancelledOrder($order);

        // Send alert
        $notificationService->sendOrderStatusNotification($order);

        return response()->json([
            'message' => __('api.messages.order_cancelled'),
            'order' => $order
        ]);
    }

    // Reviews
    public function uploadReviewImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:4096',
        ]);

        $path = $request->file('image')->store('reviews', 'public');

        return response()->json([
            'message' => __('api.messages.image_uploaded'),
            'url' => url(Storage::url($path)),
        ]);
    }

    public function addReview(Request $request, NotificationService $notificationService)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
            'images' => 'nullable|array',
        ]);

        $user = $request->user();

        // Verify order belongs to user
        $order = Order::where('id', $request->order_id)->where('user_id', $user->id)->firstOrFail();

        if ($order->status !== 'completed') {
            return response()->json(['message' => __('api.messages.review_only_delivered')], 422);
        }

        $alreadyReviewed = Review::where('user_id', $user->id)
            ->where('order_id', $order->id)
            ->exists();

        if ($alreadyReviewed) {
            return response()->json(['message' => __('api.messages.review_already_exists')], 422);
        }

        $productIds = $order->items()
            ->pluck('product_id')
            ->unique()
            ->values();

        if ($productIds->isEmpty()) {
            return response()->json(['message' => __('api.messages.review_product_not_in_order')], 422);
        }

        $reviews = DB::transaction(function () use ($productIds, $user, $order, $request) {
            return $productIds->map(function ($productId) use ($user, $order, $request) {
                return Review::create([
                    'user_id' => $user->id,
                    'product_id' => $productId,
                    'order_id' => $order->id,
                    'rating' => $request->rating,
                    'comment' => $request->comment,
                    'images' => $request->images ?? [],
                    'is_approved' => false
                ]);
            });
        });

        $notificationService->sendNewReviewNotification($order, $reviews->first());

        return response()->json([
            'message' => __('api.messages.review_created'),
            'reviews' => $reviews,
            'review' => $reviews->first()
        ], 201);
    }

    // Notifications
    public function listNotifications(Request $request)
    {
        $notifications = $request->user()->notifications()
            ->orderBy('created_at', 'desc')
            ->get();

        // Convert the text notification data to object and translate title/body on the fly
        $formatted = $notifications->map(function ($item) {
            $data = json_decode($item->data);

            if ($data && is_object($data)) {
                $type = $item->type;
                if ($type === 'App\Notifications\AdminNewOrder') {
                    $data->title = __('api.notifications.new_order_title');
                    $data->body = __('api.notifications.new_order_body', [
                        'customer' => $data->customer_name ?? __('api.notifications.guest_customer'),
                        'code' => $data->order_code ?? '',
                        'total' => number_format((float) ($data->total ?? 0), 0, ',', '.'),
                    ]);
                } elseif ($type === 'App\Notifications\AdminNewReview') {
                    $data->title = __('api.notifications.new_review_title');
                    $data->body = __('api.notifications.new_review_body', [
                        'customer' => $data->customer_name ?? '',
                        'code' => $data->order_code ?? '',
                        'rating' => $data->rating ?? 5,
                    ]);
                } elseif ($type === 'App\Notifications\AdminNewContact') {
                    $data->title = __('api.notifications.new_contact_title');
                    $data->body = __('api.notifications.new_contact_body', [
                        'customer' => $data->customer_name ?? '',
                    ]);
                } elseif ($type === 'App\Notifications\AdminNewNewsletter') {
                    $data->title = __('api.notifications.new_newsletter_title');
                    $data->body = __('api.notifications.new_newsletter_body', [
                        'email' => $data->customer_email ?? '',
                    ]);
                } elseif ($type === 'App\Notifications\ProductComplaintWarning') {
                    $data->title = __('api.notifications.product_complaint_warning_title');
                    $data->body = __('api.notifications.product_complaint_warning_body', [
                        'name' => $data->product_name ?? '',
                        'count' => $data->complaints_count ?? 0,
                    ]);
                } elseif ($type === 'App\Notifications\AdminNewComplaint') {
                    $compType = 'other';
                    if (isset($data->complaint_id)) {
                        $compType = \App\Models\Complaint::where('id', $data->complaint_id)->value('type') ?? 'other';
                    }
                    $translatedType = __("api.notifications.complaint_type_labels.{$compType}");
                    if ($translatedType === "api.notifications.complaint_type_labels.{$compType}") {
                        $typeLabels = [
                            'wrong_item' => 'Sai món',
                            'missing_item' => 'Thiếu món',
                            'bad_quality' => 'Chất lượng kém',
                            'late_delivery' => 'Giao hàng trễ',
                            'shipper_attitude' => 'Thái độ shipper',
                            'other' => 'Vấn đề khác',
                        ];
                        $translatedType = $typeLabels[$compType] ?? $compType;
                    }
                    $data->title = __('api.notifications.new_complaint_title');
                    $data->body = __('api.notifications.new_complaint_body', [
                        'code' => $data->order_code ?? '',
                        'type' => $translatedType,
                        'customer' => $data->customer_name ?? 'Khách hàng',
                    ]);
                } elseif ($type === 'App\Notifications\OrderStatusChanged') {
                    $status = $data->status ?? 'pending';
                    $title = __("api.notifications.order_status_titles.{$status}");
                    if ($title === "api.notifications.order_status_titles.{$status}") {
                        $title = __('api.notifications.order_updated_title');
                    }
                    $body = __("api.notifications.order_status_bodies.{$status}", ['code' => $data->order_code ?? '']);
                    if ($body === "api.notifications.order_status_bodies.{$status}") {
                        $body = __('api.notifications.order_updated_body', ['code' => $data->order_code ?? '']);
                    }
                    $data->title = $title;
                    $data->body = $body;
                } elseif ($type === 'App\Notifications\ComplaintStatusChanged') {
                    $status = $data->status ?? 'pending';
                    $resolution = '';
                    if (isset($data->complaint_id)) {
                        $complaintObj = \App\Models\Complaint::find($data->complaint_id);
                        if ($complaintObj) {
                            $status = $complaintObj->status;
                            $resolution = $complaintObj->resolution_note ?? '';
                        }
                    }
                    $statusStr = __("api.notifications.complaint_status_labels.{$status}");
                    if ($statusStr === "api.notifications.complaint_status_labels.{$status}") {
                        $statusStr = $status;
                    }
                    $data->title = __('api.notifications.complaint_status_changed_title', ['code' => $data->order_code ?? '']);
                    $data->body = __('api.notifications.complaint_status_changed_body', [
                        'code' => $data->order_code ?? '',
                        'status' => $statusStr,
                        'resolution' => $resolution,
                    ]);
                }
            }

            return [
                'id' => $item->id,
                'read_at' => $item->read_at,
                'created_at' => $item->created_at,
                'data' => $data
            ];
        });

        return response()->json($formatted);
    }

    public function markRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['message' => __('api.messages.notification_read')]);
    }

    // Loyalty Ledger
    public function loyaltyPoints(Request $request)
    {
        $user = $request->user();
        $vndPerPoint = max(1, (float) Setting::get('loyalty.vnd_per_point', 100));
        $balance = $user->loyalty_balance;

        return response()->json([
            'balance' => $balance,
            'vnd_per_point' => $vndPerPoint,
            'balance_value' => $balance * $vndPerPoint,
            'transactions' => $user->loyaltyPoints()->orderBy('created_at', 'desc')->get()
        ]);
    }
}
