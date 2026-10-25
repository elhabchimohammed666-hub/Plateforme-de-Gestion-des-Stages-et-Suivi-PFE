<?php

namespace App\Http\Controllers;

use App\Models\Convention;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SuiviController extends Controller
{
    public function store(Request $request, int $id): JsonResponse
    {
        $trainer = $request->user()->formateur()->firstOrFail();
        $convention = Convention::whereKey($id)->where('formateur_id', $trainer->id)->firstOrFail();
        abort_unless($convention->statut === 'validee', 422,
            'Le suivi est disponible uniquement pour une convention validée.');

        $data = $request->validate([
            'date_visite' => ['required', 'date'],
            'type' => ['required', Rule::in(['visite', 'appel', 'reunion'])],
            'commentaire' => ['required', 'string', 'max:3000'],
            'avancement' => ['required', 'integer', 'between:0,100'],
        ]);

        return response()->json($convention->suivis()->create([
            ...$data,
            'formateur_id' => $trainer->id,
        ]), 201);
    }
}
