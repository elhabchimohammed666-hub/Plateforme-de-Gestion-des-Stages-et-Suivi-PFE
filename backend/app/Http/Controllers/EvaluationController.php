<?php

namespace App\Http\Controllers;

use App\Models\Convention;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EvaluationController extends Controller
{
    public function store(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $convention = Convention::with('entreprise', 'formateur')
            ->whereKey($id)
            ->where(function ($query) use ($user): void {
                if ($user->role === 'formateur') {
                    $query->whereHas('formateur', fn ($formateurs) =>
                        $formateurs->where('user_id', $user->id));
                } else {
                    $query->whereHas('entreprise', fn ($entreprises) =>
                        $entreprises->where('user_id', $user->id));
                }
            })
            ->firstOrFail();
        abort_unless($convention->statut === 'validee', 422,
            'L’évaluation est disponible uniquement pour une convention validée.');

        $data = $request->validate([
            'note_technique' => ['required', 'numeric', 'between:0,20'],
            'note_autonomie' => ['required', 'numeric', 'between:0,20'],
            'note_communication' => ['required', 'numeric', 'between:0,20'],
            'note_rapport' => ['required', 'numeric', 'between:0,20'],
            'note_soutenance' => ['required', 'numeric', 'between:0,20'],
            'commentaire' => ['nullable', 'string', 'max:3000'],
        ]);

        $evaluation = $convention->evaluations()->updateOrCreate(
            ['type' => $user->role],
            $data,
        );

        return response()->json($evaluation);
    }
}
