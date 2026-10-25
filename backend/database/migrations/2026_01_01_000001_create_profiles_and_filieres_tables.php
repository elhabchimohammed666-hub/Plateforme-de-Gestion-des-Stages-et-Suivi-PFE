<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('filieres', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('nom');
            $table->timestamps();
        });

        Schema::create('stagiaires', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('filiere_id')->constrained()->restrictOnDelete();
            $table->string('cef', 50)->unique();
            $table->string('groupe', 50)->nullable();
            $table->string('niveau', 50)->nullable();
            $table->timestamps();
        });

        Schema::create('formateurs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('specialite')->nullable();
            $table->timestamps();
        });

        Schema::create('entreprises', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('raison_sociale');
            $table->string('secteur')->nullable();
            $table->string('adresse')->nullable();
            $table->string('ville')->nullable();
            $table->string('nom_responsable')->nullable();
            $table->string('ice', 30)->nullable()->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entreprises');
        Schema::dropIfExists('formateurs');
        Schema::dropIfExists('stagiaires');
        Schema::dropIfExists('filieres');
    }
};
