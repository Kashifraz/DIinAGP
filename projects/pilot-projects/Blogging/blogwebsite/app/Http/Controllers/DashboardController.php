<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Category;
use App\Models\Comment;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $userId = auth()->id();
        $totalPosts = Post::where('user_id', $userId)->count();
        $draftPosts = Post::where('user_id', $userId)->where('status', 'draft')->count();
        $publishedPosts = Post::where('user_id', $userId)->where('status', 'published')->count();

        $categories = Category::withCount(['posts' => function($q) use ($userId) {
            $q->where('user_id', $userId);
        }])->get(['id', 'name']);
        $totalCategories = $categories->count();

        $totalComments = Comment::whereIn('post_id', Post::where('user_id', $userId)->pluck('id'))->count();
        $approvedComments = Comment::whereIn('post_id', Post::where('user_id', $userId)->pluck('id'))->where('status', 'approved')->count();
        $pendingComments = Comment::whereIn('post_id', Post::where('user_id', $userId)->pluck('id'))->where('status', 'pending')->count();

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalPosts' => $totalPosts,
                'draftPosts' => $draftPosts,
                'publishedPosts' => $publishedPosts,
                'totalCategories' => $totalCategories,
                'categories' => $categories,
                'totalComments' => $totalComments,
                'approvedComments' => $approvedComments,
                'pendingComments' => $pendingComments,
            ]
        ]);
    }
}
