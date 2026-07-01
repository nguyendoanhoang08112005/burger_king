<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderReview;
use App\Models\ProductReview;
use App\Models\LoyaltyPoint;
use App\Models\Setting;
use App\Models\Review;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReviewController extends Controller
{
    // Customer submits a review
    public function submit(Request $request, NotificationService $notificationService)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'delivery_rating' => 'required|integer|min:1|max:5',
            'packaging_rating' => 'required|integer|min:1|max:5',
            'overall_rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
            'product_reviews' => 'nullable|array',
            'product_reviews.*.product_id' => 'required|exists:products,id',
            'product_reviews.*.rating' => 'required|integer|min:1|max:5',
            'product_reviews.*.comment' => 'nullable|string',
        ]);

        $user = $request->user();
        $order = Order::where('id', $request->order_id)->where('user_id', $user->id)->firstOrFail();

        // 1. Check order status is completed
        if ($order->status !== 'completed') {
            return response()->json(['message' => 'Chỉ cho phép đánh giá đơn hàng đã hoàn thành.'], 422);
        }

        // 2. Check duplicate review
        $alreadyReviewed = OrderReview::where('order_id', $order->id)->exists();
        if ($alreadyReviewed) {
            return response()->json(['message' => 'Đơn hàng này đã được đánh giá trước đó.'], 422);
        }

        // 3. Check within expiry_days
        $expiryDays = (int) Setting::get('review.expiry_days', 7);
        $completionTime = $order->completed_at ?? $order->updated_at;
        if (Carbon::parse($completionTime)->addDays($expiryDays)->isPast()) {
            return response()->json(['message' => "Đã quá thời hạn đánh giá đơn hàng (tối đa {$expiryDays} ngày)."], 422);
        }

        $orderReview = DB::transaction(function () use ($request, $user, $order) {
            // Auto approve logic
            $autoApprove = (bool) Setting::get('review.auto_approve_stars', false);
            $isApproved = ($autoApprove && $request->overall_rating >= 4);

            // Create Order Review
            $orderReview = OrderReview::create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'delivery_rating' => $request->delivery_rating,
                'packaging_rating' => $request->packaging_rating,
                'overall_rating' => $request->overall_rating,
                'comment' => $request->comment,
                'is_approved' => $isApproved,
            ]);

            // Create Product Reviews (if any)
            if (!empty($request->product_reviews)) {
                $orderProductIds = $order->items()->pluck('product_id')->unique()->toArray();
                foreach ($request->product_reviews as $pr) {
                    if (in_array((int)$pr['product_id'], $orderProductIds, true)) {
                        ProductReview::create([
                            'order_review_id' => $orderReview->id,
                            'order_id' => $order->id,
                            'product_id' => $pr['product_id'],
                            'user_id' => $user->id,
                            'rating' => $pr['rating'],
                            'comment' => $pr['comment'] ?? null,
                        ]);
                    }
                }
            }

            // Award loyalty points
            $bonusPoints = (int) Setting::get('review.bonus_points', 10);
            if ($bonusPoints > 0) {
                LoyaltyPoint::create([
                    'user_id' => $user->id,
                    'points' => $bonusPoints,
                    'type' => 'earn',
                    'description' => "Thưởng đánh giá đơn hàng " . $order->order_code,
                    'order_id' => $order->id,
                ]);
            }

            return $orderReview;
        });

        // Trigger real-time notification to admin
        try {
            // Load delivery/packaging information inside rating field for legacy toast details
            $orderReview->rating = $orderReview->overall_rating;
            $notificationService->sendNewReviewNotification($order, $orderReview);
        } catch (\Exception $e) {
            \Log::error("Failed to send review notification: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Đánh giá đơn hàng thành công!',
            'data' => $orderReview->load('productReviews'),
        ], 201);
    }

    // Admin lists reviews
    public function listReviews(Request $request)
    {
        $query = OrderReview::with(['user:id,name,email', 'order:id,order_code', 'productReviews.product:id,name,slug,sku,thumbnail'])->latest();

        if ($request->filled('status')) {
            if ($request->status === 'approved') {
                $query->where('is_approved', true);
            } elseif ($request->status === 'pending') {
                $query->where('is_approved', false);
            }
        }

        $paginator = $query->paginate($request->get('per_page', 20));
        $locale = $request->header('X-Locale', app()->getLocale());

        $items = collect($paginator->items())->map(function ($review) use ($locale) {
            $data = $review->toArray();
            $data['user'] = $review->user ? [
                'id' => $review->user->id,
                'name' => $review->user->name,
                'email' => $review->user->email,
            ] : null;
            $data['order'] = $review->order ? [
                'id' => $review->order->id,
                'order_code' => $review->order->order_code,
            ] : null;
            $data['product_reviews'] = collect($review->productReviews)->map(function ($pr) use ($locale) {
                $arr = $pr->toArray();
                $arr['product'] = $pr->product ? [
                    'id' => $pr->product->id,
                    'name' => $pr->product->getTranslation('name', $locale),
                    'sku' => $pr->product->sku,
                ] : null;
                return $arr;
            })->all();
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

    // Admin approves/disapproves review
    public function toggleApproval(Request $request, $id)
    {
        $review = OrderReview::findOrFail($id);
        $review->is_approved = !$review->is_approved;
        $review->save();

        return response()->json([
            'success' => true,
            'message' => $review->is_approved ? 'Đã duyệt đánh giá!' : 'Đã ẩn đánh giá!',
            'data' => $review,
        ]);
    }

    // Admin deletes review
    public function delete($id)
    {
        $review = OrderReview::findOrFail($id);
        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa đánh giá thành công!',
        ]);
    }

    // Public Product Details fetch reviews
    public function getProductReviews(Request $request, $productId)
    {
        $query = ProductReview::where('product_id', $productId)
            ->whereHas('orderReview', function ($q) {
                $q->where('is_approved', true);
            })
            ->with('user')
            ->latest();

        $reviews = $query->get();

        $totalReviews = $reviews->count();
        $averageRating = $totalReviews ? round($reviews->avg('rating'), 1) : 0;

        $breakdown = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];
        foreach ($reviews as $rev) {
            $r = (int) $rev->rating;
            if (isset($breakdown[$r])) {
                $breakdown[$r]++;
            }
        }
        foreach ($breakdown as $key => $count) {
            $breakdown[$key] = $totalReviews ? round(($count / $totalReviews) * 100) : 0;
        }

        $items = $reviews->map(function ($rev) {
            $name = $rev->user ? $rev->user->name : 'Khách vãng lai';
            $maskedName = $name;
            if (mb_strlen($name) > 2) {
                $first = mb_substr($name, 0, 1);
                $last = mb_substr($name, -1, 1);
                $maskedName = $first . '***' . $last;
            }

            return [
                'id' => $rev->id,
                'rating' => $rev->rating,
                'comment' => $rev->comment,
                'created_at' => $rev->created_at->toISOString(),
                'user' => [
                    'name' => $maskedName,
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'reviews' => $items,
                'total_reviews' => $totalReviews,
                'average_rating' => $averageRating,
                'breakdown' => $breakdown,
            ]
        ]);
    }

    // GET /api/reviews/featured
    // Lấy reviews để hiện testimonials
    public function featured()
    {
        $reviews = Review::where('is_approved', true)
            ->whereNotNull('comment')
            ->where('rating', '>=', 4)
            ->with(['user:id,name,avatar', 'product:id,name,thumbnail'])
            ->orderBy('rating', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(fn($r) => [
                'id'           => $r->id,
                'rating'       => $r->rating,
                'comment'      => $r->comment,
                'user_name'    => $r->user?->name ?? 'Khách',
                'user_avatar'  => $r->user?->avatar,
                'product_name' => $r->product?->name,
                'created_at'   => $r->created_at ? $r->created_at->format('d/m/Y') : '',
            ]);

        return response()->json(['data' => $reviews]);
    }
}
