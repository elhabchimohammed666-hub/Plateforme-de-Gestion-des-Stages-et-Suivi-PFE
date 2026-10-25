<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rapport extends Model
{
    protected $hidden = ['fichier_path'];

    protected $fillable = [
        'convention_id', 'titre', 'type', 'version', 'fichier_path', 'statut', 'commentaire_formateur',
    ];

    public function convention(): BelongsTo
    {
        return $this->belongsTo(Convention::class);
    }
}
