<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\QuizAnswerTranslation;
use App\Models\QuizQuestion;
use App\Models\QuizQuestionTranslation;
use App\Models\QuizTranslation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminQuizController extends Controller
{
    public function index(): Response
    {
        $quizzes = Quiz::with(['translations', 'course.translations'])
            ->withCount('questions')
            ->get()
            ->map(function ($q) {
                return [
                    'id' => $q->id,
                    'slug' => $q->slug,
                    'pass_percentage' => $q->pass_percentage,
                    'course_title' => $q->course ? $q->course->getTranslated('title', 'en') : '',
                    'en_title' => $q->getTranslated('title', 'en'),
                    'questions_count' => $q->questions_count,
                ];
            });

        return Inertia::render('Admin/Quizzes/Index', [
            'quizzes' => $quizzes,
        ]);
    }

    public function create(): Response
    {
        $courses = Course::with('translations')->get()->map(fn ($c) => [
            'id' => $c->id,
            'title' => $c->getTranslated('title', 'en'),
        ]);

        return Inertia::render('Admin/Quizzes/Create', [
            'courses' => $courses,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'slug' => ['required', 'string'],
            'pass_percentage' => ['required', 'integer'],
            'en_title' => ['required', 'string'],
            'en_description' => ['nullable', 'string'],
            'km_title' => ['nullable', 'string'],
            'km_description' => ['nullable', 'string'],
            'questions' => ['nullable', 'array'],
        ]);

        $quiz = Quiz::create([
            'course_id' => $validated['course_id'],
            'slug' => $validated['slug'],
            'pass_percentage' => $validated['pass_percentage'],
        ]);

        QuizTranslation::create([
            'quiz_id' => $quiz->id,
            'locale' => 'en',
            'title' => $validated['en_title'],
            'description' => $validated['en_description'] ?? null,
        ]);

        if (! empty($validated['km_title'])) {
            QuizTranslation::create([
                'quiz_id' => $quiz->id,
                'locale' => 'km',
                'title' => $validated['km_title'],
                'description' => $validated['km_description'] ?? null,
            ]);
        }

        if (! empty($validated['questions'])) {
            foreach ($validated['questions'] as $qIndex => $qData) {
                $question = QuizQuestion::create([
                    'quiz_id' => $quiz->id,
                    'question_type' => $qData['question_type'] ?? 'multiple_choice',
                    'code_snippet' => $qData['code_snippet'] ?? null,
                    'order' => $qIndex,
                ]);

                QuizQuestionTranslation::create([
                    'quiz_question_id' => $question->id,
                    'locale' => 'en',
                    'question_text' => $qData['en_question_text'],
                    'explanation' => $qData['en_explanation'] ?? null,
                ]);

                if (! empty($qData['km_question_text'])) {
                    QuizQuestionTranslation::create([
                        'quiz_question_id' => $question->id,
                        'locale' => 'km',
                        'question_text' => $qData['km_question_text'],
                        'explanation' => $qData['km_explanation'] ?? null,
                    ]);
                }

                if (! empty($qData['answers'])) {
                    foreach ($qData['answers'] as $aIndex => $aData) {
                        $answer = QuizAnswer::create([
                            'quiz_question_id' => $question->id,
                            'is_correct' => (bool) ($aData['is_correct'] ?? false),
                            'order' => $aIndex,
                        ]);

                        QuizAnswerTranslation::create([
                            'quiz_answer_id' => $answer->id,
                            'locale' => 'en',
                            'answer_text' => $aData['en_answer_text'],
                        ]);

                        if (! empty($aData['km_answer_text'])) {
                            QuizAnswerTranslation::create([
                                'quiz_answer_id' => $answer->id,
                                'locale' => 'km',
                                'answer_text' => $aData['km_answer_text'],
                            ]);
                        }
                    }
                }
            }
        }

        return redirect()->route('admin.quizzes.index')->with('success', 'Quiz created successfully.');
    }

    public function destroy(Quiz $quiz): RedirectResponse
    {
        $quiz->delete();

        return redirect()->route('admin.quizzes.index')->with('success', 'Quiz deleted.');
    }
}
