<?php

namespace App\Http\Controllers;

use App\Http\Middleware\SetLocale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LocaleController extends Controller
{
    /**
     * Switch application locale.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'in:'.implode(',', SetLocale::SUPPORTED_LOCALES)],
        ]);

        $locale = $validated['locale'];

        // Persist in session
        $request->session()->put('locale', $locale);

        // If authenticated, update user profile preference
        if ($user = $request->user()) {
            $user->update(['locale' => $locale]);
        }

        // Return back to current exact page with cookie set
        return back()->withCookie(cookie()->forever('locale', $locale));
    }
}
