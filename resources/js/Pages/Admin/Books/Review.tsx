import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import {
    ArrowLeft,
    CheckCircle2,
    Globe,
    FileText,
    AlertTriangle,
    Check,
    Save,
    RotateCcw,
    Layers,
    Eye,
    Sparkles,
    Edit3,
    BookOpen,
} from 'lucide-react';
import { cn } from '@/Utils';

interface AdminBlock {
    id: number;
    type: string;
    sort_order: number;
    page_number: number | null;
    confidence: number;
    needs_review: boolean;
    metadata: Record<string, any> | null;
    en_content: string;
    km_content: string;
}

interface AdminSection {
    id: number;
    section_number: string | null;
    slug: string;
    page_number: number | null;
    status: string;
    en_title: string;
    km_title: string;
    blocks: AdminBlock[];
}

interface AdminChapter {
    id: number;
    chapter_number: number;
    slug: string;
    status: string;
    start_page: number | null;
    end_page: number | null;
    en_title: string;
    km_title: string;
    sections: AdminSection[];
}

interface AdminPage {
    id: number;
    page_number: number;
    extracted_text: string | null;
    ocr_text: string | null;
    page_image_url: string | null;
    is_scanned: boolean;
    confidence: number;
    needs_review: boolean;
}

interface Props {
    book: {
        id: number;
        slug: string;
        author: string | null;
        status: string;
        total_pages: number;
        is_published: boolean;
        en_title: string;
        km_title: string;
        en_description: string;
        km_description: string;
    };
    chapters: AdminChapter[];
    pages: AdminPage[];
}

