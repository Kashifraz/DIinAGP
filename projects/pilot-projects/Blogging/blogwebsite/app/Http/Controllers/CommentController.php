<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;
use Inertia\Inertia;

class CommentController extends Controller
{
    public function moderation()
    {
        $comments = Comment::with(['post', 'user'])
            ->orderByDesc('created_at')
            ->paginate(20);
        return Inertia::render('Comments/Moderation', [
            'comments' => $comments
        ]);
    }

    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:comments,id',
            'action' => 'required|in:approve,delete',
        ]);
        if ($validated['action'] === 'approve') {
            Comment::whereIn('id', $validated['ids'])->update(['status' => 'approved']);
        } elseif ($validated['action'] === 'delete') {
            Comment::whereIn('id', $validated['ids'])->delete();
        }
        return back()->with('success', 'Bulk action completed successfully.');
    }
}
