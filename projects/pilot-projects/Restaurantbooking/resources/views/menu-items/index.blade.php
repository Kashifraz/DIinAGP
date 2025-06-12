@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto py-8 px-4">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
            <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            Menu Items
        </h1>
        <a href="{{ route('menu-items.create') }}" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow flex items-center gap-2 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            Add Menu Item
        </a>
    </div>
    @if(session('success'))
        <div class="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded mb-4 shadow">{{ session('success') }}</div>
    @endif
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        @forelse($menuItems as $item)
            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                <div class="h-40 bg-gray-100 flex items-center justify-center">
                    <img src="https://source.unsplash.com/400x300/?food,{{ urlencode($item->name) }}" alt="{{ $item->name }}" class="object-cover h-full w-full">
                </div>
                <div class="p-4 flex-1 flex flex-col">
                    <div class="flex items-center justify-between mb-2">
                        <h2 class="text-lg font-bold text-gray-900">{{ $item->name }}</h2>
                        <span class="text-green-700 font-semibold text-base">${{ number_format($item->price, 2) }}</span>
                    </div>
                    <div class="mb-2 text-sm text-gray-500">{{ $item->category }}</div>
                    <div class="mb-2 flex flex-wrap gap-1">
                        @foreach(explode(',', $item->dietary_labels) as $label)
                            @if(trim($label))
                                <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{{ trim($label) }}</span>
                            @endif
                        @endforeach
                    </div>
                    <div class="mb-2 text-gray-600 text-xs line-clamp-2">{{ $item->description }}</div>
                    <div class="mb-2">
                        @if($item->available)
                            <span class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2l4-4"/></svg>Available</span>
                        @else
                            <span class="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>Unavailable</span>
                        @endif
                    </div>
                    <div class="flex gap-2 mt-auto">
                        <a href="{{ route('menu-items.edit', $item) }}" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow text-xs font-bold transition">Edit</a>
                        <form action="{{ route('menu-items.destroy', $item) }}" method="POST" onsubmit="return confirm('Delete this menu item?')">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow text-xs font-bold transition">Delete</button>
                        </form>
                    </div>
                </div>
            </div>
        @empty
            <div class="col-span-full text-center text-gray-400 py-12">No menu items found.</div>
        @endforelse
    </div>
</div>
@endsection 