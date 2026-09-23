import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import ThemeToggle from '@/Components/ThemeToggle';
import { PageProps } from '@/Types';
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    Terminal,
    HelpCircle,
    Users,
    Settings,
    Award,
    ArrowLeft,
    Menu,
    X,
    Library,
} from 'lucide-react';
import { cn } from '@/Utils';

interface Props {
    title: string;
    children: React.ReactNode;
}

export default function AdminLayout({ title, children }: Props) {
    const { t } = useTranslation();
    const { url } = usePage();
    const { auth } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { href: '/admin/dashboard', label: t('admin.overview'), icon: LayoutDashboard },
        { href: '/admin/courses', label: t('admin.manage_courses'), icon: BookOpen },
        { href: '/admin/books', label: t('admin.manage_books'), icon: Library },
        { href: '/admin/lessons', label: t('admin.manage_lessons'), icon: FileText },
        { href: '/admin/exercises', label: t('admin.manage_exercises'), icon: Terminal },
        { href: '/admin/quizzes', label: t('admin.manage_quizzes'), icon: HelpCircle },
        { href: '/admin/users', label: t('admin.manage_users'), icon: Users },
        { href: '/admin/certificates', label: t('admin.manage_certificates'), icon: Award },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950 font-sans">
            <Head title={`Admin: ${title}`} />

            {/* Sidebar Desktop & Mobile */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-64 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-r border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                        <img src="/images/dynosures-logo.png" alt="CodeMaster" className="w-8 h-8 object-contain" />
                        <div>
                            <div className="font-semibold text-sm text-neutral-900 dark:text-white">CodeMaster</div>
                            <div className="text-[10px] text-neutral-500 font-medium tracking-wider uppercase">
                                Admin Panel
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-3">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors mb-4"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Return to Main Site</span>
                    </Link>

                    <nav className="space-y-1 text-xs">
                        {navItems.map((item) => {
                            const isActive = url.startsWith(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        'flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors',
                                        isActive
                                            ? 'bg-primary-600 text-white'
                                            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 flex items-center justify-between">
                    <div>
                        <div className="text-neutral-900 dark:text-white font-medium truncate max-w-[120px]">
                            {auth.user?.name}
                        </div>
                        <div className="text-[10px] text-primary-400">Administrator</div>
                    </div>
                    <LanguageSwitcher />
                </div>
            </aside>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Admin Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-base sm:text-lg font-bold text-neutral-800 dark:text-white truncate">{title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <LanguageSwitcher />
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

