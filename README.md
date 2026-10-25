# Plateforme de gestion des stages et du suivi PFE

MVP OFPPT construit avec Laravel 12, Sanctum, MySQL et React/Vite. Il couvre les quatre espaces (administration, formateur, stagiaire, entreprise), le cycle de vie des conventions, le suivi, les rapports versionnés et les évaluations.

## Prérequis

- PHP 8.2+ avec extensions PDO MySQL, Fileinfo, Mbstring et OpenSSL
- Composer
- MySQL 8+
- Node.js 20+

## Démarrage local

1. Créer la base MySQL `stages_ofppt`.
2. Installer l’API :

   ```powershell
   Set-Location backend
   composer install
   Copy-Item .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve
   ```

3. Dans un second terminal, démarrer React :

   ```powershell
   Set-Location frontend
   npm install
   Copy-Item .env.example .env
   npm run dev
   ```

4. Ouvrir l’adresse Vite affichée dans le terminal (`http://localhost:5173`).

Le frontend utilise `VITE_API_URL` (par défaut `http://localhost:8000/api`). Le backend autorise l’origine configurée dans `FRONTEND_URL`.

## Comptes de démonstration

| Rôle | E-mail | Mot de passe |
| --- | --- | --- |
| Administrateur | `admin@ofppt.test` | `password` |
| Formateur | `formateur@ofppt.test` | `password` |
| Stagiaire | `stagiaire@ofppt.test` | `password` |
| Entreprise | `entreprise@ofppt.test` | `password` |

Ces comptes et mots de passe sont réservés au développement local. Ne les utilisez pas en production.

## Fonctionnalités du MVP

- Connexion par jeton Sanctum, déconnexion, profil et contrôle d’accès par rôle.
- Demande de convention en brouillon, soumission par le stagiaire, réponse de l’entreprise, validation avec affectation d’un formateur, refus motivé et clôture administrative.
- Isolation des conventions selon le rôle de l’utilisateur.
- Journal de suivi et progression, dépôt privé de rapports PDF/DOC/DOCX (10 Mo maximum) avec versionnement, relecture par le formateur.
- Évaluations de l’entreprise et du formateur, avec notes sur 20.
- Indicateurs d’activité pour l’administration et génération de convention PDF.

La gestion CRUD des comptes et des filières, ainsi que les notifications par e-mail, sont prévues pour une itération ultérieure.

## Vérifications

```powershell
Set-Location backend
php artisan test

Set-Location ..\frontend
npm run build
```

Le backend requiert PHP/Composer et MySQL configurés localement avant le lancement de ses tests et migrations.
