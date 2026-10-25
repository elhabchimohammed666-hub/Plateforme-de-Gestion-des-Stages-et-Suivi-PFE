<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Stagiaire extends Model
{
    protected $fillable = ['user_id', 'filiere_id', 'cef', 'groupe', 'niveau'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class);
    }

    public function conventions(): HasMany
    {
        return $this->hasMany(Convention::class);
    }
}
