<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Table;
use Illuminate\Support\Facades\Auth;

class TableController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $tables = Table::all();
        return view('tables.index', compact('tables'));
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
        return view('tables.create');
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
            'number' => 'required|string|unique:tables,number',
            'seats' => 'required|integer|min:1',
            'status' => 'required|string',
        ]);
        Table::create($validated);
        return redirect()->route('tables.index')->with('success', 'Table created successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $table = Table::findOrFail($id);
        return view('tables.show', compact('table'));
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
        $table = Table::findOrFail($id);
        return view('tables.edit', compact('table'));
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
        $table = Table::findOrFail($id);
        $validated = $request->validate([
            'number' => 'required|string|unique:tables,number,' . $table->id,
            'seats' => 'required|integer|min:1',
            'status' => 'required|string',
        ]);
        $table->update($validated);
        return redirect()->route('tables.index')->with('success', 'Table updated successfully.');
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
        $table = Table::findOrFail($id);
        $table->delete();
        return redirect()->route('tables.index')->with('success', 'Table deleted successfully.');
    }
}
