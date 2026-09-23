import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { Bookmark, ArrowRight, BookOpen } from 'lucide-react';

interface BookmarkItem {
    id: number;
    lesson_id: number;
    lesson_slug: string;
    lesson_title: string;
    lesson_description?: string;
    course_slug: string;
    course_title: string;
    created_at: string;
}

interface Props {
    bookmarks: BookmarkItem[];
}

export default function Bookmarks({ bookmarks = [] }: Props) {
    const { t } = useTranslation();

    return (
        <AppLayout title={t('nav.bookmarks')}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mb-2">
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Saved</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {t('dashboard.bookmarked_lessons')}
                    </h1>
                </div>

                {bookmarks.length > 0 ? (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
                        {bookmarks.map((b) => (
                            <Link
                                key={b.id}
                                href={`/${b.course_slug}/${b.lesson_slug}`}
                                className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                            >
                                <div className="space-y-1">
                                    <div className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                        {b.course_title}
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                        {b.lesson_title}
                                    </h3>
                                    {b.lesson_description && (
                                        <p className="text-xs text-slate-400 line-clamp-1">
                                            {b.lesson_description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span>{b.created_at}</span>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-4">
                        <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
                        <p className="text-sm text-slate-500">{t('dashboard.no_bookmarks')}</p>
                        <Link
                            href="/courses"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
                        >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{t('common.explore_courses')}</span>
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

