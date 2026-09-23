import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { Quiz, QuizQuestion } from '@/Types';
import {
    HelpCircle,
    CheckCircle2,
    XCircle,
    ArrowRight,
    RotateCcw,
    Award,
    BookOpen,
} from 'lucide-react';
import { cn } from '@/Utils';

interface Props {
    quiz: Quiz & {
        questions: QuizQuestion[];
    };
}

interface ReviewItem {
    question_id: number;
    question_text: string;
    code_snippet?: string | null;
    user_answer_id: number | null;
    correct_answer_id: number | null;
    is_correct: boolean;
    explanation?: string | null;
}

export default function Show({ quiz }: Props) {
    const { t } = useTranslation();
    const questions = quiz.questions || [];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [result, setResult] = useState<{
        score: number;
        total_questions: number;
        percentage: number;
        passed: boolean;
        review: ReviewItem[];
    } | null>(null);

    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;

    function handleSelectAnswer(questionId: number, answerId: number) {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: answerId,
        }));
    }

    async function handleSubmit() {
        setIsSubmitting(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

            const res = await fetch(`/quizzes/${quiz.id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ answers: selectedAnswers }),
            });

            const data = await res.json();
            setResult(data);
            setIsFinished(true);
        } catch (e) {
            console.error('Quiz submission error:', e);
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleRestart() {
        setSelectedAnswers({});
        setCurrentIndex(0);
        setIsFinished(false);
        setResult(null);
    }

    const progressPercentage = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

    return (
        <AppLayout title={`${quiz.title} - ${t('quizzes.title')}`}>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {!isFinished ? (
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xl space-y-8">
                        {/* Header & Progress Bar */}
                        <div>
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                    {t('quizzes.question_progress', { current: currentIndex + 1, total: totalQuestions })}
                                </span>
                                <span>{progressPercentage}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Question Content */}
                        {currentQuestion && (
                            <div className="space-y-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug font-sans">
                                    {currentQuestion.question_text}
                                </h2>

                                {currentQuestion.code_snippet && (
                                    <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs sm:text-sm font-mono overflow-x-auto border border-slate-800">
                                        <code>{currentQuestion.code_snippet}</code>
                                    </pre>
                                )}

                                {/* Answer Choices */}
                                <div className="space-y-3 pt-2">
                                    {currentQuestion.answers?.map((ans) => {
                                        const isSelected = selectedAnswers[currentQuestion.id] === ans.id;
                                        return (
                                            <button
                                                key={ans.id}
                                                type="button"
                                                onClick={() => handleSelectAnswer(currentQuestion.id, ans.id)}
                                                className={cn(
                                                    'w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center gap-3',
                                                    isSelected
                                                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 shadow-xs ring-2 ring-emerald-500/20'
                                                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                                                        isSelected
                                                            ? 'border-emerald-600 bg-emerald-600 text-white'
                                                            : 'border-slate-300 dark:border-slate-600'
                                                    )}
                                                >
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <span className="leading-snug">{ans.answer_text}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Stepper Buttons */}
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                                disabled={currentIndex === 0}
                                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                {t('common.previous')}
                            </button>

                            {currentIndex < totalQuestions - 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setCurrentIndex((idx) => idx + 1)}
                                    disabled={!selectedAnswers[currentQuestion?.id || 0]}
                                    className="px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-emerald-500/20 flex items-center gap-1.5"
                                >
                                    <span>{t('common.next')}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !selectedAnswers[currentQuestion?.id || 0]}
                                    className="px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-emerald-500/20"
                                >
                                    {isSubmitting ? t('common.loading') : t('common.submit')}
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Completion / Results Screen */
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xl space-y-8 animate-in fade-in-50 zoom-in-95">
                        <div className="text-center space-y-3">
                            <div
                                className={cn(
                                    'w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-white shadow-lg',
                                    result?.passed
                                        ? 'bg-emerald-500 shadow-emerald-500/30'
                                        : 'bg-amber-500 shadow-amber-500/30'
                                )}
                            >
                                {result?.passed ? <Award className="w-8 h-8" /> : <HelpCircle className="w-8 h-8" />}
                            </div>

                            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                {t('quizzes.quiz_complete')}
                            </h2>

                            <div className="flex items-center justify-center gap-2 text-2xl font-black font-mono">
                                <span className={result?.passed ? 'text-emerald-600' : 'text-amber-600'}>
                                    {result?.score} / {result?.total_questions}
                                </span>
                                <span className="text-slate-400">({result?.percentage}%)</span>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                                {result?.passed
                                    ? t('quizzes.passed_message')
                                    : t('quizzes.failed_message')}
                            </p>
                        </div>

                        {/* Answers Review */}
                        {result && result.review && (
                            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                                    {t('quizzes.review_answers')}
                                </h3>

                                <div className="space-y-3">
                                    {result.review.map((item, i) => (
                                        <div
                                            key={item.question_id}
                                            className={cn(
                                                'p-4 rounded-xl border text-xs space-y-2',
                                                item.is_correct
                                                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                                                    : 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {i + 1}. {item.question_text}
                                                </span>
                                                {item.is_correct ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                                )}
                                            </div>

                                            {item.explanation && (
                                                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                                                    <span className="font-bold text-slate-500">{t('quizzes.explanation')}: </span>
                                                    {item.explanation}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Next Actions */}
                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={handleRestart}
                                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>{t('quizzes.try_again')}</span>
                            </button>

                            {quiz.course && (
                                <Link
                                    href={`/${quiz.course.slug}`}
                                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-500/20"
                                >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>{t('common.continue_learning')}</span>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

