<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use App\Models\ExerciseAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExerciseController extends Controller
{
    /**
     * Display list of practice exercises.
     */
    public function index(Request $request): Response
    {
        $locale = app()->getLocale();
        $user = $request->user();

        $exercises = Exercise::where('is_published', true)
            ->with(['translations', 'course.translations'])
            ->orderBy('id')
            ->get()
            ->map(function ($exercise) use ($locale, $user) {
                $hasPassed = false;
                if ($user) {
                    $hasPassed = ExerciseAttempt::where('user_id', $user->id)
                        ->where('exercise_id', $exercise->id)
                        ->where('passed', true)
                        ->exists();
                }

                return [
                    'id' => $exercise->id,
                    'slug' => $exercise->slug,
                    'language' => $exercise->language,
                    'difficulty' => $exercise->difficulty,
                    'points' => $exercise->points,
                    'title' => $exercise->getTranslated('title', $locale),
                    'course_slug' => $exercise->course ? $exercise->course->slug : null,
                    'course_title' => $exercise->course ? $exercise->course->getTranslated('title', $locale) : null,
                    'has_passed' => $hasPassed,
                ];
            });

        return Inertia::render('Exercises/Index', [
            'exercises' => $exercises,
        ]);
    }

    /**
     * Show dedicated exercise solver workspace.
     */
    public function show(Request $request, string $slug): Response
    {
        $locale = app()->getLocale();
        $user = $request->user();

        $exercise = Exercise::where('slug', $slug)
            ->where('is_published', true)
            ->with([
                'translations',
                'course.translations',
                'testCases' => fn ($q) => $q->orderBy('order'),
            ])
            ->firstOrFail();

        $userAttempt = null;
        if ($user) {
            $latest = ExerciseAttempt::where('user_id', $user->id)
                ->where('exercise_id', $exercise->id)
                ->latest()
                ->first();

            if ($latest) {
                $userAttempt = [
                    'passed' => $latest->passed,
                    'submitted_code' => $latest->submitted_code,
                    'score' => $latest->score,
                ];
            }
        }

        return Inertia::render('Exercises/Show', [
            'exercise' => [
                'id' => $exercise->id,
                'slug' => $exercise->slug,
                'language' => $exercise->language,
                'initial_code' => $exercise->initial_code,
                'solution_code' => $exercise->solution_code,
                'difficulty' => $exercise->difficulty,
                'points' => $exercise->points,
                'title' => $exercise->getTranslated('title', $locale),
                'instructions' => $exercise->getTranslated('instructions', $locale),
                'hint' => $exercise->getTranslated('hint', $locale),
                'course' => [
                    'slug' => $exercise->course->slug,
                    'title' => $exercise->course->getTranslated('title', $locale),
                ],
                'test_cases' => $exercise->testCases->map(function ($tc) {
                    return [
                        'id' => $tc->id,
                        'assertion_type' => $tc->assertion_type,
                        'selector' => $tc->selector,
                        'expected_value' => $tc->expected_value,
                        'description' => $tc->description,
                        'is_hidden' => $tc->is_hidden,
                    ];
                }),
                'user_attempt' => $userAttempt,
            ],
        ]);
    }

    /**
     * Record an exercise attempt from the test runner.
     */
    public function attempt(Request $request, Exercise $exercise): JsonResponse
    {
        $validated = $request->validate([
            'submitted_code' => ['required', 'string'],
            'passed' => ['required', 'boolean'],
        ]);

        $user = $request->user();

        if ($user) {
            ExerciseAttempt::create([
                'user_id' => $user->id,
                'exercise_id' => $exercise->id,
                'submitted_code' => $validated['submitted_code'],
                'passed' => $validated['passed'],
                'score' => $validated['passed'] ? $exercise->points : 0,
            ]);
        }

        return response()->json([
            'success' => true,
            'passed' => $validated['passed'],
            'points' => $validated['passed'] ? $exercise->points : 0,
        ]);
    }
}
