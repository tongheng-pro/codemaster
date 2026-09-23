<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessBookJob;
use App\Jobs\TranslateBookJob;
use App\Models\Book;
use App\Models\BookTranslation;
use App\Models\ContentBlock;
use App\Models\Section;
use App\Services\PDF\BookImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminBookController extends Controller
{
    public function __construct(
        protected BookImportService $importService
    ) {}

    /**
     * Display list of uploaded books in admin panel.
     */
    public function index(Request $request): Response
    {
        $books = Book::with(['translations'])
            ->withCount(['chapters', 'pages'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($book) {
                return [
                    'id' => $book->id,
                    'slug' => $book->slug,
                    'title' => $book->getTranslated('title', 'en') ?: $book->slug,
                    'author' => $book->author,
                    'status' => $book->status,
                    'processing_progress' => $book->processing_progress,
                    'current_step' => $book->current_step,
                    'error_message' => $book->error_message,
                    'total_pages' => $book->total_pages,
                    'chapters_count' => $book->chapters_count,
                    'is_published' => (bool) $book->is_published,
                    'created_at' => $book->created_at->format('M d, Y H:i'),
                ];
            });

        return Inertia::render('Admin/Books/Index', [
            'books' => $books,
        ]);
    }

    /**
     * Store and upload a new PDF book, dispatching background extraction and AI structuring.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'author' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'original_language' => ['required', 'string', 'in:en,km'],
            'cover_image' => ['nullable', 'image', 'max:5120'], // 5MB
            'pdf_file' => ['required', 'file', 'mimes:pdf', 'max:153600'], // 150MB
            'auto_translate' => ['nullable', 'boolean'],
        ]);

        $slug = Str::slug($validated['title']);
        $uniqueSlug = $slug;
        $counter = 1;
        while (Book::where('slug', $uniqueSlug)->exists()) {
            $uniqueSlug = "{$slug}-{$counter}";
            $counter++;
        }

        // Store PDF in private storage
        $pdfPath = $request->file('pdf_file')->store('books/originals', 'local');

        // Store cover image if present
        $coverPath = null;
        if ($request->hasFile('cover_image')) {
            $coverPath = 'storage/'.$request->file('cover_image')->store('books/covers', 'public');
        }

        $book = Book::create([
            'slug' => $uniqueSlug,
            'author' => $validated['author'] ?? null,
            'original_language' => $validated['original_language'],
            'cover_image' => $coverPath,
            'original_pdf_path' => $pdfPath,
            'status' => 'uploaded',
            'processing_progress' => 0,
            'current_step' => 'File uploaded. Queued for AI processing...',
            'is_published' => false,
        ]);

        BookTranslation::create([
            'book_id' => $book->id,
            'locale' => 'en',
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
        ]);

        // Dispatch background processing job
        $autoTranslate = (bool) ($validated['auto_translate'] ?? true);
        ProcessBookJob::dispatch($book, $autoTranslate);

        return redirect()->route('admin.books.index')->with('success', "Book '{$book->getTranslated('title', 'en')}' uploaded successfully! Processing started in background.");
    }

    /**
     * Poll book processing status and progress.
     */
    public function status(Book $book): JsonResponse
    {
        return response()->json([
            'status' => $book->status,
            'processing_progress' => $book->processing_progress,
            'current_step' => $book->current_step,
            'error_message' => $book->error_message,
            'total_pages' => $book->total_pages,
            'processed_pages' => $book->processed_pages,
        ]);
    }

    /**
     * Admin review workspace with split-screen view:
     * Left: Original PDF page text / OCR text
     * Right: Hierarchical Chapters, Sections, and Content Blocks with confidence alerts
     */
    public function review(Request $request, Book $book): Response
    {
        $book->load([
            'translations',
            'pages' => fn ($q) => $q->orderBy('page_number'),
            'chapters' => fn ($q) => $q->orderBy('sort_order'),
            'chapters.translations',
            'chapters.sections' => fn ($q) => $q->orderBy('sort_order'),
            'chapters.sections.translations',
            'chapters.sections.contentBlocks' => fn ($q) => $q->orderBy('sort_order'),
            'chapters.sections.contentBlocks.translations',
        ]);

        $chaptersData = $book->chapters->map(function ($chapter) {
            return [
                'id' => $chapter->id,
                'chapter_number' => $chapter->chapter_number,
                'slug' => $chapter->slug,
                'status' => $chapter->status,
                'start_page' => $chapter->start_page,
                'end_page' => $chapter->end_page,
                'en_title' => $chapter->getTranslated('title', 'en'),
                'km_title' => $chapter->getTranslated('title', 'km') ?: '',
                'sections' => $chapter->sections->map(function ($section) {
                    return [
                        'id' => $section->id,
                        'section_number' => $section->section_number,
                        'slug' => $section->slug,
                        'page_number' => $section->page_number,
                        'status' => $section->status,
                        'en_title' => $section->getTranslated('title', 'en'),
                        'km_title' => $section->getTranslated('title', 'km') ?: '',
                        'blocks' => $section->contentBlocks->map(function ($block) {
                            return [
                                'id' => $block->id,
                                'type' => $block->type,
                                'sort_order' => $block->sort_order,
                                'page_number' => $block->page_number,
                                'confidence' => $block->confidence,
                                'needs_review' => (bool) $block->needs_review,
                                'metadata' => $block->metadata,
                                'en_content' => $block->getTranslated('content', 'en'),
                                'km_content' => $block->getTranslated('content', 'km') ?: '',
                            ];
                        }),
                    ];
                }),
            ];
        });

        $pagesData = $book->pages->map(function ($page) {
            return [
                'id' => $page->id,
                'page_number' => $page->page_number,
                'extracted_text' => $page->extracted_text,
                'ocr_text' => $page->ocr_text,
                'page_image_url' => $page->page_image_path ? asset('storage/'.$page->page_image_path) : null,
                'is_scanned' => (bool) $page->is_scanned,
                'confidence' => $page->confidence,
                'needs_review' => (bool) $page->needs_review,
            ];
        });

        return Inertia::render('Admin/Books/Review', [
            'book' => [
                'id' => $book->id,
                'slug' => $book->slug,
                'author' => $book->author,
                'status' => $book->status,
                'total_pages' => $book->total_pages,
                'is_published' => (bool) $book->is_published,
                'en_title' => $book->getTranslated('title', 'en'),
                'km_title' => $book->getTranslated('title', 'km') ?: '',
                'en_description' => $book->getTranslated('description', 'en') ?: '',
                'km_description' => $book->getTranslated('description', 'km') ?: '',
            ],
            'chapters' => $chaptersData,
            'pages' => $pagesData,
        ]);
    }

    /**
     * Update an individual content block (type, text, translations, review flag).
     */
    public function updateBlock(Request $request, Book $book, ContentBlock $block): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string'],
            'en_content' => ['required', 'string'],
            'km_content' => ['nullable', 'string'],
            'needs_review' => ['nullable', 'boolean'],
            'metadata' => ['nullable', 'array'],
        ]);

        $block->update([
            'type' => $validated['type'],
            'needs_review' => $validated['needs_review'] ?? false,
            'metadata' => $validated['metadata'] ?? $block->metadata,
        ]);

        // English translation
        $block->translations()->updateOrCreate(
            ['locale' => 'en'],
            ['content' => $validated['en_content']]
        );

        // Khmer translation
        if (isset($validated['km_content'])) {
            $block->translations()->updateOrCreate(
                ['locale' => 'km'],
                ['content' => $validated['km_content']]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Content block updated successfully.',
        ]);
    }

    /**
     * Translate an individual section on demand.
     */
    public function translateSection(Request $request, Book $book, Section $section): JsonResponse
    {
        if ($message = $this->translationUnavailableMessage()) {
            return response()->json(['success' => false, 'message' => $message], 422);
        }

        $this->importService->translateSection($section, 'km');

        return response()->json([
            'success' => true,
            'message' => "Section {$section->section_number} translated to Khmer.",
        ]);
    }

    /**
     * Queue translation of the whole book, which is too large to translate within one request.
     */
    public function translateBook(Request $request, Book $book): JsonResponse
    {
        if ($message = $this->translationUnavailableMessage()) {
            return response()->json(['success' => false, 'message' => $message], 422);
        }

        TranslateBookJob::dispatch($book, 'km');

        return response()->json([
            'success' => true,
            'message' => 'Book translation to Khmer started in the background. Sections update as they finish.',
        ]);
    }

    /**
     * Explain why real translation cannot run when no AI provider with an API key is configured.
     */
    protected function translationUnavailableMessage(): ?string
    {
        $provider = config('ai.default');

        if ($provider === 'local' || empty(config("ai.providers.{$provider}.api_key"))) {
            return 'No AI translation provider is configured. Set AI_PROVIDER=gemini with GEMINI_API_KEY (or AI_PROVIDER=openai with OPENAI_API_KEY) in .env; the offline provider only translates a small glossary of terms.';
        }

        return null;
    }

    /**
     * Re-run processing pipeline for a book.
     */
    public function reprocess(Request $request, Book $book): RedirectResponse
    {
        $book->update([
            'status' => 'uploaded',
            'processing_progress' => 0,
            'current_step' => 'Reprocessing book queued...',
            'error_message' => null,
        ]);

        ProcessBookJob::dispatch($book, true);

        return back()->with('success', 'Book re-processing dispatched to background worker.');
    }

    /**
     * Toggle published status of book.
     */
    public function togglePublish(Book $book): RedirectResponse
    {
        $newStatus = ! $book->is_published;
        $book->update(['is_published' => $newStatus]);

        if ($newStatus) {
            // Also mark chapters and sections as published
            $book->chapters()->update(['status' => 'published']);
            Section::whereIn('chapter_id', $book->chapters()->pluck('id'))->update(['status' => 'published']);
        }

        return back()->with('success', $newStatus ? 'Book published to website!' : 'Book unpublished.');
    }

    /**
     * Delete book and all associated files.
     */
    public function destroy(Book $book): RedirectResponse
    {
        if (Storage::disk('local')->exists($book->original_pdf_path)) {
            Storage::disk('local')->delete($book->original_pdf_path);
        }

        // Delete public page snapshots if present
        Storage::disk('public')->deleteDirectory("books/{$book->id}");

        $book->delete();

        return redirect()->route('admin.books.index')->with('success', 'Book and associated data deleted.');
    }
}
