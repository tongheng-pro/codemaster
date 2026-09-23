<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Inertia\Inertia;
use Inertia\Response;

class AdminCertificateController extends Controller
{
    public function index(): Response
    {
        $certificates = Certificate::with(['user', 'course.translations'])
            ->latest('issued_at')
            ->paginate(20)
            ->through(fn ($c) => [
                'id' => $c->id,
                'uuid' => $c->uuid,
                'certificate_code' => $c->certificate_code,
                'student_name' => $c->user ? $c->user->name : 'Unknown User',
                'student_email' => $c->user ? $c->user->email : '',
                'course_title' => $c->course ? $c->course->getTranslated('title', 'en') : 'Unknown Course',
                'issued_at' => $c->issued_at->format('M d, Y H:i'),
            ]);

        return Inertia::render('Admin/Certificates/Index', [
            'certificates' => $certificates,
        ]);
    }
}
