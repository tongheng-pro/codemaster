<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Exercise;
use App\Models\ExerciseAttempt;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    /**
     * Show admin dashboard overview.
     */
    public function index(): Response
    {
        $stats = [
            'total_users' => User::count(),
            'total_students' => User::where('role', 'student')->count(),
            'total_courses' => Course::count(),
            'total_lessons' => Lesson::count(),
            'total_exercises' => Exercise::count(),
            'total_quizzes' => Quiz::count(),
            'total_exercise_attempts' => ExerciseAttempt::count(),
            'total_quiz_attempts' => QuizAttempt::count(),
            'total_certificates' => Certificate::count(),
        ];

        $recentUsers = User::latest()->take(5)->get();
        $recentCourses = Course::with('translations')->latest()->take(5)->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            'recentCourses' => $recentCourses,
        ]);
    }
}
