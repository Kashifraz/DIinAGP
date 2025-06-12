<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogController extends Controller
{
    // Homepage: list published posts with pagination
    public function index(Request $request)
    {
        $posts = Post::with(['category', 'tags', 'user'])
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->paginate(10);
        $posts->getCollection()->transform(function ($post) {
            $arr = $post->toArray();
            $arr['hero_image_url'] = $post->hero_image_url;
            return $arr;
        });
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);
        $tags = Tag::orderBy('name')->get(['id', 'name', 'slug']);
        return Inertia::render('Blog/Index', [
            'posts' => $posts,
            'categories' => $categories,
            'tags' => $tags,
        ]);
    }

    // Post view
    public function show($slug)
    {
        $post = Post::with(['category', 'tags', 'user'])
            ->where('slug', $slug)->where('status', 'published')->firstOrFail();
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);
        $comments = $post->comments()->where('status', 'approved')->orderByDesc('created_at')->get();
        return Inertia::render('Blog/Show', [
            'post' => $post->toArray(),
            'categories' => $categories,
            'comments' => $comments,
        ]);
    }

    // Filter by category
    public function category($slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();
        $posts = $category->posts()->with(['category', 'tags', 'user'])
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->paginate(10);
        $posts->getCollection()->transform(function ($post) {
            $arr = $post->toArray();
            $arr['hero_image_url'] = $post->hero_image_url;
            return $arr;
        });
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);
        $tags = Tag::orderBy('name')->get(['id', 'name', 'slug']);
        return Inertia::render('Blog/Index', [
            'posts' => $posts,
            'categories' => $categories,
            'tags' => $tags,
            'activeCategory' => $category,
        ]);
    }

    // Filter by tag
    public function tag($slug)
    {
        $tag = Tag::where('slug', $slug)->first();
        if (!$tag) {
            return Inertia::render('Blog/NotFound')->toResponse(request())->setStatusCode(404);
        }
        $posts = $tag->posts()->with(['category', 'tags', 'user'])
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->paginate(10);
        if ($posts->isEmpty()) {
            return Inertia::render('Blog/NotFound')->toResponse(request())->setStatusCode(404);
        }
        $posts->getCollection()->transform(function ($post) {
            $arr = $post->toArray();
            $arr['hero_image_url'] = $post->hero_image_url;
            return $arr;
        });
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);
        $tags = Tag::orderBy('name')->get(['id', 'name', 'slug']);
        return Inertia::render('Blog/Index', [
            'posts' => $posts,
            'categories' => $categories,
            'tags' => $tags,
            'activeTag' => $tag,
        ]);
    }

    public function submitComment(Request $request, $slug)
    {
        $post = Post::where('slug', $slug)->where('status', 'published')->firstOrFail();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'content' => 'required|string|max:2000',
        ]);
        $comment = $post->comments()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'content' => $validated['content'],
            'status' => 'pending',
        ]);
        return back()->with('success', 'Comment submitted for moderation!');
    }
} 