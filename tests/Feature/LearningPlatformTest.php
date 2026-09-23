<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Exercise;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LearningPlatformTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_home_and_public_catalog_are_accessible(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);

        $response = $this->get('/courses');
        $response->assertStatus(200);

        $response = $this->get('/playground');
        $response->assertStatus(200);

        $response = $this->get('/search?q=HTML');
        $response->assertStatus(200);
    }

    public function test_locale_switch_updates_session_and_cookie(): void
    {
        $response = $this->post('/locale', [
            'locale' => 'km',
        ]);

        $response->assertStatus(302);
        $response->assertSessionHas('locale', 'km');
        $response->assertCookie('locale', 'km');

        // Switch back to en
        $response = $this->post('/locale', [
            'locale' => 'en',
        ]);

        $response->assertStatus(302);
        $response->assertSessionHas('locale', 'en');
        $response->assertCookie('locale', 'en');
    }

    public function test_course_and_lesson_pages_render(): void
    {
        // /html renders the course syllabus overview
        $response = $this->get('/html');
        $response->assertStatus(200);

        // Access specific lesson directly
        $response = $this->get('/html/introduction');
        $response->assertStatus(200);
    }

    public function test_exercise_attempt_evaluation(): void
    {
        $exercise = Exercise::first();
        $this->assertNotNull($exercise, 'Seeded exercise must exist');

        $student = User::where('email', 'student@example.com')->first();
        $this->actingAs($student);

        // Valid attempt recorded
        $response = $this->postJson("/exercises/{$exercise->id}/attempt", [
            'submitted_code' => '<h1>Hello World</h1>',
            'passed' => true,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'passed' => true,
            'points' => $exercise->points,
        ]);
    }

    public function test_quiz_submission_evaluates_score(): void
    {
        $quiz = Quiz::with('questions.answers')->first();
        $this->assertNotNull($quiz, 'Seeded quiz must exist');

        $student = User::where('email', 'student@example.com')->first();
        $this->actingAs($student);

        $answers = [];
        foreach ($quiz->questions as $question) {
            $correctAnswer = $question->answers->firstWhere('is_correct', true);
            if ($correctAnswer) {
                $answers[$question->id] = $correctAnswer->id;
            }
        }

        $response = $this->postJson("/quizzes/{$quiz->id}/submit", [
            'answers' => $answers,
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'score',
            'total_questions',
            'percentage',
            'passed',
            'pass_percentage',
            'review',
        ]);
        $response->assertJsonPath('passed', true);
    }

    public function test_bookmarks_toggle_and_dashboard_require_auth(): void
    {
        $lesson = Lesson::first();
        $this->assertNotNull($lesson);

        // Unauthenticated access
        $response = $this->get('/dashboard');
        $response->assertRedirect('/login');

        $response = $this->get('/bookmarks');
        $response->assertRedirect('/login');

        // Authenticated student
        $student = User::where('email', 'student@example.com')->first();
        $this->actingAs($student);

        $response = $this->get('/dashboard');
        $response->assertStatus(200);

        // Toggle bookmark on lesson
        $toggleResponse = $this->postJson("/lessons/{$lesson->id}/bookmark");
        $toggleResponse->assertStatus(200);
        $toggleResponse->assertJson(['bookmarked' => true]);

        $response = $this->get('/bookmarks');
        $response->assertStatus(200);
    }

    public function test_admin_routes_protected_from_regular_users(): void
    {
        // Guest
        $response = $this->get('/admin/courses');
        $response->assertRedirect('/login');

        // Student
        $student = User::where('email', 'student@example.com')->first();
        $this->actingAs($student);
        $response = $this->get('/admin/courses');
        $response->assertStatus(403);

        // Admin
        $admin = User::where('email', 'admin@example.com')->first();
        $this->actingAs($admin);
        $response = $this->get('/admin/courses');
        $response->assertStatus(200);

        $response = $this->get('/admin/dashboard');
        $response->assertStatus(200);
    }

    public function test_lesson_completion_updates_course_progress(): void
    {
        $student = User::where('email', 'student@example.com')->first();
        $this->actingAs($student);

        $course = Course::where('slug', 'html')->first();
        // Skip first lesson which is already seeded as completed
        $lesson = $course->lessons()->skip(1)->first();

        $response = $this->postJson("/lessons/{$lesson->id}/complete");
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'status' => 'completed',
        ]);

        $this->assertDatabaseHas('user_lesson_progress', [
            'user_id' => $student->id,
            'lesson_id' => $lesson->id,
            'status' => 'completed',
        ]);

        $this->assertDatabaseHas('user_course_progress', [
            'user_id' => $student->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_admin_course_crud_lifecycle(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();
        $this->actingAs($admin);

        // Create course
        $response = $this->post('/admin/courses', [
            'slug' => 'rust',
            'icon' => 'Shield',
            'color' => '#dea584',
            'order' => 10,
            'is_published' => true,
            'en_title' => 'Rust Programming',
            'en_description' => 'Learn memory-safe systems programming.',
            'km_title' => 'ការសរសេរកូដ Rust',
            'km_description' => 'រៀនប្រព័ន្ធភាសា Rust ប្រកបដោយសុវត្ថិភាពខ្ពស់។',
        ]);

        $response->assertRedirect('/admin/courses');
        $this->assertDatabaseHas('courses', ['slug' => 'rust']);
        $this->assertDatabaseHas('course_translations', ['title' => 'Rust Programming', 'locale' => 'en']);
        $this->assertDatabaseHas('course_translations', ['title' => 'ការសរសេរកូដ Rust', 'locale' => 'km']);

        $course = Course::where('slug', 'rust')->first();

        // Update course
        $updateResponse = $this->put("/admin/courses/{$course->id}", [
            'slug' => 'rust-lang',
            'icon' => 'Shield',
            'color' => '#dea584',
            'order' => 12,
            'is_published' => true,
            'en_title' => 'Rust Language Mastery',
            'en_description' => 'Updated description.',
            'km_title' => 'Rust កម្រិតខ្ពស់',
            'km_description' => 'ការពិពណ៌នាថ្មី។',
        ]);

        $updateResponse->assertRedirect('/admin/courses');
        $this->assertDatabaseHas('courses', ['slug' => 'rust-lang']);

        // Delete course
        $deleteResponse = $this->delete("/admin/courses/{$course->id}");
        $deleteResponse->assertRedirect('/admin/courses');
        $this->assertDatabaseMissing('courses', ['id' => $course->id]);
    }

    public function test_admin_user_role_and_status_toggle(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();
        $student = User::where('email', 'student@example.com')->first();
        $this->actingAs($admin);

        // Toggle role
        $this->assertEquals('student', $student->role);
        $response = $this->post("/admin/users/{$student->id}/toggle-role");
        $response->assertStatus(302);
        $student->refresh();
        $this->assertEquals('admin', $student->role);

        // Toggle status
        $this->assertTrue((bool) $student->is_active);
        $response = $this->post("/admin/users/{$student->id}/toggle-status");
        $response->assertStatus(302);
        $student->refresh();
        $this->assertFalse((bool) $student->is_active);
    }
}
