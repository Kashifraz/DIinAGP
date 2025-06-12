@extends('layouts.app')

@section('content')
<div class="max-w-lg mx-auto py-10 px-4">
    <div class="bg-white rounded-xl shadow-lg p-8">
        <div class="flex flex-col md:flex-row gap-6 mb-6">
            <div class="flex-shrink-0 w-full md:w-48 h-40 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden">
                <img src="https://source.unsplash.com/400x300/?food,{{ urlencode($menuItem->name) }}" alt="{{ $menuItem->name }}" class="object-cover h-full w-full">
            </div>
            <div class="flex-1">
                <h1 class="text-2xl font-extrabold text-gray-800 mb-2 flex items-center gap-2">
                    <svg class="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {{ $menuItem->name }}
                </h1>
                <div class="mb-2 text-sm text-gray-500">{{ $menuItem->category }}</div>
                <div class="mb-2 flex flex-wrap gap-1">
                    @foreach(explode(',', $menuItem->dietary_labels) as $label)
                        @if(trim($label))
                            <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{{ trim($label) }}</span>
                        @endif
                    @endforeach
                </div>
                <div class="mb-2 text-gray-600 text-sm">{{ $menuItem->description }}</div>
                <div class="mb-2">
                    <span class="text-green-700 font-semibold text-lg">${{ number_format($menuItem->price, 2) }}</span>
                </div>
                <div class="mb-2">
                    @if($menuItem->available)
                        <span class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2l4-4"/></svg>Available</span>
                    @else
                        <span class="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>Unavailable</span>
                    @endif
                </div>
            </div>
        </div>
        <div class="flex justify-between gap-2 mt-8">
            <a href="{{ route('menu-items.edit', $menuItem) }}" class="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded font-bold shadow transition">Edit</a>
            <a href="{{ route('menu-items.index') }}" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded font-semibold transition">Back to List</a>
        </div>
    </div>
</div>
@endsection 