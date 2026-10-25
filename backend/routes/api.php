<?php

use App\Http\Controllers\Admin\LookupController;
use App\Http\Controllers\Admin\StatController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConventionController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\SuiviController;
use App\Models\Entreprise;
use App\Models\Filiere;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/filieres', fn () => Filiere::orderBy('nom')->get(['id', 'code', 'nom']));
    Route::get('/entreprises', fn () => Entreprise::orderBy('raison_sociale')
        ->get(['id', 'raison_sociale', 'ville']));

    Route::get('/conventions', [ConventionController::class, 'index']);
    Route::post('/conventions', [ConventionController::class, 'store'])->middleware('role:stagiaire');
    Route::get('/conventions/{id}', [ConventionController::class, 'show']);
    Route::get('/conventions/{id}/pdf', [ConventionController::class, 'pdf']);
    Route::put('/conventions/{id}', [ConventionController::class, 'update'])->middleware('role:stagiaire');
    Route::patch('/conventions/{id}/{action}', [ConventionController::class, 'transition'])
        ->where('action', 'soumettre|accepter|valider|refuser|terminer');

    Route::post('/conventions/{id}/suivis', [SuiviController::class, 'store'])->middleware('role:formateur');
    Route::post('/conventions/{id}/rapports', [RapportController::class, 'store'])->middleware('role:stagiaire');
    Route::get('/rapports/{id}/telecharger', [RapportController::class, 'telecharger']);
    Route::patch('/rapports/{id}/statut', [RapportController::class, 'changerStatut'])
        ->middleware('role:formateur');
    Route::post('/conventions/{id}/evaluations', [EvaluationController::class, 'store'])
        ->middleware('role:formateur,entreprise');

    Route::middleware('role:admin')->prefix('admin')->group(function (): void {
        Route::get('/stats', StatController::class);
        Route::get('/formateurs', [LookupController::class, 'formateurs']);
    });
});
