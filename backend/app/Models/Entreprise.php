<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Entreprise extends Model
{
    protected $fillable = [
        'user_id', 'raison_sociale', 'secteur', 'adresse', 'ville', 'nom_responsable', 'ice',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function conventions(): HasMany
    {
        return $this->hasMany(Convention::class);
    }
}
