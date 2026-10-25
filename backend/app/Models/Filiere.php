<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Filiere extends Model
{
    protected $fillable = ['code', 'nom'];

    public function stagiaires(): HasMany
    {
        return $this->hasMany(Stagiaire::class);
    }
}
