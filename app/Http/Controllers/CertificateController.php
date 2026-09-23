<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    /**
     * List user certificates.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $locale = app()->getLocale();

        $certificates = Certificate::where('user_id', $user->id)
            ->with(['course.translations'])
            ->latest()
            ->get()
            ->map(function ($c) use ($locale) {
                return [
                    'id' => $c->id,
                    'uuid' => $c->uuid,
                    'certificate_code' => $c->certificate_code,
                    'course_slug' => $c->course->slug,
                    'course_title' => $c->course->getTranslated('title', $locale),
                    'issued_at' => $c->issued_at->format('F d, Y'),
                ];
            });

        return Inertia::render('Certificates/Index', [
            'certificates' => $certificates,
        ]);
    }

    /**
     * View public certificate.
     */
    public function show(string $uuid): Response
    {
        $locale = app()->getLocale();

        $certificate = Certificate::where('uuid', $uuid)
            ->with(['user', 'course.translations'])
            ->firstOrFail();

        return Inertia::render('Certificates/Show', [
            'certificate' => [
                'uuid' => $certificate->uuid,
                'certificate_code' => $certificate->certificate_code,
                'student_name' => $certificate->user->name,
                'course_title' => $certificate->course->getTranslated('title', $locale),
                'course_slug' => $certificate->course->slug,
                'issued_at' => $certificate->issued_at->format('F d, Y'),
            ],
        ]);
    }
}
