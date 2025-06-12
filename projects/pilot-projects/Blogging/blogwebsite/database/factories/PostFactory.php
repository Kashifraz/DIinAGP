<?php

namespace Database\Factories;

use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition()
    {
        $title = $this->faker->sentence(6, true);
        return [
            'title' => $title,
            'slug' => Str::slug($title) . '-' . $this->faker->unique()->numberBetween(1000, 9999),
            'excerpt' => $this->faker->sentence(12, true),
            'content' => $this->faker->paragraphs(5, true),
            'status' => 'published',
            'published_at' => now(),
            'hero_image' => null, // You can set a default or random image path if needed
        ];
    }
} 