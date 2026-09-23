<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingController extends Controller
{
    /**
     * Show site settings, including which navbar items are enabled.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Settings/Index', [
            'navigation' => Setting::navigation(),
        ]);
    }

    /**
     * Enable or disable navbar items.
     */
    public function updateNavigation(Request $request): RedirectResponse
    {
        $rules = [];
        foreach (array_keys(Setting::NAVIGATION_DEFAULTS) as $item) {
            $rules["navigation.{$item}"] = ['required', 'boolean'];
        }

        $validated = $request->validate($rules);

        Setting::set('navigation', array_map('boolval', $validated['navigation']));

        return back()->with('success', 'Navigation updated.');
    }
}
