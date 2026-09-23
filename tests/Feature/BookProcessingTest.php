<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\ContentBlock;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BookProcessingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_public_book_catalog_and_syllabus_accessible(): void
    {
        $response = $this->get('/books');
        $response->assertStatus(200);

        $book = Book::first();
        $this->assertNotNull($book);

        $response = $this->get("/books/{$book->slug}");
        $response->assertStatus(200);
    }

    public function test_book_reader_displays_section_and_content_blocks(): void
    {
        $book = Book::first();
        $chapter = $book->chapters()->first();
        $section = $chapter->sections()->first();

        $response = $this->get("/books/{$book->slug}/{$chapter->slug}/{$section->slug}");
        $response->assertStatus(200);
    }

    public function test_in_book_search_returns_matches_with_page_citations(): void
    {
        $book = Book::first();

        $response = $this->getJson("/books/{$book->slug}/search?q=element");
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'results' => [
                '*' => ['chapter_title', 'section_title', 'page_number', 'type', 'content_snippet', 'url'],
            ],
        ]);
    }

    public function test_ask_the_book_provides_grounded_answer_with_citations(): void
    {
        $book = Book::first();

        $response = $this->postJson("/books/{$book->slug}/ask", [
            'question' => 'What does an element consist of in HTML?',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'answer',
            'citations' => [
                '*' => ['chapter', 'section', 'page', 'text'],
            ],
            'grounded',
        ]);
        $response->assertJsonPath('grounded', true);
    }

    public function test_admin_review_workspace_and_block_update(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();
        $this->actingAs($admin);

        $book = Book::first();
        $block = ContentBlock::first();
        $this->assertNotNull($block);

        // Access Review Workspace
        $response = $this->get("/admin/books/{$book->id}/review");
        $response->assertStatus(200);

        // Update block
        $updateResponse = $this->putJson("/admin/books/{$book->id}/blocks/{$block->id}", [
            'type' => 'note',
            'en_content' => 'Updated review block content by editor.',
            'km_content' => 'ខ្លឹមសារដែលបានកែប្រែដោយអ្នកគ្រប់គ្រង។',
            'needs_review' => false,
        ]);

        $updateResponse->assertStatus(200);
        $updateResponse->assertJson(['success' => true]);

        $this->assertDatabaseHas('content_blocks', [
            'id' => $block->id,
            'type' => 'note',
            'needs_review' => false,
        ]);

        $this->assertDatabaseHas('content_block_translations', [
            'content_block_id' => $block->id,
            'locale' => 'en',
            'content' => 'Updated review block content by editor.',
        ]);
    }

    public function test_admin_toggle_publish_status(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();
        $this->actingAs($admin);

        $book = Book::first();
        $initialStatus = $book->is_published;

        $response = $this->post("/admin/books/{$book->id}/publish");
        $response->assertStatus(302);

        $book->refresh();
        $this->assertEquals(!$initialStatus, $book->is_published);
    }

    public function test_admin_pdf_upload_validation_and_job_dispatch(): void
    {
        Storage::fake('local');
        Storage::fake('public');
        Queue::fake();

        $admin = User::where('email', 'admin@example.com')->first();
        $this->actingAs($admin);

        $file = UploadedFile::fake()->create('clean-code-sample.pdf', 1500, 'application/pdf');

        $response = $this->post('/admin/books', [
            'title' => 'Clean Code Principles',
            'author' => 'Robert C. Martin',
            'description' => 'A handbook of agile software craftsmanship.',
            'original_language' => 'en',
            'pdf_file' => $file,
            'auto_translate' => true,
        ]);

        $response->assertRedirect('/admin/books');
        $this->assertDatabaseHas('books', ['author' => 'Robert C. Martin']);
        $this->assertDatabaseHas('book_translations', ['title' => 'Clean Code Principles']);
    }

    public function test_admin_can_upload_pdfs_larger_than_the_old_150mb_limit(): void
    {
        Storage::fake('local');
        Queue::fake();

        $this->actingAs(User::where('email', 'admin@example.com')->first());

        $this->post('/admin/books', [
            'title' => 'Large Scanned Manual',
            'original_language' => 'en',
            'pdf_file' => UploadedFile::fake()->create('large-manual.pdf', 1800 * 1024, 'application/pdf'), // 1.8 GB
        ])->assertRedirect('/admin/books')->assertSessionHasNoErrors();

        $this->assertDatabaseHas('book_translations', ['title' => 'Large Scanned Manual']);
    }

    public function test_pdf_uploads_over_the_configured_limit_are_rejected(): void
    {
        Storage::fake('local');
        Queue::fake();
        config(['books.max_upload_mb' => 2048]);

        $this->actingAs(User::where('email', 'admin@example.com')->first());

        $this->post('/admin/books', [
            'title' => 'Too Large',
            'original_language' => 'en',
            'pdf_file' => UploadedFile::fake()->create('too-large.pdf', 2049 * 1024, 'application/pdf'),
        ])->assertSessionHasErrors('pdf_file');
    }
}
