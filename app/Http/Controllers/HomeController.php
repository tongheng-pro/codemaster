<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Exercise;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the platform homepage.
     */
    public function index(Request $request): Response
    {
        $locale = app()->getLocale();

        // Popular courses with translations and lesson count
        $popularCourses = Course::where('is_published', true)
            ->with(['translations' => function ($query) use ($locale) {
                $query->whereIn('locale', [$locale, 'en']);
            }])
            ->withCount(['lessons' => function ($query) {
                $query->where('is_published', true);
            }])
            ->orderBy('order')
            ->take(8)
            ->get()
            ->map(function ($course) use ($locale) {
                return [
                    'id' => $course->id,
                    'slug' => $course->slug,
                    'icon' => $course->icon,
                    'color' => $course->color,
                    'title' => $course->getTranslated('title', $locale),
                    'description' => $course->getTranslated('description', $locale),
                    'lessons_count' => $course->lessons_count,
                ];
            });

        // Platform stats
        $stats = [
            'total_students' => User::count(),
            'total_courses' => Course::where('is_published', true)->count(),
            'total_lessons' => Lesson::where('is_published', true)->count(),
            'total_exercises' => Exercise::where('is_published', true)->count(),
            'total_quizzes' => Quiz::where('is_published', true)->count(),
        ];

        return Inertia::render('Home', [
            'popularCourses' => $popularCourses,
            'stats' => $stats,
        ]);
    }
}
