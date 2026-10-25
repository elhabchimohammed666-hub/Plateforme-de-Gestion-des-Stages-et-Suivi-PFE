<?php

namespace Database\Seeders;

use App\Models\Convention;
use App\Models\Entreprise;
use App\Models\Evaluation;
use App\Models\Filiere;
use App\Models\Formateur;
use App\Models\Stagiaire;
use App\Models\Suivi;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $dev = Filiere::create(['code' => 'DEV', 'nom' => 'Développement Digital']);
        Filiere::create(['code' => 'ID', 'nom' => 'Infrastructure Digitale']);

        User::create([
            'name' => 'Administrateur OFPPT',
            'email' => 'admin@ofppt.test',
            'password' => 'password',
            'role' => 'admin',
        ]);
        $trainerUser = User::create([
            'name' => 'Karim Alaoui',
            'email' => 'formateur@ofppt.test',
            'password' => 'password',
            'role' => 'formateur',
        ]);
        $trainer = Formateur::create(['user_id' => $trainerUser->id, 'specialite' => 'Développement web']);
        $companyUser = User::create([
            'name' => 'Sara Bennani',
            'email' => 'entreprise@ofppt.test',
            'password' => 'password',
            'role' => 'entreprise',
        ]);
        $company = Entreprise::create([
            'user_id' => $companyUser->id,
            'raison_sociale' => 'TechMaroc SARL',
            'secteur' => 'Informatique',
            'ville' => 'Casablanca',
            'nom_responsable' => 'Sara Bennani',
        ]);
        $studentUser = User::create([
            'name' => 'Youssef El Idrissi',
            'email' => 'stagiaire@ofppt.test',
            'password' => 'password',
            'role' => 'stagiaire',
        ]);
        $student = Stagiaire::create([
            'user_id' => $studentUser->id,
            'filiere_id' => $dev->id,
            'cef' => 'CEF2024001',
            'groupe' => 'DEV201',
        ]);

        $convention = Convention::create([
            'stagiaire_id' => $student->id,
            'entreprise_id' => $company->id,
            'formateur_id' => $trainer->id,
            'numero' => 'STG-2026-001',
            'type' => 'stage',
            'sujet' => 'Développement d’une plateforme de suivi des stages',
            'description' => 'Conception et réalisation d’un outil de suivi pédagogique.',
            'date_debut' => now()->subWeeks(3)->toDateString(),
            'date_fin' => now()->addWeeks(5)->toDateString(),
            'statut' => 'validee',
        ]);
        Suivi::create([
            'convention_id' => $convention->id,
            'formateur_id' => $trainer->id,
            'date_visite' => now()->subDays(5)->toDateString(),
            'type' => 'reunion',
            'commentaire' => 'Avancement régulier, cadrage technique validé.',
            'avancement' => 45,
        ]);
        Evaluation::create([
            'convention_id' => $convention->id,
            'type' => 'entreprise',
            'note_technique' => 16,
            'note_autonomie' => 17,
            'note_communication' => 15,
            'note_rapport' => 15,
            'note_soutenance' => 15,
            'commentaire' => 'Bonne intégration à l’équipe.',
        ]);
    }
}
