<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reservation;
use App\Models\Order;
use App\Models\MenuItem;
use Illuminate\Support\Facades\DB;
use App\Models\Payment;

class ReportController extends Controller
{
    public function index()
    {
        // KPIs
        $totalReservations = Reservation::count();
        $totalOrders = Order::count();
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');
        $todayReservations = Reservation::whereDate('created_at', today())->count();
        $weekReservations = Reservation::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count();

        // Peak hours: group reservations by hour
        $peakHours = Reservation::select(DB::raw('HOUR(time_slot) as hour'), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw('HOUR(time_slot)'))
            ->orderBy('count', 'desc')
            ->get();
        $mostPopularHour = $peakHours->first();

        // Popular dishes: count menu items in orders
        $popularDishes = collect();
        if (DB::getSchemaBuilder()->hasTable('order_menu_item')) {
            $popularDishes = DB::table('order_menu_item')
                ->select('menu_item_id', DB::raw('COUNT(*) as count'))
                ->groupBy('menu_item_id')
                ->orderBy('count', 'desc')
                ->take(10)
                ->get()
                ->map(function($row) {
                    $item = MenuItem::find($row->menu_item_id);
                    return [
                        'name' => $item ? $item->name : 'Unknown',
                        'count' => $row->count
                    ];
                });
        }
        $mostPopularDish = $popularDishes->first();

        // Chart data
        $chartHours = $peakHours->pluck('hour');
        $chartReservations = $peakHours->pluck('count');
        $chartDishes = $popularDishes->pluck('name');
        $chartDishCounts = $popularDishes->pluck('count');

        return view('reports.index', compact(
            'totalReservations', 'totalOrders', 'totalRevenue',
            'todayReservations', 'weekReservations',
            'mostPopularHour', 'mostPopularDish',
            'peakHours', 'popularDishes',
            'chartHours', 'chartReservations', 'chartDishes', 'chartDishCounts'
        ));
    }
}
