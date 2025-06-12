@extends('layouts.app')

@section('content')
<div class="max-w-lg mx-auto py-10 px-4">
    <div class="bg-white rounded-xl shadow-lg p-8">
        <h1 class="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <svg class="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h1m2 0h12m2 0h1M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10M9 21V7a3 3 0 016 0v14"/></svg>
            Add Order
        </h1>
        @if(isset($selectedDish) && $selectedDish)
            <div class="mb-4 p-4 bg-blue-50 rounded">
                <div class="font-semibold text-blue-700">Ordering: {{ $selectedDish->name }}</div>
                <div class="text-gray-600">${{ number_format($selectedDish->price, 2) }}</div>
                <div class="text-sm text-gray-500">{{ $selectedDish->description }}</div>
            </div>
        @endif
        <form action="{{ route('orders.store') }}" method="POST" class="space-y-6">
            @csrf
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Reservation</label>
                <select name="reservation_id" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" required>
                    <option value="">Select Reservation</option>
                    @foreach($reservations as $reservation)
                        <option value="{{ $reservation->id }}">#{{ $reservation->id }} (Table: {{ $reservation->table->number ?? '-' }}, {{ $reservation->time_slot }})</option>
                    @endforeach
                </select>
                @error('reservation_id')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Status</label>
                <select name="status" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                @error('status')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Total</label>
                <input type="number" name="total" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" min="0" step="0.01" required @if(isset($selectedDish) && $selectedDish) value="{{ $selectedDish->price }}" @endif>
                @error('total')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Paid</label>
                <select name="paid" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                </select>
                @error('paid')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div class="flex justify-end gap-2 pt-4 border-t mt-6">
                <a href="{{ route('orders.index') }}" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-semibold transition">Cancel</a>
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold shadow transition">Create</button>
            </div>
        </form>
    </div>
</div>
@endsection 