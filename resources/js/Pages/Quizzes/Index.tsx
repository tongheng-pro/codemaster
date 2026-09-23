import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { Quiz } from '@/Types';
import { HelpCircle, CheckCircle2, ArrowRight, Award } from 'lucide-react';

interface Props {
    quizzes: Quiz[];
}

export default function Index({ quizzes = [] }: Props) {
    const { t } = useTranslation();

    return (
        <AppLayout title={t('quizzes.title')}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mb-2">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Assessment</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {t('quizzes.title')}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {t('quizzes.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => (
                        <Link
                            key={quiz.id}
                            href={`/quizzes/${quiz.slug}`}
                            className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500/60 shadow-xs hover:shadow-xl hover:shadow-purple-500/5 transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-mono text-xs uppercase font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
                                        {quiz.questions_count || 0} Questions
                                    </span>
                                    {quiz.user_attempt && quiz.user_attempt.passed && (
                                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>{quiz.user_attempt.percentage}%</span>
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    {quiz.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">
                                    {quiz.description}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
                                <span>Passing: {quiz.pass_percentage}%</span>
                                <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    <span>Take Quiz</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

