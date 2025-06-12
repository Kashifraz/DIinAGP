@extends('layouts.app')

@section('content')
<div class="max-w-lg mx-auto py-10 px-4">
    <div class="bg-white rounded-xl shadow-lg p-8">
        <h1 class="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <svg class="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Edit Reservation
        </h1>
        <form action="{{ route('reservations.update', $reservation) }}" method="POST" class="space-y-6">
            @csrf
            @method('PUT')
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Table</label>
                <select name="table_id" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" required>
                    @foreach($tables as $table)
                        <option value="{{ $table->id }}" @if($reservation->table_id == $table->id) selected @endif>{{ $table->number }} (Seats: {{ $table->seats }})</option>
                    @endforeach
                </select>
                @error('table_id')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Time Slot</label>
                <div class="relative">
                    <input type="datetime-local" name="time_slot" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" value="{{ date('Y-m-d\TH:i', strtotime($reservation->time_slot)) }}" required>
                    <span class="absolute right-3 top-3 text-gray-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></span>
                </div>
                @error('time_slot')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Guests</label>
                <input type="number" name="guests" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" min="1" value="{{ $reservation->guests }}" required>
                @error('guests')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Special Requests</label>
                <textarea name="special_requests" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">{{ $reservation->special_requests }}</textarea>
                @error('special_requests')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Status</label>
                <select name="status" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                    <option value="pending" @if($reservation->status=='pending') selected @endif>Pending</option>
                    <option value="confirmed" @if($reservation->status=='confirmed') selected @endif>Confirmed</option>
                    <option value="cancelled" @if($reservation->status=='cancelled') selected @endif>Cancelled</option>
                    <option value="completed" @if($reservation->status=='completed') selected @endif>Completed</option>
                </select>
                @error('status')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div class="flex justify-end gap-2 pt-4 border-t mt-6">
                <a href="{{ route('reservations.index') }}" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-semibold transition">Cancel</a>
                <button type="submit" class="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded font-bold shadow transition">Update</button>
            </div>
        </form>
    </div>
</div>
@endsection 