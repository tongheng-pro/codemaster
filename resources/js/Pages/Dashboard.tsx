import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { PageProps } from '@/Types';
import {
    BookOpen,
    CheckCircle2,
    Award,
    Flame,
    Bookmark,
    ArrowRight,
    TrendingUp,
    Terminal,
    HelpCircle,
    User,
} from 'lucide-react';

interface Props {
    stats: {
        completed_lessons: number;
        exercises_completed: number;
        quiz_score: number;
        certificates: number;
        streak_days: number;
    };
    inProgressCourses: Array<{
        id: number;
        slug: string;
        icon?: string;
        color?: string;
        title: string;
        percentage: number;
        completed_lessons: number;
        total_lessons: number;
    }>;
    bookmarks: Array<{
        id: number;
        lesson_id: number;
        lesson_slug: string;
        lesson_title: string;
        course_slug: string;
        course_title: string;
        created_at: string;
    }>;
    certificates: Array<{
        id: number;
        uuid: string;
        certificate_code: string;
        course_title: string;
        course_slug: string;
        issued_at: string;
    }>;
}

export default function Dashboard({
    stats,
    inProgressCourses = [],
    bookmarks = [],
    certificates = [],
}: Props) {
    const { t } = useTranslation();
    const { auth } = usePage<PageProps>().props;

    return (
        <AppLayout title={t('nav.dashboard')}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
                {/* Greeting Banner */}
                <div className="bg-primary-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            {t('dashboard.welcome', { name: auth.user?.name || 'Developer' })}
                        </h1>
                        <p className="text-sm text-primary-100 font-sans">
                            {t('dashboard.subtitle')}
                        </p>
                    </div>
                </div>

                {/* 1. Learning Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-600 flex items-center justify-center">
                            <Flame className="w-4 h-4 fill-orange-500" />
                        </div>
                        <div className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
                            {stats.streak_days}
                        </div>
                        <div className="text-xs font-semibold text-neutral-400">
                            {t('dashboard.learning_streak')}
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-primary-600 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
                            {stats.completed_lessons}
                        </div>
                        <div className="text-xs font-semibold text-neutral-400">
                            {t('dashboard.completed_lessons')}
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 flex items-center justify-center">
                            <Terminal className="w-4 h-4" />
                        </div>
                        <div className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
                            {stats.exercises_completed}
                        </div>
                        <div className="text-xs font-semibold text-neutral-400">
                            {t('dashboard.exercises_completed')}
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 flex items-center justify-center">
                            <HelpCircle className="w-4 h-4" />
                        </div>
                        <div className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
                            {stats.quiz_score}%
                        </div>
                        <div className="text-xs font-semibold text-neutral-400">
                            {t('dashboard.quiz_score')}
                        </div>
                    </div>

                    <div className="col-span-2 lg:col-span-1 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 flex items-center justify-center">
                            <Award className="w-4 h-4" />
                        </div>
                        <div className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
                            {stats.certificates}
                        </div>
                        <div className="text-xs font-semibold text-neutral-400">
                            {t('dashboard.certificates')}
                        </div>
                    </div>
                </div>

                {/* 2. Continue Learning Cards */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                            {t('dashboard.continue_learning')}
                        </h2>
                        <Link href="/courses" className="text-xs font-semibold text-primary-600 hover:underline">
                            {t('courses.title')} &rarr;
                        </Link>
                    </div>

                    {inProgressCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {inProgressCourses.map((c) => (
                                <Link
                                    key={c.id}
                                    href={`/${c.slug}`}
                                    className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-primary-500 shadow-xs transition-all space-y-4 group"
                                >
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs text-white"
                                            style={{ backgroundColor: c.color || '#10b981' }}
                                        >
                                            {c.slug.toUpperCase().substring(0, 4)}
                                        </span>
                                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 font-mono">
                                            {c.percentage}%
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-base text-neutral-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                            {c.title}
                                        </h3>
                                        <div className="text-xs text-neutral-400 mt-1">
                                            {c.completed_lessons} of {c.total_lessons} lessons completed
                                        </div>
                                    </div>

                                    <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-500 rounded-full"
                                            style={{ width: `${c.percentage}%` }}
                                        />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center space-y-3">
                            <p className="text-xs text-neutral-500">{t('dashboard.no_activity')}</p>
                            <Link
                                href="/courses"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-500 transition-colors"
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>{t('common.explore_courses')}</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* 3. Bottom Columns: Bookmarks & Certificates */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Bookmarks */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                <Bookmark className="w-4 h-4 text-amber-500" />
                                <span>{t('dashboard.bookmarked_lessons')}</span>
                            </h2>
                            <Link href="/bookmarks" className="text-xs font-semibold text-primary-600 hover:underline">
                                View all
                            </Link>
                        </div>

                        {bookmarks.length > 0 ? (
                            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800 shadow-xs">
                                {bookmarks.map((bm) => (
                                    <Link
                                        key={bm.id}
                                        href={`/${bm.course_slug}/${bm.lesson_slug}`}
                                        className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
                                    >
                                        <div>
                                            <div className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                                {bm.lesson_title}
                                            </div>
                                            <div className="text-xs text-neutral-400 mt-0.5">
                                                {bm.course_title} &bull; {bm.created_at}
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center text-xs text-neutral-400">
                                {t('dashboard.no_bookmarks')}
                            </div>
                        )}
                    </div>

                    {/* Earned Certificates */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                <Award className="w-4 h-4 text-rose-500" />
                                <span>{t('dashboard.certificates')}</span>
                            </h2>
                            <Link href="/certificates" className="text-xs font-semibold text-primary-600 hover:underline">
                                View all
                            </Link>
                        </div>

                        {certificates.length > 0 ? (
                            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800 shadow-xs">
                                {certificates.map((cert) => (
                                    <Link
                                        key={cert.id}
                                        href={`/certificates/${cert.uuid}`}
                                        className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
                                    >
                                        <div>
                                            <div className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                                {cert.course_title}
                                            </div>
                                            <div className="text-xs font-mono text-primary-600 dark:text-primary-400 mt-0.5">
                                                ID: {cert.certificate_code} &bull; {cert.issued_at}
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center text-xs text-neutral-400">
                                {t('certificates.no_certificates')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

