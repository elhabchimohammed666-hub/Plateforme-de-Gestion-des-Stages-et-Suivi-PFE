<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evaluation extends Model
{
    protected $fillable = [
        'convention_id', 'type', 'note_technique', 'note_autonomie', 'note_communication',
        'note_rapport', 'note_soutenance', 'commentaire',
    ];

    protected function casts(): array
    {
        return [
            'note_technique' => 'decimal:2',
            'note_autonomie' => 'decimal:2',
            'note_communication' => 'decimal:2',
            'note_rapport' => 'decimal:2',
            'note_soutenance' => 'decimal:2',
        ];
    }

    public function convention(): BelongsTo
    {
        return $this->belongsTo(Convention::class);
    }
}
