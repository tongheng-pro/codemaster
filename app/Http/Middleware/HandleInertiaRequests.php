<?php

namespace App\Http\Middleware;

use App\Models\Course;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $locale = app()->getLocale();

        // Load translations for active locale
        $translations = [];
        $translationPath = base_path("lang/{$locale}/app.php");
        if (file_exists($translationPath)) {
            $translations = require $translationPath;
        }

        // Shared navigation courses with translations
        $navCourses = cache()->remember("nav_courses_{$locale}", 300, function () use ($locale) {
            return Course::where('is_published', true)
                ->with(['translations' => function ($query) use ($locale) {
                    $query->whereIn('locale', [$locale, 'en']);
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
                    ];
                });
        });

        $user = $request->user();

        return [
            ...parent::share($request),
            //
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'avatar' => $user->avatar,
                    'locale' => $user->locale,
                    'isAdmin' => $user->isAdmin(),
                ] : null,
            ],
            'locale' => $locale,
            'translations' => $translations,
            'navCourses' => $navCourses,
            'navigation' => Setting::navigation(),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
