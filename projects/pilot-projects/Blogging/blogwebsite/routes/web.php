<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\BlogController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::resource('posts', \App\Http\Controllers\PostController::class);
    Route::resource('categories', \App\Http\Controllers\CategoryController::class);
    Route::resource('tags', \App\Http\Controllers\TagController::class);
    Route::get('/comments/moderation', [\App\Http\Controllers\CommentController::class, 'moderation'])->name('comments.moderation');
    Route::post('/comments/bulk-action', [\App\Http\Controllers\CommentController::class, 'bulkAction'])->name('comments.bulkAction');
});

// Public Blog Website
Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/post/{slug}', [BlogController::class, 'show'])->name('blog.show');
Route::get('/blog/category/{slug}', [BlogController::class, 'category'])->name('blog.category');
Route::get('/blog/tag/{slug}', [BlogController::class, 'tag'])->name('blog.tag');
Route::post('/blog/post/{slug}/comment', [\App\Http\Controllers\BlogController::class, 'submitComment'])->name('blog.comment');

require __DIR__.'/auth.php';
