<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MenuItem;
use Illuminate\Support\Facades\Auth;

class MenuItemController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $menuItems = MenuItem::all();
        return view('menu-items.index', compact('menuItems'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $user = Auth::user();
        if (!in_array($user->role, ['admin', 'staff'])) {
            abort(403, 'Unauthorized.');
        }
        $categories = \App\Models\MenuCategory::pluck('name');
        return view('menu-items.create', compact('categories'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!in_array($user->role, ['admin', 'staff'])) {
            abort(403, 'Unauthorized.');
        }
        $validated = $request->validate([
            'name' => 'required|string',
            'category' => 'required|string',
            'price' => 'required|numeric|min:0',
            'dietary_labels' => 'nullable|string',
            'description' => 'nullable|string',
            'available' => 'required|boolean',
        ]);
        MenuItem::create($validated);
        return redirect()->route('menu-items.index')->with('success', 'Menu item created successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $menuItem = MenuItem::findOrFail($id);
        return view('menu-items.show', compact('menuItem'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $user = Auth::user();
        if (!in_array($user->role, ['admin', 'staff'])) {
            abort(403, 'Unauthorized.');
        }
        $menuItem = MenuItem::findOrFail($id);
        $categories = \App\Models\MenuCategory::pluck('name');
        return view('menu-items.edit', compact('menuItem', 'categories'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        if (!in_array($user->role, ['admin', 'staff'])) {
            abort(403, 'Unauthorized.');
        }
        $menuItem = MenuItem::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string',
            'category' => 'required|string',
            'price' => 'required|numeric|min:0',
            'dietary_labels' => 'nullable|string',
            'description' => 'nullable|string',
            'available' => 'required|boolean',
        ]);
        $menuItem->update($validated);
        return redirect()->route('menu-items.index')->with('success', 'Menu item updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $user = Auth::user();
        if (!in_array($user->role, ['admin', 'staff'])) {
            abort(403, 'Unauthorized.');
        }
        $menuItem = MenuItem::findOrFail($id);
        $menuItem->delete();
        return redirect()->route('menu-items.index')->with('success', 'Menu item deleted successfully.');
    }

    public function landing()
    {
        $menuItems = MenuItem::where('available', true)->get();
        $categories = $menuItems->groupBy('category');
        return view('menu-items.landing', compact('categories'));
    }
}
