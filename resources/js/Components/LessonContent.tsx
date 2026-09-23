import React from 'react';
import { LessonContentBlock } from '@/Types';
import InteractiveCodeBlock from '@/Components/InteractiveCodeBlock';
import { Info, AlertTriangle, Lightbulb } from 'lucide-react';
import { cn } from '@/Utils';

interface Props {
    blocks?: LessonContentBlock[];
    className?: string;
}

export default function LessonContent({ blocks = [], className }: Props) {
    if (!blocks || blocks.length === 0) {
        return null;
    }

    return (
        <div className={cn('space-y-6 text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans', className)}>
            {blocks.map((block, index) => {
                switch (block.type) {
                    case 'heading': {
                        const level = block.level || 2;
                        const id = block.content
                            ? block.content.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                            : `heading-${index}`;

                        if (level === 2) {
                            return (
                                <h2
                                    key={index}
                                    id={id}
                                    className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white pt-6 pb-2 border-b border-neutral-100 dark:border-neutral-800 scroll-mt-24"
                                >
                                    {block.content}
                                </h2>
                            );
                        }
                        if (level === 3) {
                            return (
                                <h3
                                    key={index}
                                    id={id}
                                    className="text-lg font-semibold text-neutral-900 dark:text-white pt-4 scroll-mt-24"
                                >
                                    {block.content}
                                </h3>
                            );
                        }
                        return (
                            <h4
                                key={index}
                                id={id}
                                className="text-base font-semibold text-neutral-800 dark:text-neutral-200 pt-2 scroll-mt-24"
                            >
                                {block.content}
                            </h4>
                        );
                    }

                    case 'paragraph': {
                        return (
                            <p
                                key={index}
                                className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed"
                            >
                                {block.content}
                            </p>
                        );
                    }

                    case 'code_example': {
                        return (
                            <InteractiveCodeBlock
                                key={index}
                                title={block.title}
                                language={block.language || 'html'}
                                initialCode={block.initial_code || ''}
                            />
                        );
                    }

                    case 'info_box': {
                        return (
                            <div
                                key={index}
                                className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 flex gap-3 text-sm my-4"
                            >
                                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    {block.title && <div className="font-semibold text-xs uppercase tracking-wider">{block.title}</div>}
                                    <div>{block.content}</div>
                                </div>
                            </div>
                        );
                    }

                    case 'warning_box': {
                        return (
                            <div
                                key={index}
                                className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex gap-3 text-sm my-4"
                            >
                                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    {block.title && <div className="font-semibold text-xs uppercase tracking-wider">{block.title}</div>}
                                    <div>{block.content}</div>
                                </div>
                            </div>
                        );
                    }

                    case 'tip_box': {
                        return (
                            <div
                                key={index}
                                className="p-4 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 text-primary-900 dark:text-primary-200 flex gap-3 text-sm my-4"
                            >
                                <Lightbulb className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    {block.title && <div className="font-semibold text-xs uppercase tracking-wider">{block.title}</div>}
                                    <div>{block.content}</div>
                                </div>
                            </div>
                        );
                    }

                    default:
                        return null;
                }
            })}
        </div>
    );
}

