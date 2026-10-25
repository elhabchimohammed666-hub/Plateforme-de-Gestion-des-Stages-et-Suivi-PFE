<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Suivi extends Model
{
    protected $fillable = ['convention_id', 'formateur_id', 'date_visite', 'type', 'commentaire', 'avancement'];

    protected function casts(): array
    {
        return ['date_visite' => 'date'];
    }

    public function convention(): BelongsTo
    {
        return $this->belongsTo(Convention::class);
    }

    public function formateur(): BelongsTo
    {
        return $this->belongsTo(Formateur::class);
    }
}
