import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { PageProps } from '@/Types';
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    Terminal,
    HelpCircle,
    Users,
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
    ];

    return (
        <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 font-sans">
            <Head title={`Admin: ${title}`} />

            {/* Sidebar Desktop & Mobile */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="p-4 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <img src="/images/dynosure-logo.png" alt="CodeMaster" className="w-8 h-8 rounded-lg bg-white object-cover" />
                        <div>
                            <div className="font-bold text-sm text-white">CodeMaster</div>
                            <div className="text-[10px] text-amber-400 font-mono tracking-wider uppercase">
                                Admin Panel
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-3">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors mb-4"
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
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                    <div>
                        <div className="text-white font-medium truncate max-w-[120px]">
                            {auth.user?.name}
                        </div>
                        <div className="text-[10px] text-emerald-400">Administrator</div>
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
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
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

