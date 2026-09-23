<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonTranslation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminLessonController extends Controller
{
    public function index(): Response
    {
        $lessons = Lesson::with(['course.translations', 'translations'])
            ->orderBy('course_id')
            ->orderBy('order')
            ->get()
            ->map(function ($l) {
                $en = $l->translations->firstWhere('locale', 'en');
                $km = $l->translations->firstWhere('locale', 'km');

                return [
                    'id' => $l->id,
                    'slug' => $l->slug,
                    'order' => $l->order,
                    'duration_minutes' => $l->duration_minutes,
                    'is_published' => $l->is_published,
                    'course_slug' => $l->course ? $l->course->slug : '',
                    'course_title' => $l->course ? $l->course->getTranslated('title', 'en') : '',
                    'en_title' => $en ? $en->title : 'Untitled',
                    'has_km' => ! empty($km && ! empty($km->title)),
                ];
            });

        return Inertia::render('Admin/Lessons/Index', [
            'lessons' => $lessons,
        ]);
    }

    public function create(): Response
    {
        $courses = Course::with('translations')->orderBy('order')->get()->map(fn ($c) => [
            'id' => $c->id,
            'title' => $c->getTranslated('title', 'en')." ({$c->slug})",
        ]);

        return Inertia::render('Admin/Lessons/Create', [
            'courses' => $courses,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'slug' => ['required', 'string'],
            'order' => ['required', 'integer'],
            'duration_minutes' => ['required', 'integer'],
            'is_published' => ['required', 'boolean'],
            'en_title' => ['required', 'string'],
            'en_description' => ['nullable', 'string'],
            'en_content_blocks' => ['nullable', 'array'],
            'km_title' => ['nullable', 'string'],
            'km_description' => ['nullable', 'string'],
            'km_content_blocks' => ['nullable', 'array'],
        ]);

        $lesson = Lesson::create([
            'course_id' => $validated['course_id'],
            'slug' => $validated['slug'],
            'order' => $validated['order'],
            'duration_minutes' => $validated['duration_minutes'],
            'is_published' => $validated['is_published'],
        ]);

        LessonTranslation::create([
            'lesson_id' => $lesson->id,
            'locale' => 'en',
            'title' => $validated['en_title'],
            'description' => $validated['en_description'] ?? null,
            'content_blocks' => $validated['en_content_blocks'] ?? [],
        ]);

        if (! empty($validated['km_title'])) {
            LessonTranslation::create([
                'lesson_id' => $lesson->id,
                'locale' => 'km',
                'title' => $validated['km_title'],
                'description' => $validated['km_description'] ?? null,
                'content_blocks' => $validated['km_content_blocks'] ?? [],
            ]);
        }

        return redirect()->route('admin.lessons.index')->with('success', 'Lesson created successfully.');
    }

    public function edit(Lesson $lesson): Response
    {
        $lesson->load(['translations', 'course.translations']);

        $courses = Course::with('translations')->orderBy('order')->get()->map(fn ($c) => [
            'id' => $c->id,
            'title' => $c->getTranslated('title', 'en')." ({$c->slug})",
        ]);

        $en = $lesson->translations->firstWhere('locale', 'en');
        $km = $lesson->translations->firstWhere('locale', 'km');

        return Inertia::render('Admin/Lessons/Edit', [
            'courses' => $courses,
            'lesson' => [
                'id' => $lesson->id,
                'course_id' => $lesson->course_id,
                'slug' => $lesson->slug,
                'order' => $lesson->order,
                'duration_minutes' => $lesson->duration_minutes,
                'is_published' => $lesson->is_published,
                'en_title' => $en ? $en->title : '',
                'en_description' => $en ? $en->description : '',
                'en_content_blocks' => $en ? $en->content_blocks : [],
                'km_title' => $km ? $km->title : '',
                'km_description' => $km ? $km->description : '',
                'km_content_blocks' => $km ? $km->content_blocks : [],
            ],
        ]);
    }

    public function update(Request $request, Lesson $lesson): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'slug' => ['required', 'string'],
            'order' => ['required', 'integer'],
            'duration_minutes' => ['required', 'integer'],
            'is_published' => ['required', 'boolean'],
            'en_title' => ['required', 'string'],
            'en_description' => ['nullable', 'string'],
            'en_content_blocks' => ['nullable', 'array'],
            'km_title' => ['nullable', 'string'],
            'km_description' => ['nullable', 'string'],
            'km_content_blocks' => ['nullable', 'array'],
        ]);

        $lesson->update([
            'course_id' => $validated['course_id'],
            'slug' => $validated['slug'],
            'order' => $validated['order'],
            'duration_minutes' => $validated['duration_minutes'],
            'is_published' => $validated['is_published'],
        ]);

        LessonTranslation::updateOrCreate(
            ['lesson_id' => $lesson->id, 'locale' => 'en'],
            [
                'title' => $validated['en_title'],
                'description' => $validated['en_description'] ?? null,
                'content_blocks' => $validated['en_content_blocks'] ?? [],
            ]
        );

        if (! empty($validated['km_title'])) {
            LessonTranslation::updateOrCreate(
                ['lesson_id' => $lesson->id, 'locale' => 'km'],
                [
                    'title' => $validated['km_title'],
                    'description' => $validated['km_description'] ?? null,
                    'content_blocks' => $validated['km_content_blocks'] ?? [],
                ]
            );
        }

        return redirect()->route('admin.lessons.index')->with('success', 'Lesson updated successfully.');
    }

    public function destroy(Lesson $lesson): RedirectResponse
    {
        $lesson->delete();

        return redirect()->route('admin.lessons.index')->with('success', 'Lesson deleted.');
    }
}
