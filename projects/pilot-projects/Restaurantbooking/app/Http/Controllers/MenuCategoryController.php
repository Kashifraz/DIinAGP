<?php

namespace App\Http\Controllers;

use App\Models\MenuCategory;
use Illuminate\Http\Request;

class MenuCategoryController extends Controller
{
    public function index()
    {
        $categories = MenuCategory::all();
        return view('menu-categories.index', compact('categories'));
    }

    public function create()
    {
        return view('menu-categories.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:menu_categories,name',
        ]);
        MenuCategory::create($validated);
        return redirect()->route('menu-categories.index')->with('success', 'Category created successfully.');
    }

    public function edit(MenuCategory $menuCategory)
    {
        return view('menu-categories.edit', compact('menuCategory'));
    }

    public function update(Request $request, MenuCategory $menuCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:menu_categories,name,' . $menuCategory->id,
        ]);
        $menuCategory->update($validated);
        return redirect()->route('menu-categories.index')->with('success', 'Category updated successfully.');
    }

    public function destroy(MenuCategory $menuCategory)
    {
        $menuCategory->delete();
        return redirect()->route('menu-categories.index')->with('success', 'Category deleted successfully.');
    }
}
