<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Post;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        // Create a user if none exists
        $user = User::first() ?? User::factory()->create([
            'email' => 'demo@example.com',
        ]);

        // Create two dummy categories
        $cat1 = Category::firstOrCreate(['name' => 'Tech', 'slug' => 'tech']);
        $cat2 = Category::firstOrCreate(['name' => 'Life', 'slug' => 'life']);

        // Create 10 dummy posts
        foreach (range(1, 10) as $i) {
            Post::factory()->create([
                'user_id' => $user->id,
                'category_id' => $i % 2 === 0 ? $cat1->id : $cat2->id,
                'title' => 'Dummy Post ' . $i,
                'slug' => 'dummy-post-' . $i,
                'status' => 'published',
            ]);
        }
    }
}
