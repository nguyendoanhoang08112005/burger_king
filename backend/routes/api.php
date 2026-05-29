<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\PaymentController;

/*
|--------------------------------------------------------------------------
| API Routes — Hamburger King E-Commerce Platform
|--------------------------------------------------------------------------
*/

// --- PUBLIC STOREFRONT ENDPOINTS ---
Route::get('/products', [CustomerController::class, 'products']);
Route::get('/products/{slug}', [CustomerController::class, 'productDetail']);
Route::get('/categories', [CustomerController::class, 'categories']);
Route::get('/combos', [CustomerController::class, 'combos']);
Route::get('/banners', [CustomerController::class, 'banners']);
Route::get('/branches', [CustomerController::class, 'branches']);

// --- PUBLIC AUTH ENDPOINTS ---
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// --- PUBLIC PAYMENT CALLBACK WEBHOOKS ---
Route::get('/payment/vnpay/callback', [PaymentController::class, 'vnpayCallback']);
Route::get('/payment/momo/callback', [PaymentController::class, 'momoCallback']);
Route::post('/payment/momo/callback', [PaymentController::class, 'momoCallback']); // support POST IPN as well

// --- SECURE CUSTOMER ENDPOINTS (auth:sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    
    // Addresses
    Route::get('/addresses', [CustomerController::class, 'listAddresses']);
    Route::post('/addresses', [CustomerController::class, 'addAddress']);
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
    Route::post('/reviews', [CustomerController::class, 'addReview']);
    
    // Notifications
    Route::get('/notifications', [CustomerController::class, 'listNotifications']);
    Route::post('/notifications/{id}/read', [CustomerController::class, 'markRead']);
    
    // Loyalty points
    Route::get('/loyalty-points', [CustomerController::class, 'loyaltyPoints']);
});

// --- SECURE ADMIN ENDPOINTS (auth:sanctum + role:admin/staff) ---
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    // We check user's role column or Spatie role inside the endpoints, which is robust
    Route::get('/dashboard', [AdminController::class, 'dashboardStats']);
    
    // Orders Pipeline
    Route::get('/orders', [AdminController::class, 'listOrders']);
    Route::post('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
    
    // Products Manager
    Route::get('/products', [AdminController::class, 'listProducts']);
    Route::post('/products', [AdminController::class, 'createProduct']);
    Route::put('/products/{id}', [AdminController::class, 'updateProduct']);
    Route::delete('/products/{id}', [AdminController::class, 'deleteProduct']);
    
    // Categories Manager
    Route::get('/categories', [AdminController::class, 'listCategories']);
    Route::post('/categories', [AdminController::class, 'createCategory']);
    
    // Coupons Manager
    Route::get('/coupons', [AdminController::class, 'listCoupons']);
    Route::post('/coupons', [AdminController::class, 'createCoupon']);
});
