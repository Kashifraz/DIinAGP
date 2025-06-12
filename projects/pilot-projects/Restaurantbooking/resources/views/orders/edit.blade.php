@extends('layouts.app')

@section('content')
<div class="max-w-lg mx-auto py-10 px-4">
    <div class="bg-white rounded-xl shadow-lg p-8">
        <h1 class="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <svg class="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h1m2 0h12m2 0h1M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10M9 21V7a3 3 0 016 0v14"/></svg>
            Edit Order
        </h1>
        <form action="{{ route('orders.update', $order) }}" method="POST" class="space-y-6">
            @csrf
            @method('PUT')
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Reservation</label>
                <select name="reservation_id" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" required>
                    @foreach($reservations as $reservation)
                        <option value="{{ $reservation->id }}" @if($order->reservation_id == $reservation->id) selected @endif>#{{ $reservation->id }} (Table: {{ $reservation->table->number ?? '-' }}, {{ $reservation->time_slot }})</option>
                    @endforeach
                </select>
                @error('reservation_id')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Status</label>
                <select name="status" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                    <option value="pending" @if($order->status=='pending') selected @endif>Pending</option>
                    <option value="completed" @if($order->status=='completed') selected @endif>Completed</option>
                    <option value="cancelled" @if($order->status=='cancelled') selected @endif>Cancelled</option>
                </select>
                @error('status')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Total</label>
                <input type="number" name="total" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" min="0" step="0.01" value="{{ $order->total }}" required>
                @error('total')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Paid</label>
                <select name="paid" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                    <option value="1" @if($order->paid) selected @endif>Yes</option>
                    <option value="0" @if(!$order->paid) selected @endif>No</option>
                </select>
                @error('paid')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div class="flex justify-end gap-2 pt-4 border-t mt-6">
                <a href="{{ route('orders.index') }}" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-semibold transition">Cancel</a>
                <button type="submit" class="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded font-bold shadow transition">Update</button>
            </div>
        </form>
    </div>
</div>
@endsection 