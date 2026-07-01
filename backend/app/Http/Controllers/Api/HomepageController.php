<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Product;
use App\Models\ComboSet;
use App\Models\Post;
use App\Models\Branch;
use App\Models\Review;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class HomepageController extends Controller
{
    public function index()
    {
        $locale = app()->getLocale();
        $data = Cache::remember("homepage_data_{$locale}", 1800, function () {
            $now = now();
            $allCombos = ComboSet::where('is_active', true)
                ->with('items.product:id,name,thumbnail')
                ->select(['id', 'name', 'slug', 'description', 'image', 'price', 'is_active', 'sale_price'])
                ->get();

            $deal1Type = Setting::get('homepage.deal1_type', 'combo');
            $deal1Id = Setting::get('homepage.deal1_id');
            $deal2Type = Setting::get('homepage.deal2_type', 'combo');
            $deal2Id = Setting::get('homepage.deal2_id');
            $deal3Type = Setting::get('homepage.deal3_type', 'combo');
            $deal3Id = Setting::get('homepage.deal3_id');

            $resolveDeal = function ($type, $id, $fallbackIndex, $allCombos) {
                if ($id) {
                    if ($type === 'product') {
                        return Product::with(['category', 'sizes'])->find($id);
                    } else {
                        return ComboSet::with('items.product')->find($id);
                    }
                }
                return $allCombos->get($fallbackIndex);
            };

            $deal1Item = $resolveDeal($deal1Type, $deal1Id, 0, $allCombos);
            $deal2Item = $resolveDeal($deal2Type, $deal2Id, 1, $allCombos);
            $deal3Item = $resolveDeal($deal3Type, $deal3Id, 2, $allCombos);

            $result = [
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
                    ->select(['id', 'name', 'slug', 'image', 'is_active', 'sort_order'])
                    ->withCount('products')
                    ->orderBy('sort_order')
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

                'combos' => $allCombos,

                'deal1_item' => $deal1Item,
                'deal2_item' => $deal2Item,
                'deal3_item' => $deal3Item,

                'blog_posts' => Post::with('postCategory')
                    ->where('is_published', true)
                    ->whereNotNull('published_at')
                    ->where('published_at', '<=', $now)
                    ->orderByDesc('published_at')
                    ->limit(5)
                    ->select(['id', 'title', 'slug', 'thumbnail', 'excerpt', 'category', 'read_time', 'published_at', 'is_published'])
                    ->get(),

                'branches' => Branch::where('is_active', true)
                    ->select(['id', 'name', 'address', 'phone', 'open_time', 'close_time', 'lat', 'lng', 'is_active'])
                    ->get(),

                'testimonials' => Review::where('is_approved', true)
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
                    ])
                    ->toArray(),

                'gallery_banners' => Banner::where('is_active', true)
                    ->where('position', 'gallery')
                    ->orderBy('sort_order')
                    ->get(['id', 'image', 'title'])
                    ->toArray(),

                'cta_banner' => Banner::where('is_active', true)
                    ->where('position', 'cta')
                    ->first(['id', 'title', 'subtitle', 'image', 'link']),
            ];

            $serialized = [];
            foreach ($result as $key => $value) {
                if ($value instanceof \Illuminate\Support\Collection) {
                    $serialized[$key] = $value->map(fn($m) => $m->toArray())->toArray();
                } elseif ($value instanceof \Illuminate\Database\Eloquent\Model) {
                    $serialized[$key] = $value->toArray();
                } else {
                    $serialized[$key] = $value;
                }
            }
            return $serialized;
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ])->header('Vary', 'Accept-Language');
    }
}
