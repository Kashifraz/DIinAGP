<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function store(Request $request, MenuItem $menuItem)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ]);
        \App\Models\Review::create([
            'user_id' => Auth::id(),
            'menu_item_id' => $menuItem->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);
        return redirect()->route('menu.landing')."#dish-{$menuItem->id}";
    }
}
