<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookPage;
use App\Models\BookQuery;
use App\Models\ContentBlock;
use App\Models\Section;
use App\Services\AI\AIServiceManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BookReaderController extends Controller
{
    public function __construct(
        protected AIServiceManager $aiManager
    ) {}

    /**
     * Display public catalog of books.
     */
    public function index(Request $request): Response
    {
        $locale = app()->getLocale();
        $query = Book::where('is_published', true)->with(['translations']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('translations', function ($t) use ($search) {
                    $t->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                })->orWhere('author', 'like', "%{$search}%");
            });
        }

        $books = $query->orderBy('created_at', 'desc')->get()->map(function ($book) use ($locale) {
            return [
                'id' => $book->id,
                'slug' => $book->slug,
                'title' => $book->getTranslated('title', $locale),
                'description' => $book->getTranslated('description', $locale),
                'author' => $book->author,
                'cover_image' => $book->cover_image ? asset($book->cover_image) : null,
                'total_pages' => $book->total_pages,
                'chapters_count' => $book->chapters()->where('status', 'published')->count(),
            ];
        });

        return Inertia::render('Books/Index', [
            'books' => $books,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    /**
     * Display single book syllabus and table of contents.
     */
    public function show(Request $request, string $slug): Response
    {
        $locale = app()->getLocale();

        $book = Book::where('slug', $slug)
            ->where('is_published', true)
            ->with([
                'translations',
                'chapters' => fn ($q) => $q->where('status', 'published')->orderBy('sort_order'),
                'chapters.translations',
                'chapters.sections' => fn ($q) => $q->where('status', 'published')->orderBy('sort_order'),
                'chapters.sections.translations',
            ])
            ->firstOrFail();

        $firstChapter = $book->chapters->first();
        $firstSection = $firstChapter?->sections->first();

        $toc = $book->chapters->map(function ($chapter) use ($locale) {
            return [
                'id' => $chapter->id,
                'chapter_number' => $chapter->chapter_number,
                'slug' => $chapter->slug,
                'title' => $chapter->getTranslated('title', $locale),
                'start_page' => $chapter->start_page,
                'sections' => $chapter->sections->map(function ($section) use ($locale) {
                    return [
                        'id' => $section->id,
                        'section_number' => $section->section_number,
                        'slug' => $section->slug,
                        'title' => $section->getTranslated('title', $locale),
                        'page_number' => $section->page_number,
                    ];
                }),
            ];
        });

        return Inertia::render('Books/Show', [
            'book' => [
                'id' => $book->id,
                'slug' => $book->slug,
                'title' => $book->getTranslated('title', $locale),
                'description' => $book->getTranslated('description', $locale),
                'author' => $book->author,
                'cover_image' => $book->cover_image ? asset($book->cover_image) : null,
                'total_pages' => $book->total_pages,
                'first_read_url' => ($firstChapter && $firstSection) ? "/books/{$book->slug}/{$firstChapter->slug}/{$firstSection->slug}" : null,
            ],
            'tableOfContents' => $toc,
            'isReaderMode' => false,
        ]);
    }

    /**
     * Display dedicated section reader.
     */
    public function read(Request $request, string $bookSlug, string $chapterSlug, string $sectionSlug): Response
    {
        $locale = app()->getLocale();

        $book = Book::where('slug', $bookSlug)
            ->where('is_published', true)
            ->with([
                'translations',
                'chapters' => fn ($q) => $q->where('status', 'published')->orderBy('sort_order'),
                'chapters.translations',
                'chapters.sections' => fn ($q) => $q->where('status', 'published')->orderBy('sort_order'),
                'chapters.sections.translations',
            ])
            ->firstOrFail();

        $chapter = $book->chapters->firstWhere('slug', $chapterSlug);
        if (! $chapter) {
            abort(404, 'Chapter not found.');
        }

        $section = $chapter->sections()->where('slug', $sectionSlug)->where('status', 'published')->with([
            'translations',
            'contentBlocks' => fn ($q) => $q->orderBy('sort_order'),
            'contentBlocks.translations',
        ])->firstOrFail();

        // Calculate all sections in reading order to find prev/next
        $allSections = [];
        foreach ($book->chapters as $c) {
            foreach ($c->sections as $s) {
                $allSections[] = [
                    'chapter_slug' => $c->slug,
                    'section_slug' => $s->slug,
                    'title' => $s->getTranslated('title', $locale),
                    'section_number' => $s->section_number,
                ];
            }
        }

        $currentIndex = -1;
        foreach ($allSections as $idx => $s) {
            if ($s['chapter_slug'] === $chapter->slug && $s['section_slug'] === $section->slug) {
                $currentIndex = $idx;
                break;
            }
        }

        $prevSection = ($currentIndex > 0) ? $allSections[$currentIndex - 1] : null;
        $nextSection = ($currentIndex >= 0 && $currentIndex < count($allSections) - 1) ? $allSections[$currentIndex + 1] : null;

        $readingProgress = count($allSections) > 0 ? (int) round((($currentIndex + 1) / count($allSections)) * 100) : 0;

        $contentBlocks = $section->contentBlocks->map(function ($block) use ($locale) {
            return [
                'id' => $block->id,
                'type' => $block->type,
                'content' => $block->getTranslated('content', $locale),
                'page_number' => $block->page_number,
                'metadata' => $block->metadata,
            ];
        });

        $sectionPageNumbers = $section->contentBlocks->pluck('page_number')->push($section->page_number)->filter();
        $pdfPages = $sectionPageNumbers->isEmpty() ? collect() : BookPage::where('book_id', $book->id)
            ->whereBetween('page_number', [$sectionPageNumbers->min(), $sectionPageNumbers->max()])
            ->whereNotNull('page_image_path')
            ->orderBy('page_number')
            ->get(['page_number', 'page_image_path'])
            ->map(fn (BookPage $page) => [
                'page_number' => $page->page_number,
                'image_url' => Storage::disk('public')->url($page->page_image_path),
            ]);

        $toc = $book->chapters->map(function ($chap) use ($locale) {
            return [
                'id' => $chap->id,
                'chapter_number' => $chap->chapter_number,
                'slug' => $chap->slug,
                'title' => $chap->getTranslated('title', $locale),
                'sections' => $chap->sections->map(function ($sec) use ($locale) {
                    return [
                        'id' => $sec->id,
                        'section_number' => $sec->section_number,
                        'slug' => $sec->slug,
                        'title' => $sec->getTranslated('title', $locale),
                        'page_number' => $sec->page_number,
                    ];
                }),
            ];
        });

        return Inertia::render('Books/Show', [
            'book' => [
                'id' => $book->id,
                'slug' => $book->slug,
                'title' => $book->getTranslated('title', $locale),
                'author' => $book->author,
                'total_pages' => $book->total_pages,
                'pdf_url' => route('books.pdf', $book->slug),
            ],
            'chapter' => [
                'id' => $chapter->id,
                'chapter_number' => $chapter->chapter_number,
                'slug' => $chapter->slug,
                'title' => $chapter->getTranslated('title', $locale),
            ],
            'section' => [
                'id' => $section->id,
                'section_number' => $section->section_number,
                'slug' => $section->slug,
                'title' => $section->getTranslated('title', $locale),
                'page_number' => $section->page_number,
                'content_blocks' => $contentBlocks,
                'pdf_pages' => $pdfPages,
            ],
            'tableOfContents' => $toc,
            'prevSection' => $prevSection ? [
                'url' => "/books/{$book->slug}/{$prevSection['chapter_slug']}/{$prevSection['section_slug']}",
                'title' => $prevSection['title'],
                'section_number' => $prevSection['section_number'],
            ] : null,
            'nextSection' => $nextSection ? [
                'url' => "/books/{$book->slug}/{$nextSection['chapter_slug']}/{$nextSection['section_slug']}",
                'title' => $nextSection['title'],
                'section_number' => $nextSection['section_number'],
            ] : null,
            'readingProgress' => $readingProgress,
            'isReaderMode' => true,
        ]);
    }

    /**
     * Stream the original PDF so readers can open the source pages.
     */
    public function pdf(string $slug): BinaryFileResponse
    {
        $book = Book::where('slug', $slug)->where('is_published', true)->firstOrFail();

        abort_unless(Storage::disk('local')->exists($book->original_pdf_path), 404);

        return response()->file(Storage::disk('local')->path($book->original_pdf_path), [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$book->slug.'.pdf"',
        ]);
    }

    /**
     * Search within a book across chapters, sections, and content blocks.
     */
    public function search(Request $request, string $slug): JsonResponse
    {
        $q = trim($request->input('q', ''));
        if (mb_strlen($q) < 2) {
            return response()->json(['results' => []]);
        }

        $locale = app()->getLocale();
        $book = Book::where('slug', $slug)->firstOrFail();

        $matchingBlocks = ContentBlock::whereHas('section.chapter', fn ($query) => $query->where('book_id', $book->id))
            ->whereHas('translations', function ($t) use ($q, $locale) {
                $t->whereIn('locale', [$locale, 'en'])->where('content', 'like', "%{$q}%");
            })
            ->with(['section.chapter.translations', 'section.translations', 'translations'])
            ->limit(15)
            ->get()
            ->map(function ($block) use ($locale, $book) {
                $section = $block->section;
                $chapter = $section->chapter;

                return [
                    'chapter_title' => "Chapter {$chapter->chapter_number}: ".$chapter->getTranslated('title', $locale),
                    'section_title' => ($section->section_number ? "Section {$section->section_number}: " : '').$section->getTranslated('title', $locale),
                    'page_number' => $block->page_number ?: $section->page_number,
                    'type' => $block->type,
                    'content_snippet' => Str::limit(strip_tags($block->getTranslated('content', $locale)), 140),
                    'url' => "/books/{$book->slug}/{$chapter->slug}/{$section->slug}",
                ];
            });

        return response()->json([
            'results' => $matchingBlocks,
        ]);
    }

    /**
     * Grounded "Ask the Book" Q&A feature.
     */
    public function ask(Request $request, string $slug): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'min:3', 'max:500'],
        ]);

        $book = Book::where('slug', $slug)->firstOrFail();
        $locale = app()->getLocale();

        $response = $this->aiManager->askQuestion($book, $validated['question'], $locale);

        // Store query in book_queries
        BookQuery::create([
            'book_id' => $book->id,
            'user_id' => $request->user()?->id,
            'question' => $validated['question'],
            'answer' => $response['answer'],
            'citations' => $response['citations'],
            'locale' => $locale,
        ]);

        return response()->json($response);
    }
}
