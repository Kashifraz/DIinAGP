@extends('layouts.app')

@section('content')
<div class="max-w-lg mx-auto py-10 px-4">
    <div class="bg-white rounded-xl shadow-lg p-8">
        <h1 class="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <svg class="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            Pay for Order #{{ $order->id }}
        </h1>
        <div class="mb-6 space-y-2">
            <div class="flex items-center gap-2 text-lg">
                <span class="font-bold text-gray-700">Total:</span>
                <span class="text-gray-900">${{ number_format($order->total, 2) }}</span>
            </div>
            <div class="flex items-center gap-2 text-lg">
                <span class="font-bold text-gray-700">Status:</span>
                @if($order->paid)
                    <span class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Paid</span>
                @else
                    <span class="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">Unpaid</span>
                @endif
            </div>
        </div>
        @if($errors->any())
            <div class="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded mb-4 shadow">{{ $errors->first() }}</div>
        @endif
        <form id="payment-form" action="{{ route('stripe.process', $order) }}" method="POST" class="space-y-6">
            @csrf
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Card Details</label>
                <div id="card-element" class="border-2 border-gray-200 rounded-lg p-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition"></div>
            </div>
            <input type="hidden" name="stripeToken" id="stripeToken">
            <div class="flex justify-end gap-2 pt-4 border-t mt-6">
                <a href="{{ route('orders.show', $order) }}" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-semibold transition">Cancel</a>
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold shadow transition">Pay ${{ number_format($order->total, 2) }}</button>
            </div>
        </form>
    </div>
</div>
<script src="https://js.stripe.com/v3/"></script>
<script>
    const stripe = Stripe("{{ $stripeKey }}");
    const elements = stripe.elements();
    const card = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#32325d',
                '::placeholder': { color: '#a0aec0' },
                fontFamily: 'inherit',
                padding: '12px 16px',
            },
            invalid: {
                color: '#e53e3e',
            },
        }
    });
    card.mount('#card-element');

    const form = document.getElementById('payment-form');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const {token, error} = await stripe.createToken(card);
        if (error) {
            alert(error.message);
        } else {
            document.getElementById('stripeToken').value = token.id;
            form.submit();
        }
    });
</script>
@endsection 