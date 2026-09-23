import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import { useTranslation } from '@/Hooks/useTranslation';
import { Course, Lesson } from '@/Types';
import {
    CheckCircle2,
    Circle,
    ChevronRight,
    ChevronLeft,
    Bookmark,
    ListFilter,
    X,
    BookOpen,
    Menu,
} from 'lucide-react';
import { cn } from '@/Utils';

interface OnPageTopic {
    id: string;
    title: string;
}

interface Props {
    title: string;
    course: Course;
    currentLesson?: Lesson;
    previousLesson?: Lesson | null;
    nextLesson?: Lesson | null;
    isCompleted?: boolean;
    isBookmarked?: boolean;
    onPageTopics?: OnPageTopic[];
    children: React.ReactNode;
}

export default function LearningLayout({
    title,
    course,
    currentLesson,
    previousLesson,
    nextLesson,
    isCompleted = false,
    isBookmarked = false,
    onPageTopics = [],
    children,
}: Props) {
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [bookmarked, setBookmarked] = useState(isBookmarked);
    const [completed, setCompleted] = useState(isCompleted);

    function toggleBookmark() {
        if (!currentLesson) return;
        setBookmarked(!bookmarked);
        router.post(`/lessons/${currentLesson.id}/bookmark`, {}, { preserveScroll: true, preserveState: true });
    }

    function toggleComplete() {
        if (!currentLesson) return;
        setCompleted(!completed);
        router.post(`/lessons/${currentLesson.id}/complete`, {}, { preserveScroll: true, preserveState: true });
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
            <Head title={`${title} - ${course.title || course.slug}`} />

            <Navbar />

            {/* Sub-header / Course breadcrumb bar */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-16 z-30 px-4 py-2.5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs sm:text-sm truncate">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 mr-1"
                            title="Toggle Syllabus"
                        >
                            <Menu className="w-4 h-4" />
                        </button>
                        <Link href="/courses" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            {t('nav.courses')}
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <Link href={`/${course.slug}`} className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                            {course.title}
                        </Link>
                        {currentLesson && (
                            <>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                <span className="text-slate-600 dark:text-slate-300 truncate font-medium">
                                    {currentLesson.title}
                                </span>
                            </>
                        )}
                    </div>

                    {currentLesson && (
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={toggleBookmark}
                                className={cn(
                                    'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-colors',
                                    bookmarked
                                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-700 dark:text-amber-400'
                                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                )}
                                title={bookmarked ? t('common.bookmarked') : t('common.bookmark')}
                            >
                                <Bookmark className={cn('w-3.5 h-3.5', bookmarked && 'fill-amber-500 text-amber-500')} />
                                <span className="hidden sm:inline">
                                    {bookmarked ? t('common.bookmarked') : t('common.bookmark')}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={toggleComplete}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg font-medium transition-colors',
                                    completed
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                )}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">
                                    {completed ? t('courses.completed_badge') : t('courses.mark_complete')}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 3-Column Learning Body */}
            <div className="max-w-7xl mx-auto w-full flex-1 flex">
                {/* 1. Left Column: Course Syllabus Navigation */}
                <aside
                    className={cn(
                        'fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto pt-20 pb-10 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:z-auto lg:pt-6 lg:w-64 shrink-0',
                        sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
                    )}
                >
                    <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 lg:hidden">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {course.title}
                        </span>
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="px-4 py-3">
                        <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                            {t('courses.course_navigation')}
                        </h3>
                        <nav className="space-y-4 text-xs">
                            {course.sections && course.sections.length > 0 ? (
                                course.sections.map((section) => (
                                    <div key={section.id} className="space-y-1">
                                        <div className="font-semibold text-slate-800 dark:text-slate-200 px-2 py-1 text-xs">
                                            {section.title}
                                        </div>
                                        <div className="space-y-0.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                                            {section.lessons?.map((lesson) => {
                                                const isActive = currentLesson?.id === lesson.id;
                                                return (
                                                    <Link
                                                        key={lesson.id}
                                                        href={`/${course.slug}/${lesson.slug}`}
                                                        onClick={() => setSidebarOpen(false)}
                                                        className={cn(
                                                            'flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors leading-snug',
                                                            isActive
                                                                ? 'bg-emerald-500 text-white font-semibold shadow-xs'
                                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                                                        )}
                                                    >
                                                        <span className="truncate">{lesson.title}</span>
                                                        {lesson.is_completed && (
                                                            <CheckCircle2
                                                                className={cn(
                                                                    'w-3.5 h-3.5 ml-1.5 shrink-0',
                                                                    isActive ? 'text-white' : 'text-emerald-500'
                                                                )}
                                                            />
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                // Flat list if no sections
                                <div className="space-y-0.5">
                                    {course.lessons?.map((lesson) => {
                                        const isActive = currentLesson?.id === lesson.id;
                                        return (
                                            <Link
                                                key={lesson.id}
                                                href={`/${course.slug}/${lesson.slug}`}
                                                onClick={() => setSidebarOpen(false)}
                                                className={cn(
                                                    'flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-xs leading-snug',
                                                    isActive
                                                        ? 'bg-emerald-500 text-white font-semibold'
                                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                )}
                                            >
                                                <span className="truncate">{lesson.title}</span>
                                                {lesson.is_completed && (
                                                    <CheckCircle2
                                                        className={cn(
                                                            'w-3.5 h-3.5 ml-1.5 shrink-0',
                                                            isActive ? 'text-white' : 'text-emerald-500'
                                                        )}
                                                    />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </nav>
                    </div>
                </aside>

                {/* Mobile overlay backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* 2. Center Column: Main Lesson Content */}
                <main className="flex-1 min-w-0 px-4 sm:px-8 py-8">
                    <div className="max-w-3xl mx-auto">
                        {children}

                        {/* Bottom Lesson Navigation Bar */}
                        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                            {previousLesson ? (
                                <Link
                                    href={`/${course.slug}/${previousLesson.slug}`}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium transition-colors shadow-xs"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <div className="text-left">
                                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                                            {t('common.previous')}
                                        </div>
                                        <div className="truncate max-w-[140px] sm:max-w-[200px]">
                                            {previousLesson.title}
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <div />
                            )}

                            {nextLesson ? (
                                <Link
                                    href={`/${course.slug}/${nextLesson.slug}`}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium transition-colors shadow-sm shadow-emerald-500/20"
                                >
                                    <div className="text-right">
                                        <div className="text-[10px] text-emerald-100 uppercase font-semibold">
                                            {t('common.next')}
                                        </div>
                                        <div className="truncate max-w-[140px] sm:max-w-[200px]">
                                            {nextLesson.title}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <Link
                                    href={`/${course.slug}`}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-500"
                                >
                                    {t('courses.syllabus')} &rarr;
                                </Link>
                            )}
                        </div>
                    </div>
                </main>

                {/* 3. Right Column: On-Page Topics (TOC) */}
                {onPageTopics.length > 0 && (
                    <aside className="hidden xl:block w-60 py-8 pr-4 shrink-0">
                        <div className="sticky top-28 space-y-2">
                            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <ListFilter className="w-3.5 h-3.5" />
                                <span>{t('courses.on_this_page')}</span>
                            </div>
                            <nav className="space-y-1 text-xs border-l border-slate-200 dark:border-slate-800 pl-3">
                                {onPageTopics.map((topic) => (
                                    <a
                                        key={topic.id}
                                        href={`#${topic.id}`}
                                        className="block py-1 text-slate-500 hover:text-emerald-500 transition-colors truncate"
                                    >
                                        {topic.title}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}

