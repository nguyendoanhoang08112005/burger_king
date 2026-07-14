<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PaymentPluginController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\HomepageController;
use App\Http\Controllers\Api\LocaleController;
use App\Http\Controllers\Api\ContactController;

/*
|--------------------------------------------------------------------------
| API Routes — Hamburger King E-Commerce Platform
|--------------------------------------------------------------------------
*/

// --- PUBLIC STOREFRONT ENDPOINTS ---
Route::get('/health', fn() => response()->noContent());
Route::get('/homepage', [HomepageController::class, 'index']);
Route::get('/products', [CustomerController::class, 'products']);
Route::get('/products/{slug}', [CustomerController::class, 'productDetail']);
Route::get('/products/{productId}/reviews', [ReviewController::class, 'getProductReviews']);
Route::get('/reviews/featured', [ReviewController::class, 'featured']);
Route::get('/categories', [CustomerController::class, 'categories']);
Route::get('/toppings', [CustomerController::class, 'toppings']);
Route::get('/combos', [CustomerController::class, 'combos']);
Route::get('/banners', [CustomerController::class, 'banners']);
Route::get('/branches', [CustomerController::class, 'branches']);
Route::get('/payment-methods', [PaymentPluginController::class, 'activePlugins']);
Route::get('/coupons/active', [CustomerController::class, 'activeCoupons']);
Route::get('/settings/public', [SettingController::class, 'publicSettings']);
Route::post('/shipping/calculate', [SettingController::class, 'calculateShipping']);
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/featured', [PostController::class, 'featured']);
Route::get('/posts/{slug}', [PostController::class, 'show']);
Route::get('/locales/{locale}/{ns}.json', [LocaleController::class, 'servePublicTranslation']);

Route::post('/contacts', [ContactController::class, 'submitContact']);
Route::post('/newsletter', [ContactController::class, 'submitNewsletter']);

// --- PUBLIC CHATBOT ENDPOINTS ---
Route::post('/chat/session', [ChatController::class, 'createSession']);
Route::get('/chat/history/{sid}', [ChatController::class, 'getHistory']);
Route::delete('/chat/session/{sid}', [ChatController::class, 'deleteSession']);
Route::post('/chat/message', [ChatController::class, 'sendMessage']);

// --- PUBLIC AUTH ENDPOINTS ---
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// --- PUBLIC PAYMENT CALLBACK WEBHOOKS ---
Route::get('/payment/vnpay/callback', [PaymentController::class, 'vnpayCallback']);
Route::get('/payment/momo/callback', [PaymentController::class, 'momoCallback']);
Route::post('/payment/momo/callback', [PaymentController::class, 'momoCallback']); // support POST IPN as well

// --- SECURE CUSTOMER ENDPOINTS (auth:sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/profile/password', [AuthController::class, 'changePassword']);
    Route::post('/profile/avatar', [AuthController::class, 'uploadAvatar']);
    
    // Addresses
    Route::get('/addresses', [CustomerController::class, 'listAddresses']);
    Route::post('/addresses', [CustomerController::class, 'addAddress']);
    Route::put('/addresses/{id}', [CustomerController::class, 'updateAddress']);
    Route::delete('/addresses/{id}', [CustomerController::class, 'deleteAddress']);
    
    // Wishlist
    Route::get('/wishlist', [CustomerController::class, 'wishlist']);
    Route::post('/wishlist', [CustomerController::class, 'toggleWishlist']);
    
    // Coupons
    Route::post('/cart/apply-coupon', [CustomerController::class, 'applyCoupon']);
    
    // Checkout & Orders
    Route::post('/orders', [CustomerController::class, 'checkout']);
    Route::get('/orders', [CustomerController::class, 'orders']);
    Route::get('/orders/{code}', [CustomerController::class, 'orderDetail']);
    Route::post('/orders/{code}/cancel', [CustomerController::class, 'cancelOrder']);
    
    // Reviews
    Route::post('/reviews/upload', [CustomerController::class, 'uploadReviewImage']);
    Route::post('/reviews', [CustomerController::class, 'addReview']);
    Route::post('/reviews/order', [ReviewController::class, 'submit']);
    
    // Complaints
    Route::post('/complaints', [ComplaintController::class, 'submit']);
    
    // Notifications
    Route::get('/notifications', [CustomerController::class, 'listNotifications']);
    Route::post('/notifications/{id}/read', [CustomerController::class, 'markRead']);
    
    // Loyalty points
    Route::get('/loyalty-points', [CustomerController::class, 'loyaltyPoints']);
});

