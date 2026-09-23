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
            'sakuraEnabled' => Setting::isSakuraEnabled(),
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

    /**
     * Turn the Sakura Breeze mouse effect on or off for the whole site.
     */
    public function updateEffects(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'sakura' => ['required', 'boolean'],
        ]);

        Setting::set('sakura_enabled', (bool) $validated['sakura']);

        return back()->with('success', $validated['sakura'] ? 'Sakura effect enabled.' : 'Sakura effect disabled.');
    }
}
