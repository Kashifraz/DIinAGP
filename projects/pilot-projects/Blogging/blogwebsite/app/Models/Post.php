<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'title', 'slug', 'excerpt', 'content', 'status', 'published_at', 'category_id', 'hero_image'
    ];

    protected $casts = [
        'category_id' => 'integer',
    ];

    protected $appends = ['hero_image_url'];

    public function tags()
    {
        return $this->belongsToMany(\App\Models\Tag::class);
    }

    public function category()
    {
        return $this->belongsTo(\App\Models\Category::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function comments()
    {
        return $this->hasMany(\App\Models\Comment::class);
    }

    public function getHeroImageUrlAttribute()
    {
        if ($this->hero_image) {
            return asset('storage/' . $this->hero_image);
        }
        return null;
    }
}
