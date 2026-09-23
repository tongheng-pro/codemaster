import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { PageProps } from '@/Types';
import {
    Code2,
    BookOpen,
    Terminal,
    HelpCircle,
    Search,
    Menu,
    X,
    User as UserIcon,
    Award,
    Bookmark,
    LayoutDashboard,
    LogOut,
    Shield,
    ChevronDown,
    Library,
} from 'lucide-react';
import { cn } from '@/Utils';

export default function Navbar() {
    const { t } = useTranslation();
    const { auth, navCourses } = usePage<PageProps>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-4 2xl:gap-6 min-w-0">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <img
                                src="/images/dynosure-logo.png"
                                alt="CodeMaster"
                                className="w-10 h-10 shrink-0 rounded-xl bg-white object-cover shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform"
                            />
                            <div className="flex flex-col whitespace-nowrap">
                                <span className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">
                                    Code<span className="text-emerald-500">Master</span>
                                </span>
                                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 -mt-0.5">
                                    EN &bull; ភាសាខ្មែរ
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden xl:flex items-center gap-0.5">
                            {/* Courses Dropdown */}
                            <div className="relative" onMouseLeave={() => setCoursesDropdownOpen(false)}>
                                <button
                                    type="button"
                                    onClick={() => setCoursesDropdownOpen(!coursesDropdownOpen)}
                                    onMouseEnter={() => setCoursesDropdownOpen(true)}
                                    className="flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium whitespace-nowrap text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors"
                                >
                                    <BookOpen className="hidden 2xl:block w-4 h-4 shrink-0 text-emerald-500" />
                                    <span>{t('nav.courses')}</span>
                                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                                </button>

                                {coursesDropdownOpen && (
                                    <div className="absolute left-0 mt-1 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in-50 zoom-in-95">
                                        <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            {t('home.popular_courses')}
                                        </div>
                                        {navCourses && navCourses.length > 0 ? (
                                            navCourses.map((c) => (
                                                <Link
                                                    key={c.id}
                                                    href={`/${c.slug}`}
                                                    className="flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                                    onClick={() => setCoursesDropdownOpen(false)}
                                                >
                                                    <span className="font-medium">{c.title}</span>
                                                    <span className="text-xs uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                        {c.slug}
                                                    </span>
                                                </Link>
                                            ))
                                        ) : (
                                            <Link
                                                href="/courses"
                                                className="block px-3 py-2 text-sm text-slate-600 dark:text-slate-300"
                                            >
                                                {t('home.popular_courses')}
                                            </Link>
                                        )}
                                        <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2 px-3">
                                            <Link
                                                href="/courses"
                                                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline block"
                                                onClick={() => setCoursesDropdownOpen(false)}
                                            >
                                                {t('common.explore_courses')} &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/books"
                                className="flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium whitespace-nowrap text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors"
                            >
                                <Library className="hidden 2xl:block w-4 h-4 shrink-0 text-teal-500" />
                                <span>{t('nav.books')}</span>
                            </Link>

                            <Link
                                href="/exercises"
                                className="flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium whitespace-nowrap text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors"
                            >
                                <Terminal className="hidden 2xl:block w-4 h-4 shrink-0 text-blue-500" />
                                <span>{t('nav.exercises')}</span>
                            </Link>

                            <Link
                                href="/quizzes"
                                className="flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium whitespace-nowrap text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors"
                            >
                                <HelpCircle className="hidden 2xl:block w-4 h-4 shrink-0 text-purple-500" />
                                <span>{t('nav.quizzes')}</span>
                            </Link>

                            <Link
                                href="/playground"
                                className="flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium whitespace-nowrap text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors"
                            >
                                <Code2 className="hidden 2xl:block w-4 h-4 shrink-0 text-amber-500" />
                                <span>{t('nav.playground')}</span>
                            </Link>
                        </nav>
                    </div>

                    {/* Right side items: Search, Language Switcher, Auth */}
                    <div className="flex items-center gap-2 2xl:gap-3 shrink-0">
                        {/* Search Link */}
                        <Link
                            href="/search"
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/60 transition-colors w-40 md:w-56 xl:w-9 xl:h-9 xl:px-0 xl:justify-center 2xl:w-56 2xl:h-auto 2xl:px-3 2xl:justify-start"
                            aria-label={t('nav.search')}
                        >
                            <Search className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            <span className="truncate xl:hidden 2xl:inline">{t('nav.search')}</span>
                        </Link>

                        {/* Language Switcher */}
                        <LanguageSwitcher />

                        {/* User Authentication Menu */}
                        {auth.user ? (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden md:inline text-xs font-semibold max-w-[100px] truncate text-slate-800 dark:text-slate-200">
                                        {auth.user.name}
                                    </span>
                                    <ChevronDown className="w-3 h-3 text-slate-400 hidden md:inline" />
                                </button>

                                {userDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-in fade-in-50 zoom-in-95">
                                        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                                            <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                                                {auth.user.name}
                                            </div>
                                            <div className="text-[11px] text-slate-400 truncate">
                                                {auth.user.email}
                                            </div>
                                        </div>

                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            onClick={() => setUserDropdownOpen(false)}
                                        >
                                            <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                                            <span>{t('nav.dashboard')}</span>
                                        </Link>

                                        <Link
                                            href="/bookmarks"
                                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            onClick={() => setUserDropdownOpen(false)}
                                        >
                                            <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                                            <span>{t('nav.bookmarks')}</span>
                                        </Link>

                                        <Link
                                            href="/certificates"
                                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            onClick={() => setUserDropdownOpen(false)}
                                        >
                                            <Award className="w-3.5 h-3.5 text-slate-500" />
                                            <span>{t('nav.certificates')}</span>
                                        </Link>

                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            onClick={() => setUserDropdownOpen(false)}
                                        >
                                            <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                                            <span>{t('nav.profile')}</span>
                                        </Link>

                                        {auth.user.isAdmin && (
                                            <Link
                                                href="/admin/dashboard"
                                                className="flex items-center gap-2 px-3 py-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 border-t border-slate-100 dark:border-slate-800"
                                                onClick={() => setUserDropdownOpen(false)}
                                            >
                                                <Shield className="w-3.5 h-3.5" />
                                                <span>{t('nav.admin')}</span>
                                            </Link>
                                        )}

                                        <div className="border-t border-slate-100 dark:border-slate-800 mt-1">
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                onClick={() => setUserDropdownOpen(false)}
                                            >
                                                <LogOut className="w-3.5 h-3.5" />
                                                <span>{t('nav.logout')}</span>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-3 py-1.5 whitespace-nowrap text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors"
                                >
                                    {t('nav.login')}
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-3.5 py-1.5 whitespace-nowrap text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm shadow-emerald-500/20 transition-all hover:scale-102"
                                >
                                    {t('nav.register')}
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="xl:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3">
                    <Link
                        href="/search"
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Search className="w-4 h-4" />
                        <span>{t('nav.search')}</span>
                    </Link>

                    <div className="space-y-1">
                        <Link
                            href="/courses"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <BookOpen className="w-4 h-4 text-emerald-500" />
                            <span>{t('nav.courses')}</span>
                        </Link>
                        <Link
                            href="/books"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Library className="w-4 h-4 text-teal-500" />
                            <span>{t('nav.books')}</span>
                        </Link>
                        <Link
                            href="/exercises"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Terminal className="w-4 h-4 text-blue-500" />
                            <span>{t('nav.exercises')}</span>
                        </Link>
                        <Link
                            href="/quizzes"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <HelpCircle className="w-4 h-4 text-purple-500" />
                            <span>{t('nav.quizzes')}</span>
                        </Link>
                        <Link
                            href="/playground"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Code2 className="w-4 h-4 text-amber-500" />
                            <span>{t('nav.playground')}</span>
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}

