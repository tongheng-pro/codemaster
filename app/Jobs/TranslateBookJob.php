<?php

namespace App\Jobs;

use App\Models\Book;
use App\Services\PDF\BookImportService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class TranslateBookJob implements ShouldQueue
{
    use Queueable;

    /**
     * Timeout after 1 hour, since large books need thousands of translation calls.
     */
    public int $timeout = 3600;

    /**
     * Retries resume where the previous attempt stopped, because translated blocks are skipped.
     */
    public int $tries = 3;

    public function __construct(
        public Book $book,
        public string $toLocale = 'km'
    ) {}

    /**
     * Execute the job.
     */
    public function handle(BookImportService $service): void
    {
        $this->book->update(['current_step' => "Translating book to {$this->toLocale}..."]);

        $service->translateBook($this->book, $this->toLocale);

        $this->book->update(['current_step' => "Book translated to {$this->toLocale}."]);
    }
}
