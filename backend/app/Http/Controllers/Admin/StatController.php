<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Convention;
use App\Models\Rapport;
use App\Models\User;

class StatController extends Controller
{
    public function __invoke(): array
    {
        return [
            'utilisateurs' => User::query()->selectRaw('role, COUNT(*) as total')
                ->groupBy('role')->pluck('total', 'role'),
            'conventions' => Convention::query()->selectRaw('statut, COUNT(*) as total')
                ->groupBy('statut')->pluck('total', 'statut'),
            'rapports_a_corriger' => Rapport::where('statut', 'a_corriger')->count(),
        ];
    }
}
