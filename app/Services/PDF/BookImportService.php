<?php

namespace App\Services\PDF;

use App\Models\Book;
use App\Models\BookPage;
use App\Models\Chapter;
use App\Models\ChapterTranslation;
use App\Models\ContentBlock;
use App\Models\ContentBlockTranslation;
use App\Models\Section;
use App\Models\SectionTranslation;
use App\Services\AI\AIServiceManager;
use App\Services\AI\Providers\LocalRuleAIProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BookImportService
{
    public function __construct(
        protected PdfTextExtractor $extractor,
        protected AIServiceManager $aiManager
    ) {}

    /**
     * Step 1: Extract all pages from PDF into book_pages table.
     */
    public function extractPages(Book $book, ?callable $onProgress = null): void
    {
        $fullPdfPath = Storage::disk('local')->path($book->original_pdf_path);

        if (! file_exists($fullPdfPath)) {
            throw new \RuntimeException("PDF file not found at: {$fullPdfPath}");
        }

        $totalPages = $this->extractor->getPageCount($fullPdfPath);
        $book->update([
            'total_pages' => $totalPages,
            'status' => 'extracting',
            'current_step' => 'Reading PDF pages...',
            'processing_progress' => 5,
        ]);

        $publicDir = storage_path("app/public/books/{$book->id}/pages");

        for ($p = 1; $p <= $totalPages; $p++) {
            $extractedText = $this->extractor->extractPageText($fullPdfPath, $p);
            $isScanned = $this->extractor->isPageScanned($extractedText);

            // Render page image snapshot
            $imagePath = $this->extractor->renderPageThumbnail($fullPdfPath, $p, $publicDir);
            $relativeImagePath = $imagePath ? "books/{$book->id}/pages/".basename($imagePath) : null;

            BookPage::updateOrCreate(
                ['book_id' => $book->id, 'page_number' => $p],
                [
                    'extracted_text' => $extractedText,
                    'is_scanned' => $isScanned,
                    'page_image_path' => $relativeImagePath,
                    'processing_status' => 'extracted',
                    'confidence' => $isScanned ? 0.70 : 1.0,
                    'needs_review' => $isScanned,
                ]
            );

            $progress = 5 + (int) round(($p / $totalPages) * 35); // 5% -> 40%
            $book->update([
                'processed_pages' => $p,
                'processing_progress' => $progress,
                'current_step' => "Extracted page {$p} of {$totalPages}",
            ]);

            if ($onProgress) {
                $onProgress($p, $totalPages, 'extracting');
            }
        }
    }

    /**
     * Step 2 & 3: Run AI Document Understanding to detect Chapters, Sections, and Content Blocks.
     */
    public function structureBook(Book $book, bool $autoTranslate = true, ?callable $onProgress = null): void
    {
        $book->update([
            'status' => 'ai_processing',
            'current_step' => 'Analyzing chapters, sections, and code examples...',
        ]);

        // Clear any previous structure so re-processing does not duplicate chapters
        $book->chapters()->delete();

        $pages = $book->pages()->orderBy('page_number')->get();
        $totalPages = $pages->count();

        $currentChapter = null;
        $currentSection = null;
        $chapterSort = 1;
        $sectionSort = 1;
        $blockSort = 1;

        $hasChapterHeadings = $pages->contains(
            fn (BookPage $page) => (bool) preg_match(LocalRuleAIProvider::CHAPTER_PATTERN_MULTILINE, $page->getEffectiveText())
        );
        $reachedEndMatter = false;
        $lastParagraph = null;

        DB::beginTransaction();
        try {
            foreach ($pages as $index => $page) {
                $pageText = $page->getEffectiveText();

                // Skip essentially empty pages
                if (trim($pageText) === '' || $reachedEndMatter) {
                    continue;
                }

                foreach ($this->splitIntoSegments($pageText) as $segment) {
                    $firstLine = trim(strtok(ltrim($segment), "\n"));

                    // Skip cover, "About" and table of contents pages before the first chapter
                    if ($hasChapterHeadings && ! $currentChapter && ! preg_match(LocalRuleAIProvider::CHAPTER_PATTERN, $firstLine)) {
                        continue;
                    }

                    // Stop at the contributor credits appended to the end of the book
                    if ($currentChapter && preg_match('/^(Credits|You may also like)$/i', $firstLine)) {
                        $reachedEndMatter = true;
                        break;
                    }

                    $structure = $this->aiManager->extractStructure($segment, $page->page_number, [
                        'current_chapter' => $currentChapter?->id,
                        'current_section' => $currentSection?->id,
                    ]);

                    // 1. If AI detected a new chapter
                    if (! empty($structure['chapter'])) {
                        $cNum = $structure['chapter']['number'] ?? $chapterSort;
                        $cTitle = $structure['chapter']['title'] ?? "Chapter {$cNum}";
                        $cSlug = Str::slug("chapter-{$cNum}-".Str::limit($cTitle, 40, ''));

                        $currentChapter = Chapter::create([
                            'book_id' => $book->id,
                            'chapter_number' => $cNum,
                            'slug' => $cSlug,
                            'sort_order' => $chapterSort++,
                            'start_page' => $page->page_number,
                            'status' => 'draft',
                        ]);

                        ChapterTranslation::create([
                            'chapter_id' => $currentChapter->id,
                            'locale' => 'en',
                            'title' => $cTitle,
                            'description' => $structure['chapter']['description'] ?? null,
                        ]);

                        if ($autoTranslate) {
                            ChapterTranslation::create([
                                'chapter_id' => $currentChapter->id,
                                'locale' => 'km',
                                'title' => $this->aiManager->translate($cTitle, 'en', 'km'),
                                'description' => $this->aiManager->translate($structure['chapter']['description'] ?? '', 'en', 'km'),
                            ]);
                        }

                        $currentSection = null; // Reset section for new chapter
                        $sectionSort = 1;
                    }

                    // If no chapter exists yet, create an introductory chapter
                    if (! $currentChapter) {
                        $currentChapter = Chapter::create([
                            'book_id' => $book->id,
                            'chapter_number' => 1,
                            'slug' => 'chapter-1-overview',
                            'sort_order' => $chapterSort++,
                            'start_page' => $page->page_number,
                            'status' => 'draft',
                        ]);

                        ChapterTranslation::create([
                            'chapter_id' => $currentChapter->id,
                            'locale' => 'en',
                            'title' => 'Overview & Introduction',
                            'description' => 'Introductory concepts and topics.',
                        ]);

                        if ($autoTranslate) {
                            ChapterTranslation::create([
                                'chapter_id' => $currentChapter->id,
                                'locale' => 'km',
                                'title' => 'ទិដ្ឋភាពទូទៅ និង សេចក្តីផ្តើម',
                                'description' => 'គោលគំនិត និងប្រធានបទដំបូង។',
                            ]);
                        }
                    }

                    // 2. If AI detected a section
                    if (! empty($structure['section'])) {
                        $sNum = $structure['section']['number'] ?? (string) $sectionSort;
                        $sTitle = $structure['section']['title'] ?? "Section {$sNum}";
                        $sSlug = Str::slug("section-{$sNum}-".Str::limit($sTitle, 40, ''));

                        $currentSection = Section::create([
                            'chapter_id' => $currentChapter->id,
                            'section_number' => $sNum,
                            'slug' => $sSlug,
                            'sort_order' => $sectionSort++,
                            'page_number' => $page->page_number,
                            'status' => 'draft',
                        ]);

                        SectionTranslation::create([
                            'section_id' => $currentSection->id,
                            'locale' => 'en',
                            'title' => $sTitle,
                            'summary' => $structure['section']['summary'] ?? null,
                        ]);

                        if ($autoTranslate) {
                            SectionTranslation::create([
                                'section_id' => $currentSection->id,
                                'locale' => 'km',
                                'title' => $this->aiManager->translate($sTitle, 'en', 'km'),
                                'summary' => $this->aiManager->translate($structure['section']['summary'] ?? '', 'en', 'km'),
                            ]);
                        }
                        $blockSort = 1;
                    }

                    // If no section exists in this chapter yet, create a default section
                    if (! $currentSection) {
                        $currentSection = Section::create([
                            'chapter_id' => $currentChapter->id,
                            'section_number' => null,
                            'slug' => "section-{$currentChapter->chapter_number}-introduction",
                            'sort_order' => $sectionSort++,
                            'page_number' => $page->page_number,
                            'status' => 'draft',
                        ]);

                        SectionTranslation::create([
                            'section_id' => $currentSection->id,
                            'locale' => 'en',
                            'title' => 'Introduction',
                            'summary' => 'Introduction to this chapter.',
                        ]);

                        if ($autoTranslate) {
                            SectionTranslation::create([
                                'section_id' => $currentSection->id,
                                'locale' => 'km',
                                'title' => 'សេចក្តីផ្តើម',
                                'summary' => 'សេចក្តីផ្តើមនៃជំពូកនេះ។',
                            ]);
                        }
                        $blockSort = 1;
                    }

                    // 3. Save Content Blocks
                    foreach ($structure['blocks'] as $blockData) {
                        // A paragraph cut by a page break continues with a lowercase word; join it to the previous paragraph
                        if ($this->continuesParagraph($lastParagraph, $currentSection, $blockData)) {
                            $lastParagraph['content'] .= ' '.$blockData['content'];
                            $this->updateBlockContent($lastParagraph['block'], $lastParagraph['content'], $autoTranslate);

                            continue;
                        }

                        $block = ContentBlock::create([
                            'section_id' => $currentSection->id,
                            'type' => $blockData['type'] ?? 'paragraph',
                            'sort_order' => $blockSort++,
                            'page_number' => $page->page_number,
                            'confidence' => $blockData['confidence'] ?? 1.0,
                            'needs_review' => $blockData['needs_review'] ?? false,
                            'metadata' => $blockData['metadata'] ?? null,
                        ]);

                        ContentBlockTranslation::create([
                            'content_block_id' => $block->id,
                            'locale' => 'en',
                            'content' => $blockData['content'],
                        ]);

                        if ($autoTranslate) {
                            $kmContent = $this->aiManager->translate($blockData['content'], 'en', 'km', $block->type);
                            ContentBlockTranslation::create([
                                'content_block_id' => $block->id,
                                'locale' => 'km',
                                'content' => $kmContent,
                            ]);
                        }

                        $lastParagraph = $block->type === 'paragraph'
                            ? ['block' => $block, 'content' => $blockData['content']]
                            : null;
                    }
                }

                $page->update(['processing_status' => 'structured']);

                // Update progress: 40% -> 95%
                $progress = 40 + (int) round((($index + 1) / $totalPages) * 55);
                $book->update([
                    'processing_progress' => $progress,
                    'current_step' => 'Structuring page '.($index + 1)." of {$totalPages}",
                ]);

                if ($onProgress) {
                    $onProgress($index + 1, $totalPages, 'structuring');
                }
            }

            // Update end pages for chapters
            foreach ($book->chapters as $chap) {
                $lastSecPage = $chap->sections()->max('page_number');
                $chap->update(['end_page' => $lastSecPage ?: $chap->start_page]);
            }

            // Mark book as completed and ready for admin review
            $book->update([
                'status' => 'completed',
                'processing_progress' => 100,
                'current_step' => 'Book successfully extracted and structured! Ready for review.',
            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Failed to structure book {$book->id}: ".$e->getMessage(), ['trace' => $e->getTraceAsString()]);
            $book->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'current_step' => 'Processing failed: '.$e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Determine if a block is the remainder of the previous paragraph that was cut by a page break.
     *
     * @param  array{block: ContentBlock, content: string}|null  $lastParagraph
     */
    protected function continuesParagraph(?array $lastParagraph, Section $currentSection, array $blockData): bool
    {
        return $lastParagraph !== null
            && $lastParagraph['block']->section_id === $currentSection->id
            && ($blockData['type'] ?? 'paragraph') === 'paragraph'
            && preg_match('/^[a-z(]/', $blockData['content'])
            && ! preg_match('/[.!?:]$/', $lastParagraph['content']);
    }

    /**
     * Replace a block's English content and refresh its Khmer translation.
     */
    protected function updateBlockContent(ContentBlock $block, string $content, bool $autoTranslate): void
    {
        ContentBlockTranslation::where('content_block_id', $block->id)->where('locale', 'en')->update(['content' => $content]);

        if ($autoTranslate) {
            ContentBlockTranslation::where('content_block_id', $block->id)->where('locale', 'km')->update([
                'content' => $this->aiManager->translate($content, 'en', 'km', $block->type),
            ]);
        }
    }

    /**
     * Split page text at every chapter and section heading so a page holding several sections keeps each one separate.
     *
     * @return array<int, string>
     */
    protected function splitIntoSegments(string $pageText): array
    {
        $segments = [];
        $current = [];

        foreach (preg_split('/\r\n|\r|\n/', $pageText) as $line) {
            $trimmed = trim($line);
            $isHeading = preg_match(LocalRuleAIProvider::CHAPTER_PATTERN, $trimmed)
                || preg_match(LocalRuleAIProvider::SECTION_PATTERN, $trimmed);

            if ($isHeading && ! preg_match('/\.{5,}\s*\d+$/', $trimmed) && trim(implode('', $current)) !== '') {
                $segments[] = implode("\n", $current);
                $current = [];
            }

            $current[] = $line;
        }

        if (trim(implode('', $current)) !== '') {
            $segments[] = implode("\n", $current);
        }

        return $segments;
    }

    /**
     * Translate an entire book to Khmer (or specified locale).
     */
    public function translateBook(Book $book, string $toLocale = 'km'): void
    {
        $book->loadMissing(['chapters.translations', 'chapters.sections.translations', 'chapters.sections.contentBlocks.translations']);

        foreach ($book->chapters as $chapter) {
            $translation = $chapter->translations->firstWhere('locale', $toLocale);
            $enTitle = $chapter->getTranslated('title', 'en');

            if ($this->needsTranslation($translation?->title, $enTitle)) {
                $enDesc = $chapter->getTranslated('description', 'en') ?: '';
                ChapterTranslation::updateOrCreate(['chapter_id' => $chapter->id, 'locale' => $toLocale], [
                    'title' => $this->aiManager->translate($enTitle, 'en', $toLocale),
                    'description' => ! empty($enDesc) ? $this->aiManager->translate($enDesc, 'en', $toLocale) : null,
                ]);
            }

            foreach ($chapter->sections as $section) {
                $this->translateSection($section, $toLocale);
            }
        }
    }

    /**
     * Translate a specific section and its content blocks.
     *
     * Existing translations that are still English (e.g. created by the offline provider during import) are translated again.
     */
    public function translateSection(Section $section, string $toLocale = 'km'): void
    {
        $section->loadMissing(['translations', 'contentBlocks.translations']);

        $translation = $section->translations->firstWhere('locale', $toLocale);
        $enTitle = $section->getTranslated('title', 'en');

        if ($this->needsTranslation($translation?->title, $enTitle)) {
            $enSummary = $section->getTranslated('summary', 'en') ?: '';
            SectionTranslation::updateOrCreate(['section_id' => $section->id, 'locale' => $toLocale], [
                'title' => $this->aiManager->translate($enTitle, 'en', $toLocale),
                'summary' => ! empty($enSummary) ? $this->aiManager->translate($enSummary, 'en', $toLocale) : null,
            ]);
        }

        foreach ($section->contentBlocks as $block) {
            $enContent = $block->getTranslated('content', 'en') ?: '';
            $blockTranslation = $block->translations->firstWhere('locale', $toLocale);

            // Code is copied as-is, so it only needs a row, never a re-translation
            $isTranslated = $block->type === 'code'
                ? $blockTranslation !== null
                : ! $this->needsTranslation($blockTranslation?->content, $enContent);

            if ($isTranslated) {
                continue;
            }

            ContentBlockTranslation::updateOrCreate(['content_block_id' => $block->id, 'locale' => $toLocale], [
                'content' => $this->aiManager->translate($enContent, 'en', $toLocale, $block->type),
            ]);
        }
    }

    /**
     * Determine if a translation is missing or is still mostly English text.
     */
    protected function needsTranslation(?string $translated, string $original): bool
    {
        if ($translated === null || trim($translated) === '') {
            return true;
        }

        $letterCount = preg_match_all('/[\p{L}\p{M}]/u', $translated);
        $khmerCount = preg_match_all('/\p{Khmer}/u', $translated);

        return preg_match('/\p{L}/u', $original) && $letterCount > 0 && $khmerCount / $letterCount < 0.2;
    }
}
