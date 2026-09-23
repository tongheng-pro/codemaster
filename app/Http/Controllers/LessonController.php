<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\UserCourseProgress;
use App\Models\UserLessonProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LessonController extends Controller
{
    /**
     * Display a specific lesson within a course.
     */
    public function show(Request $request, string $courseSlug, string $lessonSlug): Response
    {
        $locale = app()->getLocale();
        $user = $request->user();

        $course = Course::where('slug', $courseSlug)
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

        $lesson = Lesson::where('course_id', $course->id)
            ->where('slug', $lessonSlug)
            ->where('is_published', true)
            ->with(['translations', 'codeExamples.translations'])
            ->firstOrFail();

        // Track user visit
        $isCompleted = false;
        $isBookmarked = false;
        $completedLessonIds = [];

        if ($user) {
            $lessonProgress = UserLessonProgress::firstOrCreate(
                ['user_id' => $user->id, 'lesson_id' => $lesson->id],
                ['status' => 'started', 'last_visited_at' => now()]
            );

            $lessonProgress->update(['last_visited_at' => now()]);
            $isCompleted = ($lessonProgress->status === 'completed');

            $isBookmarked = Bookmark::where('user_id', $user->id)
                ->where('lesson_id', $lesson->id)
                ->exists();

            $completedLessonIds = $user->lessonProgress()
                ->where('status', 'completed')
                ->pluck('lesson_id')
                ->toArray();
        }

        // Ordered lessons array to resolve Previous & Next
        $allLessons = $course->lessons;
        $currentIndex = $allLessons->search(fn ($item) => $item->id === $lesson->id);

        $prevLesson = null;
        if ($currentIndex !== false && $currentIndex > 0) {
            $prev = $allLessons->get($currentIndex - 1);
            $prevLesson = [
                'id' => $prev->id,
                'slug' => $prev->slug,
                'title' => $prev->getTranslated('title', $locale),
            ];
        }

        $nextLesson = null;
        if ($currentIndex !== false && $currentIndex < $allLessons->count() - 1) {
            $nxt = $allLessons->get($currentIndex + 1);
            $nextLesson = [
                'id' => $nxt->id,
                'slug' => $nxt->slug,
                'title' => $nxt->getTranslated('title', $locale),
            ];
        }

        // Extract On-Page Topics from heading blocks
        $contentBlocks = $lesson->getTranslated('content_blocks', $locale, []);
        $onPageTopics = [];
        if (is_array($contentBlocks)) {
            foreach ($contentBlocks as $index => $block) {
                if (isset($block['type']) && $block['type'] === 'heading' && ! empty($block['content'])) {
                    $slugId = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $block['content']));
                    $slugId = trim($slugId, '-') ?: "topic-{$index}";
                    $onPageTopics[] = [
                        'id' => $slugId,
                        'title' => $block['content'],
                    ];
                }
            }
        }

        // Map course navigation structure
        $sidebarSections = $course->sections->map(function ($section) use ($locale, $completedLessonIds) {
            return [
                'id' => $section->id,
                'slug' => $section->slug,
                'title' => $section->getTranslated('title', $locale),
                'lessons' => $section->lessons->map(function ($l) use ($locale, $completedLessonIds) {
                    return [
                        'id' => $l->id,
                        'slug' => $l->slug,
                        'title' => $l->getTranslated('title', $locale),
                        'is_completed' => in_array($l->id, $completedLessonIds, true),
                    ];
                }),
            ];
        });

        $sidebarFlatLessons = $course->lessons->map(function ($l) use ($locale, $completedLessonIds) {
            return [
                'id' => $l->id,
                'slug' => $l->slug,
                'title' => $l->getTranslated('title', $locale),
                'is_completed' => in_array($l->id, $completedLessonIds, true),
            ];
        });

        return Inertia::render('Lessons/Show', [
            'course' => [
                'id' => $course->id,
                'slug' => $course->slug,
                'icon' => $course->icon,
                'color' => $course->color,
                'title' => $course->getTranslated('title', $locale),
                'sections' => $sidebarSections,
                'lessons' => $sidebarFlatLessons,
            ],
            'lesson' => [
                'id' => $lesson->id,
                'slug' => $lesson->slug,
                'order' => $lesson->order,
                'duration_minutes' => $lesson->duration_minutes,
                'title' => $lesson->getTranslated('title', $locale),
                'description' => $lesson->getTranslated('description', $locale),
                'content_blocks' => $contentBlocks,
                'is_completed' => $isCompleted,
                'is_bookmarked' => $isBookmarked,
            ],
            'previousLesson' => $prevLesson,
            'nextLesson' => $nextLesson,
            'onPageTopics' => $onPageTopics,
        ]);
    }

    /**
     * Mark a lesson as completed / toggle completed.
     */
    public function toggleComplete(Request $request, Lesson $lesson): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Unauthenticated.'], 401);
            }

            return redirect()->route('login')->with('error', 'Please log in to track your learning progress.');
        }

        $progress = UserLessonProgress::firstOrCreate(
            ['user_id' => $user->id, 'lesson_id' => $lesson->id],
            ['status' => 'started']
        );

        $newStatus = ($progress->status === 'completed') ? 'started' : 'completed';
        $progress->update(['status' => $newStatus]);

        // Recalculate Course Progress
        $course = $lesson->course;
        $totalLessons = $course->lessons()->where('is_published', true)->count();
        $completedLessons = UserLessonProgress::where('user_id', $user->id)
            ->whereIn('lesson_id', $course->lessons()->pluck('id'))
            ->where('status', 'completed')
            ->count();

        $percentage = $totalLessons > 0 ? (int) round(($completedLessons / $totalLessons) * 100) : 0;

        $courseProgress = UserCourseProgress::updateOrCreate(
            ['user_id' => $user->id, 'course_id' => $course->id],
            [
                'completed_lessons_count' => $completedLessons,
                'total_lessons_count' => $totalLessons,
                'percentage' => $percentage,
                'completed_at' => ($percentage === 100) ? now() : null,
            ]
        );

        // Auto-generate certificate if course completed 100%
        if ($percentage === 100) {
            Certificate::firstOrCreate([
                'user_id' => $user->id,
                'course_id' => $course->id,
            ]);
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'status' => $newStatus,
                'course_percentage' => $percentage,
            ]);
        }

        return back()->with('success', $newStatus === 'completed' ? 'Lesson marked as completed!' : 'Lesson marked as in progress.');
    }

    /**
     * Toggle bookmark for a lesson.
     */
    public function toggleBookmark(Request $request, Lesson $lesson): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Unauthenticated.'], 401);
            }

            return redirect()->route('login')->with('error', 'Please log in to save bookmarks.');
        }

        $bookmark = Bookmark::where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            if ($request->wantsJson()) {
                return response()->json(['success' => true, 'bookmarked' => false]);
            }

            return back()->with('success', 'Bookmark removed.');
        }

        Bookmark::create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'bookmarked' => true]);
        }

        return back()->with('success', 'Lesson bookmarked!');
    }
}
