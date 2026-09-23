<?php

namespace App\Services\AI\Providers;

use App\Models\Book;
use App\Services\AI\AIProviderInterface;

class LocalRuleAIProvider implements AIProviderInterface
{
    /**
     * Technical vocabulary mapping for English -> Khmer translation preserving code and syntax.
     */
    protected array $technicalGlossary = [
        'Getting started' => 'ការចាប់ផ្តើម',
        'Introduction' => 'សេចក្តីផ្តើម',
        'Overview' => 'ទិដ្ឋភាពទូទៅ',
        'Summary' => 'សេចក្តីសង្ខេប',
        'Syntax' => 'ទម្រង់វេយ្យាករណ៍ (Syntax)',
        'Example' => 'ឧទាហរណ៍',
        'Examples' => 'ឧទាហរណ៍នានា',
        'Parameter' => 'ប៉ារ៉ាម៉ែត្រ (Parameter)',
        'Parameters' => 'ប៉ារ៉ាម៉ែត្រ (Parameters)',
        'Details' => 'ព័ត៌មានលម្អិត',
        'Description' => 'ការពិពណ៌នា',
        'Note' => 'ចំណាំ',
        'Notes' => 'ចំណាំសំខាន់ៗ',
        'Warning' => 'ការព្រមាន',
        'Important' => 'សំខាន់',
        'Definition' => 'និយមន័យ',
        'Exercise' => 'លំហាត់អនុវត្ត',
        'Exercises' => 'លំហាត់អនុវត្ត',
        'Answer' => 'ចម្លើយ',
        'Output' => 'លទ្ធផលបង្ហាញ (Output)',
        'Result' => 'លទ្ធផល',
        'Best practice' => 'ការអនុវត្តល្អបំផុត',
        'Browser support' => 'ការគាំទ្រនៅលើកម្មវិធីរុករក (Browser)',
        'Attributes' => 'គុណលក្ខណៈ (Attributes)',
        'Elements' => 'ធាតុផ្សំ (Elements)',
        'Tags' => 'ស្លាកកូដ (Tags)',
        'Headings' => 'ចំណងជើង (Headings)',
        'Paragraphs' => 'កថាខណ្ឌ (Paragraphs)',
        'Lists' => 'បញ្ជី (Lists)',
        'Tables' => 'តារាង (Tables)',
        'Comments' => 'មតិយោបល់ក្នុងកូដ (Comments)',
        'Classes and IDs' => 'ថ្នាក់ និង អត្តសញ្ញាណ (Classes and IDs)',
        'Selectors' => 'ឧបករណ៍ជ្រើសរើស (Selectors)',
        'Backgrounds' => 'ផ្ទៃខាងក្រោយ (Backgrounds)',
        'Centering' => 'ការតម្រឹមចំកណ្តាល (Centering)',
        'Variables' => 'អថេរ (Variables)',
        'Functions' => 'អនុគមន៍ (Functions)',
        'Objects' => 'វត្ថុ (Objects)',
        'Arrays' => 'អារេ (Arrays)',
    ];

    /**
     * Matches a chapter heading line, e.g. "Chapter 1: Getting started with HTML".
     */
    public const CHAPTER_PATTERN = '/^Chapter\s+(\d+)\s*[:\-\.]\s*(.+)$/i';

    /**
     * Matches a chapter heading anywhere inside multi-line page text.
     */
    public const CHAPTER_PATTERN_MULTILINE = '/^\s*Chapter\s+\d+\s*[:\-\.]\s*\S/im';

    /**
     * Matches a section heading line, e.g. "Section 1.1: Hello World" or "1.1: Hello World".
     */
    public const SECTION_PATTERN = '/^(?:Section\s+(?=\d)|(?=\d+\.\d+\s*:))(\d+(?:\.\d+)+)\s*[:\-\.]?\s*(.+)$/i';

