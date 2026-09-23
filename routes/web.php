<?php

use App\Http\Controllers\Admin\AdminBookController;
use App\Http\Controllers\Admin\AdminCertificateController;
use App\Http\Controllers\Admin\AdminCourseController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminExerciseController;
use App\Http\Controllers\Admin\AdminLessonController;
use App\Http\Controllers\Admin\AdminQuizController;
use App\Http\Controllers\Admin\AdminSettingController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookReaderController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\PlaygroundController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\SearchController;
use App\Http\Middleware\AdminMiddleware;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Bilingual language switcher
Route::post('/locale', [LocaleController::class, 'update'])->name('locale.update');

// Home & Core Hubs
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
Route::get('/playground', [PlaygroundController::class, 'index'])->name('playground');
Route::get('/search', [SearchController::class, 'index'])->name('search');

// Exercises
Route::get('/exercises', [ExerciseController::class, 'index'])->name('exercises.index');
Route::get('/exercises/{slug}', [ExerciseController::class, 'show'])->name('exercises.show');
Route::post('/exercises/{exercise}/attempt', [ExerciseController::class, 'attempt'])->name('exercises.attempt');

// Quizzes
Route::get('/quizzes', [QuizController::class, 'index'])->name('quizzes.index');
Route::get('/quizzes/{slug}', [QuizController::class, 'show'])->name('quizzes.show');
Route::post('/quizzes/{quiz}/submit', [QuizController::class, 'submit'])->name('quizzes.submit');

// Public Certificate Verification
Route::get('/certificates/{uuid}', [CertificateController::class, 'show'])->name('certificates.show');

// Books & Online Book Reader
Route::get('/books', [BookReaderController::class, 'index'])->name('books.index');
Route::get('/books/{book:slug}', [BookReaderController::class, 'show'])->name('books.show');
Route::get('/books/{book:slug}/pdf', [BookReaderController::class, 'pdf'])->name('books.pdf');
Route::get('/books/{book:slug}/search', [BookReaderController::class, 'search'])->name('books.search');
Route::post('/books/{book:slug}/ask', [BookReaderController::class, 'ask'])->name('books.ask');
Route::get('/books/{bookSlug}/{chapterSlug}/{sectionSlug}', [BookReaderController::class, 'read'])->name('books.read');

// SEO Robots & Sitemap
Route::get('/robots.txt', function () {
    return Response::make("User-agent: *\nAllow: /\nSitemap: ".url('/sitemap.xml'), 200, ['Content-Type' => 'text/plain']);
});

Route::get('/sitemap.xml', function () {
    $courses = Course::where('is_published', true)->get();
    $lessons = Lesson::where('is_published', true)->with('course')->get();

    $xml = '<?xml version="1.0" encoding="UTF-8"?>';
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';
    $xml .= '<url><loc>'.url('/').'</loc><changefreq>daily</changefreq><priority>1.0</priority></url>';
    $xml .= '<url><loc>'.url('/courses').'</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>';
    $xml .= '<url><loc>'.url('/playground').'</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>';

    foreach ($courses as $c) {
        $xml .= '<url><loc>'.url("/{$c->slug}").'</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>';
    }

    foreach ($lessons as $l) {
        if ($l->course) {
            $xml .= '<url><loc>'.url("/{$l->course->slug}/{$l->slug}").'</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>';
        }
    }

    $xml .= '</urlset>';

    return Response::make($xml, 200, ['Content-Type' => 'application/xml']);
});

// Guest Authentication Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

// Authenticated Student Routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/bookmarks', [DashboardController::class, 'bookmarks'])->name('bookmarks');
    Route::get('/certificates', [CertificateController::class, 'index'])->name('certificates.index');
    Route::get('/profile', [DashboardController::class, 'profile'])->name('profile');
    Route::post('/profile', [DashboardController::class, 'updateProfile'])->name('profile.update');

    // Lesson Progress & Bookmark Toggle
    Route::post('/lessons/{lesson}/complete', [LessonController::class, 'toggleComplete'])->name('lessons.complete');
    Route::post('/lessons/{lesson}/bookmark', [LessonController::class, 'toggleBookmark'])->name('lessons.bookmark');
});

