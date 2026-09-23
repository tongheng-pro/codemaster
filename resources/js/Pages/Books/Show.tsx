import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import MonacoCodeEditor from '@/Components/MonacoCodeEditor';
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Search,
    MessageSquare,
    Sparkles,
    CheckCircle2,
    Copy,
    Check,
    AlertCircle,
    Info,
    HelpCircle,
    FileText,
    ExternalLink,
    X,
    Send,
    Play,
    RotateCcw,
    Bookmark,
    Layers,
    ListOrdered,
    Image as ImageIcon,
    Quote,
} from 'lucide-react';
import { cn } from '@/Utils';

interface ContentBlockData {
    id: number;
    type: string;
    content: string;
    page_number: number | null;
    metadata: Record<string, any> | null;
}

interface PdfPage {
    page_number: number;
    image_url: string;
}

interface SectionItem {
    id: number;
    section_number: string | null;
    slug: string;
    title: string;
    page_number: number | null;
}

interface ChapterItem {
    id: number;
    chapter_number: number;
    slug: string;
    title: string;
    start_page: number | null;
    sections: SectionItem[];
}

interface Citation {
    chapter: string;
    section: string;
    page: number;
    text: string;
}

interface Props {
    book: {
        id: number;
        slug: string;
        title: string;
        description?: string;
        author?: string;
        cover_image?: string;
        total_pages: number;
        first_read_url?: string;
        pdf_url?: string;
    };
    chapter?: {
        id: number;
        chapter_number: number;
        slug: string;
        title: string;
    };
    section?: {
        id: number;
        section_number: string | null;
        slug: string;
        title: string;
        page_number: number | null;
        content_blocks: ContentBlockData[];
        pdf_pages?: PdfPage[];
    };
    tableOfContents: ChapterItem[];
    prevSection?: { url: string; title: string; section_number: string | null } | null;
    nextSection?: { url: string; title: string; section_number: string | null } | null;
    readingProgress?: number;
    isReaderMode: boolean;
}

