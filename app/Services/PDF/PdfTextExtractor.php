<?php

namespace App\Services\PDF;

use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class PdfTextExtractor
{
    /**
     * Get the total number of pages in the PDF file using pdfinfo.
     */
    public function getPageCount(string $pdfPath): int
    {
        if (! file_exists($pdfPath)) {
            return 0;
        }

        // Try pdfinfo first
        $process = new Process(['pdfinfo', $pdfPath]);
        $process->run();

        if ($process->isSuccessful()) {
            $output = $process->getOutput();
            if (preg_match('/Pages:\s+(\d+)/i', $output, $matches)) {
                return (int) $matches[1];
            }
        }

        // Fallback: analyze via pdftotext or binary scan
        $process = new Process(['pdftotext', $pdfPath, '-']);
        $process->run();
        if ($process->isSuccessful()) {
            $text = $process->getOutput();
            // Form feed \f separates pages in pdftotext output
            $pages = explode("\f", $text);

            return max(1, count($pages) - 1);
        }

        return 1;
    }

    /**
     * Extract raw UTF-8 text from a specific PDF page.
     */
    public function extractPageText(string $pdfPath, int $pageNumber): string
    {
        if (! file_exists($pdfPath)) {
            return '';
        }

        $process = new Process([
            'pdftotext',
            '-f', (string) $pageNumber,
            '-l', (string) $pageNumber,
            '-enc', 'UTF-8',
            '-layout',
            $pdfPath,
            '-',
        ]);

        $process->run();

        if ($process->isSuccessful()) {
            return $this->normalizeText($process->getOutput());
        }

        Log::warning("pdftotext failed on page {$pageNumber}: ".$process->getErrorOutput());

        return '';
    }

    /**
     * Replace typographic ligatures and page-break characters with plain text while keeping layout indentation.
     */
    public function normalizeText(string $text): string
    {
        $text = strtr($text, [
            "\u{FB00}" => 'ff',
            "\u{FB01}" => 'fi',
            "\u{FB02}" => 'fl',
            "\u{FB03}" => 'ffi',
            "\u{FB04}" => 'ffl',
            "\u{00A0}" => ' ',
            "\f" => '',
        ]);

        $lines = array_map('rtrim', preg_split('/\r\n|\r|\n/', $text));

        return trim(implode("\n", $lines), "\n");
    }

    /**
     * Render page image thumbnail for visual review.
     */
    public function renderPageThumbnail(string $pdfPath, int $pageNumber, string $outputDir, string $filePrefix = 'page'): ?string
    {
        if (! file_exists($pdfPath)) {
            return null;
        }

        if (! is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        $outputPathPrefix = rtrim($outputDir, '/').'/'.$filePrefix.'_'.$pageNumber;

        $process = new Process([
            'pdftoppm',
            '-png',
            '-r', '120',
            '-f', (string) $pageNumber,
            '-l', (string) $pageNumber,
            '-singlefile',
            $pdfPath,
            $outputPathPrefix,
        ]);

        $process->run();

        $expectedFile = $outputPathPrefix.'.png';
        if (file_exists($expectedFile)) {
            return $expectedFile;
        }

        return null;
    }

    /**
     * Determine if a page is likely scanned/image-based (sparse text).
     */
    public function isPageScanned(string $text): bool
    {
        $clean = trim(preg_replace('/\s+/', ' ', $text));

        // If fewer than 35 characters on a full page, it's very likely an image/scanned page
        return mb_strlen($clean) < 35;
    }
}
