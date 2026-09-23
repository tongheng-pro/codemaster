import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { Exercise } from '@/Types';
import { Terminal, CheckCircle2, ArrowRight, Filter } from 'lucide-react';
import { cn } from '@/Utils';

interface Props {
    exercises: Exercise[];
}

export default function Index({ exercises = [] }: Props) {
    const { t } = useTranslation();
    const [selectedLang, setSelectedLang] = useState<string>('all');

    const languages = ['all', 'html', 'css', 'javascript', 'php'];

    const filtered = exercises.filter((ex) => {
        if (selectedLang === 'all') return true;
        return ex.language.toLowerCase() === selectedLang.toLowerCase();
    });

    return (
        <AppLayout title={t('exercises.title')}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-2">
                            <Terminal className="w-3.5 h-3.5" />
                            <span>Practice</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                            {t('exercises.title')}
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            {t('exercises.subtitle')}
                        </p>
                    </div>

                    {/* Language Filter */}
                    <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800/70 rounded-xl border border-neutral-200 dark:border-neutral-800">
                        {languages.map((lang) => (
                            <button
                                key={lang}
                                type="button"
                                onClick={() => setSelectedLang(lang)}
                                className={cn(
                                    'px-3 py-1 rounded-lg text-xs font-medium uppercase font-mono transition-colors',
                                    selectedLang === lang
                                        ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                                )}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((ex, aosIndex) => (
                        <Link
                            key={ex.id}
                            data-aos="fade-up"
                            data-aos-delay={(aosIndex % 3) * 80}
                            href={`/exercises/${ex.slug}`}
                            className="group p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-500/60 shadow-xs hover:shadow-xl hover: transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-mono text-xs uppercase font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                                        {ex.language}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-medium text-neutral-400 capitalize">
                                            {ex.difficulty}
                                        </span>
                                        {ex.has_passed && (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        )}
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {ex.title}
                                </h3>
                                {ex.course_title && (
                                    <p className="text-xs text-neutral-400 mt-1">
                                        Part of: <span className="text-neutral-600 dark:text-neutral-300 font-medium">{ex.course_title}</span>
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                                <span>{ex.points} Points</span>
                                <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    <span>{t('exercises.solve_challenge')}</span>
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

