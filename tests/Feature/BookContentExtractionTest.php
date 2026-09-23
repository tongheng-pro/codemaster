<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\BookPage;
use App\Services\AI\Providers\LocalRuleAIProvider;
use App\Services\PDF\BookImportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BookContentExtractionTest extends TestCase
{
    use RefreshDatabase;

    public function test_extract_structure_keeps_code_indentation_tables_and_lists(): void
    {
        $pageText = <<<'TEXT'
Section 1.1: Hello World

Creating a simple page

The following HTML example creates a simple "Hello World" web page.

<!DOCTYPE html>
<html lang="en">

     <head>
         <title>Hello!</title>
     </head>

</html>

Version             Specification           Release Date
1.0     N/A                                1994-01-01
2.0      RFC 1866                          1995-11-24

1. First item
2. Second item that wraps
onto the next line

Note: The browser removes extra spaces.

GoalKicker.com – HTML5 Notes for Professionals                                    4
TEXT;

        $structure = (new LocalRuleAIProvider)->extractStructure($pageText, 4);

        $this->assertSame('Hello World', $structure['section']['title']);
        $this->assertSame(
            ['subheading', 'paragraph', 'code', 'table', 'list', 'note'],
            array_column($structure['blocks'], 'type')
        );

        [$subheading, $paragraph, $code, $table, $list, $note] = $structure['blocks'];
        $this->assertSame('Creating a simple page', $subheading['content']);
        $this->assertStringNotContainsString('Section 1.1', $paragraph['content']);
        $this->assertSame("<!DOCTYPE html>\n<html lang=\"en\">\n\n     <head>\n         <title>Hello!</title>\n     </head>\n\n</html>", $code['content']);
        $this->assertSame('html', $code['metadata']['language']);
        $this->assertStringContainsString('1995-11-24', $table['content']);
        $this->assertSame("First item\nSecond item that wraps onto the next line", $list['content']);
        $this->assertTrue($list['metadata']['ordered']);
        $this->assertSame('The browser removes extra spaces.', $note['content']);
    }

    public function test_structure_book_splits_every_section_on_a_page_and_skips_front_matter(): void
    {
        $book = Book::create([
            'slug' => 'sample-notes',
            'original_pdf_path' => 'books/sample-notes.pdf',
        ]);

        $pages = [
            1 => "Contents\nChapter 1: Doctypes ........................ 2\n      Section 1.1: Adding the Doctype ........ 2",
            2 => "Chapter 1: Doctypes\nDoctypes help browsers to understand the version of HTML.\n\nSection 1.1: Adding the Doctype\nThe declaration goes at the top of the document.\n\n<!DOCTYPE html>\n\nSection 1.2: HTML 5 Doctype\nHTML5 does not require a reference to a DTD and is based on a",
            3 => "living standard that keeps evolving.\n\nChapter 2: Headings\nSection 2.1: Using Headings\nHeadings describe the page structure.",
            4 => "Credits\nThank you to all contributors.",
        ];

        foreach ($pages as $pageNumber => $text) {
            BookPage::create(['book_id' => $book->id, 'page_number' => $pageNumber, 'extracted_text' => $text]);
        }

        app(BookImportService::class)->structureBook($book, false);

        $book->load('chapters.sections.contentBlocks.translations', 'chapters.translations', 'chapters.sections.translations');

        $this->assertSame(['Doctypes', 'Headings'], $book->chapters->map->getTranslated('title', 'en')->all());
        $this->assertSame(
            ['Introduction', 'Adding the Doctype', 'HTML 5 Doctype'],
            $book->chapters[0]->sections->map->getTranslated('title', 'en')->all()
        );

        $doctypeSection = $book->chapters[0]->sections[2];
        $this->assertSame(
            'HTML5 does not require a reference to a DTD and is based on a living standard that keeps evolving.',
            $doctypeSection->contentBlocks->sole()->getTranslated('content', 'en')
        );

        $allContent = $book->chapters->flatMap->sections->flatMap->contentBlocks->map->getTranslated('content', 'en')->implode("\n");
        $this->assertStringNotContainsString('Contents', $allContent);
        $this->assertStringNotContainsString('contributors', $allContent);
    }

    public function test_reader_includes_pdf_page_snapshots_and_serves_original_pdf(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('books/sample-notes.pdf', '%PDF-1.4 sample');

        $book = Book::create([
            'slug' => 'sample-notes',
            'original_pdf_path' => 'books/sample-notes.pdf',
            'is_published' => true,
        ]);
        BookPage::create([
            'book_id' => $book->id,
            'page_number' => 1,
            'extracted_text' => "Chapter 1: Doctypes\nSection 1.1: Adding the Doctype\nThe declaration goes at the top.",
            'page_image_path' => "books/{$book->id}/pages/page_1.png",
        ]);

        app(BookImportService::class)->structureBook($book, false);
        $book->chapters()->update(['status' => 'published']);
        $chapter = $book->chapters()->first();
        $chapter->sections()->update(['status' => 'published']);
        $section = $chapter->sections()->first();

        $this->get("/books/{$book->slug}/{$chapter->slug}/{$section->slug}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('section.pdf_pages.0.page_number', 1)
                ->where('book.pdf_url', route('books.pdf', $book->slug)));

        $this->get(route('books.pdf', $book->slug))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/pdf');
    }
}