export default function Show({
    book,
    chapter,
    section,
    tableOfContents,
    prevSection,
    nextSection,
    readingProgress = 0,
    isReaderMode,
}: Props) {
    const { t, locale } = useTranslation();

    // Ask the Book state
    const [askModalOpen, setAskModalOpen] = useState(false);
    const [questionInput, setQuestionInput] = useState('');
    const [isAsking, setIsAsking] = useState(false);
    const [aiResponse, setAiResponse] = useState<{
        answer: string;
        citations: Citation[];
        grounded: boolean;
    } | null>(null);

    // In-book search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Interactive Code Example state
    const [editorCodes, setEditorCodes] = useState<Record<number, string>>({});
    const [copiedBlockId, setCopiedBlockId] = useState<number | null>(null);

    // Reader view: extracted text or original PDF page snapshots
    const [viewMode, setViewMode] = useState<'text' | 'pdf'>('text');

    // Keep the active section visible in the sidebar instead of resetting it to the top on every visit
    const tocContainerRef = useRef<HTMLDivElement>(null);
    const isTocVisible = searchQuery.trim().length < 2;

    useEffect(() => {
        const container = tocContainerRef.current;
        const activeItem = container?.querySelector<HTMLElement>('[data-active="true"]');
        if (!container || !activeItem) return;

        const offset = activeItem.getBoundingClientRect().top - container.getBoundingClientRect().top;
        container.scrollTop += offset - container.clientHeight / 2 + activeItem.clientHeight / 2;
    }, [section?.id, isTocVisible]);

    // Handle Ask the Book
    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!questionInput.trim() || isAsking) return;

        setIsAsking(true);
        try {
            const response = await fetch(`/books/${book.slug}/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ question: questionInput }),
            });

            if (response.ok) {
                const data = await response.json();
                setAiResponse(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsAsking(false);
        }
    };

    // Handle in-book search
    const handleInBookSearch = async (val: string) => {
        setSearchQuery(val);
        if (val.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetch(`/books/${book.slug}/search?q=${encodeURIComponent(val)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.results || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCopyCode = (blockId: number, code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedBlockId(blockId);
        setTimeout(() => setCopiedBlockId(null), 2000);
    };

    // Render Overview Mode if not inside specific section
    if (!isReaderMode || !section || !chapter) {
        return (
            <AppLayout title={book.title}>
                <Head title={book.title} />

                {/* Book Header Hero */}
                <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                            <div className="w-40 h-56 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 shadow-2xl flex flex-col items-center justify-center p-4 text-center text-white shrink-0">
                                <BookOpen className="w-12 h-12 mb-3 opacity-90" />
                                <span className="text-xs font-bold uppercase tracking-wider line-clamp-2">
                                    {book.title}
                                </span>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Verified Technical Book</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                                    {book.title}
                                </h1>
                                {book.author && (
                                    <p className="text-sm text-slate-400 mt-2">
                                        By <span className="text-slate-200 font-medium">{book.author}</span>
                                    </p>
                                )}
                                {book.description && (
                                    <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed max-w-3xl">
                                        {book.description}
                                    </p>
                                )}

                                <div className="mt-6 flex flex-wrap items-center gap-4 justify-center md:justify-start">
                                    {book.first_read_url ? (
                                        <Link
                                            href={book.first_read_url}
                                            className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 flex items-center gap-2 transition-all hover:scale-105"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            <span>{t('books.start_reading')}</span>
                                        </Link>
                                    ) : (
                                        <span className="text-xs text-slate-400">Chapters being compiled...</span>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setAskModalOpen(true)}
                                        className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 flex items-center gap-2 transition-colors"
                                    >
                                        <MessageSquare className="w-4 h-4 text-teal-400" />
                                        <span>{t('books.ask_book')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table of Contents Syllabus */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <ListOrdered className="w-6 h-6 text-teal-500" />
                        <span>{t('books.table_of_contents')}</span>
                    </h2>

                    <div className="space-y-4">
                        {tableOfContents.map((chap) => (
                            <div
                                key={chap.id}
                                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
                            >
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center">
                                            {chap.chapter_number}
                                        </span>
                                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                                            {chap.title}
                                        </h3>
                                    </div>
                                    {chap.start_page && (
                                        <span className="text-xs font-mono text-slate-400">
                                            Page {chap.start_page}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {chap.sections.map((sec) => (
                                        <Link
                                            key={sec.id}
                                            href={`/books/${book.slug}/${chap.slug}/${sec.slug}`}
                                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors group"
                                        >
                                            <div className="flex items-center gap-2">
                                                {sec.section_number && (
                                                    <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-semibold">
                                                        {sec.section_number}
                                                    </span>
                                                )}
                                                <span className="group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                                    {sec.title}
                                                </span>
                                            </div>
                                            {sec.page_number && (
                                                <span className="text-[11px] font-mono text-slate-400">
                                                    p.{sec.page_number}
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Render Ask the Book Modal */}
                {renderAskModal()}
            </AppLayout>
        );
    }

    // Render Full Reader Mode
    return (
        <AppLayout title={`${section.title} - ${book.title}`}>
            <Head title={`${section.title} - ${book.title}`} />

            {/* Reading Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 fixed top-16 left-0 z-30">
                <div
                    className="bg-teal-500 h-1 transition-all duration-300"
                    style={{ width: `${readingProgress}%` }}
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-8">
                {/* Left Sidebar: Table of Contents & In-Book Search */}
                <aside className="w-full lg:w-80 shrink-0">
                    <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm max-h-[calc(100vh-7rem)] flex flex-col">
                        {/* Book Header Link */}
                        <Link
                            href={`/books/${book.slug}`}
                            className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-teal-600 mb-3"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="truncate">{book.title}</span>
                        </Link>

                        {/* Search Input */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleInBookSearch(e.target.value)}
                                placeholder={t('books.search_in_book')}
                                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                            />
                        </div>

                        {/* Search Results if typing */}
                        {searchQuery.trim().length >= 2 ? (
                            <div className="overflow-y-auto flex-1 space-y-2 text-xs">
                                <div className="text-[11px] font-semibold text-slate-400 uppercase">
                                    Search Matches ({searchResults.length})
                                </div>
                                {isSearching ? (
                                    <div className="text-center py-4 text-slate-400">Searching book...</div>
                                ) : searchResults.length === 0 ? (
                                    <div className="text-center py-4 text-slate-400">No matches found.</div>
                                ) : (
                                    searchResults.map((res, i) => (
                                        <Link
                                            key={i}
                                            href={res.url}
                                            className="block p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700/60 transition-colors"
                                        >
                                            <div className="font-semibold text-teal-600 dark:text-teal-400">
                                                {res.section_title}
                                            </div>
                                            <div className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-2 mt-0.5">
                                                {res.content_snippet}
                                            </div>
                                            <div className="text-[10px] font-mono text-slate-400 mt-1">
                                                Page {res.page_number} &bull; {res.type}
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        ) : (
                            /* Normal TOC Tree */
                            <div ref={tocContainerRef} className="overflow-y-auto flex-1 space-y-4 pr-1">
                                {tableOfContents.map((chap) => (
                                    <div key={chap.id} className="space-y-1">
                                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between py-1">
                                            <span className="truncate">
                                                {chap.chapter_number}. {chap.title}
                                            </span>
                                        </div>
                                        <div className="space-y-0.5 pl-2 border-l border-slate-100 dark:border-slate-800">
                                            {chap.sections.map((sec) => {
                                                const isActive = sec.id === section.id;
                                                return (
                                                    <Link
                                                        key={sec.id}
                                                        data-active={isActive}
                                                        href={`/books/${book.slug}/${chap.slug}/${sec.slug}`}
                                                        className={cn(
                                                            'block px-2.5 py-1.5 rounded-lg text-xs transition-colors',
                                                            isActive
                                                                ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 font-semibold border-l-2 border-teal-500'
                                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="truncate">
                                                                {sec.section_number} {sec.title}
                                                            </span>
                                                            {sec.page_number && (
                                                                <span className="text-[10px] font-mono opacity-60 shrink-0 ml-1">
                                                                    p.{sec.page_number}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Ask the Book Quick Button */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setAskModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{t('books.ask_book')}</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Reading Column */}
                <main className="flex-1 max-w-3xl min-w-0">
                    {/* Header & Breadcrumb */}
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                            <div className="flex items-center gap-1.5 font-medium">
                                <Link href="/books" className="hover:text-teal-600">
                                    {t('books.title')}
                                </Link>
                                <span>&rsaquo;</span>
                                <Link href={`/books/${book.slug}`} className="hover:text-teal-600 truncate max-w-[150px]">
                                    {book.title}
                                </Link>
                                <span>&rsaquo;</span>
                                <span>Chapter {chapter.chapter_number}</span>
                            </div>

                            {section.page_number && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs font-semibold">
                                    <FileText className="w-3 h-3 text-teal-500" />
                                    <span>{t('books.page_ref')}: {section.page_number}</span>
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {section.section_number && (
                                <span className="text-teal-600 dark:text-teal-400 mr-2">
                                    {section.section_number}
                                </span>
                            )}
                            {section.title}
                        </h1>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                        <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setViewMode('text')}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors',
                                    viewMode === 'text'
                                        ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                )}
                            >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Text</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('pdf')}
                                disabled={!section.pdf_pages?.length}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                                    viewMode === 'pdf'
                                        ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                )}
                            >
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>PDF pages</span>
                            </button>
                        </div>

                        {book.pdf_url && (
                            <a
                                href={`${book.pdf_url}${section.page_number ? `#page=${section.page_number}` : ''}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Open original PDF</span>
                            </a>
                        )}
                    </div>

                    {viewMode === 'pdf' && section.pdf_pages?.length ? (
                        <div className="space-y-6">
                            {section.pdf_pages.map((page) => (
                                <figure
                                    key={page.page_number}
                                    className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white shadow-sm overflow-hidden"
                                >
                                    <img
                                        src={page.image_url}
                                        alt={`${book.title} - page ${page.page_number}`}
                                        loading="lazy"
                                        className="w-full h-auto"
                                    />
                                    <figcaption className="px-4 py-2 text-xs font-mono text-slate-500 bg-slate-50 dark:bg-slate-800 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
                                        Page {page.page_number}
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    ) : (
                        /* Content Blocks Stream */
                        <div className="space-y-6">
                            {section.content_blocks.map((block, index) => {
                                const previousPage = index > 0 ? section.content_blocks[index - 1].page_number : null;
                                const startsNewPage = index > 0 && block.page_number !== null && block.page_number !== previousPage;

                                return (
                                    <React.Fragment key={block.id}>
                                        {startsNewPage && (
                                            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                                                <span className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-700" />
                                                <span>p.{block.page_number}</span>
                                                <span className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-700" />
                                            </div>
                                        )}
                                        {renderContentBlock(block)}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination Footer */}
                    <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                        {prevSection ? (
                            <Link
                                href={prevSection.url}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="truncate max-w-[150px] sm:max-w-xs">{prevSection.title}</span>
                            </Link>
                        ) : <div />}

                        {nextSection && (
                            <Link
                                href={nextSection.url}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition-colors ml-auto"
                            >
                                <span className="truncate max-w-[150px] sm:max-w-xs">{nextSection.title}</span>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                </main>
            </div>

            {/* Grounded "Ask the Book" Modal */}
            {renderAskModal()}
        </AppLayout>
    );

    // Helper: Render individual content block according to semantic type
    function renderContentBlock(block: ContentBlockData) {
        const currentCode = editorCodes[block.id] !== undefined ? editorCodes[block.id] : block.content;
        const isCopied = copiedBlockId === block.id;

        switch (block.type) {
            case 'heading':
                return (
                    <h2 key={block.id} className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white pt-4">
                        {block.content}
                    </h2>
                );

            case 'subheading':
                return (
                    <h3 key={block.id} className="text-lg font-bold text-slate-800 dark:text-slate-100 pt-2">
                        {block.content}
                    </h3>
                );

            case 'definition':
                return (
                    <div
                        key={block.id}
                        className="p-4 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border-l-4 border-teal-500 text-slate-800 dark:text-slate-200 shadow-sm"
                    >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider mb-1">
                            <Info className="w-4 h-4" />
                            <span>Definition</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed">{block.content}</p>
                    </div>
                );

            case 'note':
                return (
                    <div
                        key={block.id}
                        className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-blue-500 text-slate-800 dark:text-slate-200 shadow-sm"
                    >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">
                            <Info className="w-4 h-4" />
                            <span>Note</span>
                        </div>
                        <p className="text-sm leading-relaxed">{block.content}</p>
                    </div>
                );

            case 'warning':
                return (
                    <div
                        key={block.id}
                        className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border-l-4 border-amber-500 text-slate-800 dark:text-slate-200 shadow-sm"
                    >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>Warning</span>
                        </div>
                        <p className="text-sm leading-relaxed">{block.content}</p>
                    </div>
                );

            case 'code':
            case 'example':
                const lang = block.metadata?.language || 'html';
                return (
                    <div
                        key={block.id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 overflow-hidden shadow-md my-4"
                    >
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/90 border-b border-slate-700/60 text-slate-300 text-xs">
                            <div className="flex items-center gap-2 font-mono">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                <span className="uppercase font-semibold ml-2 text-teal-400">{lang}</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleCopyCode(block.id, currentCode)}
                                className="flex items-center gap-1 hover:text-white px-2 py-1 rounded bg-slate-700/50 hover:bg-slate-700 transition-colors"
                            >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{isCopied ? t('common.copied') : t('common.copy')}</span>
                            </button>
                        </div>

                        <MonacoCodeEditor
                            value={currentCode}
                            language={lang}
                            onChange={(val) => setEditorCodes((prev) => ({ ...prev, [block.id]: val }))}
                            height={`${Math.min(Math.max(block.content.split('\n').length * 19 + 24, 80), 560)}px`}
                            readOnly={false}
                        />
                    </div>
                );

            case 'list':
                const ListTag = block.metadata?.ordered ? 'ol' : 'ul';
                return (
                    <ListTag
                        key={block.id}
                        className={cn(
                            'pl-6 space-y-1.5 text-base text-slate-700 dark:text-slate-300 leading-relaxed marker:text-teal-500',
                            block.metadata?.ordered ? 'list-decimal' : 'list-disc'
                        )}
                    >
                        {block.content.split('\n').map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ListTag>
                );

            case 'table':
                return (
                    <div
                        key={block.id}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 overflow-x-auto"
                    >
                        <pre className="p-4 text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-200 whitespace-pre">
                            {block.content}
                        </pre>
                    </div>
                );

            case 'quote':
                return (
                    <blockquote
                        key={block.id}
                        className="pl-4 border-l-4 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 italic leading-relaxed"
                    >
                        <Quote className="w-4 h-4 mb-1 text-slate-400" />
                        {block.content}
                    </blockquote>
                );

            case 'exercise':
                return (
                    <div
                        key={block.id}
                        className="p-5 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 dark:bg-slate-800/80 my-4"
                    >
                        <div className="flex items-center gap-2 font-bold text-sm text-emerald-600 dark:text-emerald-400 mb-2">
                            <HelpCircle className="w-4 h-4" />
                            <span>Exercise / Practice</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {block.content}
                        </p>
                    </div>
                );

            case 'summary':
                return (
                    <div
                        key={block.id}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 my-4"
                    >
                        <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white mb-2">
                            <CheckCircle2 className="w-4 h-4 text-teal-500" />
                            <span>Chapter / Section Summary</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {block.content}
                        </p>
                    </div>
                );

            case 'paragraph':
            default:
                return (
                    <p
                        key={block.id}
                        className="text-base text-slate-700 dark:text-slate-300 leading-relaxed"
                    >
                        {block.content}
                    </p>
                );
        }
    }

    // Modal: Grounded "Ask the Book" Q&A
    function renderAskModal() {
        if (!askModalOpen) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in-50">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                    {/* Modal Header */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                    {t('books.ask_book')}
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {t('books.grounded_notice')}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAskModalOpen(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Question Input Form */}
                    <form onSubmit={handleAskQuestion} className="p-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={questionInput}
                                onChange={(e) => setQuestionInput(e.target.value)}
                                placeholder={t('books.ask_placeholder')}
                                className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            <button
                                type="submit"
                                disabled={isAsking || !questionInput.trim()}
                                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{isAsking ? 'Thinking...' : t('books.ask_btn')}</span>
                            </button>
                        </div>
                    </form>

                    {/* Modal Body: Answer and Citations */}
                    <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
                        {isAsking ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                                <Sparkles className="w-8 h-8 text-teal-500 animate-spin" />
                                <span>Reading book pages and grounding answer...</span>
                            </div>
                        ) : aiResponse ? (
                            <div>
                                <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
                                    Grounded Answer
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                                    {aiResponse.answer}
                                </div>

                                {aiResponse.citations && aiResponse.citations.length > 0 && (
                                    <div className="mt-6">
                                        <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-teal-500" />
                                            <span>{t('books.citations')}</span>
                                        </div>
                                        <div className="space-y-2">
                                            {aiResponse.citations.map((cite, i) => (
                                                <div
                                                    key={i}
                                                    className="p-3 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/40 text-xs"
                                                >
                                                    <div className="flex items-center justify-between font-bold text-teal-700 dark:text-teal-400 mb-1">
                                                        <span>{cite.section}</span>
                                                        <span className="font-mono">Page {cite.page}</span>
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-400 italic">
                                                        "{cite.text}"
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-400 text-xs">
                                Enter a question to find answers directly from this book with exact page citations.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

