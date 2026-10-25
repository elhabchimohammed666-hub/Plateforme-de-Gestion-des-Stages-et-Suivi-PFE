<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_returns_a_token_and_profile(): void
    {
        $user = User::create([
            'name' => 'Test Admin',
            'email' => 'admin@example.test',
            'password' => 'password123',
            'role' => 'admin',
        ]);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123',
        ])->assertOk()->assertJsonStructure(['token', 'user' => ['id', 'name', 'role']]);
    }

    public function test_api_requires_authentication(): void
    {
        $this->getJson('/api/conventions')->assertUnauthorized();
    }
}
