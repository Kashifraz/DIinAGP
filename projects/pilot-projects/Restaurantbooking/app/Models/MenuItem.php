<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'price',
        'dietary_labels',
        'description',
        'available',
    ];

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
