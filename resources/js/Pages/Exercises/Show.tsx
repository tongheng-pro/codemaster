import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import MonacoCodeEditor from '@/Components/MonacoCodeEditor';
import { useTranslation } from '@/Hooks/useTranslation';
import { Exercise, ExerciseTestCase } from '@/Types';
import {
    Play,
    RotateCcw,
    HelpCircle,
    Eye,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Check,
    Award,
} from 'lucide-react';
import { cn, showToast } from '@/Utils';

interface Props {
    exercise: Exercise;
}

interface TestResult {
    id: number;
    description: string;
    passed: boolean;
}

export default function Show({ exercise }: Props) {
    const { t } = useTranslation();
    const [code, setCode] = useState(
        exercise.user_attempt?.submitted_code || exercise.initial_code
    );
    const [showHint, setShowHint] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [hasEvaluated, setHasEvaluated] = useState(exercise.user_attempt?.passed || false);
    const [isAllPassed, setIsAllPassed] = useState(exercise.user_attempt?.passed || false);
    const [previewDoc, setPreviewDoc] = useState('');

    function runEvaluation() {
        const results: TestResult[] = [];
        const parser = new DOMParser();
        const doc = parser.parseFromString(code, 'text/html');

        const testCases: ExerciseTestCase[] = exercise.test_cases || [];

        testCases.forEach((tc) => {
            let passed = false;

            if (tc.assertion_type === 'dom_element_exists') {
                if (tc.selector) {
                    const el = doc.querySelector(tc.selector);
                    passed = !!el;
                }
            } else if (tc.assertion_type === 'dom_text_contains') {
                if (tc.selector) {
                    const el = doc.querySelector(tc.selector);
                    if (el) {
                        const text = el.textContent || '';
                        passed = text.toLowerCase().includes((tc.expected_value || '').toLowerCase());
                    }
                }
            } else if (tc.assertion_type === 'regex_match') {
                if (tc.expected_value) {
                    try {
                        const regex = new RegExp(tc.expected_value, 'i');
                        passed = regex.test(code);
                    } catch (e) {
                        passed = false;
                    }
                }
            } else {
                passed = true;
            }

            results.push({
                id: tc.id,
                description: tc.description || `Test: ${tc.assertion_type}`,
                passed,
            });
        });

        const allPassed = results.length > 0 && results.every((r) => r.passed);
        setTestResults(results);
        setHasEvaluated(true);
        setIsAllPassed(allPassed);

        // Update sandbox preview
        setPreviewDoc(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:sans-serif;margin:16px;color:#1e293b;}</style></head>
<body>${code}</body>
</html>`);

        recordAttempt(allPassed);
    }

    // The attempt endpoint returns JSON (not an Inertia page), so send it with fetch like the quiz page does
    async function recordAttempt(passed: boolean) {
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const response = await fetch(`/exercises/${exercise.id}/attempt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
                body: JSON.stringify({ submitted_code: code, passed }),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data: { passed: boolean; points: number } = await response.json();
            if (data.passed && data.points > 0) {
                showToast(`Passed! +${data.points} points`);
            }
        } catch (error) {
            console.error('Could not save the exercise attempt:', error);
            showToast('Your result could not be saved. Please try again.', 'error');
        }
    }

    function handleReset() {
        setCode(exercise.initial_code);
        setTestResults([]);
        setHasEvaluated(false);
        setIsAllPassed(false);
    }

    return (
        <AppLayout title={`${exercise.title} - ${t('exercises.title')}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col flex-1">
                {/* Back navigation */}
                <div className="mb-4">
                    <Link
                        href="/exercises"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{t('exercises.title')}</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                    {/* Left Pane: Instructions & Requirements */}
                    <div className="lg:col-span-5 space-y-6 flex flex-col">
                        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-mono text-xs uppercase font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                                    {exercise.language}
                                </span>
                                <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                    <Award className="w-4 h-4" />
                                    <span>{exercise.points} Points</span>
                                </div>
                            </div>

                            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-3">
                                {exercise.title}
                            </h1>

                            <div className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed mb-6 font-sans">
                                {exercise.instructions}
                            </div>

                            {/* Test Cases Results Breakdown */}
                            {hasEvaluated && (
                                <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                                        {t('exercises.test_cases')}
                                    </h4>

                                    {isAllPassed ? (
                                        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 flex items-center gap-2 text-sm font-semibold">
                                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                            <span>{t('common.correct')}</span>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 flex items-center gap-2 text-sm font-semibold">
                                            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                                            <span>{t('common.incorrect')}</span>
                                        </div>
                                    )}

                                    <div className="space-y-2 mt-2">
                                        {testResults.map((tr) => (
                                            <div
                                                key={tr.id}
                                                className={cn(
                                                    'p-3 rounded-xl border flex items-center justify-between text-xs font-medium',
                                                    tr.passed
                                                        ? 'bg-green-50/40 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-200'
                                                        : 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
                                                )}
                                            >
                                                <span>{tr.description}</span>
                                                {tr.passed ? (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-red-600" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Hint and Solution toggles */}
                            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
                                {exercise.hint && (
                                    <button
                                        type="button"
                                        onClick={() => setShowHint(!showHint)}
                                        className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                                    >
                                        <HelpCircle className="w-3.5 h-3.5" />
                                        <span>{t('common.hint')}</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowSolution(!showSolution)}
                                    className="text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>{t('common.show_answer')}</span>
                                </button>
                            </div>

                            {/* Hint Box */}
                            {showHint && exercise.hint && (
                                <div className="mt-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                                    <div className="font-bold mb-1">{t('exercises.hint_title')}</div>
                                    <div>{exercise.hint}</div>
                                </div>
                            )}

                            {/* Solution Box */}
                            {showSolution && (
                                <div className="mt-3 p-3.5 rounded-xl bg-neutral-900 text-neutral-100 border border-neutral-800 text-xs font-mono">
                                    <div className="font-sans font-bold text-amber-400 mb-1">
                                        {t('exercises.solution_title')}:
                                    </div>
                                    <pre className="overflow-x-auto p-2 bg-neutral-950 rounded-lg">
                                        {exercise.solution_code}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Pane: Code Editor & Action Buttons */}
                    <div className="lg:col-span-7 flex flex-col space-y-4">
                        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs flex-1 flex flex-col">
                            {/* Toolbar */}
                            <div className="flex items-center justify-between px-4 py-3 bg-neutral-100/70 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800">
                                <span className="text-xs font-bold font-mono text-neutral-600 dark:text-neutral-300 uppercase">
                                    {exercise.language} Editor
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl text-xs font-medium transition-colors"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>{t('common.reset')}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={runEvaluation}
                                        className="flex items-center gap-1.5 px-5 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                                    >
                                        <Play className="w-3.5 h-3.5 fill-white" />
                                        <span>{t('common.submit')}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Monaco Editor */}
                            <div className="flex-1 min-h-[300px]">
                                <MonacoCodeEditor
                                    value={code}
                                    onChange={(val) => setCode(val)}
                                    language={exercise.language}
                                    height="340px"
                                />
                            </div>

                            {/* Output Sandbox Preview */}
                            {previewDoc && (
                                <div className="border-t border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-neutral-950">
                                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                                        {t('common.preview')}
                                    </div>
                                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white overflow-hidden">
                                        <iframe
                                            srcDoc={previewDoc}
                                            title="Sandbox Preview"
                                            sandbox="allow-scripts"
                                            className="w-full h-32 border-0 bg-white"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

