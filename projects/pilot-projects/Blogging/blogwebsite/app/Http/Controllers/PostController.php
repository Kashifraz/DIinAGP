<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use App\Models\Tag;
use App\Models\Category;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $posts = Post::where('user_id', Auth::id())->latest()->paginate(10);
        $posts->getCollection()->transform(function ($post) {
            $arr = $post->toArray();
            $arr['hero_image_url'] = $post->hero_image_url;
            return $arr;
        });
        return Inertia::render('Posts/Index', [
            'posts' => $posts,
            'csrf_token' => csrf_token(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $tags = Tag::orderBy('name')->get(['id', 'name', 'slug']);
        $categories = Category::orderBy('name')->get(['id', 'name']);
        return Inertia::render('Posts/Create', [
            'allTags' => $tags,
            'allCategories' => $categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'required|string',
            'status' => 'required|in:draft,published',
            'tags' => 'required|array|min:1',
            'tags.*' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'hero_image' => 'nullable|image|max:2048',
        ]);
        $slug = Str::slug($validated['title']);
        $slugCount = Post::where('slug', $slug)->count();
        if ($slugCount > 0) {
            $slug .= '-' . ($slugCount + 1);
        }
        $heroImagePath = null;
        if ($request->hasFile('hero_image')) {
            $heroImagePath = $request->file('hero_image')->store('posts', 'public');
        }
        $post = Post::create([
            'user_id' => Auth::id(),
            'title' => $validated['title'],
            'slug' => $slug,
            'content' => $validated['content'],
            'excerpt' => $validated['excerpt'],
            'status' => $validated['status'],
            'published_at' => $validated['status'] === 'published' ? now() : null,
            'category_id' => $validated['category_id'],
            'hero_image' => $heroImagePath,
        ]);
        $tagIds = collect($request->input('tags', []))->map(function ($tag) {
            if (is_array($tag) && isset($tag['name'])) {
                $name = trim($tag['name']);
            } else {
                $name = trim($tag);
            }
            $slug = Str::slug($name);
            $tagModel = \App\Models\Tag::firstOrCreate(['slug' => $slug], ['name' => $name]);
            return $tagModel->id;
        });
        $post->tags()->sync($tagIds);
        return redirect()->route('posts.index')->with('success', 'Post created successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\Response
     */
    public function show(Post $post)
    {
        $this->authorize('view', $post);
        return Inertia::render('Posts/Show', [
            'post' => $post->toArray()
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\Response
     */
    public function edit(Post $post)
    {
        $this->authorize('update', $post);
        $tags = Tag::orderBy('name')->get(['id', 'name', 'slug']);
        $categories = Category::orderBy('name')->get(['id', 'name']);
        $post->load('tags', 'category');
        return Inertia::render('Posts/Edit', [
            'post' => $post,
            'allTags' => $tags,
            'allCategories' => $categories,
            'postTags' => $post->tags->map(function($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                ];
            }),
            'postCategory' => $post->category ? [
                'id' => $post->category->id,
                'name' => $post->category->name
            ] : null
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Post $post)
    {
        $this->authorize('update', $post);
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'required|string',
            'status' => 'required|in:draft,published',
            'tags' => 'required|array|min:1',
            'tags.*' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'hero_image' => 'nullable|image|max:2048',
        ]);
        $slug = Str::slug($validated['title']);
        $slugCount = Post::where('slug', $slug)->where('id', '!=', $post->id)->count();
        if ($slugCount > 0) {
            $slug .= '-' . ($slugCount + 1);
        }
        $heroImagePath = $post->hero_image;
        if ($request->hasFile('hero_image')) {
            $heroImagePath = $request->file('hero_image')->store('posts', 'public');
        }
        $post->update([
            'title' => $validated['title'],
            'slug' => $slug,
            'content' => $validated['content'],
            'excerpt' => $validated['excerpt'],
            'status' => $validated['status'],
            'published_at' => $validated['status'] === 'published' ? now() : null,
            'category_id' => $validated['category_id'],
            'hero_image' => $heroImagePath,
        ]);
        $tagIds = collect($request->input('tags', []))->map(function ($tag) {
            if (is_array($tag) && isset($tag['name'])) {
                $name = trim($tag['name']);
            } else {
                $name = trim($tag);
            }
            $slug = Str::slug($name);
            $tagModel = \App\Models\Tag::firstOrCreate(['slug' => $slug], ['name' => $name]);
            return $tagModel->id;
        });
        $post->tags()->sync($tagIds);
        return redirect()->route('posts.index')->with('success', 'Post updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\Response
     */
    public function destroy(Post $post)
    {
        $this->authorize('delete', $post);
        $post->delete();
        return redirect()->route('posts.index')->with('success', 'Post deleted successfully.');
    }
}
