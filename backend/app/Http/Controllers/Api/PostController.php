<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $query = Post::where('is_published', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        return response()->json(
            $query->orderByDesc('published_at')
                ->paginate($request->get('per_page', 9))
        );
    }

    public function featured()
    {
        $posts = \Illuminate\Support\Facades\Cache::remember('featured_posts', 1800, function () {
            return Post::where('is_published', true)
                ->whereNotNull('published_at')
                ->where('published_at', '<=', now())
                ->orderByDesc('published_at')
                ->limit(3)
                ->select(['id', 'title', 'slug', 'thumbnail', 'excerpt', 'category', 'read_time', 'published_at', 'is_published'])
                ->get();
        });
        return response()->json($posts);
    }

    public function show($slug)
    {
        $post = Post::where('is_published', true)
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json($post);
    }
}
