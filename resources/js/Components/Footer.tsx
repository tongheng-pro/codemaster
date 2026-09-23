import React from 'react';
import { Link } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import { Heart } from 'lucide-react';

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="md:col-span-1 space-y-3">
                        <Link href="/" className="flex items-center gap-2 group">
                            <img src="/images/mylogo-logo.png" alt="CodeMaster" className="w-8 h-8 object-contain" />
                            <span className="font-bold text-base text-neutral-900 dark:text-white">
                                Code<span className="text-primary-500">Master</span>
                            </span>
                        </Link>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans">
                            {t('home.hero_subtitle')}
                        </p>
                    </div>

                    {/* Popular Tracks */}
                    <div>
                        <h4 className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
                            {t('home.popular_courses')}
                        </h4>
                        <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                            <li><Link href="/html" className="hover:text-primary-500 transition-colors">HTML Tutorial</Link></li>
                            <li><Link href="/css" className="hover:text-primary-500 transition-colors">CSS Tutorial</Link></li>
                            <li><Link href="/javascript" className="hover:text-primary-500 transition-colors">JavaScript Tutorial</Link></li>
                            <li><Link href="/courses" className="hover:text-primary-500 transition-colors font-medium text-primary-600 dark:text-primary-400">{t('courses.title')} &rarr;</Link></li>
                        </ul>
                    </div>

                    {/* Practice */}
                    <div>
                        <h4 className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
                            {t('home.practice_title')}
                        </h4>
                        <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                            <li><Link href="/playground" className="hover:text-primary-500 transition-colors">{t('nav.playground')}</Link></li>
                            <li><Link href="/exercises" className="hover:text-primary-500 transition-colors">{t('nav.exercises')}</Link></li>
                            <li><Link href="/quizzes" className="hover:text-primary-500 transition-colors">{t('nav.quizzes')}</Link></li>
                            <li><Link href="/search" className="hover:text-primary-500 transition-colors">{t('search.title')}</Link></li>
                        </ul>
                    </div>

                    {/* Learning & Accounts */}
                    <div>
                        <h4 className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
                            {t('dashboard.subtitle')}
                        </h4>
                        <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                            <li><Link href="/dashboard" className="hover:text-primary-500 transition-colors">{t('nav.dashboard')}</Link></li>
                            <li><Link href="/bookmarks" className="hover:text-primary-500 transition-colors">{t('nav.bookmarks')}</Link></li>
                            <li><Link href="/certificates" className="hover:text-primary-500 transition-colors">{t('nav.certificates')}</Link></li>
                            <li><Link href="/profile" className="hover:text-primary-500 transition-colors">{t('nav.profile')}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 gap-3">
                    <div className="flex items-center gap-1">
                        <span>Crafted with</span>
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
                        <span>for developers worldwide &bull; English &amp; ភាសាខ្មែរ</span>
                    </div>
                    <div>
                        &copy; {new Date().getFullYear()} CodeMaster. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}

