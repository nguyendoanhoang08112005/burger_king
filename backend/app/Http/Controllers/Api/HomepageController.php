<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Product;
use App\Models\ComboSet;
use App\Models\Post;
use App\Models\Branch;
use Illuminate\Support\Facades\Cache;

class HomepageController extends Controller
{
    public function index()
    {
        $data = Cache::remember('homepage_data', 1800, function () {
            $now = now();
            return [
                'banners' => Banner::where('is_active', true)
                    ->where('position', 'hero')
                    ->where(function ($q) use ($now) {
                        $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
                    })
                    ->where(function ($q) use ($now) {
                        $q->whereNull('expires_at')->orWhere('expires_at', '>', $now);
                    })
                    ->orderBy('sort_order')
                    ->select(['id', 'title', 'subtitle', 'image', 'link', 'position', 'sort_order', 'is_active', 'starts_at', 'expires_at'])
                    ->get(),

                'categories' => Category::where('is_active', true)
                    ->withCount('products')
                    ->orderBy('sort_order')
                    ->select(['id', 'name', 'slug', 'image', 'is_active', 'sort_order'])
                    ->get(),

                'featured_products' => Product::where('is_featured', true)
                    ->where('is_available', true)
                    ->with(['category:id,name', 'sizes'])
                    ->limit(9)
                    ->select(['id', 'name', 'slug', 'thumbnail', 'base_price', 'sale_price', 'category_id', 'is_featured', 'is_available'])
                    ->get(),

                'combo_products' => Product::where('is_available', true)
                    ->whereHas('category', function ($q) {
                        $q->where('slug', 'combo-meals');
                    })
                    ->with(['category:id,name,slug', 'sizes'])
                    ->limit(50)
                    ->select(['id', 'category_id', 'name', 'slug', 'thumbnail', 'base_price', 'sale_price', 'is_featured', 'is_available'])
                    ->get(),

                'combos' => ComboSet::where('is_active', true)
                    ->with('items.product:id,name,thumbnail')
                    ->select(['id', 'name', 'slug', 'description', 'image', 'price', 'is_active'])
                    ->get(),

                'blog_posts' => Post::where('is_published', true)
                    ->whereNotNull('published_at')
                    ->where('published_at', '<=', $now)
                    ->orderByDesc('published_at')
                    ->limit(5)
                    ->select(['id', 'title', 'slug', 'thumbnail', 'excerpt', 'category', 'read_time', 'published_at', 'is_published'])
                    ->get(),

                'branches' => Branch::where('is_active', true)
                    ->select(['id', 'name', 'address', 'phone', 'open_time', 'close_time', 'lat', 'lng', 'is_active'])
                    ->get()
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ])->header('Cache-Control', 'public, max-age=300');
    }
}
