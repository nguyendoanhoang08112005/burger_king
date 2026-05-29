<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Branch;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\LoyaltyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminController extends Controller
{
    // --- DASHBOARD STATS ---

    public function dashboardStats()
    {
        // 1. Core Metrics
        $totalSales = (float) Order::where('payment_status', 'paid')->sum('total');
        $pendingOrders = Order::where('status', 'pending')->count();
        $activeCustomers = User::where('role', 'customer')->count();
        $totalProducts = Product::count();

        // 2. Sales Trend (Last 7 Days) for Recharts
        $salesTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dailyTotal = Order::whereDate('created_at', $date)
                ->where('payment_status', 'paid')
                ->sum('total');

            $salesTrend[] = [
                'name' => $date->format('d/m'),
                'Doanh thu' => (float) $dailyTotal,
                'Đơn hàng' => Order::whereDate('created_at', $date)->count(),
            ];
        }

        // 3. Top Selling Products
        $topProducts = DB::table('order_items')
            ->select('product_name as name', DB::raw('SUM(quantity) as quantity'), DB::raw('SUM(subtotal) as value'))
            ->groupBy('product_name')
            ->orderBy('quantity', 'desc')
            ->limit(5)
            ->get();

        // 4. Latest Orders
        $latestOrders = Order::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'metrics' => [
                'total_sales' => $totalSales,
                'pending_orders' => $pendingOrders,
                'active_customers' => $activeCustomers,
                'total_products' => $totalProducts,
            ],
            'sales_trend' => $salesTrend,
            'top_products' => $topProducts,
            'latest_orders' => $latestOrders,
        ]);
    }

    // --- ORDERS MANAGEMENT ---

    public function listOrders(Request $request)
    {
        $query = Order::with(['user', 'items', 'address']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_status') && $request->payment_status !== 'all') {
            $query->where('payment_status', $request->payment_status);
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(15));
    }

    public function updateOrderStatus(Request $request, $id, NotificationService $notificationService, LoyaltyService $loyaltyService)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,delivering,delivered,cancelled',
            'payment_status' => 'nullable|in:unpaid,paid,refunded'
        ]);

        $order = Order::findOrFail($id);
        $oldStatus = $order->status;

        $updateData = ['status' => $request->status];
        if ($request->has('payment_status')) {
            $updateData['payment_status'] = $request->payment_status;
        }

        // If status becomes delivered, auto mark paid if COD/others
        if ($request->status === 'delivered' && $order->payment_method === 'cod') {
            $updateData['payment_status'] = 'paid';
        }

        $order->update($updateData);

        // 1. Award loyalty points on order completion
        if ($request->status === 'delivered' && $order->payment_status === 'paid') {
            $loyaltyService->awardPointsForOrder($order);
        }

        // 2. Handle point reversals if order is cancelled
        if ($request->status === 'cancelled' && $oldStatus !== 'cancelled') {
            $loyaltyService->refundPointsForCancelledOrder($order);
        }

        // 3. Send real-time tracking notification
        if ($oldStatus !== $request->status) {
            $notificationService->sendOrderStatusNotification($order);
        }

        return response()->json([
            'message' => 'Cập nhật trạng thái đơn hàng thành công!',
            'order' => $order->load(['items', 'address'])
        ]);
    }

    // --- PRODUCTS CRUD ---

    public function listProducts()
    {
        return response()->json(Product::with('category')->orderBy('sort_order')->get());
    }

    public function createProduct(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'base_price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'thumbnail' => 'required|string',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'is_featured' => 'nullable|boolean',
            'is_available' => 'nullable|boolean',
        ]);

        $product = Product::create([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => \Illuminate\Support\Str::slug($request->name),
            'base_price' => $request->base_price,
            'sale_price' => $request->sale_price,
            'thumbnail' => $request->thumbnail,
            'description' => $request->description,
            'short_description' => $request->short_description,
            'is_featured' => $request->is_featured ?? false,
            'is_available' => $request->is_available ?? true,
        ]);

        // Auto seed default sizes
        ProductSize::create(['product_id' => $product->id, 'size' => 'S', 'extra_price' => 0.00]);
        ProductSize::create(['product_id' => $product->id, 'size' => 'M', 'extra_price' => 15000.00]);
        ProductSize::create(['product_id' => $product->id, 'size' => 'L', 'extra_price' => 30000.00]);

        return response()->json([
            'message' => 'Thêm sản phẩm mới thành công!',
            'product' => $product
        ], 201);
    }

    public function updateProduct(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'base_price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'thumbnail' => 'required|string',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'is_featured' => 'nullable|boolean',
            'is_available' => 'nullable|boolean',
        ]);

        $product->update([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => \Illuminate\Support\Str::slug($request->name),
            'base_price' => $request->base_price,
            'sale_price' => $request->sale_price,
            'thumbnail' => $request->thumbnail,
            'description' => $request->description,
            'short_description' => $request->short_description,
            'is_featured' => $request->is_featured ?? $product->is_featured,
            'is_available' => $request->is_available ?? $product->is_available,
        ]);

        return response()->json([
            'message' => 'Cập nhật thông tin sản phẩm thành công!',
            'product' => $product
        ]);
    }

    public function deleteProduct($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Xóa sản phẩm thành công (Soft Delete).']);
    }

    // --- CATEGORIES CRUD ---

    public function listCategories()
    {
        return response()->json(Category::withCount('products')->get());
    }

    public function createCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => \Illuminate\Support\Str::slug($request->name),
            'description' => $request->description,
            'image' => $request->image,
        ]);

        return response()->json([
            'message' => 'Thêm danh mục mới thành công!',
            'category' => $category
        ], 201);
    }

    // --- COUPONS CRUD ---

    public function listCoupons()
    {
        return response()->json(Coupon::orderBy('created_at', 'desc')->get());
    }

    public function createCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:coupons,code',
            'type' => 'required|in:percent,fixed,free_ship',
            'value' => 'required|numeric|min:0',
            'min_order' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
        ]);

        $coupon = Coupon::create([
            'code' => strtoupper($request->code),
            'type' => $request->type,
            'value' => $request->value,
            'min_order' => $request->min_order ?? 0.00,
            'max_discount' => $request->max_discount,
            'usage_limit' => $request->usage_limit,
            'is_active' => true,
            'starts_at' => now(),
            'expires_at' => now()->addMonths(6)
        ]);

        return response()->json([
            'message' => 'Tạo mã giảm giá thành công!',
            'coupon' => $coupon
        ], 201);
    }
}
