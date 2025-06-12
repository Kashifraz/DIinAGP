<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Order;

class PaymentController extends Controller
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
            $payments = Payment::with('order')->orderBy('created_at', 'desc')->get();
        } else {
            $payments = Payment::whereHas('order.reservation', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->with('order')->orderBy('created_at', 'desc')->get();
        }
        return view('payments.index', compact('payments'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $orders = Order::where('paid', false)->get();
        return view('payments.create', compact('orders'));
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
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|string',
            'method' => 'required|string',
            'transaction_id' => 'nullable|string',
        ]);
        Payment::create($validated);
        // Optionally mark order as paid if payment is successful
        $order = Order::find($validated['order_id']);
        if ($order && $validated['status'] === 'completed') {
            $order->paid = true;
            $order->save();
        }
        return redirect()->route('payments.index')->with('success', 'Payment recorded successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $payment = Payment::with('order')->findOrFail($id);
        $user = auth()->user();
        if (in_array($user->role, ['admin', 'staff']) || ($payment->order && $payment->order->reservation && $payment->order->reservation->user_id == $user->id)) {
            return view('payments.show', compact('payment'));
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
        $payment = Payment::findOrFail($id);
        $user = auth()->user();
        if (in_array($user->role, ['admin', 'staff']) || ($payment->order && $payment->order->reservation && $payment->order->reservation->user_id == $user->id)) {
            $orders = Order::where('paid', false)->orWhere('id', $payment->order_id)->get();
            return view('payments.edit', compact('payment', 'orders'));
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
        $payment = Payment::findOrFail($id);
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'staff']) && (!($payment->order && $payment->order->reservation && $payment->order->reservation->user_id == $user->id))) {
            abort(403, 'Unauthorized.');
        }
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|string',
            'method' => 'required|string',
            'transaction_id' => 'nullable|string',
        ]);
        $payment->update($validated);
        // Optionally mark order as paid if payment is successful
        $order = Order::find($validated['order_id']);
        if ($order && $validated['status'] === 'completed') {
            $order->paid = true;
            $order->save();
        }
        return redirect()->route('payments.index')->with('success', 'Payment updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $payment = Payment::findOrFail($id);
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'staff']) && (!($payment->order && $payment->order->reservation && $payment->order->reservation->user_id == $user->id))) {
            abort(403, 'Unauthorized.');
        }
        $payment->delete();
        return redirect()->route('payments.index')->with('success', 'Payment deleted successfully.');
    }
}
