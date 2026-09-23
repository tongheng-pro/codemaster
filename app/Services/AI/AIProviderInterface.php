<?php

namespace App\Services\AI;

use App\Models\Book;

interface AIProviderInterface
{
    /**
     * Parse raw page text and identify chapter, section, and semantic content blocks.
     *
     * @param string $text Raw text extracted from the page(s)
     * @param int $pageNumber Primary page number being processed
     * @param array $context Context about previous chapter/section
     * @return array{
     *     chapter: ?array{number: int, title: string, description: ?string},
     *     section: ?array{number: ?string, title: string, summary: ?string},
     *     blocks: array<int, array{
     *         type: string,
     *         content: string,
     *         page_number: int,
     *         confidence: float,
     *         needs_review: bool,
     *         metadata: ?array
     *     }>
     * }
     */
    public function extractStructure(string $text, int $pageNumber, array $context = []): array;

    /**
     * Translate content between languages (English <-> Khmer) while preserving code, keywords, and technical formatting.
     */
    public function translate(string $content, string $fromLocale, string $toLocale, string $contentType = 'text'): string;

    /**
     * Generate a concise summary for a chapter or section.
     */
    public function summarize(string $content, string $locale = 'en'): string;

    /**
     * Classify an isolated text block into a content block type.
     */
    public function classifyContent(string $rawText): string;

    /**
     * Grounded Q&A against the book content with citations (chapter, section, page).
     *
     * @return array{
     *     answer: string,
     *     citations: array<int, array{chapter: string, section: string, page: int, text: string}>,
     *     grounded: bool
     * }
     */
    public function askQuestion(Book $book, string $question, string $locale = 'en'): array;
}

