import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import {
    Library,
    Upload,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    RotateCcw,
    Trash2,
    X,
    Sparkles,
    Globe,
    Layers,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/Utils';

interface AdminBook {
    id: number;
    slug: string;
    title: string;
    author: string | null;
    status: string;
    processing_progress: number;
    current_step: string | null;
    error_message: string | null;
    total_pages: number;
    chapters_count: number;
    is_published: boolean;
    created_at: string;
}

interface Props {
    books: AdminBook[];
}

export default function Index({ books: initialBooks }: Props) {
    const { t } = useTranslation();
    const [books, setBooks] = useState<AdminBook[]>(initialBooks);
    // Open the upload form straight away when arriving from the dashboard's "Upload book" button
    const [uploadModalOpen, setUploadModalOpen] = useState(
        () => new URLSearchParams(window.location.search).get('upload') === '1'
    );

    // Sync state with props
    useEffect(() => {
        setBooks(initialBooks);
    }, [initialBooks]);

    // Poll status for any book currently in progress
    useEffect(() => {
        const hasProcessing = books.some((b) => !['completed', 'failed'].includes(b.status));
        if (!hasProcessing) return;

        const interval = setInterval(() => {
            router.reload({ only: ['books'] });
        }, 3000);

        return () => clearInterval(interval);
    }, [books]);

    // Upload Form
    const { data, setData, post, processing, errors, reset, progress } = useForm({
        title: '',
        author: '',
        description: '',
        original_language: 'en',
        pdf_file: null as File | null,
        cover_image: null as File | null,
        auto_translate: true,
    });

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/books', {
            onSuccess: () => {
                reset();
                setUploadModalOpen(false);
            },
        });
    };

    const handleTogglePublish = (bookId: number) => {
        router.post(`/admin/books/${bookId}/publish`, {}, { preserveScroll: true });
    };

    const handleReprocess = (bookId: number) => {
        if (confirm('Are you sure you want to reprocess this book?')) {
            router.post(`/admin/books/${bookId}/reprocess`, {}, { preserveScroll: true });
        }
    };

    const handleDelete = (bookId: number) => {
        if (confirm('Are you sure you want to permanently delete this book and its chapters?')) {
            router.delete(`/admin/books/${bookId}`);
        }
    };

    return (
        <AdminLayout title={t('admin.manage_books')}>
            <Head title={`Admin: ${t('admin.manage_books')}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2.5">
                            <Library className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                            <span>{t('admin.manage_books')}</span>
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            Upload PDF books, inspect OCR/text extraction, review AI chapters, and publish online.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setUploadModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm flex items-center gap-2 transition-colors self-start sm:self-auto"
                    >
                        <Upload className="w-4 h-4" />
                        <span>{t('books.upload_pdf')}</span>
                    </button>
                </div>

                {/* Books List Table */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                    {books.length === 0 ? (
                        <div className="text-center py-16">
                            <Library className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
                            <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                                No books uploaded yet
                            </h3>
                            <p className="text-sm text-neutral-500 mt-1">
                                Click "Upload PDF Book" to import and structure your first book with AI.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
                                <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                                    <tr>
                                        <th className="px-6 py-4">Book Title / Author</th>
                                        <th className="hidden md:table-cell px-6 py-4">Pages / Chapters</th>
                                        <th className="px-6 py-4">AI Processing Status</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {books.map((b) => {
                                        const isProcessing = !['completed', 'failed'].includes(b.status);
                                        return (
                                            <tr key={b.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-neutral-900 dark:text-white">
                                                        {b.title}
                                                    </div>
                                                    <div className="text-xs text-neutral-400 mt-0.5">
                                                        {b.author || 'Author unspecified'} &bull; {b.created_at}
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell px-6 py-4">
                                                    <div className="flex items-center gap-3 text-xs font-mono">
                                                        <span>{b.total_pages} pages</span>
                                                        <span>&bull;</span>
                                                        <span>{b.chapters_count} chapters</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 max-w-xs">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="font-semibold uppercase tracking-wider text-[10px] text-primary-600 dark:text-primary-400">
                                                                {b.status.replace('_', ' ')}
                                                            </span>
                                                            <span className="font-mono text-neutral-400">
                                                                {b.processing_progress}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className={cn(
                                                                    'h-1.5 rounded-full transition-all duration-300',
                                                                    b.status === 'failed'
                                                                        ? 'bg-rose-500'
                                                                        : b.status === 'completed'
                                                                        ? 'bg-primary-500'
                                                                        : 'bg-primary-500 animate-pulse'
                                                                )}
                                                                style={{ width: `${b.processing_progress}%` }}
                                                            />
                                                        </div>
                                                        {b.current_step && (
                                                            <div className="text-[11px] text-neutral-500 truncate" title={b.current_step}>
                                                                {b.current_step}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleTogglePublish(b.id)}
                                                        title={b.is_published ? 'Click to unpublish (hide from website)' : 'Click to publish on the website'}
                                                        className={cn(
                                                            'px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer',
                                                            b.is_published
                                                                ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/60'
                                                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-200 dark:border-neutral-700 hover:bg-primary-600 hover:text-white hover:border-primary-600'
                                                        )}
                                                    >
                                                        {b.is_published ? (
                                                            <>
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                <span>Published</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock className="w-3 h-3" />
                                                                <span>Draft &middot; Publish</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/admin/books/${b.id}/review`}
                                                            className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/50 hover:bg-primary-100 text-primary-600 dark:text-primary-400 text-xs font-semibold flex items-center gap-1 border border-primary-200/60 dark:border-primary-800/60 transition-colors"
                                                            title={t('books.review_workspace')}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            <span>Review</span>
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleReprocess(b.id)}
                                                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors"
                                                            title={t('books.reprocess')}
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(b.id)}
                                                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                                            title="Delete Book"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {uploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in-50">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                            <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                                <Upload className="w-4 h-4 text-primary-600" />
                                <span>{t('books.upload_pdf')}</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setUploadModalOpen(false)}
                                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-sm">
                            <div>
                                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                                    Book Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. HTML5 Notes for Professionals"
                                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                                {errors.title && <div className="text-xs text-rose-500 mt-1">{errors.title}</div>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                                        Author
                                    </label>
                                    <input
                                        type="text"
                                        value={data.author}
                                        onChange={(e) => setData('author', e.target.value)}
                                        placeholder="e.g. Stack Overflow Contributors"
                                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                                        Original Language
                                    </label>
                                    <select
                                        value={data.original_language}
                                        onChange={(e) => setData('original_language', e.target.value)}
                                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    >
                                        <option value="en">English (en)</option>
                                        <option value="km">Khmer (km)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                                    Description / Summary
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief book overview..."
                                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                                    PDF File * (Max: 150MB)
                                </label>
                                <input
                                    type="file"
                                    required
                                    accept="application/pdf"
                                    onChange={(e) => setData('pdf_file', e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-950 dark:file:text-primary-300"
                                />
                                {errors.pdf_file && <div className="text-xs text-rose-500 mt-1">{errors.pdf_file}</div>}
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="auto_translate"
                                    checked={data.auto_translate}
                                    onChange={(e) => setData('auto_translate', e.target.checked)}
                                    className="rounded text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="auto_translate" className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                                    Auto-translate extracted chapters & sections to Khmer (KM)
                                </label>
                            </div>

                            {progress && (
                                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-primary-600 h-2" style={{ width: `${progress.percentage}%` }} />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setUploadModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors"
                                >
                                    {processing ? 'Uploading...' : 'Start Import & AI Extraction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