    /**
     * Extract chapters, sections, and granular content blocks from raw page text.
     *
     * Blank lines from the PDF layout are used to separate blocks, so paragraphs, code samples,
     * tables, lists and callouts keep the same grouping and indentation as the original page.
     */
    public function extractStructure(string $text, int $pageNumber, array $context = []): array
    {
        $lines = array_map('rtrim', preg_split('/\r\n|\r|\n/', str_replace("\f", '', $text)));

        $detectedChapter = null;
        $detectedSection = null;

        foreach ($lines as $index => $line) {
            $trimmed = trim($line);

            if ($this->isNoiseLine($trimmed)) {
                $lines[$index] = '';

                continue;
            }

            if (! $detectedChapter && ! $detectedSection && preg_match(self::CHAPTER_PATTERN, $trimmed, $matches)) {
                $chapterNumber = (int) $matches[1];
                $chapterTitle = trim($matches[2]);
                $detectedChapter = [
                    'number' => $chapterNumber,
                    'title' => $chapterTitle,
                    'description' => "Chapter {$chapterNumber}: {$chapterTitle}",
                ];
                $lines[$index] = '';
            } elseif (! $detectedSection && preg_match(self::SECTION_PATTERN, $trimmed, $matches)) {
                $sectionNumber = trim($matches[1]);
                $sectionTitle = trim($matches[2]);
                $detectedSection = [
                    'number' => $sectionNumber,
                    'title' => $sectionTitle,
                    'summary' => "Section {$sectionNumber} covering {$sectionTitle}.",
                ];
                $lines[$index] = '';
            }
        }

        $blocks = [];
        $previousGroupEndedWithCode = false;

        foreach ($this->groupLines($lines) as $group) {
            $previousGroupEndedWithCode = $this->parseGroup($group, $blocks, $pageNumber, $previousGroupEndedWithCode);
        }

        foreach ($blocks as $index => $block) {
            unset($blocks[$index]['metadata']['raw_lines']);
        }

        return [
            'chapter' => $detectedChapter,
            'section' => $detectedSection,
            'blocks' => $blocks,
        ];
    }

    /**
     * Determine if a line is page furniture (running footer, table of contents entry, bare page number).
     */
    public function isNoiseLine(string $line): bool
    {
        return (bool) preg_match('/^GoalKicker\.com\s+[–\-]|^\d{1,4}$|\.{5,}\s*\d+$/u', $line);
    }

    /**
     * Split lines into groups separated by blank lines.
     *
     * @param  array<int, string>  $lines
     * @return array<int, array<int, string>>
     */
    protected function groupLines(array $lines): array
    {
        $groups = [];
        $current = [];

        foreach ($lines as $line) {
            if (trim($line) === '') {
                if (! empty($current)) {
                    $groups[] = $current;
                    $current = [];
                }

                continue;
            }

            $current[] = $line;
        }

        if (! empty($current)) {
            $groups[] = $current;
        }

        return $groups;
    }

    /**
     * Convert a group of consecutive lines into one or more content blocks.
     *
     * @param  array<int, string>  $group
     * @return bool Whether the group ended with a code line (so the next code group continues the same sample).
     */
    protected function parseGroup(array $group, array &$blocks, int $pageNumber, bool $continueCode): bool
    {
        $trimmed = array_map('trim', $group);
        $codeLineCount = count(array_filter($trimmed, fn (string $line) => $this->isCodeLine($line)));

        if ($codeLineCount < count($group) / 2 && $this->looksLikeTable($group)) {
            $blocks[] = $this->makeBlock('table', $this->dedent($group), $pageNumber, 0.85, ['format' => 'preformatted']);

            return false;
        }

        if (preg_match('/^(Note|Important|Warning|Caution|Tip)\s*[:\-]\s*(.*)$/i', $trimmed[0], $callout)) {
            $label = ucfirst(strtolower($callout[1]));
            $type = in_array($label, ['Warning', 'Caution'], true) ? 'warning' : 'note';
            $content = trim($callout[2].' '.implode(' ', array_slice($trimmed, 1)));
            $blocks[] = $this->makeBlock($type, $content, $pageNumber, 0.98, ['label' => $label]);

            return false;
        }

        if (preg_match('/^(\d+\.|[•\-\*▪◦])\s+\S/u', $trimmed[0]) && ! $this->isCodeLine($trimmed[0])) {
            $blocks[] = $this->makeListBlock($trimmed, $pageNumber);

            return false;
        }

        $textBuffer = [];
        $codeBuffer = [];
        $endedWithCode = false;

        foreach ($group as $index => $line) {
            $isIndented = strlen($line) - strlen(ltrim($line)) > 0;
            $isProseContinuation = ! empty($textBuffer)
                && preg_match('/^[a-z]/', $trimmed[$index])
                && ! preg_match('/[;\{\}>]$/', $trimmed[$index]);
            $isCode = ! $isProseContinuation && ($this->isCodeLine($trimmed[$index])
                || (! empty($codeBuffer) && ($isIndented || preg_match('/^[\}\]\)]/', $trimmed[$index]))));

            if ($isCode) {
                if (! empty($textBuffer)) {
                    $this->flushTextBuffer($textBuffer, $blocks, $pageNumber);
                    $textBuffer = [];
                }
                $codeBuffer[] = $line;
                $endedWithCode = true;
            } else {
                if (! empty($codeBuffer)) {
                    $this->flushCodeBuffer($codeBuffer, $blocks, $pageNumber, $continueCode);
                    $codeBuffer = [];
                    $continueCode = false;
                }
                $textBuffer[] = $line;
                $endedWithCode = false;
            }
        }

        if (! empty($codeBuffer)) {
            $this->flushCodeBuffer($codeBuffer, $blocks, $pageNumber, $continueCode);
        }

        if (! empty($textBuffer)) {
            $this->flushTextBuffer($textBuffer, $blocks, $pageNumber);
        }

        return $endedWithCode;
    }