// --- SECURE ADMIN ENDPOINTS (auth:sanctum + role:admin/staff) ---
Route::middleware(['auth:sanctum', 'role:admin|staff', 'admin.permission'])->prefix('admin')->group(function () {
    // We check user's role column or Spatie role inside the endpoints, which is robust
    Route::get('/dashboard', [AdminController::class, 'dashboardStats']);
    Route::get('/dashboard/stats', [AdminController::class, 'dashboardStats']);
    Route::get('/dashboard/revenue-chart', [AdminController::class, 'revenueChart']);
    Route::get('/dashboard/recent-orders', [AdminController::class, 'recentOrders']);
    Route::get('/dashboard/activity-log', [AdminController::class, 'activityLog']);
    Route::get('/translations/status', [AdminController::class, 'translationsStatus']);
    
    // Orders Pipeline
    Route::get('/orders', [AdminController::class, 'listOrders']);
    Route::get('/orders/counts', [AdminController::class, 'orderCounts']);
    Route::get('/orders/{id}', [AdminController::class, 'showOrder']);
    Route::post('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
    Route::patch('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
    
    // Products Manager
    Route::get('/products', [AdminController::class, 'listProducts']);
    Route::post('/products', [AdminController::class, 'createProduct']);
    Route::post('/upload', [AdminController::class, 'upload']);
    Route::get('/products/{id}', [AdminController::class, 'showProduct']);
    Route::put('/products/{id}', [AdminController::class, 'updateProduct']);
    Route::patch('/products/{id}', [AdminController::class, 'patchProduct']);
    Route::delete('/products/{id}', [AdminController::class, 'deleteProduct']);
    
    // Categories Manager
    Route::get('/categories', [AdminController::class, 'listCategories']);
    Route::post('/categories', [AdminController::class, 'createCategory']);
    Route::get('/categories/{id}', [AdminController::class, 'showCategory']);
    Route::put('/categories/{id}', [AdminController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [AdminController::class, 'deleteCategory']);

    // Combos
    Route::get('/combos', [AdminController::class, 'listCombos']);
    Route::post('/combos', [AdminController::class, 'createCombo']);
    Route::get('/combos/{id}', [AdminController::class, 'showCombo']);
    Route::put('/combos/{id}', [AdminController::class, 'updateCombo']);
    Route::delete('/combos/{id}', [AdminController::class, 'deleteCombo']);

    // Toppings
    Route::get('/toppings', [AdminController::class, 'listToppings']);
    Route::post('/toppings', [AdminController::class, 'createTopping']);
    Route::get('/toppings/{id}', [AdminController::class, 'showTopping']);
    Route::put('/toppings/{id}', [AdminController::class, 'updateTopping']);
    Route::delete('/toppings/{id}', [AdminController::class, 'deleteTopping']);
    
    // Coupons Manager
    Route::get('/coupons', [AdminController::class, 'listCoupons']);
    Route::post('/coupons', [AdminController::class, 'createCoupon']);
    Route::get('/coupons/{id}', [AdminController::class, 'showCoupon']);
    Route::put('/coupons/{id}', [AdminController::class, 'updateCoupon']);
    Route::delete('/coupons/{id}', [AdminController::class, 'deleteCoupon']);

    // Users
    Route::get('/users', [AdminController::class, 'listUsers']);
    Route::post('/users/staff', [AdminController::class, 'createStaff']);
    Route::put('/users/{id}', [AdminController::class, 'updateUser']);
    Route::put('/users/{id}/staff', [AdminController::class, 'updateStaff']);
    Route::patch('/users/{id}/role', [AdminController::class, 'updateUserRole']);
    Route::patch('/users/{id}/toggle-status', [AdminController::class, 'toggleUserStatus']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);

    // Reviews
    Route::get('/reviews', [ReviewController::class, 'listReviews']);
    Route::post('/reviews/{id}/approve', [ReviewController::class, 'toggleApproval']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'delete']);
    
    // Complaints
    Route::get('/complaints', [ComplaintController::class, 'listComplaints']);
    Route::get('/complaints/pending-count', [ComplaintController::class, 'getPendingCount']);
    Route::get('/complaints/counts', [ComplaintController::class, 'getCounts']);
    Route::get('/complaints/{id}', [ComplaintController::class, 'show']);
    Route::post('/complaints/{id}/process', [ComplaintController::class, 'process']);

    // Reports
    Route::get('/reports/summary', [AdminController::class, 'reportSummary']);
    Route::get('/reports/top-products', [AdminController::class, 'topProducts']);
    Route::get('/reports/top-customers', [AdminController::class, 'topCustomers']);
    Route::get('/reports/export-csv', [AdminController::class, 'exportCsv']);

    // Payment plugins
    Route::get('/payment-plugins', [PaymentPluginController::class, 'index']);
    Route::patch('/payment-plugins/{key}/toggle', [PaymentPluginController::class, 'toggle']);
    Route::put('/payment-plugins/{key}/config', [PaymentPluginController::class, 'updateConfig']);

    // Settings
    Route::get('/settings', [SettingController::class, 'index']);
    Route::put('/settings', [SettingController::class, 'update']);
    Route::post('/settings/upload', [SettingController::class, 'upload']);
    Route::post('/settings/test-email', [SettingController::class, 'testEmail']);
    Route::get('/translations/locales', [LocaleController::class, 'index']);
    Route::post('/translations/locales', [LocaleController::class, 'store']);
    Route::patch('/translations/locales/{code}/default', [LocaleController::class, 'setDefault']);
    Route::delete('/translations/locales/{code}', [LocaleController::class, 'destroy']);
    Route::get('/translations/{code}', [LocaleController::class, 'getTranslations']);
    Route::put('/translations/{code}', [LocaleController::class, 'updateTranslations']);

    // Content
    Route::get('/posts', [AdminController::class, 'listPosts']);
    Route::get('/posts/categories', [AdminController::class, 'postCategories']);
    Route::post('/posts', [AdminController::class, 'createPost']);
    Route::get('/posts/{id}', [AdminController::class, 'showPost']);
    Route::put('/posts/{id}', [AdminController::class, 'updatePost']);
    Route::delete('/posts/{id}', [AdminController::class, 'deletePost']);
    // Post Categories Management
    Route::get('/post-categories', [AdminController::class, 'listPostCategories']);
    Route::post('/post-categories', [AdminController::class, 'createPostCategory']);
    Route::get('/post-categories/{id}', [AdminController::class, 'showPostCategory']);
    Route::put('/post-categories/{id}', [AdminController::class, 'updatePostCategory']);
    Route::delete('/post-categories/{id}', [AdminController::class, 'deletePostCategory']);
    // Post Tags Management
    Route::get('/post-tags', [AdminController::class, 'listPostTags']);
    Route::post('/post-tags', [AdminController::class, 'createPostTag']);
    Route::get('/post-tags/{id}', [AdminController::class, 'showPostTag']);
    Route::put('/post-tags/{id}', [AdminController::class, 'updatePostTag']);
    Route::delete('/post-tags/{id}', [AdminController::class, 'deletePostTag']);
    Route::get('/banners', [AdminController::class, 'listBanners']);
    Route::post('/banners', [AdminController::class, 'createBanner']);
    Route::get('/banners/{id}', [AdminController::class, 'showBanner']);
    Route::put('/banners/{id}', [AdminController::class, 'updateBanner']);
    Route::delete('/banners/{id}', [AdminController::class, 'deleteBanner']);
    Route::get('/branches', [AdminController::class, 'listBranches']);
    Route::post('/branches', [AdminController::class, 'createBranch']);
    Route::get('/branches/{id}', [AdminController::class, 'showBranch']);
    Route::put('/branches/{id}', [AdminController::class, 'updateBranch']);
    Route::delete('/branches/{id}', [AdminController::class, 'deleteBranch']);

    // Contacts Management
    Route::get('/contacts', [ContactController::class, 'listContacts']);
    Route::get('/contacts/{id}', [ContactController::class, 'showContact']);
    Route::put('/contacts/{id}', [ContactController::class, 'updateContact']);
    Route::delete('/contacts/{id}', [ContactController::class, 'deleteContact']);

    // --- SECURE CHATBOT ADMIN ENDPOINTS ---
    Route::get('/chat/stats', [ChatController::class, 'adminStats']);
    Route::get('/chat/top-questions', [ChatController::class, 'adminTopQuestions']);
    Route::get('/chat/sessions', [ChatController::class, 'adminSessions']);
    Route::get('/chat/sessions/{sid}', [ChatController::class, 'adminSessionMessages']);
    Route::get('/chat/caches', [ChatController::class, 'adminCaches']);
    Route::delete('/chat/caches/{id}', [ChatController::class, 'adminDeleteCache']);
    Route::post('/chat/caches/clear', [ChatController::class, 'adminClearCaches']);
    Route::get('/chat/ai-status', [ChatController::class, 'adminAiStatus']);
});
