<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Illuminate\Support\Facades\Redirect;
use App\Mail\PaymentReceiptMail;
use Illuminate\Support\Facades\Mail;

class StripeController extends Controller
{
    public function showPaymentForm(Order $order)
    {
        if ($order->paid) {
            return redirect()->route('orders.show', $order)->with('success', 'Order already paid.');
        }
        return view('payments.stripe', [
            'order' => $order,
            'stripeKey' => config('app.STRIPE_KEY') ?? env('STRIPE_KEY'),
        ]);
    }

    public function processPayment(Request $request, Order $order)
    {
        if ($order->paid) {
            return redirect()->route('orders.show', $order)->with('success', 'Order already paid.');
        }
        $request->validate([
            'stripeToken' => 'required',
        ]);
        Stripe::setApiKey(config('app.STRIPE_SECRET') ?? env('STRIPE_SECRET'));
        try {
            $charge = \Stripe\Charge::create([
                'amount' => intval($order->total * 100), // in cents
                'currency' => 'usd',
                'description' => 'Order #' . $order->id,
                'source' => $request->stripeToken,
            ]);
            $order->paid = true;
            $order->status = 'completed';
            $order->save();
            // Send payment receipt email
            $order->load('reservation.user');
            Mail::to($order->reservation->user->email ?? null)->send(new PaymentReceiptMail($order));
            return redirect()->route('orders.show', $order)->with('success', 'Payment successful!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
