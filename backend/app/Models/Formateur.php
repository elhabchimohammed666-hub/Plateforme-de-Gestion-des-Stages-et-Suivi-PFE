<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Formateur extends Model
{
    protected $fillable = ['user_id', 'specialite'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function conventions(): HasMany
    {
        return $this->hasMany(Convention::class);
    }
}
