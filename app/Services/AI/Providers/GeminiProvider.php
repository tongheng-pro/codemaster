<?php

namespace App\Services\AI\Providers;

use App\Models\Book;
use App\Services\AI\AIProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiProvider implements AIProviderInterface
{
    protected string $apiKey;

    protected string $model;

    protected string $endpoint;

    protected int $timeout;

    protected LocalRuleAIProvider $fallbackProvider;

    public function __construct()
    {
        $this->apiKey = config('ai.providers.gemini.api_key', '');
        $this->model = config('ai.providers.gemini.model', 'gemini-2.5-flash');
        $this->endpoint = config('ai.providers.gemini.endpoint', 'https://generativelanguage.googleapis.com/v1beta');
        $this->timeout = (int) config('ai.providers.gemini.timeout', 45);
        $this->fallbackProvider = new LocalRuleAIProvider;
    }

    public function extractStructure(string $text, int $pageNumber, array $context = []): array
    {
        if (empty($this->apiKey)) {
            return $this->fallbackProvider->extractStructure($text, $pageNumber, $context);
        }

        try {
            $prompt = <<<PROMPT
You are an expert technical editor analyzing text from page {$pageNumber} of a programming book.
Analyze the text and extract:
1. Chapter info if a chapter begins on this page (number and title).
2. Section info if a section begins on this page (number and title).
3. A list of structured content blocks. Allowed types: "paragraph", "heading", "subheading", "definition", "example", "code", "list", "quote", "note", "warning", "table", "exercise", "summary".
Preserve all original text, code, examples, and technical terms. Do not invent missing facts.
Return strictly valid JSON with this schema:
{
  "chapter": {"number": 1, "title": "...", "description": "..."} or null,
  "section": {"number": "1.1", "title": "...", "summary": "..."} or null,
  "blocks": [
    {
      "type": "paragraph" | "code" | "note" | "warning" | "example" | "subheading" | "definition" | "table",
      "content": "exact content",
      "page_number": {$pageNumber},
      "confidence": 0.95,
      "needs_review": false,
      "metadata": {"language": "html"} or null
    }
  ]
}

Page Text:
{$text}
PROMPT;

            $response = Http::timeout($this->timeout)->post("{$this->endpoint}/models/{$this->model}:generateContent?key={$this->apiKey}", [
                'contents' => [
                    ['parts' => [['text' => $prompt]]],
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                    'temperature' => 0.1,
                ],
            ]);

            if ($response->successful()) {
                $body = $response->json();
                $content = $body['candidates'][0]['content']['parts'][0]['text'] ?? '';
                $parsed = json_decode($content, true);
                if (is_array($parsed) && isset($parsed['blocks'])) {
                    return $parsed;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Gemini extractStructure failed, falling back to LocalRuleAIProvider: '.$e->getMessage());
        }

        return $this->fallbackProvider->extractStructure($text, $pageNumber, $context);
    }

    public function translate(string $content, string $fromLocale, string $toLocale, string $contentType = 'text'): string
    {
        if (empty($this->apiKey) || $fromLocale === $toLocale || $contentType === 'code') {
            return $this->fallbackProvider->translate($content, $fromLocale, $toLocale, $contentType);
        }

        try {
            $prompt = <<<PROMPT
Translate the following text from {$fromLocale} to {$toLocale} (Khmer).
CRITICAL RULES:
1. Do NOT translate programming code, syntax, keywords, HTML tags, or CSS attributes. Keep them in standard English code format.
2. For technical terminology, keep the English term in parentheses alongside the Khmer translation where appropriate (e.g. ធាតុផ្សំ (Element), អថេរ (Variable)).
3. Preserve markdown and formatting.
4. Output only the translated text.

Text to translate:
{$content}
PROMPT;

            $response = Http::timeout($this->timeout)->post("{$this->endpoint}/models/{$this->model}:generateContent?key={$this->apiKey}", [
                'contents' => [
                    ['parts' => [['text' => $prompt]]],
                ],
                'generationConfig' => [
                    'temperature' => 0.2,
                ],
            ]);

            if ($response->successful()) {
                $body = $response->json();
                $translated = trim($body['candidates'][0]['content']['parts'][0]['text'] ?? '');
                if (! empty($translated)) {
                    return $translated;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Gemini translation failed: '.$e->getMessage());
        }

        return $this->fallbackProvider->translate($content, $fromLocale, $toLocale, $contentType);
    }

    public function summarize(string $content, string $locale = 'en'): string
    {
        if (empty($this->apiKey)) {
            return $this->fallbackProvider->summarize($content, $locale);
        }

        try {
            $prompt = "Summarize the following book section in 2 clear sentences in {$locale} language:\n\n{$content}";
            $response = Http::timeout($this->timeout)->post("{$this->endpoint}/models/{$this->model}:generateContent?key={$this->apiKey}", [
                'contents' => [
                    ['parts' => [['text' => $prompt]]],
                ],
            ]);

            if ($response->successful()) {
                $summary = trim($response->json('candidates.0.content.parts.0.text') ?? '');
                if (! empty($summary)) {
                    return $summary;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Gemini summarize failed: '.$e->getMessage());
        }

        return $this->fallbackProvider->summarize($content, $locale);
    }

    public function classifyContent(string $rawText): string
    {
        return $this->fallbackProvider->classifyContent($rawText);
    }

    public function askQuestion(Book $book, string $question, string $locale = 'en'): array
    {
        return $this->fallbackProvider->askQuestion($book, $question, $locale);
    }
}
