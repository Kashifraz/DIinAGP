@extends('layouts.app')

@section('content')
<div class="max-w-lg mx-auto py-10 px-4">
    <div class="bg-white rounded-xl shadow-lg p-8">
        <h1 class="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <svg class="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Edit Payment
        </h1>
        <form action="{{ route('payments.update', $payment) }}" method="POST" class="space-y-6">
            @csrf
            @method('PUT')
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Order</label>
                <select name="order_id" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" required>
                    @foreach($orders as $order)
                        <option value="{{ $order->id }}" @if($payment->order_id == $order->id) selected @endif>#{{ $order->id }} (Total: ${{ number_format($order->total, 2) }})</option>
                    @endforeach
                </select>
                @error('order_id')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Amount</label>
                <input type="number" name="amount" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" min="0" step="0.01" value="{{ $payment->amount }}" required>
                @error('amount')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Status</label>
                <select name="status" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                    <option value="pending" @if($payment->status=='pending') selected @endif>Pending</option>
                    <option value="completed" @if($payment->status=='completed') selected @endif>Completed</option>
                    <option value="failed" @if($payment->status=='failed') selected @endif>Failed</option>
                </select>
                @error('status')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Method</label>
                <input type="text" name="method" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" value="{{ $payment->method }}" required>
                @error('method')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Transaction ID</label>
                <input type="text" name="transaction_id" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" value="{{ $payment->transaction_id }}">
                @error('transaction_id')<div class="text-red-500 text-sm mt-1">{{ $message }}</div>@enderror
            </div>
            <div class="flex justify-end gap-2 pt-4 border-t mt-6">
                <a href="{{ route('payments.index') }}" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-semibold transition">Cancel</a>
                <button type="submit" class="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded font-bold shadow transition">Update</button>
            </div>
        </form>
    </div>
</div>
@endsection 