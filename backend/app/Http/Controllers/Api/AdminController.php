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
use App\Models\Translation;
use App\Services\NotificationService;
use App\Services\LoyaltyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
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
        $totalOrders = Order::count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $activeCustomers = User::where('role', 'customer')->count();
        $totalProducts = Product::count();
        $totalReviews = Review::count();

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
                __('api.messages.orders_metric') => Order::whereDate('created_at', $date)->count(),
            ];
        }

        // 3. Top Selling Products
        $topProducts = DB::table('order_items')
            ->select('product_name as name', 'product_sku as sku', DB::raw('SUM(quantity) as quantity'), DB::raw('SUM(subtotal) as value'))
            ->groupBy('product_sku', 'product_name')
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
                'total_orders' => $totalOrders,
                'pending_orders' => $pendingOrders,
                'active_customers' => $activeCustomers,
                'total_products' => $totalProducts,
                'total_reviews' => $totalReviews,
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
        $startDate = now()->subDays($days - 1)->startOfDay();

        $data = Order::where('status', 'completed')
            ->where('created_at', '>=', $startDate)
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

    public function activityLog(Request $request)
    {
        $paginator = Order::with('user')->latest()->paginate($request->get('per_page', 5));

        $paginator->getCollection()->transform(fn ($order) => [
            'name' => $order->user?->name ?? __('api.messages.walk_in_customer'),
            'role' => $order->user?->role ?? 'customer',
            'action' => __('api.messages.activity_created_order', ['code' => $order->order_code]),
            'time' => $order->created_at,
            'ip' => request()->ip(),
        ]);

        return $this->page($paginator);
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
            'status' => 'required|in:pending,confirmed,preparing,delivering,completed,cancelled',
            'payment_status' => 'nullable|in:unpaid,paid,refunded'
        ]);

        $order = Order::findOrFail($id);
        $oldStatus = $order->status;
        $allowedTransitions = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['preparing', 'cancelled'],
            'preparing' => ['delivering', 'cancelled'],
            'delivering' => ['completed'],
            'completed' => [],
            'cancelled' => [],
        ];

        if ($request->status !== $oldStatus && !in_array($request->status, $allowedTransitions[$oldStatus] ?? [], true)) {
            return response()->json([
                'message' => __('api.messages.order_status_invalid_transition'),
            ], 422);
        }

        $updateData = ['status' => $request->status];
        if ($request->has('payment_status')) {
            $updateData['payment_status'] = $request->payment_status;
        }

        // If status becomes completed, auto mark paid if COD/others
        if ($request->status === 'completed' && $order->payment_method === 'cod') {
            $updateData['payment_status'] = 'paid';
        }

        $order->update($updateData);

        // 1. Award loyalty points on order completion
        if ($request->status === 'completed' && $order->payment_status === 'paid') {
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

        return $this->ok($order->load(['user', 'items', 'address']), __('api.messages.order_status_updated'));
    }

    // --- PRODUCTS CRUD ---

    public function listProducts(Request $request)
    {
        $query = Product::with(['translations', 'category.translations'])->orderBy('sort_order');

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
        return $this->ok(Product::with(['category', 'sizes', 'images', 'translations'])->findOrFail($id));
    }

    public function createProduct(Request $request)
    {
        if ($request->has('translations')) {
            $request->merge([
                'name' => $request->input('translations.name'),
                'description' => $request->input('translations.description'),
                'short_description' => $request->input('translations.short_description'),
            ]);
        }

        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required',
            'slug' => 'nullable|string|max:255|unique:products,slug',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'base_price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'thumbnail' => 'required|string',
            'description' => 'nullable',
            'short_description' => 'nullable',
            'is_featured' => 'nullable|boolean',
            'is_available' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'sizes' => 'nullable|array',
            'sizes.*.size' => 'required_with:sizes|in:S,M,L,XL',
            'sizes.*.sku' => 'nullable|string|max:100|distinct',
            'sizes.*.extra_price' => 'nullable|numeric|min:0',
            'sizes.*.is_available' => 'nullable|boolean',
        ]);

        $slugName = is_array($request->name) ? ($request->name['vi'] ?? '') : $request->name;

        $product = Product::create([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => $request->slug ?: \Illuminate\Support\Str::slug($slugName),
            'sku' => $this->normalizeSku($request->sku),
            'base_price' => $request->base_price,
            'sale_price' => $request->sale_price,
            'thumbnail' => $request->thumbnail,
            'description' => $request->description,
            'short_description' => $request->short_description,
            'is_featured' => $request->is_featured ?? false,
            'is_available' => $request->is_available ?? true,
            'sort_order' => $request->sort_order ?? 0,
        ]);

        if (!$product->sku) {
            $product->update(['sku' => $this->generatedSku('PRD', $product->slug, $product->id)]);
        }

        $sizes = $request->sizes ?: [
            ['size' => 'S', 'extra_price' => 0.00, 'is_available' => true],
            ['size' => 'M', 'extra_price' => 15000.00, 'is_available' => true],
            ['size' => 'L', 'extra_price' => 30000.00, 'is_available' => true],
        ];
        foreach ($sizes as $size) {
            ProductSize::create([
                'product_id' => $product->id,
                'size' => $size['size'],
                'sku' => $this->normalizeSku($size['sku'] ?? null) ?: "{$product->sku}-{$size['size']}",
                'extra_price' => $size['extra_price'] ?? 0,
                'is_available' => $size['is_available'] ?? true,
            ]);
        }

        return $this->ok($product->load('category'), __('api.messages.product_created'))->setStatusCode(201);
    }

    public function updateProduct(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        if ($request->has('translations')) {
            $request->merge([
                'name' => $request->input('translations.name'),
                'description' => $request->input('translations.description'),
                'short_description' => $request->input('translations.short_description'),
            ]);
        }

        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required',
            'slug' => 'nullable|string|max:255|unique:products,slug,' . $product->id,
            'sku' => 'nullable|string|max:100|unique:products,sku,' . $product->id,
            'base_price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'thumbnail' => 'required|string',
            'description' => 'nullable',
            'short_description' => 'nullable',
            'is_featured' => 'nullable|boolean',
            'is_available' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'sizes' => 'nullable|array',
            'sizes.*.size' => 'required_with:sizes|in:S,M,L,XL',
            'sizes.*.sku' => 'nullable|string|max:100|distinct',
            'sizes.*.extra_price' => 'nullable|numeric|min:0',
            'sizes.*.is_available' => 'nullable|boolean',
        ]);

        $slugName = is_array($request->name) ? ($request->name['vi'] ?? '') : $request->name;

        $product->update([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => $request->slug ?: \Illuminate\Support\Str::slug($slugName),
            'sku' => $this->normalizeSku($request->sku) ?: $this->generatedSku('PRD', $request->slug ?: $slugName, $product->id),
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
                    'sku' => $this->normalizeSku($size['sku'] ?? null) ?: "{$product->sku}-{$size['size']}",
                    'extra_price' => $size['extra_price'] ?? 0,
                    'is_available' => $size['is_available'] ?? true,
                ]);
            }
        }

        return $this->ok($product->load(['category', 'sizes']), __('api.messages.product_updated_details'));
    }

    public function patchProduct(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'sku' => 'sometimes|nullable|string|max:100|unique:products,sku,' . $product->id,
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
        if (array_key_exists('sku', $data)) {
            $data['sku'] = $this->normalizeSku($data['sku']);
        }

        $product->update($data);

        return $this->ok($product->load('category'), __('api.messages.product_updated'));
    }

    public function deleteProduct($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return $this->ok(null, __('api.messages.product_deleted'));
    }

    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:4096',
        ]);

        $path = $request->file('image')->store('admin', 'public');

        return $this->ok([
            'url' => url(Storage::url($path)),
        ], __('api.messages.image_uploaded'));
    }

    // --- CATEGORIES CRUD ---

    public function listCategories()
    {
        $query = Category::with('translations')->withCount('products')->orderBy('sort_order');

        if (request()->filled('search')) {
            $query->where('name', 'like', '%' . request('search') . '%');
        }

        return $this->page($query->paginate(request('per_page', 10)));
    }

    public function createCategory(Request $request)
    {
        if ($request->has('translations')) {
            $request->merge([
                'name' => $request->input('translations.name'),
                'description' => $request->input('translations.description'),
            ]);
        }

        $request->validate([
            'name' => 'required',
            'slug' => 'nullable|string|max:255|unique:categories,slug',
            'description' => 'nullable',
            'image' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $slugName = is_array($request->name) ? ($request->name['vi'] ?? '') : $request->name;

        $category = Category::create([
            'name' => $request->name,
            'slug' => $request->slug ?: \Illuminate\Support\Str::slug($slugName),
            'description' => $request->description,
            'image' => $request->image,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return $this->ok($category, __('api.messages.category_created'))->setStatusCode(201);
    }

    public function showCategory($id)
    {
        return $this->ok(Category::with('translations')->withCount('products')->findOrFail($id));
    }

    public function updateCategory(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        if ($request->has('translations')) {
            $request->merge([
                'name' => $request->input('translations.name'),
                'description' => $request->input('translations.description'),
            ]);
        }

        $data = $request->validate([
            'name' => 'required',
            'slug' => 'nullable|string|max:255|unique:categories,slug,' . $category->id,
            'description' => 'nullable',
            'image' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $slugName = is_array($request->name) ? ($request->name['vi'] ?? '') : $request->name;
        $data['slug'] = $data['slug'] ?: \Illuminate\Support\Str::slug($slugName);

        $category->update($data);

        return $this->ok($category->loadCount('products'), __('api.messages.category_updated'));
    }

    public function deleteCategory($id)
    {
        Category::findOrFail($id)->delete();

        return $this->ok(null, __('api.messages.category_deleted'));
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

        return $this->ok($coupon, __('api.messages.coupon_created'))->setStatusCode(201);
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

        return $this->ok($coupon, __('api.messages.coupon_updated'));
    }

    public function deleteCoupon($id)
    {
        Coupon::findOrFail($id)->delete();

        return $this->ok(null, __('api.messages.coupon_deleted'));
    }

    public function listUsers(Request $request)
    {
        $query = User::withCount('orders')->with('permissions')->withTrashed();

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

    public function createStaff(Request $request)
    {
        abort_unless($request->user()->isAdmin(), 403);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'permissions' => 'array',
            'permissions.*' => ['string', Rule::in(config('admin_permissions'))],
        ]);

        $staff = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'role' => 'staff',
        ]);
        $staff->assignRole(Role::firstOrCreate(['name' => 'staff']));
        $this->syncStaffPermissions($staff, $data['permissions'] ?? []);

        return $this->ok($staff->load('permissions'), __('api.messages.staff_created'));
    }

    public function updateStaff(Request $request, $id)
    {
        abort_unless($request->user()->isAdmin(), 403);

        $staff = User::withTrashed()->where('role', 'staff')->findOrFail($id);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($staff->id)],
            'phone' => 'nullable|string|max:20',
            'permissions' => 'array',
            'permissions.*' => ['string', Rule::in(config('admin_permissions'))],
        ]);

        $staff->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
        ]);
        $this->syncStaffPermissions($staff, $data['permissions'] ?? []);

        return $this->ok($staff->load('permissions'), __('api.messages.staff_updated'));
    }

    public function updateUser(Request $request, $id)
    {
        abort_unless($request->user()->isAdmin(), 403);

        $user = User::withTrashed()->findOrFail($id);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update($data);

        return $this->ok($user->load('permissions'), __('api.messages.user_updated'));
    }

    private function syncStaffPermissions(User $staff, array $modules): void
    {
        $permissions = collect($modules)->map(
            fn (string $module) => Permission::firstOrCreate(['name' => "access.{$module}"])
        );
        $staff->syncPermissions($permissions);
    }

    public function updateUserRole(Request $request, $id)
    {
        abort_unless($request->user()->isAdmin(), 403);
        $request->validate(['role' => 'required|in:customer,admin,staff']);
        $user = User::withTrashed()->findOrFail($id);
        $user->update(['role' => $request->role]);
        $user->syncRoles([Role::firstOrCreate(['name' => $request->role])]);
        if ($request->role !== 'staff') {
            $user->syncPermissions([]);
        }

        return $this->ok($user, __('api.messages.role_updated'));
    }

    public function toggleUserStatus(Request $request, $id)
    {
        abort_unless($request->user()->isAdmin(), 403);
        $user = User::withTrashed()->findOrFail($id);
        abort_if($user->id === $request->user()->id, 422, __('api.messages.current_user_protected'));
        abort_if($user->isAdmin(), 422, __('api.messages.admin_user_protected'));
        $user->trashed() ? $user->restore() : $user->delete();

        return $this->ok(User::withTrashed()->find($id), __('api.messages.account_status_updated'));
    }

    public function deleteUser(Request $request, $id)
    {
        abort_unless($request->user()->isAdmin(), 403);
        $user = User::withTrashed()->findOrFail($id);
        abort_if($user->id === $request->user()->id, 422, __('api.messages.current_user_protected'));
        abort_if($user->isAdmin(), 422, __('api.messages.admin_user_protected'));
        $user->forceDelete();

        return $this->ok(null, __('api.messages.user_deleted'));
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

        $paginator = $query->paginate($request->get('per_page', 20));
        $locale = $request->header('X-Locale', app()->getLocale());

        $items = collect($paginator->items())->map(function ($review) use ($locale) {
            $data = $review->toArray();
            $data['product'] = $review->product ? [
                'id' => $review->product->id,
                'name' => $review->product->getTranslation('name', $locale),
                'sku' => $review->product->sku,
            ] : null;
            $data['user'] = $review->user ? [
                'id' => $review->user->id,
                'name' => $review->user->name,
                'email' => $review->user->email,
            ] : null;

            return $data;
        })->all();

        return $this->ok($items, 'OK', [
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
        ]);
    }

    public function showReview(Request $request, $id)
    {
        $review = Review::with(['product', 'user', 'order.items', 'order.address'])->findOrFail($id);

        return $this->ok($this->serializeReview($review, $request));
    }

    public function deleteReview($id)
    {
        Review::findOrFail($id)->delete();

        return $this->ok(null, __('api.messages.review_deleted'));
    }

    private function serializeReview(Review $review, Request $request): array
    {
        $locale = $request->header('X-Locale', app()->getLocale());
        $data = $review->toArray();
        $data['product'] = $review->product ? [
            'id' => $review->product->id,
            'name' => $review->product->getTranslation('name', $locale),
            'sku' => $review->product->sku,
        ] : null;
        $data['user'] = $review->user ? [
            'id' => $review->user->id,
            'name' => $review->user->name,
            'email' => $review->user->email,
            'phone' => $review->user->phone,
        ] : null;
        $data['order'] = $review->order ? [
            'id' => $review->order->id,
            'order_code' => $review->order->order_code,
            'status' => $review->order->status,
            'total' => (float) $review->order->total,
            'created_at' => $review->order->created_at,
            'items' => $review->order->items,
            'address' => $review->order->address,
        ] : null;

        return $data;
    }

    public function reportSummary()
    {
        $start = now()->startOfMonth();
        $last30Days = now()->subDays(29)->startOfDay();
        $orders = Order::where('created_at', '>=', $start);
        $counts = Order::select('status', DB::raw('COUNT(*) as total'))->groupBy('status')->pluck('total', 'status');
        $counts['total'] = $counts->sum();
        $deliveredOrders = Order::where('status', 'completed');
        $totalRevenue = (float) (clone $deliveredOrders)->sum('total');
        $deliveredOrdersCount = (clone $deliveredOrders)->count();
        $completedOrdersLast30Days = Order::where('status', 'completed')->where('created_at', '>=', $last30Days)->count();
        $totalReviews = Review::count();

        return $this->ok([
            'month_revenue' => (float) (clone $orders)->where('status', 'completed')->sum('total'),
            'month_orders' => (clone $orders)->count(),
            'total_revenue' => $totalRevenue,
            'total_orders' => (int) $counts['total'],
            'completed_orders_30_days' => $completedOrdersLast30Days,
            'average_order_value' => $deliveredOrdersCount ? round($totalRevenue / $deliveredOrdersCount) : 0,
            'total_customers' => User::where('role', 'customer')->count(),
            'total_products' => Product::count(),
            'total_reviews' => $totalReviews,
            'average_rating' => $totalReviews ? round((float) Review::avg('rating'), 1) : 0,
            'newCustomers' => User::where('role', 'customer')->where('created_at', '>=', $start)->count(),
            'counts' => $counts,
        ]);
    }

    public function topProducts()
    {
        $products = DB::table('order_items')
            ->select('product_name as name', 'product_sku as sku', DB::raw('SUM(quantity) as quantity'), DB::raw('SUM(subtotal) as value'))
            ->groupBy('product_sku', 'product_name')
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
            ->where('orders.status', 'completed')
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
        $query = ComboSet::with(['translations', 'items.product'])->withCount('items')->latest();
        if ($request->filled('search')) $query->where('name', 'like', "%{$request->search}%");
        return $this->page($query->paginate($request->get('per_page', 10)));
    }

    public function showCombo($id)
    {
        return $this->ok(ComboSet::with(['items.product', 'translations'])->findOrFail($id));
    }

    public function createCombo(Request $request)
    {
        if ($request->has('translations')) {
            $request->merge([
                'name' => $request->input('translations.name'),
                'description' => $request->input('translations.description'),
            ]);
        }

        $data = $request->validate([
            'name' => 'required',
            'slug' => 'nullable|string|max:255|unique:combo_sets,slug',
            'sku' => 'nullable|string|max:100|unique:combo_sets,sku',
            'description' => 'nullable',
            'image' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'is_active' => 'nullable|boolean',
            'items' => 'nullable|array',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity' => 'nullable|integer|min:1',
            'items.*.size' => 'nullable|in:S,M,L,XL',
        ]);

        $slugName = is_array($request->name) ? ($request->name['vi'] ?? '') : $request->name;

        $combo = ComboSet::create([
            'name' => $request->name,
            'slug' => $request->slug ?: \Illuminate\Support\Str::slug($slugName),
            'sku' => $this->normalizeSku($request->sku),
            'description' => $request->description,
            'image' => $request->image,
            'price' => $request->price,
            'is_active' => $request->boolean('is_active', true),
        ]);
        if (!$combo->sku) {
            $combo->update(['sku' => $this->generatedSku('CMB', $combo->slug, $combo->id)]);
        }
        $this->syncComboItems($combo, $request->items ?? []);
        return $this->ok($combo->load('items.product'), __('api.messages.combo_created'))->setStatusCode(201);
    }

    public function updateCombo(Request $request, $id)
    {
        $combo = ComboSet::findOrFail($id);

        if ($request->has('translations')) {
            $request->merge([
                'name' => $request->input('translations.name'),
                'description' => $request->input('translations.description'),
            ]);
        }

        $data = $request->validate([
            'name' => 'required',
            'slug' => 'nullable|string|max:255|unique:combo_sets,slug,' . $combo->id,
            'sku' => 'nullable|string|max:100|unique:combo_sets,sku,' . $combo->id,
            'description' => 'nullable',
            'image' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'is_active' => 'nullable|boolean',
            'items' => 'nullable|array',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity' => 'nullable|integer|min:1',
            'items.*.size' => 'nullable|in:S,M,L,XL',
        ]);
        unset($data['items']);
        $slugName = is_array($request->name) ? ($request->name['vi'] ?? '') : $request->name;
        $data['slug'] = $data['slug'] ?: \Illuminate\Support\Str::slug($slugName);
        $data['sku'] = $this->normalizeSku($data['sku'] ?? null) ?: $this->generatedSku('CMB', $data['slug'] ?: $slugName, $combo->id);
        $combo->update($data);
        $this->syncComboItems($combo, $request->items ?? []);
        return $this->ok($combo->load('items.product'), __('api.messages.combo_updated'));
    }

    public function deleteCombo($id)
    {
        ComboSet::findOrFail($id)->delete();
        return $this->ok(null, __('api.messages.combo_deleted'));
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
        $query = ProductTopping::with('translations')->latest();
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
        if ($request->has('translations')) {
            $request->merge([
                'name' => $request->input('translations.name'),
            ]);
        }

        $data = $request->validate([
            'name' => 'required',
            'sku' => 'nullable|string|max:100|unique:product_toppings,sku',
            'category' => 'required|in:sauce,cheese,veggie,meat',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string',
            'is_available' => 'nullable|boolean',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
        ]);
        $data['sku'] = $this->normalizeSku($data['sku'] ?? null);
        $data['is_available'] = $request->boolean('is_available', true);
        $data['category_ids'] = array_values(array_map('intval', $data['category_ids'] ?? []));
        $topping = ProductTopping::create($data);
        if (!$topping->sku) {
            $topping->update(['sku' => $this->generatedSku('TOP', $topping->name, $topping->id)]);
        }
        return $this->ok($topping, __('api.messages.topping_created'))->setStatusCode(201);
    }

    public function showTopping($id)
    {
        return $this->ok(ProductTopping::with('translations')->findOrFail($id));
    }

    public function updateTopping(Request $request, $id)
    {
        $topping = ProductTopping::findOrFail($id);

        if ($request->has('translations')) {
            $request->merge([
                'name' => $request->input('translations.name'),
            ]);
        }

        $data = $request->validate([
            'name' => 'required',
            'sku' => 'nullable|string|max:100|unique:product_toppings,sku,' . $topping->id,
            'category' => 'required|in:sauce,cheese,veggie,meat',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string',
            'is_available' => 'nullable|boolean',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
        ]);
        $data['sku'] = $this->normalizeSku($data['sku'] ?? null) ?: $this->generatedSku('TOP', $data['name'], $topping->id);
        $data['category_ids'] = array_values(array_map('intval', $data['category_ids'] ?? []));
        $topping->update($data);
        return $this->ok($topping, __('api.messages.topping_updated'));
    }

    public function deleteTopping($id)
    {
        ProductTopping::findOrFail($id)->delete();
        return $this->ok(null, __('api.messages.topping_deleted'));
    }

    private function normalizeSku(?string $sku): ?string
    {
        if (!$sku) {
            return null;
        }

        return \Illuminate\Support\Str::upper(\Illuminate\Support\Str::slug($sku, '-'));
    }

    private function generatedSku(string $prefix, ?string $source, int $id): string
    {
        $base = \Illuminate\Support\Str::upper(\Illuminate\Support\Str::slug($source ?: (string) $id, '-'));
        return "{$prefix}-{$base}-{$id}";
    }

    public function listBanners(Request $request)
    {
        $query = Banner::with('translations')->orderBy('sort_order');
        if ($request->filled('search')) $query->where('title', 'like', "%{$request->search}%");
        if ($request->filled('position')) $query->where('position', $request->position);
        return $this->page($query->paginate($request->get('per_page', 10)));
    }

    public function createBanner(Request $request)
    {
        if ($request->has('translations')) {
            $request->merge([
                'title' => $request->input('translations.title'),
                'subtitle' => $request->input('translations.subtitle'),
            ]);
        }

        $data = $request->validate([
            'title' => 'required',
            'subtitle' => 'nullable',
            'image' => 'required|string',
            'link' => 'nullable|string|max:255',
            'position' => 'required|in:hero,blog_hero,popup,sidebar',
            'sort_order' => 'nullable|integer',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'is_active' => 'nullable|boolean',
        ]);
        $data['is_active'] = $request->boolean('is_active', true);
        return $this->ok(Banner::create($data), __('api.messages.banner_created'))->setStatusCode(201);
    }

    public function showBanner($id)
    {
        return $this->ok(Banner::with('translations')->findOrFail($id));
    }

    public function updateBanner(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        if ($request->has('translations')) {
            $request->merge([
                'title' => $request->input('translations.title'),
                'subtitle' => $request->input('translations.subtitle'),
            ]);
        }

        $data = $request->validate([
            'title' => 'required',
            'subtitle' => 'nullable',
            'image' => 'required|string',
            'link' => 'nullable|string|max:255',
            'position' => 'required|in:hero,blog_hero,popup,sidebar',
            'sort_order' => 'nullable|integer',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'is_active' => 'nullable|boolean',
        ]);
        $banner->update($data);
        return $this->ok($banner, __('api.messages.banner_updated'));
    }

    public function deleteBanner($id)
    {
        Banner::findOrFail($id)->delete();
        return $this->ok(null, __('api.messages.banner_deleted'));
    }

    public function listBranches(Request $request)
    {
        $query = Branch::with('translations')->latest();
        if ($request->filled('search')) $query->where('name', 'like', "%{$request->search}%")->orWhere('address', 'like', "%{$request->search}%");
        return $this->page($query->paginate($request->get('per_page', 10)));
    }

    public function createBranch(Request $request)
    {
        if ($request->has('translations')) {
            $request->merge([
                'name' => $request->input('translations.name'),
                'address' => $request->input('translations.address'),
            ]);
        }

        $data = $request->validate([
            'name' => 'required',
            'address' => 'required',
            'phone' => 'required|string|max:30',
            'open_time' => 'required',
            'close_time' => 'required',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'is_active' => 'nullable|boolean',
        ]);
        $data['is_active'] = $request->boolean('is_active', true);
        return $this->ok(Branch::create($data), __('api.messages.branch_created'))->setStatusCode(201);
    }

    public function showBranch($id)
    {
        return $this->ok(Branch::with('translations')->findOrFail($id));
    }

    public function updateBranch(Request $request, $id)
    {
        $branch = Branch::findOrFail($id);

        if ($request->has('translations')) {
            $request->merge([
                'name' => $request->input('translations.name'),
                'address' => $request->input('translations.address'),
            ]);
        }

        $data = $request->validate([
            'name' => 'required',
            'address' => 'required',
            'phone' => 'required|string|max:30',
            'open_time' => 'required',
            'close_time' => 'required',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'is_active' => 'nullable|boolean',
        ]);
        $branch->update($data);
        return $this->ok($branch, __('api.messages.branch_updated'));
    }

    public function deleteBranch($id)
    {
        Branch::findOrFail($id)->delete();
        return $this->ok(null, __('api.messages.branch_deleted'));
    }

    public function listPosts(Request $request)
    {
        $query = Post::with('translations')->latest('published_at');
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
        return $this->ok(Post::create($data), __('api.messages.post_created'))->setStatusCode(201);
    }

    public function showPost($id)
    {
        return $this->ok(Post::with('translations')->findOrFail($id));
    }

    public function updatePost(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        $data = $this->validatePost($request, $post->id);
        $post->update($data);
        return $this->ok($post, __('api.messages.post_updated'));
    }

    public function deletePost($id)
    {
        Post::findOrFail($id)->delete();
        return $this->ok(null, __('api.messages.post_deleted'));
    }

    private function validatePost(Request $request, $ignoreId = null): array
    {
        if ($request->has('translations')) {
            $request->merge([
                'title' => $request->input('translations.title'),
                'excerpt' => $request->input('translations.excerpt'),
                'content' => $request->input('translations.content'),
            ]);
        }

        $data = $request->validate([
            'title' => 'required',
            'slug' => 'nullable|string|max:255|unique:posts,slug' . ($ignoreId ? ',' . $ignoreId : ''),
            'excerpt' => 'required',
            'content' => 'required',
            'thumbnail' => 'required|string',
            'category' => 'required|string|max:255',
            'author' => 'nullable|string|max:255',
            'read_time' => 'nullable|integer|min:1',
            'video_url' => 'nullable|string|max:255',
            'is_published' => 'nullable|boolean',
            'published_at' => 'nullable|date',
        ]);

        $slugTitle = is_array($data['title']) ? ($data['title']['vi'] ?? '') : $data['title'];

        $data['slug'] = $data['slug'] ?: \Illuminate\Support\Str::slug($slugTitle);
        $data['author'] = $data['author'] ?? 'Hamburger King Editorial';
        $data['read_time'] = $data['read_time'] ?? 5;
        $data['is_published'] = $request->boolean('is_published', true);
        $data['published_at'] = $data['published_at'] ?? now();
        return $data;
    }

    public function translationsStatus()
    {
        $models = [
            'products'   => [Product::class,   ['name']],
            'categories' => [Category::class,  ['name']],
            'posts'      => [Post::class,      ['title']],
            'branches'   => [Branch::class,    ['name']],
            'combos'     => [ComboSet::class,  ['name']],
        ];

        $result = [];
        foreach ($models as $key => [$model, $fields]) {
            $total = $model::count();
            $translated = Translation::where('translatable_type', $model)
                ->where('locale', 'en')
                ->whereIn('field', $fields)
                ->whereNotNull('value')
                ->where('value', '!=', '')
                ->distinct('translatable_id')
                ->count();

            $result[$key] = [
                'total'      => $total,
                'translated' => $translated,
                'missing'    => $total - $translated,
                'percent'    => $total > 0
                    ? round($translated / $total * 100)
                    : 100,
            ];
        }

        return response()->json(['data' => $result]);
    }
}
