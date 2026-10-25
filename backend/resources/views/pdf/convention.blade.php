<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #182436; }
    h1 { text-align: center; font-size: 19px; margin-bottom: 4px; }
    .number { text-align: center; color: #64748b; margin-bottom: 24px; }
    h2 { font-size: 13px; background: #eef3f1; padding: 7px 9px; margin-top: 18px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 7px 9px; border: 1px solid #d8dfdc; vertical-align: top; }
    td.label { width: 35%; background: #f8faf9; font-weight: bold; }
    .signatures { margin-top: 48px; }
    .signatures td { border: 0; text-align: center; height: 80px; }
  </style>
</head>
<body>
  <h1>CONVENTION DE {{ mb_strtoupper($convention->type === 'pfe' ? 'projet de fin d’études' : 'stage') }}</h1>
  <div class="number">N° {{ $convention->numero }}</div>
  <h2>Le stagiaire</h2>
  <table>
    <tr><td class="label">Nom complet</td><td>{{ $convention->stagiaire->user->name }}</td></tr>
    <tr><td class="label">CEF</td><td>{{ $convention->stagiaire->cef }}</td></tr>
    <tr><td class="label">Filière</td><td>{{ $convention->stagiaire->filiere->nom }}</td></tr>
  </table>
  <h2>L’entreprise d’accueil</h2>
  <table>
    <tr><td class="label">Raison sociale</td><td>{{ $convention->entreprise->raison_sociale }}</td></tr>
    <tr><td class="label">Adresse</td><td>{{ $convention->entreprise->adresse }} {{ $convention->entreprise->ville }}</td></tr>
    <tr><td class="label">Responsable</td><td>{{ $convention->entreprise->nom_responsable }}</td></tr>
  </table>
  <h2>Le stage</h2>
  <table>
    <tr><td class="label">Sujet</td><td>{{ $convention->sujet }}</td></tr>
    <tr><td class="label">Période</td><td>Du {{ $convention->date_debut->format('d/m/Y') }} au {{ $convention->date_fin->format('d/m/Y') }}</td></tr>
    <tr><td class="label">Encadrant pédagogique</td><td>{{ $convention->formateur?->user->name }}</td></tr>
  </table>
  <table class="signatures">
    <tr><td>Le stagiaire</td><td>L’entreprise</td><td>L’établissement</td></tr>
  </table>
</body>
</html>
