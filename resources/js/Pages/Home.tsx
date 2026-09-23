import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { Course } from '@/Types';
import {
    Code2,
    BookOpen,
    Terminal,
    HelpCircle,
    Award,
    TrendingUp,
    Languages,
    ArrowRight,
    Search,
    Play,
    Sparkles,
    CheckCircle2,
} from 'lucide-react';
import InteractiveCodeBlock from '@/Components/InteractiveCodeBlock';

interface Props {
    popularCourses: Course[];
    stats: {
        total_students: number;
        total_courses: number;
        total_lessons: number;
        total_exercises: number;
        total_quizzes: number;
    };
}

export default function Home({ popularCourses = [], stats }: Props) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/search', { q: searchQuery.trim() });
        }
    }

    const whyFeatures = [
        {
            icon: Code2,
            color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
            title: t('home.why_interactive'),
            desc: t('home.why_interactive_desc'),
        },
        {
            icon: Terminal,
            color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
            title: t('home.why_exercises'),
            desc: t('home.why_exercises_desc'),
        },
        {
            icon: HelpCircle,
            color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
            title: t('home.why_quizzes'),
            desc: t('home.why_quizzes_desc'),
        },
        {
            icon: TrendingUp,
            color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
            title: t('home.why_progress'),
            desc: t('home.why_progress_desc'),
        },
        {
            icon: Award,
            color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
            title: t('home.why_certificates'),
            desc: t('home.why_certificates_desc'),
        },
        {
            icon: Languages,
            color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800',
            title: t('home.why_bilingual'),
            desc: t('home.why_bilingual_desc'),
        },
    ];

    const sampleHeroSnippet = `<div class="welcome-box">
  <h1>Hello, Developer!</h1>
  <p>Learn web development in English & ភាសាខ្មែរ.</p>
</div>`;

    return (
        <AppLayout title={t('home.hero_title')}>
            <Head>
                <meta name="description" content={t('home.hero_subtitle')} />
            </Head>

            {/* 1. Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 dark:border-slate-800 bg-linear-to-b from-white via-slate-50 to-slate-100/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Native Bilingual Coding Education &bull; EN + KM</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                                {t('home.hero_title')}
                            </h1>

                            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                                {t('home.hero_subtitle')}
                            </p>

                            {/* Search Form */}
                            <form onSubmit={handleSearch} className="max-w-md mx-auto lg:mx-0 flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('home.hero_subtitle').substring(0, 35) + '...'}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-sm shadow-emerald-500/20"
                                >
                                    {t('nav.search_btn')}
                                </button>
                            </form>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                                <Link
                                    href="/courses"
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-500/25 hover:scale-102"
                                >
                                    <span>{t('common.start_learning')}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/playground"
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
                                >
                                    <Play className="w-4 h-4 text-emerald-500" />
                                    <span>{t('nav.playground')}</span>
                                </Link>
                            </div>
                        </div>

                        {/* Interactive Hero Code Block */}
                        <div className="lg:col-span-5">
                            <div className="relative">
                                <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-emerald-500 to-teal-500 opacity-20 blur-xl" />
                                <div className="relative">
                                    <InteractiveCodeBlock
                                        title="Live Code Editor Demo"
                                        language="html"
                                        initialCode={sampleHeroSnippet}
                                        className="my-0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Popular Courses Section */}
            <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {t('home.popular_courses')}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {t('home.popular_courses_sub')}
                        </p>
                    </div>
                    <Link
                        href="/courses"
                        className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
                    >
                        <span>{t('common.explore_courses')}</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {popularCourses.map((course) => (
                        <Link
                            key={course.id}
                            href={`/${course.slug}`}
                            className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 shadow-xs hover:shadow-xl hover:shadow-emerald-500/5 transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span
                                        className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm text-white shadow-sm"
                                        style={{ backgroundColor: course.color || '#10b981' }}
                                    >
                                        {course.slug.toUpperCase().substring(0, 4)}
                                    </span>
                                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 font-mono">
                                        {t('courses.lessons_count', { count: course.lessons_count || 0 })}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                    {course.description}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                <span>{t('common.start_learning')}</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* 3. Why Learn Here Features */}
            <section className="py-16 sm:py-24 border-y border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {t('home.why_learn_title')}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t('home.hero_subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {whyFeatures.map((feat, idx) => {
                            const Icon = feat.icon;
                            return (
                                <div
                                    key={idx}
                                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${feat.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                                        {feat.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {feat.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 4. Practice & Playground Callout */}
            <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-3xl bg-linear-to-br from-slate-900 via-slate-850 to-slate-950 p-8 sm:p-12 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 max-w-2xl space-y-6">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Interactive Sandbox
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                            {t('home.practice_title')}
                        </h2>
                        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                            {t('home.practice_desc')}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <Link
                                href="/playground"
                                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:scale-102 flex items-center gap-2"
                            >
                                <Play className="w-4 h-4 fill-slate-950" />
                                <span>{t('home.open_playground')}</span>
                            </Link>
                            <Link
                                href="/exercises"
                                className="px-6 py-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-sm transition-colors"
                            >
                                {t('home.browse_exercises')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}

