<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NavigationSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_navbar_uses_defaults_before_anything_is_saved(): void
    {
        $this->get('/books')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('navigation.courses', false)
                ->where('navigation.books', true));
    }

    public function test_admin_can_enable_and_disable_navbar_items(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->put('/admin/settings/navigation', ['navigation' => [
                'courses' => true,
                'books' => true,
                'exercises' => false,
                'quizzes' => true,
                'playground' => false,
            ]])
            ->assertRedirect();

        $this->get('/books')->assertInertia(fn ($page) => $page
            ->where('navigation.courses', true)
            ->where('navigation.exercises', false)
            ->where('navigation.playground', false));
    }

    public function test_students_cannot_change_navigation(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)
            ->put('/admin/settings/navigation', ['navigation' => ['courses' => true]])
            ->assertForbidden();
    }

    public function test_admin_can_disable_and_enable_the_sakura_effect(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->get('/books')->assertSee('/sakura/sakura.js', false);

        $this->actingAs($admin)->put('/admin/settings/effects', ['sakura' => false])->assertRedirect();
        $this->get('/books')->assertDontSee('/sakura/sakura.js', false);

        $this->actingAs($admin)->put('/admin/settings/effects', ['sakura' => true])->assertRedirect();
        $this->get('/books')->assertSee('/sakura/sakura.js', false);
    }

    public function test_students_cannot_change_the_sakura_effect(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)->put('/admin/settings/effects', ['sakura' => false])->assertForbidden();
    }
}
