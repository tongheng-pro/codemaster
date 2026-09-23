<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Exercise;
use App\Models\ExerciseTestCase;
use App\Models\ExerciseTranslation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminExerciseController extends Controller
{
    public function index(): Response
    {
        $exercises = Exercise::with(['translations', 'course.translations'])
            ->withCount('testCases')
            ->get()
            ->map(function ($e) {
                return [
                    'id' => $e->id,
                    'slug' => $e->slug,
                    'language' => $e->language,
                    'difficulty' => $e->difficulty,
                    'points' => $e->points,
                    'course_title' => $e->course ? $e->course->getTranslated('title', 'en') : '',
                    'en_title' => $e->getTranslated('title', 'en'),
                    'test_cases_count' => $e->test_cases_count,
                ];
            });

        return Inertia::render('Admin/Exercises/Index', [
            'exercises' => $exercises,
        ]);
    }

    public function create(): Response
    {
        $courses = Course::with('translations')->get()->map(fn ($c) => [
            'id' => $c->id,
            'title' => $c->getTranslated('title', 'en'),
        ]);

        return Inertia::render('Admin/Exercises/Create', [
            'courses' => $courses,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'slug' => ['required', 'string'],
            'language' => ['required', 'string'],
            'difficulty' => ['required', 'string'],
            'points' => ['required', 'integer'],
            'initial_code' => ['required', 'string'],
            'solution_code' => ['required', 'string'],
            'en_title' => ['required', 'string'],
            'en_instructions' => ['required', 'string'],
            'en_hint' => ['nullable', 'string'],
            'km_title' => ['nullable', 'string'],
            'km_instructions' => ['nullable', 'string'],
            'km_hint' => ['nullable', 'string'],
            'test_cases' => ['nullable', 'array'],
        ]);

        $exercise = Exercise::create([
            'course_id' => $validated['course_id'],
            'slug' => $validated['slug'],
            'language' => $validated['language'],
            'difficulty' => $validated['difficulty'],
            'points' => $validated['points'],
            'initial_code' => $validated['initial_code'],
            'solution_code' => $validated['solution_code'],
        ]);

        ExerciseTranslation::create([
            'exercise_id' => $exercise->id,
            'locale' => 'en',
            'title' => $validated['en_title'],
            'instructions' => $validated['en_instructions'],
            'hint' => $validated['en_hint'] ?? null,
        ]);

        if (! empty($validated['km_title'])) {
            ExerciseTranslation::create([
                'exercise_id' => $exercise->id,
                'locale' => 'km',
                'title' => $validated['km_title'],
                'instructions' => $validated['km_instructions'] ?? $validated['en_instructions'],
                'hint' => $validated['km_hint'] ?? null,
            ]);
        }

        if (! empty($validated['test_cases'])) {
            foreach ($validated['test_cases'] as $index => $tc) {
                ExerciseTestCase::create([
                    'exercise_id' => $exercise->id,
                    'assertion_type' => $tc['assertion_type'] ?? 'dom_element_exists',
                    'selector' => $tc['selector'] ?? null,
                    'expected_value' => $tc['expected_value'] ?? null,
                    'description' => $tc['description'] ?? 'Test Case '.($index + 1),
                    'order' => $index,
                ]);
            }
        }

        return redirect()->route('admin.exercises.index')->with('success', 'Exercise created successfully.');
    }

    public function destroy(Exercise $exercise): RedirectResponse
    {
        $exercise->delete();

        return redirect()->route('admin.exercises.index')->with('success', 'Exercise deleted.');
    }
}
