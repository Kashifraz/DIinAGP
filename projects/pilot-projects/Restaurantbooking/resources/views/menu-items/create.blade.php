@extends('layouts.app')

@section('content')
<div class="max-w-lg mx-auto py-10 px-4">
    <div class="bg-white rounded-xl shadow-lg p-8">
        <h1 class="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <svg class="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            Add Menu Item
        </h1>
        <form action="{{ route('menu-items.store') }}" method="POST" class="space-y-6">
            @csrf
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Name</label>
                <input type="text" name="name" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" required>
                @error('name')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Category</label>
                <select name="category" id="category-select" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" required>
                    <option value="">-- Select Category --</option>
                    @foreach($categories as $cat)
                        <option value="{{ $cat }}">{{ $cat }}</option>
                    @endforeach
                    <option value="__new__">Add new category...</option>
                </select>
                <input type="text" name="category" id="category-input" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition mt-2 hidden" placeholder="Enter new category">
                @error('category')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Price</label>
                <input type="number" name="price" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" min="0" step="0.01" required>
                @error('price')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Dietary Labels <span class="text-xs text-gray-400">(comma separated)</span></label>
                <input type="text" name="dietary_labels" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                @error('dietary_labels')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea name="description" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"></textarea>
                @error('description')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Available</label>
                <select name="available" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                </select>
                @error('available')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div class="flex justify-end gap-2 pt-4 border-t mt-6">
                <a href="{{ route('menu-items.index') }}" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-semibold transition">Cancel</a>
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold shadow transition">Create</button>
            </div>
        </form>
    </div>
</div>
@endsection

@section('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const select = document.getElementById('category-select');
    const input = document.getElementById('category-input');
    function toggleCategoryField() {
        if (select.value === '__new__') {
            select.classList.add('hidden');
            input.classList.remove('hidden');
            input.required = true;
            input.name = 'category';
            select.name = '';
            input.focus();
        } else {
            select.classList.remove('hidden');
            input.classList.add('hidden');
            input.required = false;
            input.name = '';
            select.name = 'category';
        }
    }
    if (select && input) {
        select.addEventListener('change', toggleCategoryField);
        // On page load, ensure correct field is shown
        toggleCategoryField();
    }
});
</script>
@endsection 
@endsection 