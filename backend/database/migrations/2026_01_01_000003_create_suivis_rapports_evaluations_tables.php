<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('suivis', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('convention_id')->constrained()->cascadeOnDelete();
            $table->foreignId('formateur_id')->constrained()->restrictOnDelete();
            $table->date('date_visite');
            $table->string('type', 20);
            $table->text('commentaire');
            $table->unsignedTinyInteger('avancement');
            $table->timestamps();
        });

        Schema::create('rapports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('convention_id')->constrained()->cascadeOnDelete();
            $table->string('titre');
            $table->string('type', 20);
            $table->unsignedInteger('version');
            $table->string('fichier_path');
            $table->string('statut', 20)->default('depose');
            $table->text('commentaire_formateur')->nullable();
            $table->timestamps();
            $table->unique(['convention_id', 'type', 'version']);
        });

        Schema::create('evaluations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('convention_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20);
            $table->decimal('note_technique', 4, 2);
            $table->decimal('note_autonomie', 4, 2);
            $table->decimal('note_communication', 4, 2);
            $table->decimal('note_rapport', 4, 2);
            $table->decimal('note_soutenance', 4, 2);
            $table->text('commentaire')->nullable();
            $table->timestamps();
            $table->unique(['convention_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
        Schema::dropIfExists('rapports');
        Schema::dropIfExists('suivis');
    }
};
