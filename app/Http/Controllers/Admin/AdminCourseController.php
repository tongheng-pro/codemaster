<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseTranslation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminCourseController extends Controller
{
    public function index(): Response
    {
        $courses = Course::with(['translations'])
            ->withCount('lessons')
            ->orderBy('order')
            ->get();

        return Inertia::render('Admin/Courses/Index', [
            'courses' => $courses,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Courses/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'slug' => ['required', 'string', 'unique:courses,slug'],
            'icon' => ['nullable', 'string'],
            'color' => ['nullable', 'string'],
            'order' => ['required', 'integer'],
            'is_published' => ['required', 'boolean'],
            'en_title' => ['required', 'string'],
            'en_description' => ['nullable', 'string'],
            'km_title' => ['nullable', 'string'],
            'km_description' => ['nullable', 'string'],
        ]);

        $course = Course::create([
            'slug' => $validated['slug'],
            'icon' => $validated['icon'] ?? 'Code2',
            'color' => $validated['color'] ?? '#10b981',
            'order' => $validated['order'],
            'is_published' => $validated['is_published'],
        ]);

        // English Translation
        CourseTranslation::create([
            'course_id' => $course->id,
            'locale' => 'en',
            'title' => $validated['en_title'],
            'description' => $validated['en_description'] ?? null,
        ]);

        // Khmer Translation (if provided)
        if (! empty($validated['km_title'])) {
            CourseTranslation::create([
                'course_id' => $course->id,
                'locale' => 'km',
                'title' => $validated['km_title'],
                'description' => $validated['km_description'] ?? null,
            ]);
        }

        return redirect()->route('admin.courses.index')->with('success', 'Course created successfully.');
    }

    public function edit(Course $course): Response
    {
        $course->load('translations');

        $enTrans = $course->translations->firstWhere('locale', 'en');
        $kmTrans = $course->translations->firstWhere('locale', 'km');

        return Inertia::render('Admin/Courses/Edit', [
            'course' => [
                'id' => $course->id,
                'slug' => $course->slug,
                'icon' => $course->icon,
                'color' => $course->color,
                'order' => $course->order,
                'is_published' => $course->is_published,
                'en_title' => $enTrans ? $enTrans->title : '',
                'en_description' => $enTrans ? $enTrans->description : '',
                'km_title' => $kmTrans ? $kmTrans->title : '',
                'km_description' => $kmTrans ? $kmTrans->description : '',
            ],
        ]);
    }

    public function update(Request $request, Course $course): RedirectResponse
    {
        $validated = $request->validate([
            'slug' => ['required', 'string', 'unique:courses,slug,'.$course->id],
            'icon' => ['nullable', 'string'],
            'color' => ['nullable', 'string'],
            'order' => ['required', 'integer'],
            'is_published' => ['required', 'boolean'],
            'en_title' => ['required', 'string'],
            'en_description' => ['nullable', 'string'],
            'km_title' => ['nullable', 'string'],
            'km_description' => ['nullable', 'string'],
        ]);

        $course->update([
            'slug' => $validated['slug'],
            'icon' => $validated['icon'] ?? 'Code2',
            'color' => $validated['color'] ?? '#10b981',
            'order' => $validated['order'],
            'is_published' => $validated['is_published'],
        ]);

        // English
        CourseTranslation::updateOrCreate(
            ['course_id' => $course->id, 'locale' => 'en'],
            ['title' => $validated['en_title'], 'description' => $validated['en_description'] ?? null]
        );

        // Khmer
        if (! empty($validated['km_title'])) {
            CourseTranslation::updateOrCreate(
                ['course_id' => $course->id, 'locale' => 'km'],
                ['title' => $validated['km_title'], 'description' => $validated['km_description'] ?? null]
            );
        }

        return redirect()->route('admin.courses.index')->with('success', 'Course updated successfully.');
    }

    public function destroy(Course $course): RedirectResponse
    {
        $course->delete();

        return redirect()->route('admin.courses.index')->with('success', 'Course deleted.');
    }
}
