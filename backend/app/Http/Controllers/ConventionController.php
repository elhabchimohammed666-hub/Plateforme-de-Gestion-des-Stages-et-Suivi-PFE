<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Convention;
use App\Models\Stagiaire;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class ConventionController extends Controller
{
    private function visibleToCurrentUser(): Builder
    {
        $user = request()->user();

        return Convention::query()
            ->when($user->role === 'stagiaire', fn (Builder $query) => $query->whereHas(
                'stagiaire',
                fn (Builder $students) => $students->where('user_id', $user->id)
            ))
            ->when($user->role === 'formateur', fn (Builder $query) => $query->whereHas(
                'formateur',
                fn (Builder $trainers) => $trainers->where('user_id', $user->id)
            ))
            ->when($user->role === 'entreprise', fn (Builder $query) => $query->whereHas(
                'entreprise',
                fn (Builder $companies) => $companies->where('user_id', $user->id)
            ));
    }

    private function details(Builder $query): Builder
    {
        return $query->with([
            'stagiaire.user:id,name,email',
            'stagiaire.filiere:id,code,nom',
            'entreprise.user:id,name',
            'formateur.user:id,name',
            'suivis.formateur.user:id,name',
            'rapports',
            'evaluations',
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $conventions = $this->details($this->visibleToCurrentUser())
            ->when($request->filled('statut'), fn (Builder $query) =>
                $query->where('statut', $request->input('statut')))
            ->latest()
            ->paginate(max(1, min(100, (int) $request->query('per_page', 15))));

        return response()->json($conventions);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->details($this->visibleToCurrentUser())->findOrFail($id));
    }

    public function pdf(int $id): Response
    {
        $convention = $this->details($this->visibleToCurrentUser()
            ->whereIn('statut', ['validee', 'terminee'])
            ->whereKey($id))->firstOrFail();

        return Pdf::loadView('pdf.convention', ['convention' => $convention])
            ->download("convention-{$convention->numero}.pdf");
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'entreprise_id' => ['required', 'exists:entreprises,id'],
            'type' => ['required', Rule::in(['stage', 'pfe'])],
            'sujet' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'date_debut' => ['required', 'date'],
            'date_fin' => ['required', 'date', 'after:date_debut'],
        ]);

        $student = Stagiaire::where('user_id', $request->user()->id)->firstOrFail();
        $convention = DB::transaction(function () use ($student, $data): Convention {
            $lockedStudent = Stagiaire::query()->lockForUpdate()->findOrFail($student->id);
            $hasActiveConvention = $lockedStudent->conventions()
                ->where('type', $data['type'])
                ->whereIn('statut', ['brouillon', 'soumise', 'acceptee_entreprise', 'validee'])
                ->exists();

            if ($hasActiveConvention) {
                abort(422, 'Une convention active existe déjà pour ce type de stage.');
            }

            $convention = $lockedStudent->conventions()->create([
                ...$data,
                'numero' => 'STG-'.now()->format('Y').'-'.Str::upper(Str::random(8)),
                'statut' => 'brouillon',
            ]);

            return $convention;
        });

        return response()->json($this->details(
            $this->visibleToCurrentUser()->whereKey($convention->id)
        )->firstOrFail(), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $convention = $this->visibleToCurrentUser()->findOrFail($id);
        abort_unless($request->user()->role === 'stagiaire', 403);
        abort_unless(in_array($convention->statut, ['brouillon', 'refusee'], true), 422,
            'Seules les conventions en brouillon ou refusées peuvent être modifiées.');

        $data = $request->validate([
            'entreprise_id' => ['required', 'exists:entreprises,id'],
            'type' => ['required', Rule::in(['stage', 'pfe'])],
            'sujet' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'date_debut' => ['required', 'date'],
            'date_fin' => ['required', 'date', 'after:date_debut'],
        ]);

        DB::transaction(function () use ($convention, $data): void {
            $student = Stagiaire::query()->lockForUpdate()->findOrFail($convention->stagiaire_id);
            $conflictingConvention = $student->conventions()
                ->where('id', '!=', $convention->id)
                ->where('type', $data['type'])
                ->whereIn('statut', ['brouillon', 'soumise', 'acceptee_entreprise', 'validee'])
                ->exists();
            if ($conflictingConvention) {
                abort(422, 'Une convention active existe déjà pour ce type de stage.');
            }

            $convention->update([...$data, 'motif_refus' => null]);
        });

        return response()->json($this->details(
            $this->visibleToCurrentUser()->whereKey($convention->id)
        )->firstOrFail());
    }

    public function transition(Request $request, int $id, string $action): JsonResponse
    {
        $convention = $this->visibleToCurrentUser()->findOrFail($id);
        $user = $request->user();

        if ($action === 'soumettre') {
            abort_unless($user->role === 'stagiaire', 403);
            abort_unless(in_array($convention->statut, ['brouillon', 'refusee'], true), 422);
            $convention->update(['statut' => 'soumise', 'motif_refus' => null]);
        } elseif ($action === 'accepter') {
            abort_unless($user->role === 'entreprise', 403);
            abort_unless($convention->statut === 'soumise', 422);
            $convention->update(['statut' => 'acceptee_entreprise']);
        } elseif ($action === 'valider') {
            abort_unless($user->role === 'admin', 403);
            abort_unless($convention->statut === 'acceptee_entreprise', 422);
            $data = $request->validate(['formateur_id' => ['required', 'exists:formateurs,id']]);
            $convention->update(['statut' => 'validee', 'formateur_id' => $data['formateur_id']]);
        } elseif ($action === 'refuser') {
            abort_unless(in_array($user->role, ['admin', 'entreprise'], true), 403);
            abort_unless(in_array($convention->statut, ['soumise', 'acceptee_entreprise'], true), 422);
            $data = $request->validate(['motif' => ['required', 'string', 'max:2000']]);
            $convention->update(['statut' => 'refusee', 'motif_refus' => $data['motif']]);
        } elseif ($action === 'terminer') {
            abort_unless($user->role === 'admin', 403);
            abort_unless($convention->statut === 'validee', 422);
            $convention->update(['statut' => 'terminee']);
        } else {
            abort(404);
        }

        return response()->json($this->details(
            $this->visibleToCurrentUser()->whereKey($convention->id)
        )->firstOrFail());
    }
}
