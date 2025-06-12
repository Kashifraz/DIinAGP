<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

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

        \App\Models\User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        \App\Models\User::create([
            'name' => 'Customer One',
            'email' => 'customer1@example.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);
        \App\Models\User::create([
            'name' => 'Customer Two',
            'email' => 'customer2@example.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);
    }
}
