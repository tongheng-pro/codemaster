<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Supported locales in the application.
     */
    public const SUPPORTED_LOCALES = ['en', 'km'];

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = 'en';

        if ($request->user() && in_array($request->user()->locale, self::SUPPORTED_LOCALES, true)) {
            $locale = $request->user()->locale;
        } elseif ($request->session()->has('locale') && in_array($request->session()->get('locale'), self::SUPPORTED_LOCALES, true)) {
            $locale = $request->session()->get('locale');
        } elseif ($request->cookie('locale') && in_array($request->cookie('locale'), self::SUPPORTED_LOCALES, true)) {
            $locale = $request->cookie('locale');
        }

        app()->setLocale($locale);

        return $next($request);
    }
}