export default function Review({ book, chapters, pages }: Props) {
    const { t } = useTranslation();

    const [selectedPageNum, setSelectedPageNum] = useState<number>(1);
    const [pageViewMode, setPageViewMode] = useState<'extracted' | 'ocr' | 'image'>('extracted');

    // Currently selected block for inline editing
    const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
    const [blockForm, setBlockForm] = useState<{
        type: string;
        en_content: string;
        km_content: string;
        needs_review: boolean;
    }>({
        type: 'paragraph',
        en_content: '',
        km_content: '',
        needs_review: false,
    });
    const [isSavingBlock, setIsSavingBlock] = useState(false);
    const [saveSuccessBlockId, setSaveSuccessBlockId] = useState<number | null>(null);

    const activePage = pages.find((p) => p.page_number === selectedPageNum) || pages[0];

    const handleSelectEditBlock = (block: AdminBlock) => {
        setEditingBlockId(block.id);
        setBlockForm({
            type: block.type,
            en_content: block.en_content,
            km_content: block.km_content,
            needs_review: block.needs_review,
        });
        if (block.page_number) {
            setSelectedPageNum(block.page_number);
        }
    };

    const handleSaveBlock = async (blockId: number) => {
        setIsSavingBlock(true);
        try {
            const res = await fetch(`/admin/books/${book.id}/blocks/${blockId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify(blockForm),
            });

            if (res.ok) {
                setSaveSuccessBlockId(blockId);
                setTimeout(() => setSaveSuccessBlockId(null), 2000);
                router.reload({ only: ['chapters'] });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSavingBlock(false);
        }
    };

    const handleTranslateSection = async (sectionId: number) => {
        const res = await fetch(`/admin/books/${book.id}/sections/${sectionId}/translate`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
        });
        const data = await res.json().catch(() => null);
        if (res.ok) {
            router.reload({ only: ['chapters'] });
        } else {
            alert(data?.message || 'Translation failed.');
        }
    };

    const handleTranslateBook = async () => {
        if (!confirm('Translate entire book to Khmer using AI?')) return;
        const res = await fetch(`/admin/books/${book.id}/translate`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
        });
        const data = await res.json().catch(() => null);
        alert(data?.message || (res.ok ? 'Translation started.' : 'Translation failed.'));
    };

    const handleTogglePublish = () => {
        router.post(`/admin/books/${book.id}/publish`, {}, { preserveScroll: true });
    };

    return (
        <AdminLayout title={`Review: ${book.en_title}`}>
            <Head title={`AI Review: ${book.en_title}`} />

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
                {/* Top Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm mb-6">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/books"
                            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-extrabold text-lg text-neutral-900 dark:text-white">
                                    {book.en_title}
                                </h1>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono">
                                    {book.total_pages} Pages
                                </span>
                            </div>
                            <div className="text-xs text-neutral-400">
                                Status: <span className="font-semibold text-primary-600 uppercase">{book.status}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleTranslateBook}
                            className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                            <Globe className="w-4 h-4 text-primary-500" />
                            <span>Translate Book to Khmer</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleTogglePublish}
                            className={cn(
                                'px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5',
                                book.is_published
                                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                            )}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{book.is_published ? t('books.unpublish_book') : t('books.publish_book')}</span>
                        </button>
                    </div>
                </div>

                {/* Split-Screen Review Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Pane: Original Page Text & OCR Viewer (5 Columns) */}
                    <div className="lg:col-span-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-4 sticky top-6">
                        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-3">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary-600" />
                                <span className="font-bold text-sm text-neutral-900 dark:text-white">
                                    Original Source Page
                                </span>
                            </div>

                            {/* Page Selector */}
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-neutral-500 font-medium">Page:</label>
                                <select
                                    value={selectedPageNum}
                                    onChange={(e) => setSelectedPageNum(Number(e.target.value))}
                                    className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono font-bold text-neutral-900 dark:text-white focus:outline-none"
                                >
                                    {pages.map((p) => (
                                        <option key={p.page_number} value={p.page_number}>
                                            Page {p.page_number} {p.is_scanned ? '(Scanned)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex gap-1 mb-3 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs">
                            <button
                                type="button"
                                onClick={() => setPageViewMode('extracted')}
                                className={cn(
                                    'flex-1 py-1 rounded-lg font-medium transition-colors',
                                    pageViewMode === 'extracted'
                                        ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-xs'
                                        : 'text-neutral-500 hover:text-neutral-900'
                                )}
                            >
                                Extracted Text
                            </button>
                            <button
                                type="button"
                                onClick={() => setPageViewMode('ocr')}
                                className={cn(
                                    'flex-1 py-1 rounded-lg font-medium transition-colors',
                                    pageViewMode === 'ocr'
                                        ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-xs'
                                        : 'text-neutral-500 hover:text-neutral-900'
                                )}
                            >
                                OCR Text
                            </button>
                            {activePage?.page_image_url && (
                                <button
                                    type="button"
                                    onClick={() => setPageViewMode('image')}
                                    className={cn(
                                        'flex-1 py-1 rounded-lg font-medium transition-colors',
                                        pageViewMode === 'image'
                                            ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-xs'
                                            : 'text-neutral-500 hover:text-neutral-900'
                                    )}
                                >
                                    Page Snapshot
                                </button>
                            )}
                        </div>

                        {/* Page Content Display */}
                        <div className="h-[calc(100vh-18rem)] overflow-y-auto rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-950 p-4 text-xs font-mono leading-relaxed">
                            {pageViewMode === 'image' && activePage?.page_image_url ? (
                                <img
                                    src={activePage.page_image_url}
                                    alt={`Page ${activePage.page_number}`}
                                    className="w-full rounded-lg shadow-sm"
                                />
                            ) : pageViewMode === 'ocr' ? (
                                <div className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                                    {activePage?.ocr_text || '(No separate OCR text; direct text extraction was clean)'}
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                                    {activePage?.extracted_text || '(Empty page content)'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Pane: Structured Chapters, Sections, & Content Blocks (7 Columns) */}
                    <div className="lg:col-span-7 space-y-6">
                        {chapters.length === 0 ? (
                            <div className="bg-white dark:bg-neutral-900 p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center text-neutral-400">
                                No chapters structured yet. Wait for processing to complete or click Reprocess.
                            </div>
                        ) : (
                            chapters.map((chap) => (
                                <div
                                    key={chap.id}
                                    className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6 space-y-6"
                                >
                                    {/* Chapter Header */}
                                    <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
                                        <div>
                                            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                                                Chapter {chap.chapter_number}
                                            </span>
                                            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                                {chap.en_title}
                                            </h2>
                                            {chap.km_title && (
                                                <div className="text-xs text-neutral-500 mt-0.5">
                                                    {chap.km_title}
                                                </div>
                                            )}
                                        </div>

                                        <span className="text-xs font-mono text-neutral-400">
                                            Pages {chap.start_page} &ndash; {chap.end_page}
                                        </span>
                                    </div>

                                    {/* Sections */}
                                    <div className="space-y-6">
                                        {chap.sections.map((sec) => (
                                            <div
                                                key={sec.id}
                                                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 p-4 space-y-4"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 mr-2 font-mono">
                                                            {sec.section_number}
                                                        </span>
                                                        <span className="font-bold text-sm text-neutral-900 dark:text-white">
                                                            {sec.en_title}
                                                        </span>
                                                        {sec.km_title && (
                                                            <div className="text-xs text-neutral-400 ml-6">
                                                                {sec.km_title}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {sec.page_number && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedPageNum(sec.page_number!)}
                                                                className="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600 hover:border-primary-500"
                                                            >
                                                                Page {sec.page_number}
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => handleTranslateSection(sec.id)}
                                                            className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                                                        >
                                                            <Globe className="w-3 h-3" />
                                                            <span>Translate</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Blocks Stream */}
                                                <div className="space-y-3 pt-2">
                                                    {sec.blocks.map((block) => {
                                                        const isEditing = editingBlockId === block.id;
                                                        const isSaved = saveSuccessBlockId === block.id;

                                                        return (
                                                            <div
                                                                key={block.id}
                                                                className={cn(
                                                                    'rounded-xl p-3 text-xs transition-all border',
                                                                    block.needs_review
                                                                        ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20'
                                                                        : 'border-neutral-200 dark:border-neutral-700/60 bg-white dark:bg-neutral-900'
                                                                )}
                                                            >
                                                                {/* Block Meta & Type Header */}
                                                                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-neutral-100 dark:border-neutral-800">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-mono uppercase font-bold text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-primary-600 dark:text-primary-400">
                                                                            {block.type}
                                                                        </span>
                                                                        {block.page_number && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setSelectedPageNum(block.page_number!)}
                                                                                className="font-mono text-[10px] text-neutral-400 hover:text-primary-600"
                                                                            >
                                                                                p.{block.page_number}
                                                                            </button>
                                                                        )}
                                                                        {block.needs_review && (
                                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                                                                <AlertTriangle className="w-3 h-3" />
                                                                                <span>Needs Review</span>
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSelectEditBlock(block)}
                                                                        className="text-neutral-400 hover:text-primary-600 flex items-center gap-1 text-[11px]"
                                                                    >
                                                                        <Edit3 className="w-3 h-3" />
                                                                        <span>{isEditing ? 'Editing' : 'Edit'}</span>
                                                                    </button>
                                                                </div>

                                                                {/* Edit Mode */}
                                                                {isEditing ? (
                                                                    <div className="space-y-3 pt-1">
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <div>
                                                                                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                                                                                    Type
                                                                                </label>
                                                                                <select
                                                                                    value={blockForm.type}
                                                                                    onChange={(e) => setBlockForm({ ...blockForm, type: e.target.value })}
                                                                                    className="w-full px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white"
                                                                                >
                                                                                    <option value="paragraph">Paragraph</option>
                                                                                    <option value="heading">Heading</option>
                                                                                    <option value="subheading">Subheading</option>
                                                                                    <option value="code">Code / Example</option>
                                                                                    <option value="definition">Definition</option>
                                                                                    <option value="note">Note</option>
                                                                                    <option value="warning">Warning</option>
                                                                                    <option value="table">Table</option>
                                                                                    <option value="exercise">Exercise</option>
                                                                                    <option value="summary">Summary</option>
                                                                                </select>
                                                                            </div>

                                                                            <div className="flex items-center gap-2 pt-4">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    id={`nr_${block.id}`}
                                                                                    checked={blockForm.needs_review}
                                                                                    onChange={(e) => setBlockForm({ ...blockForm, needs_review: e.target.checked })}
                                                                                    className="rounded text-primary-600"
                                                                                />
                                                                                <label htmlFor={`nr_${block.id}`} className="text-xs text-neutral-600 dark:text-neutral-400">
                                                                                    Needs manual review
                                                                                </label>
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                                                                                English Content
                                                                            </label>
                                                                            <textarea
                                                                                rows={3}
                                                                                value={blockForm.en_content}
                                                                                onChange={(e) => setBlockForm({ ...blockForm, en_content: e.target.value })}
                                                                                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white font-mono"
                                                                            />
                                                                        </div>

                                                                        <div>
                                                                            <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                                                                                Khmer Translation
                                                                            </label>
                                                                            <textarea
                                                                                rows={3}
                                                                                value={blockForm.km_content}
                                                                                onChange={(e) => setBlockForm({ ...blockForm, km_content: e.target.value })}
                                                                                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white"
                                                                            />
                                                                        </div>

                                                                        <div className="flex justify-end gap-2 pt-1">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setEditingBlockId(null)}
                                                                                className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 text-xs"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                disabled={isSavingBlock}
                                                                                onClick={() => handleSaveBlock(block.id)}
                                                                                className="px-3 py-1 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs flex items-center gap-1 shadow-sm"
                                                                            >
                                                                                <Save className="w-3 h-3" />
                                                                                <span>{isSavingBlock ? 'Saving...' : 'Save Block'}</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    /* Preview Mode */
                                                                    <div className="space-y-1.5">
                                                                        <div className="text-neutral-800 dark:text-neutral-200 font-sans whitespace-pre-line leading-relaxed">
                                                                            {block.en_content}
                                                                        </div>
                                                                        {block.km_content && (
                                                                            <div className="text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800 pt-1 text-[11px] leading-relaxed">
                                                                                {block.km_content}
                                                                            </div>
                                                                        )}
                                                                        {isSaved && (
                                                                            <div className="text-[10px] text-primary-500 flex items-center gap-1">
                                                                                <Check className="w-3 h-3" />
                                                                                <span>Saved successfully</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

