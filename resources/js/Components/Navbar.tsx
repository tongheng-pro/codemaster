import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import ThemeToggle from '@/Components/ThemeToggle';
import { NavigationSettings, PageProps } from '@/Types';
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
    const { auth, navigation } = usePage<PageProps>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    // Admins switch these on or off in Admin → Settings
    const navLinks = [
        { key: 'courses', href: '/courses', label: t('nav.courses'), icon: BookOpen, iconColor: 'text-primary-500' },
        { key: 'books', href: '/books', label: t('nav.books'), icon: Library, iconColor: 'text-primary-500' },
        { key: 'exercises', href: '/exercises', label: t('nav.exercises'), icon: Terminal, iconColor: 'text-blue-500' },
        { key: 'quizzes', href: '/quizzes', label: t('nav.quizzes'), icon: HelpCircle, iconColor: 'text-purple-500' },
        { key: 'playground', href: '/playground', label: t('nav.playground'), icon: Code2, iconColor: 'text-amber-500' },
    ].filter((item) => navigation?.[item.key as keyof NavigationSettings] ?? true);

    return (
        <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-4 2xl:gap-6 min-w-0">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <img
                                src="/images/dynosures-logo.png"
                                alt="CodeMaster"
                                className="w-10 h-10 shrink-0 object-contain group-hover:scale-105 transition-transform"
                            />
                            <div className="flex flex-col whitespace-nowrap">
                                <span className="font-bold text-lg leading-tight tracking-tight text-neutral-900 dark:text-white">
                                    Code<span className="text-primary-500">Master</span>
                                </span>
                                <span className="hidden sm:block text-[10px] font-medium text-neutral-400 dark:text-neutral-500 -mt-0.5">
                                    EN &bull; ភាសាខ្មែរ
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden xl:flex items-center gap-0.5">
                            {navLinks.map((item) => (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    className="flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium whitespace-nowrap text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 transition-colors"
                                >
                                    <item.icon className={cn('hidden 2xl:block w-4 h-4 shrink-0', item.iconColor)} />
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right side items: Search, Language Switcher, Auth */}
                    <div className="flex items-center gap-2 2xl:gap-3 shrink-0">
                        {/* Search Link */}
                        <Link
                            href="/search"
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700/60 transition-colors w-40 md:w-56 xl:w-9 xl:h-9 xl:px-0 xl:justify-center 2xl:w-56 2xl:h-auto 2xl:px-3 2xl:justify-start"
                            aria-label={t('nav.search')}
                        >
                            <Search className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                            <span className="truncate xl:hidden 2xl:inline">{t('nav.search')}</span>
                        </Link>

                        {/* Theme and Language Switchers */}
                        <ThemeToggle className="hidden sm:flex" />
                        <LanguageSwitcher className="hidden sm:inline-block" />

                        {/* User Authentication Menu */}
                        {auth.user ? (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex items-center gap-2 p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-primary-600 text-white font-bold text-xs flex items-center justify-center">
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden md:inline text-xs font-semibold max-w-[100px] truncate text-neutral-800 dark:text-neutral-200">
                                        {auth.user.name}
                                    </span>
                                    <ChevronDown className="w-3 h-3 text-neutral-400 hidden md:inline" />
                                </button>

                                {userDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl py-1 z-50 animate-in fade-in-50 zoom-in-95">
                                        <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                                            <div className="font-semibold text-xs text-neutral-900 dark:text-white truncate">
                                                {auth.user.name}
                                            </div>
                                            <div className="text-[11px] text-neutral-400 truncate">
                                                {auth.user.email}
                                            </div>
                                        </div>

                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                            onClick={() => setUserDropdownOpen(false)}
                                        >
                                            <LayoutDashboard className="w-3.5 h-3.5 text-neutral-500" />
                                            <span>{t('nav.dashboard')}</span>
                                        </Link>

                                        <Link
                                            href="/bookmarks"
                                            className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                            onClick={() => setUserDropdownOpen(false)}
                                        >
                                            <Bookmark className="w-3.5 h-3.5 text-neutral-500" />
                                            <span>{t('nav.bookmarks')}</span>
                                        </Link>

                                        <Link
                                            href="/certificates"
                                            className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                            onClick={() => setUserDropdownOpen(false)}
                                        >
                                            <Award className="w-3.5 h-3.5 text-neutral-500" />
                                            <span>{t('nav.certificates')}</span>
                                        </Link>

                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                            onClick={() => setUserDropdownOpen(false)}
                                        >
                                            <UserIcon className="w-3.5 h-3.5 text-neutral-500" />
                                            <span>{t('nav.profile')}</span>
                                        </Link>

                                        {auth.user.isAdmin && (
                                            <Link
                                                href="/admin/dashboard"
                                                className="flex items-center gap-2 px-3 py-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 border-t border-neutral-100 dark:border-neutral-800"
                                                onClick={() => setUserDropdownOpen(false)}
                                            >
                                                <Shield className="w-3.5 h-3.5" />
                                                <span>{t('nav.admin')}</span>
                                            </Link>
                                        )}

                                        <div className="border-t border-neutral-100 dark:border-neutral-800 mt-1">
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
                            <div className="hidden sm:flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-3 py-1.5 whitespace-nowrap text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 transition-colors"
                                >
                                    {t('nav.login')}
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-3.5 py-1.5 whitespace-nowrap text-xs sm:text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-lg shadow-sm transition-all hover:scale-102"
                                >
                                    {t('nav.register')}
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="xl:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div className="xl:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 pt-3 pb-6 space-y-3">
                    {/* Theme and language live here on phones, where the top bar has no room for them */}
                    <div className="flex items-center gap-2 sm:hidden">
                        <ThemeToggle />
                        <LanguageSwitcher />
                    </div>

                    <Link
                        href="/search"
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Search className="w-4 h-4" />
                        <span>{t('nav.search')}</span>
                    </Link>

                    <div className="space-y-1">
                        {navLinks.map((item) => (
                            <Link
                                key={item.key}
                                href={item.href}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <item.icon className={cn('w-4 h-4', item.iconColor)} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    {!auth.user && (
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800 sm:hidden">
                            <Link
                                href="/login"
                                className="px-3 py-2 text-center rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-200"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t('nav.login')}
                            </Link>
                            <Link
                                href="/register"
                                className="px-3 py-2 text-center rounded-lg bg-primary-600 text-sm font-semibold text-white"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t('nav.register')}
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}