// Administrator Routes
Route::middleware(['auth', AdminMiddleware::class])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', fn () => redirect()->route('admin.dashboard'));

    // Site Settings
    Route::get('/settings', [AdminSettingController::class, 'index'])->name('settings.index');
    Route::put('/settings/navigation', [AdminSettingController::class, 'updateNavigation'])->name('settings.navigation');
    Route::put('/settings/effects', [AdminSettingController::class, 'updateEffects'])->name('settings.effects');
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Courses CRUD
    Route::get('/courses', [AdminCourseController::class, 'index'])->name('courses.index');
    Route::get('/courses/create', [AdminCourseController::class, 'create'])->name('courses.create');
    Route::post('/courses', [AdminCourseController::class, 'store'])->name('courses.store');
    Route::get('/courses/{course}/edit', [AdminCourseController::class, 'edit'])->name('courses.edit');
    Route::put('/courses/{course}', [AdminCourseController::class, 'update'])->name('courses.update');
    Route::delete('/courses/{course}', [AdminCourseController::class, 'destroy'])->name('courses.destroy');

    // Lessons CRUD
    Route::get('/lessons', [AdminLessonController::class, 'index'])->name('lessons.index');
    Route::get('/lessons/create', [AdminLessonController::class, 'create'])->name('lessons.create');
    Route::post('/lessons', [AdminLessonController::class, 'store'])->name('lessons.store');
    Route::get('/lessons/{lesson}/edit', [AdminLessonController::class, 'edit'])->name('lessons.edit');
    Route::put('/lessons/{lesson}', [AdminLessonController::class, 'update'])->name('lessons.update');
    Route::delete('/lessons/{lesson}', [AdminLessonController::class, 'destroy'])->name('lessons.destroy');

    // Exercises CRUD
    Route::get('/exercises', [AdminExerciseController::class, 'index'])->name('exercises.index');
    Route::get('/exercises/create', [AdminExerciseController::class, 'create'])->name('exercises.create');
    Route::post('/exercises', [AdminExerciseController::class, 'store'])->name('exercises.store');
    Route::delete('/exercises/{exercise}', [AdminExerciseController::class, 'destroy'])->name('exercises.destroy');

    // Quizzes CRUD
    Route::get('/quizzes', [AdminQuizController::class, 'index'])->name('quizzes.index');
    Route::get('/quizzes/create', [AdminQuizController::class, 'create'])->name('quizzes.create');
    Route::post('/quizzes', [AdminQuizController::class, 'store'])->name('quizzes.store');
    Route::delete('/quizzes/{quiz}', [AdminQuizController::class, 'destroy'])->name('quizzes.destroy');

    // Users Administration
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::post('/users/{user}/toggle-role', [AdminUserController::class, 'toggleRole'])->name('users.toggle-role');
    Route::post('/users/{user}/toggle-status', [AdminUserController::class, 'toggleStatus'])->name('users.toggle-status');

    // Issued Certificates
    Route::get('/certificates', [AdminCertificateController::class, 'index'])->name('certificates.index');

    // Books Management & AI Review Workspace
    Route::get('/books', [AdminBookController::class, 'index'])->name('books.index');
    Route::post('/books', [AdminBookController::class, 'store'])->name('books.store');
    Route::get('/books/{book}/status', [AdminBookController::class, 'status'])->name('books.status');
    Route::get('/books/{book}/review', [AdminBookController::class, 'review'])->name('books.review');
    Route::put('/books/{book}/blocks/{block}', [AdminBookController::class, 'updateBlock'])->name('books.update-block');
    Route::post('/books/{book}/sections/{section}/translate', [AdminBookController::class, 'translateSection'])->name('books.translate-section');
    Route::post('/books/{book}/translate', [AdminBookController::class, 'translateBook'])->name('books.translate');
    Route::post('/books/{book}/reprocess', [AdminBookController::class, 'reprocess'])->name('books.reprocess');
    Route::post('/books/{book}/publish', [AdminBookController::class, 'togglePublish'])->name('books.publish');
    Route::post('/books/{book}/cover', [AdminBookController::class, 'updateCover'])->name('books.cover');
    Route::delete('/books/{book}', [AdminBookController::class, 'destroy'])->name('books.destroy');
});

// Dynamic Course Syllabus & Lesson URLs (Catch-all for clean paths like /html and /html/introduction)
Route::get('/{course:slug}', [CourseController::class, 'show'])->name('courses.show');
Route::get('/{courseSlug}/{lessonSlug}', [LessonController::class, 'show'])->name('lessons.show');
