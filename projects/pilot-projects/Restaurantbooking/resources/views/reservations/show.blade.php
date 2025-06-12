@extends('layouts.app')

@section('content')
<div class="max-w-lg mx-auto py-10 px-4">
    <div class="bg-white rounded-xl shadow-lg p-8">
        <h1 class="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <svg class="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Reservation Details
        </h1>
        <div class="mb-6 space-y-2">
            <div class="flex items-center gap-2 text-lg">
                <span class="font-bold text-gray-700">Table:</span>
                <span class="text-gray-900">{{ $reservation->table->number ?? '-' }}</span>
            </div>
            <div class="flex items-center gap-2 text-lg">
                <span class="font-bold text-gray-700">User:</span>
                <span class="text-gray-900">{{ $reservation->user->name ?? '-' }}</span>
            </div>
            <div class="flex items-center gap-2 text-lg">
                <span class="font-bold text-gray-700">Time Slot:</span>
                <span class="text-gray-900">{{ $reservation->time_slot }}</span>
            </div>
            <div class="flex items-center gap-2 text-lg">
                <span class="font-bold text-gray-700">Guests:</span>
                <span class="text-gray-900">{{ $reservation->guests }}</span>
            </div>
            <div class="flex items-center gap-2 text-lg">
                <span class="font-bold text-gray-700">Status:</span>
                @if($reservation->status == 'confirmed')
                    <span class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2l4-4"/></svg>Confirmed</span>
                @elseif($reservation->status == 'pending')
                    <span class="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>Pending</span>
                @elseif($reservation->status == 'completed')
                    <span class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>Completed</span>
                @else
                    <span class="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>Cancelled</span>
                @endif
            </div>
            <div class="flex items-center gap-2 text-lg">
                <span class="font-bold text-gray-700">Special Requests:</span>
                <span class="text-gray-900">{{ $reservation->special_requests }}</span>
            </div>
        </div>
        <div class="flex justify-between gap-2 mt-8">
            <a href="{{ route('reservations.edit', $reservation) }}" class="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded font-bold shadow transition">Edit</a>
            <a href="{{ route('reservations.index') }}" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded font-semibold transition">Back to List</a>
        </div>
    </div>
</div>
@endsection 