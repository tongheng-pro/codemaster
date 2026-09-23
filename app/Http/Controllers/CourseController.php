<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\UserCourseProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    /**
     * Display all available courses.
     */
    public function index(Request $request): Response
    {
        $locale = app()->getLocale();
        $user = $request->user();

        $courses = Course::where('is_published', true)
            ->with(['translations' => function ($query) use ($locale) {
                $query->whereIn('locale', [$locale, 'en']);
            }])
            ->withCount(['lessons' => function ($query) {
                $query->where('is_published', true);
            }])
            ->orderBy('order')
            ->get()
            ->map(function ($course) use ($locale, $user) {
                $progress = null;
                if ($user) {
                    $userProgress = UserCourseProgress::where('user_id', $user->id)
                        ->where('course_id', $course->id)
                        ->first();
                    $progress = $userProgress ? $userProgress->percentage : 0;
                }

                return [
                    'id' => $course->id,
                    'slug' => $course->slug,
                    'icon' => $course->icon,
                    'color' => $course->color,
                    'title' => $course->getTranslated('title', $locale),
                    'description' => $course->getTranslated('description', $locale),
                    'lessons_count' => $course->lessons_count,
                    'completed_percentage' => $progress,
                ];
            });

        return Inertia::render('Courses/Index', [
            'courses' => $courses,
        ]);
    }

    /**
     * Display a single course syllabus.
     */
    public function show(Request $request, string $slug): Response
    {
        $locale = app()->getLocale();
        $user = $request->user();

        $course = Course::where('slug', $slug)
            ->where('is_published', true)
            ->with([
                'translations',
                'sections.translations',
                'sections.lessons' => function ($query) {
                    $query->where('is_published', true)->orderBy('order');
                },
                'sections.lessons.translations',
                'lessons' => function ($query) {
                    $query->where('is_published', true)->orderBy('order');
                },
                'lessons.translations',
            ])
            ->firstOrFail();

        // Check completed lessons for current user
        $completedLessonIds = [];
        $coursePercentage = 0;
        if ($user) {
            $completedLessonIds = $user->lessonProgress()
                ->where('status', 'completed')
                ->pluck('lesson_id')
                ->toArray();

            $progress = UserCourseProgress::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();
            if ($progress) {
                $coursePercentage = $progress->percentage;
            }
        }

        // Map course data with translations
        $mappedSections = $course->sections->map(function ($section) use ($locale, $completedLessonIds) {
            return [
                'id' => $section->id,
                'slug' => $section->slug,
                'order' => $section->order,
                'title' => $section->getTranslated('title', $locale),
                'lessons' => $section->lessons->map(function ($lesson) use ($locale, $completedLessonIds) {
                    return [
                        'id' => $lesson->id,
                        'slug' => $lesson->slug,
                        'order' => $lesson->order,
                        'duration_minutes' => $lesson->duration_minutes,
                        'title' => $lesson->getTranslated('title', $locale),
                        'description' => $lesson->getTranslated('description', $locale),
                        'is_completed' => in_array($lesson->id, $completedLessonIds, true),
                    ];
                }),
            ];
        });

        $mappedLessons = $course->lessons->map(function ($lesson) use ($locale, $completedLessonIds) {
            return [
                'id' => $lesson->id,
                'slug' => $lesson->slug,
                'order' => $lesson->order,
                'duration_minutes' => $lesson->duration_minutes,
                'title' => $lesson->getTranslated('title', $locale),
                'description' => $lesson->getTranslated('description', $locale),
                'is_completed' => in_array($lesson->id, $completedLessonIds, true),
            ];
        });

        $firstLesson = $course->lessons->first();

        return Inertia::render('Courses/Show', [
            'course' => [
                'id' => $course->id,
                'slug' => $course->slug,
                'icon' => $course->icon,
                'color' => $course->color,
                'title' => $course->getTranslated('title', $locale),
                'description' => $course->getTranslated('description', $locale),
                'meta_title' => $course->getTranslated('meta_title', $locale),
                'meta_description' => $course->getTranslated('meta_description', $locale),
                'sections' => $mappedSections,
                'lessons' => $mappedLessons,
                'lessons_count' => $course->lessons->count(),
                'completed_percentage' => $coursePercentage,
                'first_lesson_slug' => $firstLesson ? $firstLesson->slug : null,
            ],
        ]);
    }
}
