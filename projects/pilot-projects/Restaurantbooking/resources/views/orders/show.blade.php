@extends('layouts.app')

@section('content')
<div class="max-w-lg mx-auto py-10 px-4">
    <div class="bg-white rounded-xl shadow-lg p-8">
        <h1 class="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <svg class="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h1m2 0h12m2 0h1M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10M9 21V7a3 3 0 016 0v14"/></svg>
            Order Details
        </h1>
        <div class="mb-6 space-y-2">
            <div class="flex items-center gap-2 text-lg">
                <span class="font-bold text-gray-700">Reservation:</span>
                <span class="text-gray-900">#{{ $order->reservation->id ?? '-' }}</span>
            </div>
            <div class="flex items-center gap-2 text-lg">
                <span class="font-bold text-gray-700">Status:</span>
                @if($order->status == 'completed')
                    <span class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2l4-4"/></svg>Completed</span>
                @elseif($order->status == 'pending')
                    <span class="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>Pending</span>
                @else
                    <span class="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>Cancelled</span>
                @endif
            </div>
            <div class="flex items-center gap-2 text-lg">
                <span class="font-bold text-gray-700">Total:</span>
                <span class="text-gray-900">${{ number_format($order->total, 2) }}</span>
            </div>
            <div class="flex items-center gap-2 text-lg">
                <span class="font-bold text-gray-700">Paid:</span>
                @if($order->paid)
                    <span class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2l4-4"/></svg>Yes</span>
                @else
                    <span class="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>No</span>
                @endif
            </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-8">
            @if(!$order->paid)
                <a href="{{ route('stripe.pay', $order) }}" class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-bold shadow transition">Pay Now</a>
            @endif
            <a href="{{ route('orders.edit', $order) }}" class="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded font-bold shadow transition">Edit</a>
            <a href="{{ route('orders.index') }}" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded font-semibold transition">Back to List</a>
        </div>
    </div>
</div>
@endsection 