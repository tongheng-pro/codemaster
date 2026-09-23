import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { Search as SearchIcon, BookOpen, FileText, Terminal, HelpCircle, ArrowRight } from 'lucide-react';

interface Props {
    query?: string;
    results: {
        courses: Array<{ id: number; slug: string; title: string; description?: string; url: string }>;
        lessons: Array<{ id: number; title: string; description?: string; course_title: string; url: string }>;
        exercises: Array<{ id: number; title: string; language: string; course_title: string; url: string }>;
        quizzes: Array<{ id: number; title: string; course_title: string; url: string }>;
    };
}

export default function Search({ query = '', results }: Props) {
    const { t } = useTranslation();
    const [searchVal, setSearchVal] = useState(query);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.get('/search', { q: searchVal }, { preserveState: true });
    }

    const hasAnyResults =
        results.courses.length > 0 ||
        results.lessons.length > 0 ||
        results.exercises.length > 0 ||
        results.quizzes.length > 0;

    return (
        <AppLayout title={t('search.title')}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
                {/* Search Header Form */}
                <div className="text-center space-y-4 max-w-xl mx-auto">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {t('search.title')}
                    </h1>
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <div className="relative flex-1">
                            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchVal}
                                onChange={(e) => setSearchVal(e.target.value)}
                                placeholder={t('search.placeholder')}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
                        >
                            {t('nav.search_btn')}
                        </button>
                    </form>
                </div>

                {query && (
                    <div className="text-xs font-semibold text-slate-400">
                        {t('search.results_for', { query })}
                    </div>
                )}

                {query && !hasAnyResults && (
                    <div className="p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-sm text-slate-500">
                        {t('search.no_results')}
                    </div>
                )}

                {/* 1. Courses Results */}
                {results.courses.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{t('search.courses_category')}</span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {results.courses.map((c) => (
                                <Link
                                    key={c.id}
                                    href={c.url}
                                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 transition-colors shadow-xs group"
                                >
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                        {c.title}
                                    </h3>
                                    {c.description && (
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                            {c.description}
                                        </p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Lessons Results */}
                {results.lessons.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{t('search.lessons_category')}</span>
                        </h2>
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
                            {results.lessons.map((l) => (
                                <Link
                                    key={l.id}
                                    href={l.url}
                                    className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                                >
                                    <div>
                                        <div className="text-xs font-mono font-medium text-emerald-600">
                                            {l.course_title}
                                        </div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                            {l.title}
                                        </div>
                                        {l.description && (
                                            <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                                                {l.description}
                                            </div>
                                        )}
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Exercises Results */}
                {results.exercises.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5" />
                            <span>{t('search.exercises_category')}</span>
                        </h2>
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
                            {results.exercises.map((e) => (
                                <Link
                                    key={e.id}
                                    href={e.url}
                                    className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-[10px] uppercase font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                                                {e.language}
                                            </span>
                                            <span className="text-xs text-slate-400">{e.course_title}</span>
                                        </div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mt-0.5">
                                            {e.title}
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. Quizzes Results */}
                {results.quizzes.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>{t('search.quizzes_category')}</span>
                        </h2>
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
                            {results.quizzes.map((q) => (
                                <Link
                                    key={q.id}
                                    href={q.url}
                                    className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                                >
                                    <div>
                                        <div className="text-xs text-slate-400">{q.course_title}</div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                                            {q.title}
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