    /**
     * Determine if a group of lines is a column-aligned table (e.g. "Parameter    Details").
     *
     * @param  array<int, string>  $group
     */
    protected function looksLikeTable(array $group): bool
    {
        if (count($group) < 2) {
            return false;
        }

        $gapLines = count(array_filter($group, fn (string $line) => (bool) preg_match('/\S {3,}\S/', ltrim($line))));
        $deeplyIndented = count(array_filter($group, fn (string $line) => (bool) preg_match('/^ {6,}\S/', $line)));

        return $gapLines >= 2 || ($gapLines >= 1 && $deeplyIndented >= 2);
    }

    /**
     * Build a list block from bullet or numbered lines, folding wrapped lines into the previous item.
     *
     * @param  array<int, string>  $lines
     */
    protected function makeListBlock(array $lines, int $pageNumber): array
    {
        $items = [];
        $ordered = (bool) preg_match('/^\d+\./', $lines[0]);

        foreach ($lines as $line) {
            if (preg_match('/^(?:\d+\.|[•\-\*▪◦])\s+(.*)$/u', $line, $matches)) {
                $items[] = trim($matches[1]);
            } elseif (! empty($items)) {
                $items[count($items) - 1] .= ' '.$line;
            } else {
                $items[] = $line;
            }
        }

        return $this->makeBlock('list', implode("\n", $items), $pageNumber, 0.9, ['ordered' => $ordered]);
    }

    /**
     * Append buffered code lines as a code block, merging with the previous code block when the sample spans blank lines.
     *
     * @param  array<int, string>  $codeBuffer
     */
    protected function flushCodeBuffer(array $codeBuffer, array &$blocks, int $pageNumber, bool $continuePrevious): void
    {
        $lastIndex = count($blocks) - 1;

        if ($continuePrevious && $lastIndex >= 0 && $blocks[$lastIndex]['type'] === 'code') {
            $rawLines = array_merge($blocks[$lastIndex]['metadata']['raw_lines'] ?? [], [''], $codeBuffer);
            $content = $this->dedent($rawLines);
            $blocks[$lastIndex]['content'] = $content;
            $blocks[$lastIndex]['metadata'] = ['language' => $this->detectLanguage($content), 'raw_lines' => $rawLines];

            return;
        }

        $content = $this->dedent($codeBuffer);
        $blocks[] = $this->makeBlock('code', $content, $pageNumber, 0.95, [
            'language' => $this->detectLanguage($content),
            'raw_lines' => $codeBuffer,
        ]);
    }

    /**
     * Remove the common leading indentation from lines while keeping relative indentation.
     *
     * @param  array<int, string>  $lines
     */
    protected function dedent(array $lines): string
    {
        $indents = array_map(
            fn (string $line) => strlen($line) - strlen(ltrim($line)),
            array_filter($lines, fn (string $line) => trim($line) !== '')
        );
        $minIndent = empty($indents) ? 0 : min($indents);

        return implode("\n", array_map(fn (string $line) => rtrim(substr($line, $minIndent)), $lines));
    }

    /**
     * Create a content block array.
     */
    protected function makeBlock(string $type, string $content, int $pageNumber, float $confidence, ?array $metadata = null): array
    {
        return [
            'type' => $type,
            'content' => $content,
            'page_number' => $pageNumber,
            'confidence' => $confidence,
            'needs_review' => false,
            'metadata' => $metadata,
        ];
    }

