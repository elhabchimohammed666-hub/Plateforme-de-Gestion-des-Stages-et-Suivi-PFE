<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Formateur;
use Illuminate\Database\Eloquent\Collection;

class LookupController extends Controller
{
    public function formateurs(): Collection
    {
        return Formateur::query()->with('user:id,name')->orderBy('id')->get();
    }
}
