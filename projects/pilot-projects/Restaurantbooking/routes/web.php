<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', [\App\Http\Controllers\MenuItemController::class, 'landing'])->name('menu.landing');

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'role:admin,staff'])->group(function () {
    Route::resource('tables', \App\Http\Controllers\TableController::class);
    Route::resource('menu-items', \App\Http\Controllers\MenuItemController::class);
    Route::resource('orders', \App\Http\Controllers\OrderController::class);
    Route::resource('payments', \App\Http\Controllers\PaymentController::class);
    Route::get('reports', [\App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
    Route::resource('menu-categories', \App\Http\Controllers\MenuCategoryController::class);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('reservations', \App\Http\Controllers\ReservationController::class);

    Route::get('pay/{order}', [\App\Http\Controllers\StripeController::class, 'showPaymentForm'])->name('stripe.pay');
    Route::post('pay/{order}', [\App\Http\Controllers\StripeController::class, 'processPayment'])->name('stripe.process');

    Route::post('/menu/review/{menuItem}', [\App\Http\Controllers\ReviewController::class, 'store'])->middleware('auth')->name('reviews.store');
});

require __DIR__.'/auth.php';
