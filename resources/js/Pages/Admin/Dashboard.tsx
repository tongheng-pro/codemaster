import React from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import {
    Users,
    BookOpen,
    FileText,
    Terminal,
    HelpCircle,
    Award,
    TrendingUp,
    Shield,
    Library,
    Upload,
    Trash2,
} from 'lucide-react';

interface Props {
    stats: {
        total_users: number;
        total_students: number;
        total_courses: number;
        total_lessons: number;
        total_exercises: number;
        total_quizzes: number;
        total_exercise_attempts: number;
        total_quiz_attempts: number;
        total_certificates: number;
        total_books: number;
    };
    recentUsers: Array<{ id: number; name: string; email: string; role: string; created_at: string }>;
    recentCourses: Array<{ id: number; slug: string; is_published: boolean }>;
    recentBooks: Array<{
        id: number;
        title: string;
        status: string;
        processing_progress: number;
        total_pages: number;
        is_published: boolean;
    }>;
}

export default function Dashboard({ stats, recentUsers = [], recentBooks = [] }: Props) {
    const { t } = useTranslation();

    const handleDeleteBook = (bookId: number, title: string) => {
        if (confirm(`Permanently delete "${title}" with all its chapters, sections and page images?`)) {
            router.delete(`/admin/books/${bookId}`, { preserveScroll: true });
        }
    };

    const statCards = [
        { label: t('admin.total_users'), val: stats.total_users, icon: Users, color: 'text-blue-500' },
        { label: t('admin.total_courses'), val: stats.total_courses, icon: BookOpen, color: 'text-primary-500' },
        { label: t('admin.total_lessons'), val: stats.total_lessons, icon: FileText, color: 'text-purple-500' },
        { label: t('admin.manage_books'), val: stats.total_books, icon: Library, color: 'text-primary-500' },
        { label: 'Exercises', val: stats.total_exercises, icon: Terminal, color: 'text-amber-500' },
        { label: 'Quizzes', val: stats.total_quizzes, icon: HelpCircle, color: 'text-primary-500' },
        { label: 'Certificates Issued', val: stats.total_certificates, icon: Award, color: 'text-rose-500' },
    ];

    return (
        <AdminLayout title={t('admin.overview')}>
            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {statCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={idx}
                                className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <Icon className={`w-5 h-5 ${card.color}`} />
                                </div>
                                <div className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
                                    {card.val}
                                </div>
                                <div className="text-xs font-semibold text-neutral-400 truncate">
                                    {card.label}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Books: upload and delete */}
                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
                    <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-sm font-semibold text-neutral-800 dark:text-white flex items-center gap-2">
                            <Library className="w-4 h-4 text-primary-500" />
                            <span>{t('admin.manage_books')}</span>
                        </h2>
                        <div className="flex items-center gap-3">
                            <Link href="/admin/books" className="text-xs font-semibold text-primary-600 hover:underline">
                                View all
                            </Link>
                            <Link
                                href="/admin/books?upload=1"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload book</span>
                            </Link>
                        </div>
                    </div>

                    {recentBooks.length === 0 ? (
                        <div className="p-8 text-center text-xs text-neutral-400">No books yet. Upload a PDF to get started.</div>
                    ) : (
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {recentBooks.map((book) => (
                                <div key={book.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                                    <div className="min-w-0">
                                        <div className="font-semibold text-neutral-900 dark:text-white truncate">{book.title}</div>
                                        <div className="text-neutral-400 mt-0.5">
                                            {book.total_pages} pages &bull;{' '}
                                            {book.status === 'completed'
                                                ? book.is_published
                                                    ? 'Published'
                                                    : 'Draft'
                                                : `${book.status} ${book.processing_progress}%`}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Link
                                            href={`/admin/books/${book.id}/review`}
                                            className="px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-semibold transition-colors"
                                        >
                                            Review
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteBook(book.id, book.title)}
                                            className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                            aria-label={`Delete ${book.title}`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Users and Courses */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Users */}
                    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
                        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-neutral-800 dark:text-white flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" />
                                <span>Recent Users</span>
                            </h2>
                            <Link href="/admin/users" className="text-xs font-semibold text-primary-600 hover:underline">
                                View all
                            </Link>
                        </div>
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {recentUsers.map((u) => (
                                <div key={u.id} className="p-4 flex items-center justify-between text-xs">
                                    <div>
                                        <div className="font-bold text-neutral-900 dark:text-white">{u.name}</div>
                                        <div className="text-neutral-400">{u.email}</div>
                                    </div>
                                    <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                            u.role === 'admin'
                                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                                        }`}
                                    >
                                        {u.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Admin Actions */}
                    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-bold text-neutral-800 dark:text-white flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary-500" />
                            <span>Quick Management</span>
                        </h2>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Link
                                href="/admin/courses/create"
                                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-500 hover:bg-primary-50/30 dark:hover:bg-primary-950/20 text-xs font-semibold transition-colors space-y-1 block"
                            >
                                <div className="text-primary-600 dark:text-primary-400 font-bold">+ New Course</div>
                                <div className="text-neutral-400 text-[11px]">Add curriculum &amp; translations</div>
                            </Link>

                            <Link
                                href="/admin/lessons/create"
                                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-500 hover:bg-primary-50/30 dark:hover:bg-primary-950/20 text-xs font-semibold transition-colors space-y-1 block"
                            >
                                <div className="text-purple-600 dark:text-purple-400 font-bold">+ New Lesson</div>
                                <div className="text-neutral-400 text-[11px]">Add content blocks &amp; code</div>
                            </Link>

                            <Link
                                href="/admin/exercises/create"
                                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-500 hover:bg-primary-50/30 dark:hover:bg-primary-950/20 text-xs font-semibold transition-colors space-y-1 block"
                            >
                                <div className="text-blue-600 dark:text-blue-400 font-bold">+ New Exercise</div>
                                <div className="text-neutral-400 text-[11px]">Add test cases &amp; hints</div>
                            </Link>

                            <Link
                                href="/admin/quizzes/create"
                                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-500 hover:bg-primary-50/30 dark:hover:bg-primary-950/20 text-xs font-semibold transition-colors space-y-1 block"
                            >
                                <div className="text-primary-600 dark:text-primary-400 font-bold">+ New Quiz</div>
                                <div className="text-neutral-400 text-[11px]">Add questions &amp; answers</div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