    /**
     * Check if a line appears to be part of source code.
     */
    protected function isCodeLine(string $line): bool
    {
        $line = trim($line);

        if ($line === '') {
            return false;
        }

        if (preg_match('/^(<[a-zA-Z!?\/]|\/\/|\/\*|\*\/|\*\s|#!)/', $line)) {
            return true;
        }

        // Long runs of plain words are prose that merely mentions code, e.g. "console.log() can be called with any number..."
        $endsLikeCode = preg_match('/[\{\}]$/', $line) || (str_ends_with($line, ';') && preg_match('/[(=:\'"]/', $line));
        if (preg_match('/(?:\b[a-zA-Z]+\b[\s,]+){6,}/', $line) && ! $endsLikeCode) {
            return false;
        }

        $codePatterns = [
            '/^[\}\]\)]+[;,\)]*$/',
            '/^(var|let|const)\s+[\w$]+\s*(=|;|,|$)/',
            '/^(async\s+)?function\b\s*[\w$]*\s*\(/',
            '/^(if|for|while|switch|catch)\s*\(/',
            '/^(return|import|export|throw|break;|continue;|try\s*\{|else\b|do\s*\{|case\s)/',
            '/^class\s+[A-Z][\w$]*\s*(\{|extends)/',
            '/^(console|document|window|Math|JSON|Object|Array|Promise)\./',
            '/^\$\(/',
            '/^@(media|import|font-face|keyframes|supports|charset|page)\b/',
            '/^[a-z-]+\s*:\s*[^:]+;$/',
            '/^[\w\.\#\*\[\]="\':>~+\-\s,()]+\{$/',
            '/^[\w$.\[\]\'"]+\s*(=|\+=|-=|\+\+|--)\s*.*;$/',
            '/^[\w$.]+\(.*\);?$/',
            '/(;|\{|=>)$/',
        ];

        foreach ($codePatterns as $pattern) {
            if (preg_match($pattern, $line)) {
                return ! preg_match('/^[A-Z][a-z]+\s+[a-z]+\s+[a-z]+.*[\.\?!:]$/', $line);
            }
        }

        return false;
    }

    /**
     * Detect language from code content.
     */
    protected function detectLanguage(string $code): string
    {
        $trimmed = ltrim($code);

        if (str_starts_with($trimmed, '<') || preg_match('/<\/?[a-z][\w-]*[\s>]/i', $code)) {
            return 'html';
        }
        if (preg_match('/^[^=()]*\{/m', $code) && preg_match('/^\s*[a-z-]+\s*:\s*[^;]+;/m', $code)) {
            return 'css';
        }
        if (preg_match('/(function|const |let |var |console\.|=>|\);)/', $code)) {
            return 'javascript';
        }

        return 'plaintext';
    }

    /**
     * Flush accumulated text lines into a paragraph, subheading or quote block.
     *
     * @param  array<int, string>  $textBuffer
     */
    protected function flushTextBuffer(array $textBuffer, array &$blocks, int $pageNumber): void
    {
        $trimmed = array_map('trim', $textBuffer);
        $joined = trim(preg_replace('/\s+/', ' ', implode(' ', $trimmed)));

        if ($joined === '') {
            return;
        }

        $allIndented = count(array_filter($textBuffer, fn (string $line) => (bool) preg_match('/^ {4,}\S/', $line))) === count($textBuffer);

        if (count($trimmed) === 1 && mb_strlen($joined) < 60 && ! preg_match('/[\.\?!:,;\)]$/', $joined) && ! preg_match('/^[a-z]/', $joined) && ! str_contains($joined, ',')) {
            $blocks[] = $this->makeBlock('subheading', $joined, $pageNumber, 0.9);
        } elseif ($allIndented) {
            $blocks[] = $this->makeBlock('quote', $joined, $pageNumber, 0.9);
        } else {
            $blocks[] = $this->makeBlock('paragraph', $joined, $pageNumber, 0.95);
        }
    }

    /**
     * Translate text safely into Khmer, preserving syntax, HTML elements, and code tokens.
     */
    public function translate(string $content, string $fromLocale, string $toLocale, string $contentType = 'text'): string
    {
        if ($fromLocale === $toLocale) {
            return $content;
        }

        // If translating to English, return content (source of truth)
        if ($toLocale === 'en') {
            return $content;
        }

        // Code blocks should never be translated!
        if ($contentType === 'code' || $this->isCodeLine($content)) {
            return $content;
        }

        $translated = $content;

        // Apply glossary replacements for known technical phrases
        foreach ($this->technicalGlossary as $en => $km) {
            $translated = preg_replace('/\b'.preg_quote($en, '/').'\b/i', $km, $translated);
        }

        // Handle common conversational/educational patterns
        $patterns = [
            '/The\s+([a-zA-Z0-9_\-]+)\s+element\s+defines/i' => 'ធាតុផ្សំ $1 កំណត់អំពី',
            '/The\s+([a-zA-Z0-9_\-]+)\s+property\s+sets/i' => 'លក្ខណៈ $1 កំណត់អំពី',
            '/This\s+topic\s+covers/i' => 'ប្រធានបទនេះរៀបរាប់អំពី',
            '/For\s+example/i' => 'ឧទាហរណ៍',
            '/In\s+this\s+example/i' => 'នៅក្នុងឧទាហរណ៍នេះ',
            '/It\s+is\s+recommended\s+to/i' => 'វាត្រូវបានណែនាំឱ្យ',
            '/Click\s+here\s+to/i' => 'ចុចទីនេះដើម្បី',
            '/You\s+can\s+use/i' => 'អ្នកអាចប្រើប្រាស់',
        ];

        foreach ($patterns as $pattern => $replacement) {
            $translated = preg_replace($pattern, $replacement, $translated);
        }

        return $translated;
    }

