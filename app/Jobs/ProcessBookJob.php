<?php

namespace App\Jobs;

use App\Models\Book;
use App\Services\PDF\BookImportService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProcessBookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Timeout after 2 hours: very large PDFs (up to the 2 GB upload limit) can have thousands of pages.
     * Keep the queue's retry_after above this so a running job is never started twice.
     */
    public int $timeout = 7200;

    /**
     * Number of attempts.
     */
    public int $tries = 3;

    public function __construct(
        public Book $book,
        public bool $autoTranslate = true
    ) {}

    /**
     * Execute the job.
     */
    public function handle(BookImportService $service): void
    {
        Log::info("Starting ProcessBookJob for Book #{$this->book->id}: {$this->book->slug}");

        try {
            // Step 1: Extract pages
            $service->extractPages($this->book);

            // Step 2 & 3: AI Document Understanding & Structure
            $service->structureBook($this->book, $this->autoTranslate);

            Log::info("Successfully completed ProcessBookJob for Book #{$this->book->id}");
        } catch (Throwable $e) {
            Log::error("ProcessBookJob failed for Book #{$this->book->id}: " . $e->getMessage(), [
                'exception' => $e,
            ]);

            $this->book->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'current_step' => 'Job execution failed: ' . $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle job failure.
     */
    public function failed(?Throwable $exception): void
    {
        Log::critical("ProcessBookJob completely failed for Book #{$this->book->id}: " . ($exception ? $exception->getMessage() : 'Unknown error'));

        $this->book->update([
            'status' => 'failed',
            'error_message' => $exception ? $exception->getMessage() : 'Job failed permanently after max retries.',
            'current_step' => 'Processing failed.',
        ]);
    }
}

