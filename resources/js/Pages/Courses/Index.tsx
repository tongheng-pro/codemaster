import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { Course } from '@/Types';
import { BookOpen, Search, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
    courses: Course[];
}

export default function Index({ courses = [] }: Props) {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');

    const filtered = courses.filter((c) => {
        const query = search.toLowerCase();
        return (
            (c.title && c.title.toLowerCase().includes(query)) ||
            (c.description && c.description.toLowerCase().includes(query)) ||
            c.slug.toLowerCase().includes(query)
        );
    });

    return (
        <AppLayout title={t('courses.title')}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-2">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Catalog</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {t('courses.title')}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {t('courses.subtitle')}
                        </p>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter courses..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((course) => {
                        const hasProgress = course.completed_percentage !== null && course.completed_percentage !== undefined;
                        return (
                            <Link
                                key={course.id}
                                href={`/${course.slug}`}
                                className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/60 shadow-xs hover:shadow-xl hover:shadow-emerald-500/5 transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span
                                            className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm text-white shadow-sm"
                                            style={{ backgroundColor: course.color || '#10b981' }}
                                        >
                                            {course.slug.toUpperCase().substring(0, 4)}
                                        </span>
                                        <span className="text-xs font-mono font-medium text-slate-400">
                                            {t('courses.lessons_count', { count: course.lessons_count || 0 })}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
                                        {course.description}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    {hasProgress && course.completed_percentage! > 0 && (
                                        <div className="mb-3">
                                            <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                                                <span>Progress</span>
                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                    {course.completed_percentage}%
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full"
                                                    style={{ width: `${course.completed_percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                        <span>
                                            {hasProgress && course.completed_percentage! > 0
                                                ? t('courses.continue_course')
                                                : t('courses.start_course')}
                                        </span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}

