<?php

namespace App\Console\Commands;

use App\Models\Book;
use App\Models\BookTranslation;
use App\Models\Section;
use App\Services\PDF\BookImportService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;

#[Signature('books:import {path=Mybook : A PDF file or a directory of PDF files, relative to the project root} {--publish : Publish the books and all of their chapters and sections} {--no-translate : Skip creating Khmer translations}')]
#[Description('Import PDF books with full chapters, sections, content blocks and page snapshots')]
class ImportBooksCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(BookImportService $service): int
    {
        $path = base_path($this->argument('path'));
        $pdfFiles = is_dir($path) ? glob(rtrim($path, '/').'/*.pdf') : [$path];
        $pdfFiles = array_filter($pdfFiles, fn (string $file) => is_file($file) && str_ends_with(strtolower($file), '.pdf'));

        if (empty($pdfFiles)) {
            $this->error("No PDF files found at {$path}.");

            return self::FAILURE;
        }

        foreach ($pdfFiles as $pdfFile) {
            $title = $this->readPdfTitle($pdfFile) ?: Str::headline(pathinfo($pdfFile, PATHINFO_FILENAME));
            $slug = Str::slug($title);
            $storedPath = "books/originals/{$slug}.pdf";

            Storage::disk('local')->put($storedPath, file_get_contents($pdfFile));

            $book = Book::updateOrCreate(['slug' => $slug], [
                'author' => $this->readPdfAuthor($pdfFile),
                'original_language' => 'en',
                'original_pdf_path' => $storedPath,
                'status' => 'uploaded',
                'processing_progress' => 0,
                'error_message' => null,
            ]);

            BookTranslation::updateOrCreate(['book_id' => $book->id, 'locale' => 'en'], [
                'title' => $title,
                'description' => "{$title}, imported from the original PDF with every chapter, section, code sample and page.",
            ]);

            $this->info("Importing {$title}...");

            $service->extractPages($book);
            $service->structureBook($book, ! $this->option('no-translate'));

            $coverPagePath = $book->pages()->where('page_number', 1)->value('page_image_path');
            if ($coverPagePath) {
                $book->update(['cover_image' => "storage/{$coverPagePath}"]);
            }

            if ($this->option('publish')) {
                $book->update(['is_published' => true]);
                $book->chapters()->update(['status' => 'published']);
                Section::whereIn('chapter_id', $book->chapters()->pluck('id'))->update(['status' => 'published']);
            }

            $this->line(sprintf(
                '  %d pages, %d chapters, %d sections, %d content blocks',
                $book->total_pages,
                $book->chapters()->count(),
                $book->sections()->count(),
                $book->sections()->withCount('contentBlocks')->get()->sum('content_blocks_count'),
            ));
        }

        return self::SUCCESS;
    }

    /**
     * Read the "Title" field from the PDF metadata.
     */
    protected function readPdfTitle(string $pdfFile): ?string
    {
        return $this->readPdfInfoField($pdfFile, 'Title');
    }

    /**
     * Read the "Author" field from the PDF metadata.
     */
    protected function readPdfAuthor(string $pdfFile): ?string
    {
        return $this->readPdfInfoField($pdfFile, 'Author');
    }

    /**
     * Read a single field from pdfinfo output.
     */
    protected function readPdfInfoField(string $pdfFile, string $field): ?string
    {
        $process = new Process(['pdfinfo', $pdfFile]);
        $process->run();

        if ($process->isSuccessful() && preg_match('/^'.preg_quote($field, '/').':\s+(.+)$/m', $process->getOutput(), $matches)) {
            return trim($matches[1]);
        }

        return null;
    }
}
