<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default AI Provider
    |--------------------------------------------------------------------------
    |
    | Supported: "local", "gemini", "openai"
    | "local" uses an intelligent rule-based heuristic extractor and translator
    | that works 100% offline with zero external API fees or latency.
    |
    */

    'default' => env('AI_PROVIDER', 'local'),

    /*
    |--------------------------------------------------------------------------
    | AI Providers Configuration
    |--------------------------------------------------------------------------
    */

    'providers' => [
        'local' => [
            'name' => 'Local Rule-Based Parser',
        ],

        'gemini' => [
            'name' => 'Google Gemini AI',
            'api_key' => env('GEMINI_API_KEY', ''),
            'model' => env('GEMINI_MODEL', 'gemini-2.5-flash'),
            'endpoint' => env('GEMINI_ENDPOINT', 'https://generativelanguage.googleapis.com/v1beta'),
            'timeout' => 45,
        ],

        'openai' => [
            'name' => 'OpenAI',
            'api_key' => env('OPENAI_API_KEY', ''),
            'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
            'endpoint' => env('OPENAI_ENDPOINT', 'https://api.openai.com/v1'),
            'timeout' => 45,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Processing Options & Cost Controls
    |--------------------------------------------------------------------------
    */

    'options' => [
        'confidence_threshold' => (float) env('AI_CONFIDENCE_THRESHOLD', 0.80),
        'chunk_pages' => (int) env('AI_CHUNK_PAGES', 2),
        'cache_results' => (bool) env('AI_CACHE_RESULTS', true),
        'cache_ttl_hours' => 72,
    ],

];
