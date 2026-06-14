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
        $query = Product::with(['category', 'sizes'])
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

        if ($request->filled('limit')) {
            $products = $query->limit((int) $request->limit)->get();
            $this->markWishlisted($products, $request->user('sanctum'));

            return response()->json($products);
        }

        $products = $query->paginate($request->get('per_page', 9));
        $this->markWishlisted($products->getCollection(), $request->user('sanctum'));

        return response()->json($products);
    }

    public function productDetail(Request $request, $slug)
    {
        $product = Product::with(['category', 'images', 'sizes'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->where('slug', $slug)
            ->firstOrFail();

        $this->markWishlisted($product, $request->user('sanctum'));

        return response()->json($product);
    }

    public function categories()
    {
        return response()->json(Category::where('is_active', true)->orderBy('sort_order')->get());
    }

    public function toppings(Request $request)
    {
        $query = ProductTopping::where('is_available', true);

        if ($request->filled('category_id')) {
            $categoryId = (int) $request->category_id;
            $query->where(function ($q) use ($categoryId) {
                $q->whereNull('category_ids')
                    ->orWhereJsonLength('category_ids', 0)
                    ->orWhereJsonContains('category_ids', $categoryId);
            });
        }

        return response()->json($query->orderBy('category')->orderBy('name')->get());
    }

    public function combos()
    {
        return response()->json(ComboSet::with('items.product')->where('is_active', true)->get());
    }

    public function banners()
    {
        return response()->json(Banner::where('is_active', true)->orderBy('sort_order')->get());
    }

    public function branches()
    {
        return response()->json(Branch::where('is_active', true)->get());
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
            'subtotal' => 'required|numeric|min:0'
        ]);

        $coupon = Coupon::where('code', $request->code)->first();

        if (!$coupon || !$coupon->isValidFor($request->subtotal)) {
            return response()->json(['message' => __('api.messages.coupon_invalid')], 422);
        }

        $discount = $coupon->calculateDiscount($request->subtotal);

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

        // Convert the text notification data to object
        $formatted = $notifications->map(function ($item) {
            return [
                'id' => $item->id,
                'read_at' => $item->read_at,
                'created_at' => $item->created_at,
                'data' => json_decode($item->data)
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
