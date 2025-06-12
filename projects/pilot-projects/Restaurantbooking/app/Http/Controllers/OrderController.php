<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Reservation;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $user = auth()->user();
        if (in_array($user->role, ['admin', 'staff'])) {
            $orders = Order::with('reservation')->orderBy('created_at', 'desc')->get();
        } else {
            $orders = Order::whereHas('reservation', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->with('reservation')->orderBy('created_at', 'desc')->get();
        }
        return view('orders.index', compact('orders'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
        $reservations = Reservation::where('status', 'confirmed')->get();
        $selectedDish = null;
        if ($request->has('dish')) {
            $selectedDish = \App\Models\MenuItem::find($request->input('dish'));
        }
        return view('orders.create', compact('reservations', 'selectedDish'));
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
            'reservation_id' => 'required|exists:reservations,id',
            'status' => 'required|string',
            'total' => 'required|numeric|min:0',
            'paid' => 'required|boolean',
        ]);
        Order::create($validated);
        return redirect()->route('orders.index')->with('success', 'Order created successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $order = Order::with('reservation')->findOrFail($id);
        $user = auth()->user();
        if (in_array($user->role, ['admin', 'staff']) || ($order->reservation && $order->reservation->user_id == $user->id)) {
            return view('orders.show', compact('order'));
        }
        abort(403, 'Unauthorized.');
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $order = Order::findOrFail($id);
        $user = auth()->user();
        if (in_array($user->role, ['admin', 'staff']) || ($order->reservation && $order->reservation->user_id == $user->id)) {
            $reservations = Reservation::where('status', 'confirmed')->orWhere('id', $order->reservation_id)->get();
            return view('orders.edit', compact('order', 'reservations'));
        }
        abort(403, 'Unauthorized.');
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
        $order = Order::findOrFail($id);
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'staff']) && (!($order->reservation && $order->reservation->user_id == $user->id))) {
            abort(403, 'Unauthorized.');
        }
        $validated = $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
            'status' => 'required|string',
            'total' => 'required|numeric|min:0',
            'paid' => 'required|boolean',
        ]);
        $order->update($validated);
        return redirect()->route('orders.index')->with('success', 'Order updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'staff']) && (!($order->reservation && $order->reservation->user_id == $user->id))) {
            abort(403, 'Unauthorized.');
        }
        $order->delete();
        return redirect()->route('orders.index')->with('success', 'Order deleted successfully.');
    }
}
