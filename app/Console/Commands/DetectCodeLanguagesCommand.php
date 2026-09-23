<?php

namespace App\Console\Commands;

use App\Models\ContentBlock;
use App\Services\AI\Providers\LocalRuleAIProvider;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('books:detect-languages {--all : Re-detect every code block, not only ones marked as plain text}')]
#[Description('Re-detect the programming language of imported book code blocks (for highlighting and the Run button)')]
class DetectCodeLanguagesCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(LocalRuleAIProvider $detector): int
    {
        $updated = [];
        $checked = 0;

        ContentBlock::query()
            ->whereIn('type', ['code', 'example'])
            ->with('translations')
            ->chunkById(500, function ($blocks) use ($detector, &$updated, &$checked) {
                foreach ($blocks as $block) {
                    $current = $block->metadata['language'] ?? null;
                    if (! $this->option('all') && $current !== null && $current !== 'plaintext') {
                        continue;
                    }

                    $checked++;
                    $detected = $detector->detectLanguage((string) $block->getTranslated('content', 'en'));
                    if ($detected === $current) {
                        continue;
                    }

                    $block->update(['metadata' => array_merge($block->metadata ?? [], ['language' => $detected])]);
                    $updated[$detected] = ($updated[$detected] ?? 0) + 1;
                }
            });

        $this->info("Checked {$checked} code blocks, updated ".array_sum($updated).'.');
        foreach ($updated as $language => $count) {
            $this->line("  {$language}: {$count}");
        }

        return self::SUCCESS;
    }
}
