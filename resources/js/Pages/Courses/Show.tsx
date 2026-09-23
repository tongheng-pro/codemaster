import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { Course } from '@/Types';
import {
    BookOpen,
    Play,
    CheckCircle2,
    Clock,
    ChevronRight,
    Award,
} from 'lucide-react';

interface Props {
    course: Course & {
        meta_title?: string;
        meta_description?: string;
        first_lesson_slug?: string | null;
    };
}

export default function Show({ course }: Props) {
    const { t } = useTranslation();

    const startUrl = course.first_lesson_slug
        ? `/${course.slug}/${course.first_lesson_slug}`
        : '#';

    return (
        <AppLayout title={course.title || course.slug}>
            <Head>
                {course.meta_title && <title>{course.meta_title}</title>}
                {course.meta_description && <meta name="description" content={course.meta_description} />}
            </Head>

            {/* Course Hero Banner */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <span
                                className="w-16 h-16 rounded-2xl flex items-center justify-center font-mono font-bold text-xl text-white shadow-md"
                                style={{ backgroundColor: course.color || '#10b981' }}
                            >
                                {course.slug.toUpperCase().substring(0, 4)}
                            </span>
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {course.title}
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                                    {course.description}
                                </p>
                            </div>
                        </div>

                        <Link
                            href={startUrl}
                            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 shrink-0 hover:scale-102"
                        >
                            <Play className="w-4 h-4 fill-white" />
                            <span>
                                {course.completed_percentage && course.completed_percentage > 0
                                    ? t('courses.continue_course')
                                    : t('courses.start_course')}
                            </span>
                        </Link>
                    </div>

                    {/* Progress Stats bar if started */}
                    {course.completed_percentage !== undefined && course.completed_percentage !== null && course.completed_percentage > 0 && (
                        <div className="mt-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                            <div className="flex justify-between text-xs font-semibold mb-2">
                                <span className="text-slate-600 dark:text-slate-300">Course Progress</span>
                                <span className="text-emerald-600 dark:text-emerald-400">{course.completed_percentage}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                    style={{ width: `${course.completed_percentage}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Syllabus Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {t('courses.syllabus')}
                    </h2>
                    <span className="text-xs font-medium text-slate-400">
                        {t('courses.lessons_count', { count: course.lessons_count || 0 })}
                    </span>
                </div>

                {course.sections && course.sections.length > 0 ? (
                    <div className="space-y-6">
                        {course.sections.map((section) => (
                            <div
                                key={section.id}
                                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
                            >
                                <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                        {section.title}
                                    </h3>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {section.lessons?.map((lesson) => (
                                        <Link
                                            key={lesson.id}
                                            href={`/${course.slug}/${lesson.slug}`}
                                            className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                {lesson.is_completed ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                        {lesson.title}
                                                    </div>
                                                    {lesson.description && (
                                                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                                                            {lesson.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                                <span className="flex items-center gap-1 font-mono">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{lesson.duration_minutes || 5} min</span>
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Flat list if no sections
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                        {course.lessons?.map((lesson) => (
                            <Link
                                key={lesson.id}
                                href={`/${course.slug}/${lesson.slug}`}
                                className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    {lesson.is_completed ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                                    )}
                                    <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                        {lesson.title}
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

