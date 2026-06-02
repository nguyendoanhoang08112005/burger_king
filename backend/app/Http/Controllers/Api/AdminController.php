<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Branch;
use App\Models\Banner;
use App\Models\ComboItem;
use App\Models\ComboSet;
use App\Models\Post;
use App\Models\ProductTopping;
use App\Models\User;
use App\Models\Review;
use App\Services\NotificationService;
use App\Services\LoyaltyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class AdminController extends Controller
{
    private function ok($data = null, string $message = 'OK', array $meta = [])
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
            'meta' => $meta,
        ]);
    }

    private function page($paginator, string $message = 'OK')
    {
        return $this->ok($paginator->items(), $message, [
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
        ]);
    }

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

        return $this->ok([
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

    public function revenueChart(Request $request)
    {
        $period = $request->get('period', '7days');
        $days = match ($period) {
            '30days' => 30,
            '3months' => 90,
            default => 7,
        };

        $data = Order::where('status', 'delivered')
            ->where('created_at', '>=', now()->subDays($days))
            ->selectRaw('DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $result = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $day = now()->subDays($i);
            $date = $day->format('Y-m-d');
            $found = $data->firstWhere('date', $date);

            $result[] = [
                'date' => $day->format('d/m'),
                'revenue' => $found ? (int) $found->revenue : 0,
                'orders' => $found ? (int) $found->orders : 0,
            ];
        }

        return $this->ok($result);
    }

    public function recentOrders()
    {
        return $this->ok(Order::with(['user', 'items', 'address'])->latest()->limit(10)->get());
    }

    public function activityLog()
    {
        $activities = Order::with('user')->latest()->limit(10)->get()->map(fn ($order) => [
            'name' => $order->user?->name ?? 'Khách lẻ',
            'role' => $order->user?->role ?? 'customer',
            'action' => "tạo đơn {$order->order_code}",
            'time' => $order->created_at,
            'ip' => request()->ip(),
        ]);

        return $this->ok($activities);
    }

    // --- ORDERS MANAGEMENT ---

    public function listOrders(Request $request)
    {
        $query = Order::with(['user', 'items', 'address']);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status') && $request->payment_status !== 'all') {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_code', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($user) => $user->where('name', 'like', "%{$search}%"));
            });
        }

        return $this->page($query->latest()->paginate($request->get('per_page', 15)));
    }

    public function orderCounts()
    {
        $counts = Order::select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $counts['total'] = Order::count();

        return $this->ok($counts);
    }

    public function showOrder($id)
    {
        return $this->ok(Order::with(['user', 'items', 'address'])->findOrFail($id));
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

        return $this->ok($order->load(['user', 'items', 'address']), 'Cập nhật trạng thái đơn hàng thành công!');
    }

    // --- PRODUCTS CRUD ---

    public function listProducts(Request $request)
    {
        $query = Product::with('category')->orderBy('sort_order');

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('is_available')) {
            $query->where('is_available', filter_var($request->is_available, FILTER_VALIDATE_BOOLEAN));
        }

        return $this->page($query->paginate($request->get('per_page', 15)));
    }

    public function showProduct($id)
    {
        return $this->ok(Product::with(['category', 'sizes', 'images'])->findOrFail($id));
    }

    public function createProduct(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug',
            'base_price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'thumbnail' => 'required|string',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'is_featured' => 'nullable|boolean',
            'is_available' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'sizes' => 'nullable|array',
            'sizes.*.size' => 'required_with:sizes|in:S,M,L,XL',
            'sizes.*.extra_price' => 'nullable|numeric|min:0',
            'sizes.*.is_available' => 'nullable|boolean',
        ]);

        $product = Product::create([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => $request->slug ?: \Illuminate\Support\Str::slug($request->name),
            'base_price' => $request->base_price,
            'sale_price' => $request->sale_price,
            'thumbnail' => $request->thumbnail,
            'description' => $request->description,
            'short_description' => $request->short_description,
            'is_featured' => $request->is_featured ?? false,
            'is_available' => $request->is_available ?? true,
            'sort_order' => $request->sort_order ?? 0,
        ]);

        $sizes = $request->sizes ?: [
            ['size' => 'S', 'extra_price' => 0.00, 'is_available' => true],
            ['size' => 'M', 'extra_price' => 15000.00, 'is_available' => true],
            ['size' => 'L', 'extra_price' => 30000.00, 'is_available' => true],
        ];
        foreach ($sizes as $size) {
            ProductSize::create([
                'product_id' => $product->id,
                'size' => $size['size'],
                'extra_price' => $size['extra_price'] ?? 0,
                'is_available' => $size['is_available'] ?? true,
            ]);
        }

        return $this->ok($product->load('category'), 'Thêm sản phẩm mới thành công!')->setStatusCode(201);
    }

    public function updateProduct(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug,' . $product->id,
            'base_price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'thumbnail' => 'required|string',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'is_featured' => 'nullable|boolean',
            'is_available' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'sizes' => 'nullable|array',
            'sizes.*.size' => 'required_with:sizes|in:S,M,L,XL',
            'sizes.*.extra_price' => 'nullable|numeric|min:0',
            'sizes.*.is_available' => 'nullable|boolean',
        ]);

        $product->update([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => $request->slug ?: \Illuminate\Support\Str::slug($request->name),
            'base_price' => $request->base_price,
            'sale_price' => $request->sale_price,
            'thumbnail' => $request->thumbnail,
            'description' => $request->description,
            'short_description' => $request->short_description,
            'is_featured' => $request->is_featured ?? $product->is_featured,
            'is_available' => $request->is_available ?? $product->is_available,
            'sort_order' => $request->sort_order ?? $product->sort_order,
        ]);

        if ($request->has('sizes')) {
            $product->sizes()->delete();
            foreach ($request->sizes as $size) {
                ProductSize::create([
                    'product_id' => $product->id,
                    'size' => $size['size'],
                    'extra_price' => $size['extra_price'] ?? 0,
                    'is_available' => $size['is_available'] ?? true,
                ]);
            }
        }

        return $this->ok($product->load(['category', 'sizes']), 'Cập nhật thông tin sản phẩm thành công!');
    }

    public function patchProduct(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'base_price' => 'sometimes|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'thumbnail' => 'sometimes|string',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'is_featured' => 'sometimes|boolean',
            'is_available' => 'sometimes|boolean',
        ]);

        if (array_key_exists('name', $data)) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }

        $product->update($data);

        return $this->ok($product->load('category'), 'Cập nhật sản phẩm thành công!');
    }

    public function deleteProduct($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return $this->ok(null, 'Xóa sản phẩm thành công (Soft Delete).');
    }

    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:4096',
        ]);

        $path = $request->file('image')->store('admin', 'public');

        return $this->ok([
            'url' => url(Storage::url($path)),
        ], 'Upload ảnh thành công!');
    }

    // --- CATEGORIES CRUD ---

    public function listCategories()
    {
        $query = Category::withCount('products')->orderBy('sort_order');

        if (request()->filled('search')) {
            $query->where('name', 'like', '%' . request('search') . '%');
        }

        return $this->page($query->paginate(request('per_page', 10)));
    }

    public function createCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => $request->slug ?: \Illuminate\Support\Str::slug($request->name),
            'description' => $request->description,
            'image' => $request->image,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return $this->ok($category, 'Thêm danh mục mới thành công!')->setStatusCode(201);
    }

    public function showCategory($id)
    {
        return $this->ok(Category::withCount('products')->findOrFail($id));
    }

    public function updateCategory(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug,' . $category->id,
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);
        $data['slug'] = $data['slug'] ?: \Illuminate\Support\Str::slug($data['name']);
        $category->update($data);

        return $this->ok($category->loadCount('products'), 'Cập nhật danh mục thành công!');
    }

    public function deleteCategory($id)
    {
        Category::findOrFail($id)->delete();

        return $this->ok(null, 'Xóa danh mục thành công!');
    }

    // --- COUPONS CRUD ---

    public function listCoupons()
    {
        return $this->ok(Coupon::orderBy('created_at', 'desc')->get());
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
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'is_active' => 'nullable|boolean',
        ]);

        $coupon = Coupon::create([
            'code' => strtoupper($request->code),
            'type' => $request->type,
            'value' => $request->value,
            'min_order' => $request->min_order ?? 0.00,
            'max_discount' => $request->max_discount,
            'usage_limit' => $request->usage_limit,
            'is_active' => $request->boolean('is_active', true),
            'starts_at' => $request->starts_at ?? now(),
            'expires_at' => $request->expires_at ?? now()->addMonths(6)
        ]);

        return $this->ok($coupon, 'Tạo mã giảm giá thành công!')->setStatusCode(201);
    }

    public function showCoupon($id)
    {
        return $this->ok(Coupon::findOrFail($id));
    }

    public function updateCoupon(Request $request, $id)
    {
        $coupon = Coupon::findOrFail($id);
        $data = $request->validate([
            'code' => 'required|string|unique:coupons,code,' . $coupon->id,
            'type' => 'required|in:percent,fixed,free_ship',
            'value' => 'required|numeric|min:0',
            'min_order' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'is_active' => 'nullable|boolean',
        ]);

        $data['code'] = strtoupper($data['code']);
        $coupon->update($data);

        return $this->ok($coupon, 'Cập nhật mã giảm giá thành công!');
    }

    public function deleteCoupon($id)
    {
        Coupon::findOrFail($id)->delete();

        return $this->ok(null, 'Xóa mã giảm giá thành công!');
    }

    public function listUsers(Request $request)
    {
        $query = User::withCount('orders')->withTrashed();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return $this->page($query->latest()->paginate($request->get('per_page', 20)));
    }

    public function updateUserRole(Request $request, $id)
    {
        $request->validate(['role' => 'required|in:customer,admin,staff']);
        $user = User::withTrashed()->findOrFail($id);
        $user->update(['role' => $request->role]);

        return $this->ok($user, 'Cập nhật role thành công!');
    }

    public function toggleUserStatus($id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->trashed() ? $user->restore() : $user->delete();

        return $this->ok(User::withTrashed()->find($id), 'Cập nhật trạng thái tài khoản thành công!');
    }

    public function listReviews(Request $request)
    {
        $query = Review::with(['product', 'user'])->latest();

        if ($request->filled('status')) {
            if ($request->status === 'approved') {
                $query->where('is_approved', true);
            } elseif ($request->status === 'pending') {
                $query->where('is_approved', false);
            }
        }

        return $this->page($query->paginate($request->get('per_page', 20)));
    }

    public function approveReview($id)
    {
        $review = Review::findOrFail($id);
        $review->update(['is_approved' => true]);

        return $this->ok($review->load(['product', 'user']), 'Đã duyệt đánh giá!');
    }

    public function hideReview($id)
    {
        $review = Review::findOrFail($id);
        $review->update(['is_approved' => false]);

        return $this->ok($review->load(['product', 'user']), 'Đã ẩn đánh giá!');
    }

    public function deleteReview($id)
    {
        Review::findOrFail($id)->delete();

        return $this->ok(null, 'Xóa đánh giá thành công!');
    }

    public function reportSummary()
    {
        $start = now()->startOfMonth();
        $orders = Order::where('created_at', '>=', $start);

        return $this->ok([
            'month_revenue' => (float) (clone $orders)->where('status', 'delivered')->sum('total'),
            'month_orders' => (clone $orders)->count(),
            'newCustomers' => User::where('role', 'customer')->where('created_at', '>=', $start)->count(),
            'counts' => Order::select('status', DB::raw('COUNT(*) as total'))->groupBy('status')->pluck('total', 'status'),
        ]);
    }

    public function topProducts()
    {
        $products = DB::table('order_items')
            ->select('product_name as name', DB::raw('SUM(quantity) as quantity'), DB::raw('SUM(subtotal) as value'))
            ->groupBy('product_name')
            ->orderByDesc('quantity')
            ->limit(10)
            ->get();

        return $this->ok($products);
    }

    public function topCustomers()
    {
        $customers = User::query()
            ->select('users.id', 'users.name', 'users.email')
            ->join('orders', 'orders.user_id', '=', 'users.id')
            ->selectRaw('COUNT(orders.id) as orders_count, SUM(orders.total) as total_spent')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('total_spent')
            ->limit(10)
            ->get();

        return $this->ok($customers);
    }

    public function exportCsv()
    {
        return $this->revenueChart(request()->merge(['period' => request('period', '30days')]));
    }

    public function listCombos(Request $request)
    {
        $query = ComboSet::with('items.product')->withCount('items')->latest();
        if ($request->filled('search')) $query->where('name', 'like', "%{$request->search}%");
        return $this->page($query->paginate($request->get('per_page', 10)));
    }

    public function showCombo($id)
    {
        return $this->ok(ComboSet::with('items.product')->findOrFail($id));
    }

    public function createCombo(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:combo_sets,slug',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'is_active' => 'nullable|boolean',
            'items' => 'nullable|array',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity' => 'nullable|integer|min:1',
            'items.*.size' => 'nullable|in:S,M,L,XL',
        ]);
        $combo = ComboSet::create([
            ...$data,
            'slug' => $data['slug'] ?? \Illuminate\Support\Str::slug($data['name']),
            'is_active' => $request->boolean('is_active', true),
        ]);
        $this->syncComboItems($combo, $request->items ?? []);
        return $this->ok($combo->load('items.product'), 'Tạo combo thành công!')->setStatusCode(201);
    }

    public function updateCombo(Request $request, $id)
    {
        $combo = ComboSet::findOrFail($id);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:combo_sets,slug,' . $combo->id,
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'is_active' => 'nullable|boolean',
            'items' => 'nullable|array',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity' => 'nullable|integer|min:1',
            'items.*.size' => 'nullable|in:S,M,L,XL',
        ]);
        unset($data['items']);
        $data['slug'] = $data['slug'] ?: \Illuminate\Support\Str::slug($data['name']);
        $combo->update($data);
        $this->syncComboItems($combo, $request->items ?? []);
        return $this->ok($combo->load('items.product'), 'Cập nhật combo thành công!');
    }

    public function deleteCombo($id)
    {
        ComboSet::findOrFail($id)->delete();
        return $this->ok(null, 'Xóa combo thành công!');
    }

    private function syncComboItems(ComboSet $combo, array $items): void
    {
        $combo->items()->delete();
        foreach ($items as $item) {
            ComboItem::create([
                'combo_id' => $combo->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'] ?? 1,
                'size' => $item['size'] ?? 'S',
            ]);
        }
    }

    public function listToppings(Request $request)
    {
        $query = ProductTopping::query()->latest();
        if ($request->filled('search')) $query->where('name', 'like', "%{$request->search}%");
        if ($request->filled('category')) $query->where('category', $request->category);
        if ($request->filled('category_id')) {
            $categoryId = (int) $request->category_id;
            $query->where(function ($q) use ($categoryId) {
                $q->whereNull('category_ids')
                    ->orWhereJsonLength('category_ids', 0)
                    ->orWhereJsonContains('category_ids', $categoryId);
            });
        }
        return $this->page($query->paginate($request->get('per_page', 10)));
    }

    public function createTopping(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|in:sauce,cheese,veggie,meat',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string',
            'is_available' => 'nullable|boolean',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
        ]);
        $data['is_available'] = $request->boolean('is_available', true);
        $data['category_ids'] = array_values(array_map('intval', $data['category_ids'] ?? []));
        return $this->ok(ProductTopping::create($data), 'Tạo topping thành công!')->setStatusCode(201);
    }

    public function updateTopping(Request $request, $id)
    {
        $topping = ProductTopping::findOrFail($id);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|in:sauce,cheese,veggie,meat',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string',
            'is_available' => 'nullable|boolean',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
        ]);
        $data['category_ids'] = array_values(array_map('intval', $data['category_ids'] ?? []));
        $topping->update($data);
        return $this->ok($topping, 'Cập nhật topping thành công!');
    }

    public function deleteTopping($id)
    {
        ProductTopping::findOrFail($id)->delete();
        return $this->ok(null, 'Xóa topping thành công!');
    }

    public function listBanners(Request $request)
    {
        $query = Banner::orderBy('sort_order');
        if ($request->filled('search')) $query->where('title', 'like', "%{$request->search}%");
        if ($request->filled('position')) $query->where('position', $request->position);
        return $this->page($query->paginate($request->get('per_page', 10)));
    }

    public function createBanner(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'image' => 'required|string',
            'link' => 'nullable|string|max:255',
            'position' => 'required|in:hero,popup,sidebar',
            'sort_order' => 'nullable|integer',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'is_active' => 'nullable|boolean',
        ]);
        $data['is_active'] = $request->boolean('is_active', true);
        return $this->ok(Banner::create($data), 'Tạo banner thành công!')->setStatusCode(201);
    }

    public function updateBanner(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'image' => 'required|string',
            'link' => 'nullable|string|max:255',
            'position' => 'required|in:hero,popup,sidebar',
            'sort_order' => 'nullable|integer',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'is_active' => 'nullable|boolean',
        ]);
        $banner->update($data);
        return $this->ok($banner, 'Cập nhật banner thành công!');
    }

    public function deleteBanner($id)
    {
        Banner::findOrFail($id)->delete();
        return $this->ok(null, 'Xóa banner thành công!');
    }

    public function listBranches(Request $request)
    {
        $query = Branch::latest();
        if ($request->filled('search')) $query->where('name', 'like', "%{$request->search}%")->orWhere('address', 'like', "%{$request->search}%");
        return $this->page($query->paginate($request->get('per_page', 10)));
    }

    public function createBranch(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'open_time' => 'required',
            'close_time' => 'required',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'is_active' => 'nullable|boolean',
        ]);
        $data['is_active'] = $request->boolean('is_active', true);
        return $this->ok(Branch::create($data), 'Tạo chi nhánh thành công!')->setStatusCode(201);
    }

    public function updateBranch(Request $request, $id)
    {
        $branch = Branch::findOrFail($id);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'open_time' => 'required',
            'close_time' => 'required',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'is_active' => 'nullable|boolean',
        ]);
        $branch->update($data);
        return $this->ok($branch, 'Cập nhật chi nhánh thành công!');
    }

    public function deleteBranch($id)
    {
        Branch::findOrFail($id)->delete();
        return $this->ok(null, 'Xóa chi nhánh thành công!');
    }

    public function listPosts(Request $request)
    {
        $query = Post::latest('published_at');
        if ($request->filled('search')) $query->where('title', 'like', "%{$request->search}%");
        if ($request->filled('status')) $query->where('is_published', $request->status === 'published');
        if ($request->filled('category')) $query->where('category', $request->category);
        return $this->page($query->paginate($request->get('per_page', 10)));
    }

    public function postCategories()
    {
        return $this->ok(
            Post::query()
                ->whereNotNull('category')
                ->select('category')
                ->distinct()
                ->orderBy('category')
                ->pluck('category')
                ->values()
        );
    }

    public function createPost(Request $request)
    {
        $data = $this->validatePost($request);
        return $this->ok(Post::create($data), 'Tạo bài viết thành công!')->setStatusCode(201);
    }

    public function showPost($id)
    {
        return $this->ok(Post::findOrFail($id));
    }

    public function updatePost(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        $data = $this->validatePost($request, $post->id);
        $post->update($data);
        return $this->ok($post, 'Cập nhật bài viết thành công!');
    }

    public function deletePost($id)
    {
        Post::findOrFail($id)->delete();
        return $this->ok(null, 'Xóa bài viết thành công!');
    }

    private function validatePost(Request $request, $ignoreId = null): array
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:posts,slug' . ($ignoreId ? ',' . $ignoreId : ''),
            'excerpt' => 'required|string|max:200',
            'content' => 'required|string',
            'thumbnail' => 'required|string',
            'category' => 'required|string|max:255',
            'author' => 'nullable|string|max:255',
            'read_time' => 'nullable|integer|min:1',
            'video_url' => 'nullable|string|max:255',
            'is_published' => 'nullable|boolean',
            'published_at' => 'nullable|date',
        ]);
        $data['slug'] = $data['slug'] ?: \Illuminate\Support\Str::slug($data['title']);
        $data['author'] = $data['author'] ?? 'Hamburger King Editorial';
        $data['read_time'] = $data['read_time'] ?? 5;
        $data['is_published'] = $request->boolean('is_published', true);
        $data['published_at'] = $data['published_at'] ?? now();
        return $data;
    }
}
