<?php

namespace Tests\Feature;

use App\Jobs\TranslateBookJob;
use App\Models\Book;
use App\Models\BookPage;
use App\Models\Section;
use App\Models\User;
use App\Services\PDF\BookImportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class BookTranslationTest extends TestCase
{
    use RefreshDatabase;

    protected Book $book;

    protected Section $section;

    protected function setUp(): void
    {
        parent::setUp();

        $this->book = Book::create(['slug' => 'sample-notes', 'original_pdf_path' => 'books/sample-notes.pdf']);
        BookPage::create([
            'book_id' => $this->book->id,
            'page_number' => 1,
            'extracted_text' => "Chapter 1: Doctypes\nSection 1.1: Adding the Doctype\nThe declaration goes at the top of the document.\n\n<!DOCTYPE html>",
        ]);

        // Import with the offline provider, which stores English copies as Khmer translations
        config(['ai.default' => 'local']);
        app(BookImportService::class)->structureBook($this->book, true);

        $this->section = Section::whereHas('translations', fn ($query) => $query->where('title', 'Adding the Doctype'))->firstOrFail();
        $this->actingAs(User::factory()->create(['role' => 'admin']));
    }

    public function test_section_translation_replaces_english_copies_and_keeps_code(): void
    {
        config(['ai.default' => 'gemini', 'ai.providers.gemini.api_key' => 'test-key']);
        Http::fake([
            '*' => Http::response(['candidates' => [['content' => ['parts' => [['text' => 'ការប្រកាសនៅខាងលើឯកសារ។']]]]]]),
        ]);

        $this->postJson("/admin/books/{$this->book->id}/sections/{$this->section->id}/translate")
            ->assertOk()
            ->assertJson(['success' => true]);

        $blocks = $this->section->contentBlocks()->with('translations')->get();
        $this->assertSame('ការប្រកាសនៅខាងលើឯកសារ។', $blocks->firstWhere('type', 'paragraph')->getTranslated('content', 'km'));
        $this->assertSame('<!DOCTYPE html>', $blocks->firstWhere('type', 'code')->getTranslated('content', 'km'));
        $this->assertSame('ការប្រកាសនៅខាងលើឯកសារ។', $this->section->fresh('translations')->getTranslated('title', 'km'));
    }

    public function test_book_translation_is_queued(): void
    {
        config(['ai.default' => 'gemini', 'ai.providers.gemini.api_key' => 'test-key']);
        Queue::fake();

        $this->postJson("/admin/books/{$this->book->id}/translate")->assertOk();

        Queue::assertPushed(TranslateBookJob::class, fn (TranslateBookJob $job) => $job->book->is($this->book));
    }

    public function test_translation_explains_missing_ai_provider(): void
    {
        $this->postJson("/admin/books/{$this->book->id}/sections/{$this->section->id}/translate")
            ->assertUnprocessable()
            ->assertJson(['success' => false]);
    }
}
