<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('conventions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('stagiaire_id')->constrained()->cascadeOnDelete();
            $table->foreignId('entreprise_id')->constrained()->restrictOnDelete();
            $table->foreignId('formateur_id')->nullable()->constrained()->nullOnDelete();
            $table->string('numero', 40)->unique();
            $table->string('type', 20);
            $table->string('sujet');
            $table->text('description')->nullable();
            $table->date('date_debut');
            $table->date('date_fin');
            $table->string('statut', 30)->default('brouillon')->index();
            $table->text('motif_refus')->nullable();
            $table->timestamps();
            $table->index(['stagiaire_id', 'type', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conventions');
    }
};
