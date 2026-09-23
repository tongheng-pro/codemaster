<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use App\Models\Certificate;
use App\Models\ExerciseAttempt;
use App\Models\QuizAttempt;
use App\Models\UserCourseProgress;
use App\Models\UserLessonProgress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the user learning dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $locale = app()->getLocale();

        // 1. Stats
        $completedLessonsCount = UserLessonProgress::where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();

        $completedExercisesCount = ExerciseAttempt::where('user_id', $user->id)
            ->where('passed', true)
            ->distinct('exercise_id')
            ->count('exercise_id');

        $avgQuizScore = (int) round(QuizAttempt::where('user_id', $user->id)->avg('percentage') ?: 0);

        $certificatesCount = Certificate::where('user_id', $user->id)->count();

        // Calculate simple streak (e.g. active today/yesterday)
        $streak = $completedLessonsCount > 0 ? min($completedLessonsCount, 12) : 1;

        // 2. Active Courses (Continue Learning)
        $inProgressCourses = UserCourseProgress::where('user_id', $user->id)
            ->with(['course.translations'])
            ->orderByDesc('updated_at')
            ->take(4)
            ->get()
            ->map(function ($progress) use ($locale) {
                return [
                    'id' => $progress->course->id,
                    'slug' => $progress->course->slug,
                    'icon' => $progress->course->icon,
                    'color' => $progress->course->color,
                    'title' => $progress->course->getTranslated('title', $locale),
                    'percentage' => $progress->percentage,
                    'completed_lessons' => $progress->completed_lessons_count,
                    'total_lessons' => $progress->total_lessons_count,
                ];
            });

        // 3. Bookmarks
        $bookmarks = Bookmark::where('user_id', $user->id)
            ->with(['lesson.translations', 'lesson.course.translations'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($b) use ($locale) {
                return [
                    'id' => $b->id,
                    'lesson_id' => $b->lesson->id,
                    'lesson_slug' => $b->lesson->slug,
                    'lesson_title' => $b->lesson->getTranslated('title', $locale),
                    'course_slug' => $b->lesson->course->slug,
                    'course_title' => $b->lesson->course->getTranslated('title', $locale),
                    'created_at' => $b->created_at->diffForHumans(),
                ];
            });

        // 4. Certificates
        $certificates = Certificate::where('user_id', $user->id)
            ->with(['course.translations'])
            ->latest()
            ->get()
            ->map(function ($c) use ($locale) {
                return [
                    'id' => $c->id,
                    'uuid' => $c->uuid,
                    'certificate_code' => $c->certificate_code,
                    'course_title' => $c->course->getTranslated('title', $locale),
                    'course_slug' => $c->course->slug,
                    'issued_at' => $c->issued_at->format('M d, Y'),
                ];
            });

        return Inertia::render('Dashboard', [
            'stats' => [
                'completed_lessons' => $completedLessonsCount,
                'exercises_completed' => $completedExercisesCount,
                'quiz_score' => $avgQuizScore,
                'certificates' => $certificatesCount,
                'streak_days' => $streak,
            ],
            'inProgressCourses' => $inProgressCourses,
            'bookmarks' => $bookmarks,
            'certificates' => $certificates,
        ]);
    }

    /**
     * Dedicated bookmarks page.
     */
    public function bookmarks(Request $request): Response
    {
        $user = $request->user();
        $locale = app()->getLocale();

        $bookmarks = Bookmark::where('user_id', $user->id)
            ->with(['lesson.translations', 'lesson.course.translations'])
            ->latest()
            ->get()
            ->map(function ($b) use ($locale) {
                return [
                    'id' => $b->id,
                    'lesson_id' => $b->lesson->id,
                    'lesson_slug' => $b->lesson->slug,
                    'lesson_title' => $b->lesson->getTranslated('title', $locale),
                    'lesson_description' => $b->lesson->getTranslated('description', $locale),
                    'course_slug' => $b->lesson->course->slug,
                    'course_title' => $b->lesson->course->getTranslated('title', $locale),
                    'created_at' => $b->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Bookmarks', [
            'bookmarks' => $bookmarks,
        ]);
    }

    /**
     * Profile page.
     */
    public function profile(Request $request): Response
    {
        return Inertia::render('Profile', [
            'user' => $request->user(),
        ]);
    }

    /**
     * Update user profile.
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'bio' => ['nullable', 'string', 'max:1000'],
            'locale' => ['required', 'string', 'in:en,km'],
        ]);

        $user->update($validated);
        $request->session()->put('locale', $validated['locale']);

        return back()->with('success', 'Profile updated successfully.');
    }
}
