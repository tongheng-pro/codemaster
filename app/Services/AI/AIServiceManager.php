<?php

namespace App\Services\AI;

use App\Models\Book;
use App\Services\AI\Providers\GeminiProvider;
use App\Services\AI\Providers\LocalRuleAIProvider;
use App\Services\AI\Providers\OpenAIProvider;
use InvalidArgumentException;

class AIServiceManager implements AIProviderInterface
{
    protected AIProviderInterface $provider;

    public function __construct(?string $driver = null)
    {
        $driver = $driver ?: config('ai.default', 'local');
        $this->provider = $this->resolveProvider($driver);
    }

    protected function resolveProvider(string $driver): AIProviderInterface
    {
        return match ($driver) {
            'gemini' => new GeminiProvider(),
            'openai' => new OpenAIProvider(),
            'local' => new LocalRuleAIProvider(),
            default => throw new InvalidArgumentException("Unsupported AI provider: {$driver}"),
        };
    }

    public function getProvider(): AIProviderInterface
    {
        return $this->provider;
    }

    public function extractStructure(string $text, int $pageNumber, array $context = []): array
    {
        return $this->provider->extractStructure($text, $pageNumber, $context);
    }

    public function translate(string $content, string $fromLocale, string $toLocale, string $contentType = 'text'): string
    {
        return $this->provider->translate($content, $fromLocale, $toLocale, $contentType);
    }

    public function summarize(string $content, string $locale = 'en'): string
    {
        return $this->provider->summarize($content, $locale);
    }

    public function classifyContent(string $rawText): string
    {
        return $this->provider->classifyContent($rawText);
    }

    public function askQuestion(Book $book, string $question, string $locale = 'en'): array
    {
        return $this->provider->askQuestion($book, $question, $locale);
    }
}

