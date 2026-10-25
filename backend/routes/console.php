<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('about:project', function () {
    $this->comment('Plateforme OFPPT - gestion des stages et du suivi PFE.');
})->purpose('Afficher les informations du projet');
