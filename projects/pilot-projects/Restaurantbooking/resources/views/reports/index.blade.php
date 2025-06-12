@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-extrabold text-gray-800 mb-8 flex items-center gap-3">
        <svg class="w-9 h-9 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3v18h18"/></svg>
        Reports Dashboard
    </h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div class="text-gray-500 flex items-center gap-2 mb-1"><svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>Reservations (Today)</div>
            <div class="text-3xl font-extrabold text-blue-700">{{ $todayReservations }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div class="text-gray-500 flex items-center gap-2 mb-1"><svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>Reservations (This Week)</div>
            <div class="text-3xl font-extrabold text-blue-700">{{ $weekReservations }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div class="text-gray-500 flex items-center gap-2 mb-1"><svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>Reservations (All Time)</div>
            <div class="text-3xl font-extrabold text-blue-700">{{ $totalReservations }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div class="text-gray-500 flex items-center gap-2 mb-1"><svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 10h1m2 0h12m2 0h1M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10M9 21V7a3 3 0 016 0v14"/></svg>Total Orders</div>
            <div class="text-3xl font-extrabold text-green-700">{{ $totalOrders }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div class="text-gray-500 flex items-center gap-2 mb-1"><svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8c-4.418 0-8 1.79-8 4v6a2 2 0 002 2h12a2 2 0 002-2v-6c0-2.21-3.582-4-8-4z"/></svg>Total Revenue</div>
            <div class="text-3xl font-extrabold text-emerald-700">${{ number_format($totalRevenue, 2) }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div class="text-gray-500 flex items-center gap-2 mb-1"><svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3"/></svg>Most Popular Hour</div>
            <div class="text-3xl font-extrabold text-indigo-700">@if($mostPopularHour){{ str_pad($mostPopularHour->hour, 2, '0', STR_PAD_LEFT) }}:00 ({{ $mostPopularHour->count }})@else - @endif</div>
        </div>
        <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center lg:col-span-2">
            <div class="text-gray-500 flex items-center gap-2 mb-1"><svg class="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>Most Popular Dish</div>
            <div class="text-3xl font-extrabold text-pink-700">@if($mostPopularDish){{ $mostPopularDish['name'] }} ({{ $mostPopularDish['count'] }})@else - @endif</div>
        </div>
    </div>
    <div class="mb-12">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2"><svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 3v18h18"/></svg>Reservations by Hour</h2>
        <div class="bg-white rounded-xl shadow p-6">
            <canvas id="reservationsByHourChart" height="100"></canvas>
        </div>
    </div>
    <div class="mb-12">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2"><svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>Top 5 Popular Dishes</h2>
        <div class="bg-white rounded-xl shadow p-6">
            <canvas id="popularDishesChart" height="100"></canvas>
        </div>
    </div>
    <div class="mb-12">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2"><svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3"/></svg>Peak Hours (Most Reservations)</h2>
        <div class="bg-white rounded-xl shadow p-6 overflow-x-auto">
            <table class="min-w-full">
                <thead>
                    <tr>
                        <th class="py-2 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Hour</th>
                        <th class="py-2 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Reservation Count</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($peakHours as $row)
                        <tr class="hover:bg-blue-50 transition">
                            <td class="py-2 px-4">{{ str_pad($row->hour, 2, '0', STR_PAD_LEFT) }}:00</td>
                            <td class="py-2 px-4">{{ $row->count }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
    <div>
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2"><svg class="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>Popular Dishes</h2>
        <div class="bg-white rounded-xl shadow p-6 overflow-x-auto">
            @if(count($popularDishes))
            <table class="min-w-full">
                <thead>
                    <tr>
                        <th class="py-2 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Menu Item</th>
                        <th class="py-2 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Order Count</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($popularDishes as $dish)
                        <tr class="hover:bg-blue-50 transition">
                            <td class="py-2 px-4">{{ $dish['name'] }}</td>
                            <td class="py-2 px-4">{{ $dish['count'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
            @else
                <p class="text-gray-400">No order data available.</p>
            @endif
        </div>
    </div>
</div>
<!-- Chart.js CDN -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    const chartHours = @json($chartHours);
    const chartReservations = @json($chartReservations);
    const chartDishes = @json($chartDishes->take(5));
    const chartDishCounts = @json($chartDishCounts->take(5));

    // Reservations by Hour
    new Chart(document.getElementById('reservationsByHourChart'), {
        type: 'bar',
        data: {
            labels: chartHours.map(h => h.toString().padStart(2, '0') + ':00'),
            datasets: [{
                label: 'Reservations',
                data: chartReservations,
                backgroundColor: 'rgba(59, 130, 246, 0.7)'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });

    // Popular Dishes
    new Chart(document.getElementById('popularDishesChart'), {
        type: 'bar',
        data: {
            labels: chartDishes,
            datasets: [{
                label: 'Order Count',
                data: chartDishCounts,
                backgroundColor: 'rgba(16, 185, 129, 0.7)'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });
</script>
@endsection 