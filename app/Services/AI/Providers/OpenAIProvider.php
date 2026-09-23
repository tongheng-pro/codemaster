<?php

namespace App\Services\AI\Providers;

use App\Models\Book;
use App\Services\AI\AIProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAIProvider implements AIProviderInterface
{
    protected string $apiKey;
    protected string $model;
    protected string $endpoint;
    protected int $timeout;
    protected LocalRuleAIProvider $fallbackProvider;

    public function __construct()
    {
        $this->apiKey = config('ai.providers.openai.api_key', '');
        $this->model = config('ai.providers.openai.model', 'gpt-4o-mini');
        $this->endpoint = config('ai.providers.openai.endpoint', 'https://api.openai.com/v1');
        $this->timeout = (int) config('ai.providers.openai.timeout', 45);
        $this->fallbackProvider = new LocalRuleAIProvider();
    }

    public function extractStructure(string $text, int $pageNumber, array $context = []): array
    {
        if (empty($this->apiKey)) {
            return $this->fallbackProvider->extractStructure($text, $pageNumber, $context);
        }

        try {
            $system = 'You are an expert technical editor analyzing text from a book. Extract chapters, sections, and structured blocks (paragraph, heading, subheading, definition, example, code, list, quote, note, warning, table, exercise, summary). Output strictly valid JSON.';
            $userPrompt = "Page {$pageNumber} Text:\n{$text}";

            $response = Http::withToken($this->apiKey)
                ->timeout($this->timeout)
                ->post("{$this->endpoint}/chat/completions", [
                    'model' => $this->model,
                    'response_format' => ['type' => 'json_object'],
                    'temperature' => 0.1,
                    'messages' => [
                        ['role' => 'system', 'content' => $system],
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                ]);

            if ($response->successful()) {
                $content = $response->json('choices.0.message.content');
                $parsed = json_decode($content, true);
                if (is_array($parsed) && isset($parsed['blocks'])) {
                    return $parsed;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('OpenAI extractStructure failed: ' . $e->getMessage());
        }

        return $this->fallbackProvider->extractStructure($text, $pageNumber, $context);
    }

    public function translate(string $content, string $fromLocale, string $toLocale, string $contentType = 'text'): string
    {
        if (empty($this->apiKey) || $fromLocale === $toLocale || $contentType === 'code') {
            return $this->fallbackProvider->translate($content, $fromLocale, $toLocale, $contentType);
        }

        try {
            $system = "Translate from {$fromLocale} to {$toLocale} (Khmer). Never translate code, keywords, or HTML tags. Output only translation.";
            $response = Http::withToken($this->apiKey)
                ->timeout($this->timeout)
                ->post("{$this->endpoint}/chat/completions", [
                    'model' => $this->model,
                    'temperature' => 0.2,
                    'messages' => [
                        ['role' => 'system', 'content' => $system],
                        ['role' => 'user', 'content' => $content],
                    ],
                ]);

            if ($response->successful()) {
                $translated = trim($response->json('choices.0.message.content') ?? '');
                if (!empty($translated)) {
                    return $translated;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('OpenAI translate failed: ' . $e->getMessage());
        }

        return $this->fallbackProvider->translate($content, $fromLocale, $toLocale, $contentType);
    }

    public function summarize(string $content, string $locale = 'en'): string
    {
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

