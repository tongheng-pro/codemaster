<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    /**
     * Display list of quizzes.
     */
    public function index(Request $request): Response
    {
        $locale = app()->getLocale();
        $user = $request->user();

        $quizzes = Quiz::where('is_published', true)
            ->with(['translations', 'course.translations'])
            ->withCount('questions')
            ->orderBy('id')
            ->get()
            ->map(function ($quiz) use ($locale, $user) {
                $userAttempt = null;
                if ($user) {
                    $attempt = QuizAttempt::where('user_id', $user->id)
                        ->where('quiz_id', $quiz->id)
                        ->latest()
                        ->first();

                    if ($attempt) {
                        $userAttempt = [
                            'score' => $attempt->score,
                            'total_questions' => $attempt->total_questions,
                            'percentage' => $attempt->percentage,
                            'passed' => $attempt->passed,
                        ];
                    }
                }

                return [
                    'id' => $quiz->id,
                    'slug' => $quiz->slug,
                    'pass_percentage' => $quiz->pass_percentage,
                    'title' => $quiz->getTranslated('title', $locale),
                    'description' => $quiz->getTranslated('description', $locale),
                    'questions_count' => $quiz->questions_count,
                    'course_slug' => $quiz->course ? $quiz->course->slug : null,
                    'course_title' => $quiz->course ? $quiz->course->getTranslated('title', $locale) : null,
                    'user_attempt' => $userAttempt,
                ];
            });

        return Inertia::render('Quizzes/Index', [
            'quizzes' => $quizzes,
        ]);
    }

    /**
     * Display interactive quiz runner.
     */
    public function show(Request $request, string $slug): Response
    {
        $locale = app()->getLocale();
        $user = $request->user();

        $quiz = Quiz::where('slug', $slug)
            ->where('is_published', true)
            ->with([
                'translations',
                'course.translations',
                'questions' => fn ($q) => $q->orderBy('order'),
                'questions.translations',
                'questions.answers' => fn ($q) => $q->orderBy('order'),
                'questions.answers.translations',
            ])
            ->firstOrFail();

        $userAttempt = null;
        if ($user) {
            $latest = QuizAttempt::where('user_id', $user->id)
                ->where('quiz_id', $quiz->id)
                ->latest()
                ->first();

            if ($latest) {
                $userAttempt = [
                    'score' => $latest->score,
                    'total_questions' => $latest->total_questions,
                    'percentage' => $latest->percentage,
                    'passed' => $latest->passed,
                ];
            }
        }

        $questions = $quiz->questions->map(function ($question) use ($locale) {
            return [
                'id' => $question->id,
                'question_type' => $question->question_type,
                'code_snippet' => $question->code_snippet,
                'order' => $question->order,
                'question_text' => $question->getTranslated('question_text', $locale),
                'explanation' => $question->getTranslated('explanation', $locale),
                'answers' => $question->answers->map(function ($answer) use ($locale) {
                    return [
                        'id' => $answer->id,
                        'order' => $answer->order,
                        'answer_text' => $answer->getTranslated('answer_text', $locale),
                    ];
                }),
            ];
        });

        return Inertia::render('Quizzes/Show', [
            'quiz' => [
                'id' => $quiz->id,
                'slug' => $quiz->slug,
                'pass_percentage' => $quiz->pass_percentage,
                'title' => $quiz->getTranslated('title', $locale),
                'description' => $quiz->getTranslated('description', $locale),
                'course' => [
                    'slug' => $quiz->course->slug,
                    'title' => $quiz->course->getTranslated('title', $locale),
                ],
                'questions' => $questions,
                'user_attempt' => $userAttempt,
            ],
        ]);
    }

    /**
     * Submit and evaluate quiz answers.
     */
    public function submit(Request $request, Quiz $quiz): JsonResponse
    {
        $validated = $request->validate([
            'answers' => ['required', 'array'], // map of question_id => answer_id or string
        ]);

        $locale = app()->getLocale();
        $user = $request->user();

        $quiz->load(['questions.answers']);
        $totalQuestions = $quiz->questions->count();
        $correctCount = 0;
        $review = [];

        foreach ($quiz->questions as $question) {
            $userSelectedAnswer = $validated['answers'][$question->id] ?? null;
            $correctAnswer = $question->answers->firstWhere('is_correct', true);

            $isCorrect = false;
            if ($correctAnswer && $userSelectedAnswer == $correctAnswer->id) {
                $isCorrect = true;
                $correctCount++;
            }

            $review[] = [
                'question_id' => $question->id,
                'question_text' => $question->getTranslated('question_text', $locale),
                'code_snippet' => $question->code_snippet,
                'user_answer_id' => $userSelectedAnswer,
                'correct_answer_id' => $correctAnswer ? $correctAnswer->id : null,
                'is_correct' => $isCorrect,
                'explanation' => $question->getTranslated('explanation', $locale),
            ];
        }

        $percentage = $totalQuestions > 0 ? (int) round(($correctCount / $totalQuestions) * 100) : 0;
        $passed = ($percentage >= $quiz->pass_percentage);

        if ($user) {
            QuizAttempt::create([
                'user_id' => $user->id,
                'quiz_id' => $quiz->id,
                'score' => $correctCount,
                'total_questions' => $totalQuestions,
                'percentage' => $percentage,
                'passed' => $passed,
                'answers_summary' => $review,
            ]);
        }

        return response()->json([
            'score' => $correctCount,
            'total_questions' => $totalQuestions,
            'percentage' => $percentage,
            'passed' => $passed,
            'pass_percentage' => $quiz->pass_percentage,
            'review' => $review,
        ]);
    }
}