    /**
     * Summarize text.
     */
    public function summarize(string $content, string $locale = 'en'): string
    {
        $sentences = preg_split('/(?<=[.?!])\s+/', trim($content));
        $firstFew = array_slice($sentences, 0, 2);
        $summary = implode(' ', $firstFew);

        if ($locale === 'km') {
            return $this->translate($summary, 'en', 'km');
        }

        return $summary;
    }

    /**
     * Classify single text block.
     */
    public function classifyContent(string $rawText): string
    {
        $trimmed = trim($rawText);
        if ($this->isCodeLine($trimmed)) {
            return 'code';
        }
        if (preg_match('/^(Note|Important|Warning)/i', $trimmed)) {
            return 'note';
        }
        if (preg_match('/^(Exercise|Practice|Question)\b/i', $trimmed)) {
            return 'exercise';
        }
        if (strlen($trimmed) < 80 && str_ends_with($trimmed, ':')) {
            return 'subheading';
        }

        return 'paragraph';
    }

    /**
     * Grounded Question & Answering:
     * Answers questions strictly based on the book's sections and content blocks,
     * providing exact chapter, section, and PDF page number citations!
     */
    public function askQuestion(Book $book, string $question, string $locale = 'en'): array
    {
        $keywords = array_filter(
            preg_split('/\s+/', strtolower(preg_replace('/[^\w\s]/', '', $question))),
            fn ($w) => strlen($w) > 2
        );

        $book->loadMissing(['chapters.sections.contentBlocks.translations', 'chapters.translations', 'sections.translations']);

        $matches = [];

        foreach ($book->chapters as $chapter) {
            $chapterTitle = $chapter->getTranslated('title', 'en');
            foreach ($chapter->sections as $section) {
                $sectionTitle = $section->getTranslated('title', 'en');
                foreach ($section->contentBlocks as $block) {
                    $blockText = $block->getTranslated('content', 'en') ?: '';
                    $lowerBlock = strtolower($blockText);

                    $score = 0;
                    foreach ($keywords as $kw) {
                        if (str_contains($lowerBlock, $kw)) {
                            $score += 10;
                        }
                    }

                    if ($score > 0) {
                        $matches[] = [
                            'score' => $score,
                            'chapter' => "Chapter {$chapter->chapter_number}: {$chapterTitle}",
                            'section' => "Section {$section->section_number}: {$sectionTitle}",
                            'page' => $block->page_number ?: ($section->page_number ?: 1),
                            'text' => $blockText,
                            'type' => $block->type,
                        ];
                    }
                }
            }
        }

        usort($matches, fn ($a, $b) => $b['score'] <=> $a['score']);
        $topMatches = array_slice($matches, 0, 3);

        if (empty($topMatches)) {
            $notFoundEn = "I could not find information regarding \"{$question}\" in this book ({$book->getTranslated('title', 'en')}). Please verify the topic exists in the table of contents.";

            return [
                'answer' => $locale === 'km' ? $this->translate($notFoundEn, 'en', 'km') : $notFoundEn,
                'citations' => [],
                'grounded' => false,
            ];
        }

        $citationList = [];
        $answerParts = [];

        foreach ($topMatches as $match) {
            $citationList[] = [
                'chapter' => $match['chapter'],
                'section' => $match['section'],
                'page' => $match['page'],
                'text' => mb_substr($match['text'], 0, 160).'...',
            ];
            $answerParts[] = "According to {$match['section']} (Page {$match['page']}): \"{$match['text']}\"";
        }

        $answerText = implode("\n\n", $answerParts);

        if ($locale === 'km') {
            $answerText = $this->translate($answerText, 'en', 'km');
        }

        return [
            'answer' => $answerText,
            'citations' => $citationList,
            'grounded' => true,
        ];
    }
}
