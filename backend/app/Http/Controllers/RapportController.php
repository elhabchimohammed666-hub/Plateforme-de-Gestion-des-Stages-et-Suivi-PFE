<?php

namespace App\Http\Controllers;

use App\Models\Convention;
use App\Models\Rapport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RapportController extends Controller
{
    public function store(Request $request, int $id): JsonResponse
    {
        $convention = Convention::whereHas(
            'stagiaire',
            fn ($query) => $query->where('user_id', $request->user()->id)
        )->findOrFail($id);
        abort_unless($convention->statut === 'validee', 422,
            'Le dépôt est disponible uniquement pour une convention validée.');

        $data = $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(['intermediaire', 'final'])],
            'fichier' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
        ]);

        $rapport = DB::transaction(function () use ($convention, $data, $request): Rapport {
            $lockedConvention = Convention::query()->lockForUpdate()->findOrFail($convention->id);
            $version = ($lockedConvention->rapports()->where('type', $data['type'])->max('version') ?? 0) + 1;
            $path = $request->file('fichier')->store("rapports/{$lockedConvention->id}", 'private');

            return $lockedConvention->rapports()->create([
                'titre' => $data['titre'],
                'type' => $data['type'],
                'version' => $version,
                'fichier_path' => $path,
                'statut' => 'depose',
            ]);
        });

        return response()->json($rapport, 201);
    }

    public function telecharger(Request $request, int $id): StreamedResponse
    {
        $rapport = Rapport::with('convention')->findOrFail($id);
        $user = $request->user();
        $canAccess = $user->role === 'admin'
            || ($user->role === 'stagiaire' && $rapport->convention->stagiaire()->where('user_id', $user->id)->exists())
            || ($user->role === 'formateur' && $rapport->convention->formateur()->where('user_id', $user->id)->exists())
            || ($user->role === 'entreprise' && $rapport->convention->entreprise()->where('user_id', $user->id)->exists());
        abort_unless($canAccess, 403);

        return Storage::disk('private')->download($rapport->fichier_path);
    }

    public function changerStatut(Request $request, int $id): JsonResponse
    {
        $rapport = Rapport::with('convention.formateur')->findOrFail($id);
        abort_unless($rapport->convention->formateur?->user_id === $request->user()->id, 404);
        $data = $request->validate([
            'statut' => ['required', Rule::in(['a_corriger', 'valide'])],
            'commentaire_formateur' => ['nullable', 'string', 'max:2000'],
        ]);
        $rapport->update($data);

        return response()->json($rapport);
    }
}
