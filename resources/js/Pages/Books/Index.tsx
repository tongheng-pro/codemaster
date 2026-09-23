import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import {
    Library,
    BookOpen,
    Search,
    User as UserIcon,
    Layers,
    FileText,
    ArrowRight,
    Sparkles,
    CheckCircle2,
} from 'lucide-react';

interface BookItem {
    id: number;
    slug: string;
    title: string;
    description: string | null;
    author: string | null;
    cover_image: string | null;
    total_pages: number;
    chapters_count: number;
}

interface Props {
    books: BookItem[];
    filters: {
        search?: string;
    };
}

export default function Index({ books, filters }: Props) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/books', { search: searchQuery }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout title={t('books.title')}>
            <Head title={t('books.title')} />

            {/* Hero Section */}
            <div className="bg-gradient-to-b from-teal-500/10 via-slate-50 to-white dark:from-teal-950/20 dark:via-slate-900 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/60 text-xs font-semibold text-teal-700 dark:text-teal-300 mb-4">
                        <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                        <span>AI-Structured Books & References</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {t('books.title')}
                    </h1>
                    <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        {t('books.subtitle')}
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('search.placeholder')}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition-colors"
                        >
                            {t('nav.search_btn')}
                        </button>
                    </form>
                </div>
            </div>

            {/* Books Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {books.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <Library className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {t('books.no_books')}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {filters.search ? 'Try adjusting your search query.' : 'New books are currently being scanned and imported.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {books.map((book) => (
                            <div
                                key={book.id}
                                className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 flex flex-col justify-between hover:shadow-xl hover:border-teal-500/50 transition-all group"
                            >
                                <div>
                                    {/* Cover / Header Icon */}
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                            {book.total_pages} {t('books.page_ref')}s
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                                        {book.title}
                                    </h2>

                                    {book.author && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                                            <UserIcon className="w-3.5 h-3.5" />
                                            <span>{book.author}</span>
                                        </div>
                                    )}

                                    {book.description && (
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 line-clamp-3">
                                            {book.description}
                                        </p>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Layers className="w-3.5 h-3.5 text-teal-500" />
                                            <span>{book.chapters_count} {t('books.chapter')}s</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                            <span>Grounded AI Citations</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                                    <Link
                                        href={`/books/${book.slug}`}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm hover:shadow transition-all"
                                    >
                                        <span>{t('books.read_online')}</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

