import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { Course } from '@/Types';
import {
    Code2,
    Terminal,
    HelpCircle,
    Award,
    TrendingUp,
    Languages,
    ArrowRight,
    Search,
    Play,
    Sparkles,
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

export default function Home({ stats }: Props) {
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
            color: 'text-primary-500 bg-primary-50 dark:bg-primary-950/60 border-primary-200 dark:border-primary-800',
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
            color: 'text-primary-500 bg-primary-50 dark:bg-primary-950/60 border-primary-200 dark:border-primary-800',
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
            <section className="bg-white dark:bg-neutral-950 relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-neutral-200 dark:border-neutral-800 ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-7 space-y-6 text-center lg:text-left" data-aos="fade-up">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-100/80 dark:bg-primary-950/80 text-primary-800 dark:text-primary-300 border border-primary-300 dark:border-primary-700">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Native Bilingual Coding Education &bull; EN + KM</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
                                {t('home.hero_title')}
                            </h1>

                            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed">
                                {t('home.hero_subtitle')}
                            </p>

                            {/* Search Form */}
                            <form onSubmit={handleSearch} className="max-w-md mx-auto lg:mx-0 flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('home.hero_subtitle').substring(0, 35) + '...'}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-xs"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-all shadow-sm"
                                >
                                    {t('nav.search_btn')}
                                </button>
                            </form>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                                <Link
                                    href="/courses"
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm transition-all shadow-md hover:scale-102"
                                >
                                    <span>{t('common.start_learning')}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/playground"
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white font-semibold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-xs"
                                >
                                    <Play className="w-4 h-4 text-primary-500" />
                                    <span>{t('nav.playground')}</span>
                                </Link>
                            </div>
                        </div>

                        {/* Interactive Hero Code Block */}
                        <div className="lg:col-span-5" data-aos="fade-up" data-aos-delay="150">
                            <div className="relative">
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

            {/* 3. Why Learn Here Features */}
            <section className="py-16 sm:py-24 border-y border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-3" data-aos="fade-up">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            {t('home.why_learn_title')}
                        </h2>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {t('home.hero_subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {whyFeatures.map((feat, idx) => {
                            const Icon = feat.icon;
                            return (
                                <div
                                    key={idx}
                                    data-aos="fade-up"
                                    data-aos-delay={(idx % 3) * 100}
                                    className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${feat.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                                        {feat.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
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
                <div data-aos="fade-up" className="bg-neutral-900 rounded-3xl p-8 sm:p-12 text-white border border-neutral-800 shadow-2xl relative overflow-hidden">

                    <div className="relative z-10 max-w-2xl space-y-6">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/20 text-primary-400 border border-primary-500/30">
                            Interactive Sandbox
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                            {t('home.practice_title')}
                        </h2>
                        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                            {t('home.practice_desc')}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <Link
                                href="/playground"
                                className="px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-neutral-950 font-bold text-sm transition-all shadow-lg hover:scale-102 flex items-center gap-2"
                            >
                                <Play className="w-4 h-4 fill-neutral-950" />
                                <span>{t('home.open_playground')}</span>
                            </Link>
                            <Link
                                href="/exercises"
                                className="px-6 py-3 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-white font-semibold text-sm transition-colors"
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

