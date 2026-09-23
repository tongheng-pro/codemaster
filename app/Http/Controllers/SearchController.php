<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Exercise;
use App\Models\Lesson;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    /**
     * Search courses, lessons, exercises, and quizzes.
     */
    public function index(Request $request): Response
    {
        $query = trim((string) $request->input('q', ''));
        $locale = app()->getLocale();

        $courseResults = [];
        $lessonResults = [];
        $exerciseResults = [];
        $quizResults = [];

        if (! empty($query)) {
            // 1. Search Courses
            $courseResults = Course::where('is_published', true)
                ->where(function ($q) use ($query) {
                    $q->where('slug', 'like', "%{$query}%")
                        ->orWhereHas('translations', function ($t) use ($query) {
                            $t->where('title', 'like', "%{$query}%")
                                ->orWhere('description', 'like', "%{$query}%");
                        });
                })
                ->with(['translations'])
                ->take(6)
                ->get()
                ->map(fn ($c) => [
                    'id' => $c->id,
                    'slug' => $c->slug,
                    'title' => $c->getTranslated('title', $locale),
                    'description' => $c->getTranslated('description', $locale),
                    'url' => "/{$c->slug}",
                ]);

            // 2. Search Lessons
            $lessonResults = Lesson::where('is_published', true)
                ->where(function ($q) use ($query) {
                    $q->where('slug', 'like', "%{$query}%")
                        ->orWhereHas('translations', function ($t) use ($query) {
                            $t->where('title', 'like', "%{$query}%")
                                ->orWhere('description', 'like', "%{$query}%");
                        });
                })
                ->with(['translations', 'course.translations'])
                ->take(10)
                ->get()
                ->map(fn ($l) => [
                    'id' => $l->id,
                    'title' => $l->getTranslated('title', $locale),
                    'description' => $l->getTranslated('description', $locale),
                    'course_title' => $l->course ? $l->course->getTranslated('title', $locale) : '',
                    'url' => "/{$l->course->slug}/{$l->slug}",
                ]);

            // 3. Search Exercises
            $exerciseResults = Exercise::where('is_published', true)
                ->where(function ($q) use ($query) {
                    $q->where('slug', 'like', "%{$query}%")
                        ->orWhereHas('translations', function ($t) use ($query) {
                            $t->where('title', 'like', "%{$query}%")
                                ->orWhere('instructions', 'like', "%{$query}%");
                        });
                })
                ->with(['translations', 'course.translations'])
                ->take(6)
                ->get()
                ->map(fn ($e) => [
                    'id' => $e->id,
                    'title' => $e->getTranslated('title', $locale),
                    'language' => $e->language,
                    'course_title' => $e->course ? $e->course->getTranslated('title', $locale) : '',
                    'url' => "/exercises/{$e->slug}",
                ]);

            // 4. Search Quizzes
            $quizResults = Quiz::where('is_published', true)
                ->where(function ($q) use ($query) {
                    $q->where('slug', 'like', "%{$query}%")
                        ->orWhereHas('translations', function ($t) use ($query) {
                            $t->where('title', 'like', "%{$query}%")
                                ->orWhere('description', 'like', "%{$query}%");
                        });
                })
                ->with(['translations', 'course.translations'])
                ->take(6)
                ->get()
                ->map(fn ($qz) => [
                    'id' => $qz->id,
                    'title' => $qz->getTranslated('title', $locale),
                    'course_title' => $qz->course ? $qz->course->getTranslated('title', $locale) : '',
                    'url' => "/quizzes/{$qz->slug}",
                ]);
        }

        return Inertia::render('Search', [
            'query' => $query,
            'results' => [
                'courses' => $courseResults,
                'lessons' => $lessonResults,
                'exercises' => $exerciseResults,
                'quizzes' => $quizResults,
            ],
        ]);
    }
}
