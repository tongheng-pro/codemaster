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
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                        {t('books.title')}
                    </h1>
                    <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        {t('books.subtitle')}
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('search.placeholder')}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-colors"
                        >
                            {t('nav.search_btn')}
                        </button>
                    </form>
                </div>
            </div>

            {/* Books Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {books.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                        <Library className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                            {t('books.no_books')}
                        </h3>
                        <p className="text-sm text-neutral-500 mt-1">
                            {filters.search ? 'Try adjusting your search query.' : 'New books are currently being scanned and imported.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {books.map((book, aosIndex) => (
                            <div
                                key={book.id}
                                data-aos="fade-up"
                                data-aos-delay={(aosIndex % 3) * 80}
                                className="bg-white dark:bg-neutral-800/80 rounded-2xl border border-neutral-200 dark:border-neutral-700/60 p-6 flex flex-col justify-between hover:shadow-xl hover:border-primary-500/50 transition-all group"
                            >
                                <div>
                                    {/* Cover / Header Icon */}
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        {book.cover_image ? (
                                            <img
                                                src={book.cover_image}
                                                alt={`${book.title} cover`}
                                                loading="lazy"
                                                className="w-16 h-[5.5rem] rounded-lg object-cover bg-white shadow-md group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <div className="bg-primary-500 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                                                <BookOpen className="w-6 h-6" />
                                            </div>
                                        )}
                                        <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                                            {book.total_pages} {t('books.page_ref')}s
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                                        {book.title}
                                    </h2>

                                    {book.author && (
                                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-2">
                                            <UserIcon className="w-3.5 h-3.5" />
                                            <span>{book.author}</span>
                                        </div>
                                    )}

                                    {book.description && (
                                        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-3 line-clamp-3">
                                            {book.description}
                                        </p>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                                        <div className="flex items-center gap-1">
                                            <Layers className="w-3.5 h-3.5 text-primary-500" />
                                            <span>{book.chapters_count} {t('books.chapter')}s</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                            <span>Grounded AI Citations</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-700/60">
                                    <Link
                                        href={`/books/${book.slug}`}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-sm hover:shadow transition-all"
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

