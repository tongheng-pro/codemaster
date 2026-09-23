import React, { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import MonacoCodeEditor from '@/Components/MonacoCodeEditor';
import CodeRunOutput from '@/Components/CodeRunOutput';
import { LANGUAGES, findLanguage } from '@/Utils/languages';
import { runCode, RunResult, RunnableMode } from '@/Utils/codeRunner';
import { useTranslation } from '@/Hooks/useTranslation';
import { Play, RotateCcw, Copy, Maximize2, Minimize2, Check, Code2, Globe, FileCode2 } from 'lucide-react';
import { cn, copyToClipboard } from '@/Utils';

interface StarterTemplate {
    title: string;
    html: string;
    css: string;
    js: string;
}

interface Props {
    templates?: Record<string, StarterTemplate>;
}

export default function Playground({ templates = {} }: Props) {
    const { t } = useTranslation();

    const defaultHtml = `<div class="hero">
  <h1>Hello from CodeMaster Playground!</h1>
  <p>Start experimenting with HTML, CSS, and JavaScript.</p>
  <button id="magicBtn">Click for Magic</button>
</div>`;

    const defaultCss = `body {
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  padding: 30px;
  background: #f8fafc;
  color: #0f172a;
}
.hero {
  max-width: 500px;
  margin: 0 auto;
  padding: 32px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
  text-align: center;
}
h1 {
  color: #059669;
  font-size: 24px;
  margin-top: 0;
}
p {
  color: #64748b;
  font-size: 15px;
  line-height: 1.6;
}
button {
  background: #059669;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.1s ease;
}
button:hover {
  background: #047857;
}
button:active {
  transform: scale(0.98);
}`;

    const defaultJs = `const btn = document.getElementById('magicBtn');
if (btn) {
  btn.addEventListener('click', () => {
    alert('Congratulations! Your interactive code is running smoothly inside the sandbox.');
  });
}
console.log('Playground initialized!');`;

    // "web": HTML/CSS/JS page with live preview. "code": any language, run in the browser when possible.
    const initialLanguage = findLanguage(new URLSearchParams(window.location.search).get('lang'));
    const [mode, setMode] = useState<'web' | 'code'>(initialLanguage ? 'code' : 'web');
    const [languageId, setLanguageId] = useState(initialLanguage?.id ?? 'python');
    const [codeByLanguage, setCodeByLanguage] = useState<Record<string, string>>({});
    const [runResult, setRunResult] = useState<RunResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [runStatus, setRunStatus] = useState('');

    const language = findLanguage(languageId) ?? LANGUAGES[0];
    const languageCode = codeByLanguage[language.id] ?? language.sample;
    const isLanguageRunnable = language.runMode === 'javascript' || language.runMode === 'python' || language.runMode === 'sql';

    const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
    const [htmlCode, setHtmlCode] = useState(defaultHtml);
    const [cssCode, setCssCode] = useState(defaultCss);
    const [jsCode, setJsCode] = useState(defaultJs);
    const [previewDoc, setPreviewDoc] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [copied, setCopied] = useState(false);

    function compileSandbox() {
        const combined = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' data:; connect-src 'none';">
  <style>
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
  <script>
    try {
      ${jsCode}
    } catch(err) {
      console.error(err);
    }
  </script>
</body>
</html>`;
        setPreviewDoc(combined);
    }

    useEffect(() => {
        compileSandbox();
    }, []);

    const runLanguageCode = useCallback(async () => {
        if (!isLanguageRunnable || isRunning) return;
        setIsRunning(true);
        setRunStatus('');
        const result = await runCode(language.runMode as RunnableMode, languageCode, setRunStatus);
        setRunResult(result);
        setIsRunning(false);
    }, [isLanguageRunnable, isRunning, language, languageCode]);

    function handleRun() {
        if (mode === 'web') {
            compileSandbox();
        } else {
            runLanguageCode();
        }
    }

    // Ctrl/Cmd + Enter runs the code
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                handleRun();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    });

    function changeLanguage(nextLanguageId: string) {
        setLanguageId(nextLanguageId);
        setRunResult(null);
    }

    function handleReset() {
        if (mode === 'code') {
            setCodeByLanguage((previous) => ({ ...previous, [language.id]: language.sample }));
            setRunResult(null);
            return;
        }
        setHtmlCode(defaultHtml);
        setCssCode(defaultCss);
        setJsCode(defaultJs);
        compileSandbox();
    }

    function handleCopy() {
        let codeToCopy = '';
        if (mode === 'code') codeToCopy = languageCode;
        else if (activeTab === 'html') codeToCopy = htmlCode;
        else if (activeTab === 'css') codeToCopy = cssCode;
        else if (activeTab === 'js') codeToCopy = jsCode;

        copyToClipboard(codeToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function loadTemplate(key: string) {
        const tpl = templates[key];
        if (tpl) {
            setHtmlCode(tpl.html);
            setCssCode(tpl.css);
            setJsCode(tpl.js);
            compileSandbox();
        }
    }

    return (
        <AppLayout title={t('playground.title')}>
            <div className={cn('p-4 sm:p-6 lg:p-8 flex flex-col flex-1', isFullscreen && 'fixed inset-0 z-50 bg-neutral-900')}>
                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                            <Code2 className="w-6 h-6 text-primary-500" />
                            <span>{t('playground.title')}</span>
                        </h1>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{t('playground.subtitle')}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Mode switch */}
                        <div className="inline-flex rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800/60 p-0.5 text-xs font-semibold">
                            {(
                                [
                                    { value: 'web', label: 'Web page', icon: Globe },
                                    { value: 'code', label: 'Code', icon: FileCode2 },
                                ] as const
                            ).map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setMode(option.value)}
                                    className={cn(
                                        'flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors',
                                        mode === option.value
                                            ? 'bg-white dark:bg-neutral-900 text-primary-600 dark:text-primary-400 shadow-xs'
                                            : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200',
                                    )}
                                >
                                    <option.icon className="w-3.5 h-3.5" />
                                    <span>{option.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Language selector (code mode) */}
                        {mode === 'code' && (
                            <select
                                value={language.id}
                                onChange={(e) => changeLanguage(e.target.value)}
                                aria-label="Language"
                                className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-700 dark:text-neutral-200"
                            >
                                <optgroup label="Runs in your browser">
                                    {LANGUAGES.filter((item) => item.runMode).map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.label}
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup label="Editing only">
                                    {LANGUAGES.filter((item) => !item.runMode).map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.label}
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                        )}

                        {/* Templates Selector */}
                        {mode === 'web' && Object.keys(templates).length > 0 && (
                            <select
                                onChange={(e) => e.target.value && loadTemplate(e.target.value)}
                                className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-700 dark:text-neutral-200"
                                defaultValue=""
                            >
                                <option value="" disabled>
                                    {t('playground.templates')}
                                </option>
                                {Object.entries(templates).map(([k, v]) => (
                                    <option key={k} value={k}>
                                        {v.title}
                                    </option>
                                ))}
                            </select>
                        )}

                        <button
                            type="button"
                            onClick={handleRun}
                            disabled={mode === 'code' && (!isLanguageRunnable || isRunning)}
                            title={
                                mode === 'code' && !isLanguageRunnable
                                    ? `${language.label} can't run in the browser; you can still write and copy it.`
                                    : 'Run (Ctrl/⌘ + Enter)'
                            }
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-xs transition-colors shadow-sm"
                        >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>{t('common.run')}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl text-xs font-medium transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{t('common.reset')}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl text-xs font-medium transition-colors"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? t('common.copied') : t('common.copy')}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-1.5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl text-xs transition-colors"
                            title={isFullscreen ? t('common.exit_fullscreen') : t('common.fullscreen')}
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Code mode: any language + output */}
                {mode === 'code' && (
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[500px]">
                        <div className="flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
                            <div className="px-4 py-2.5 bg-neutral-100/70 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold">
                                <span className="font-mono text-primary-600 dark:text-primary-400">{language.label}</span>
                                <span className="text-[11px] font-medium text-neutral-500">
                                    {isLanguageRunnable ? 'Runs in your browser' : 'Editing only'}
                                </span>
                            </div>
                            <div className="flex-1 min-h-[450px]">
                                <MonacoCodeEditor
                                    key={language.id}
                                    value={languageCode}
                                    onChange={(value) => setCodeByLanguage((previous) => ({ ...previous, [language.id]: value }))}
                                    language={language.monaco}
                                    height="100%"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs min-h-[300px]">
                            {isLanguageRunnable ? (
                                <CodeRunOutput
                                    result={runResult}
                                    isRunning={isRunning}
                                    status={runStatus}
                                    className="flex-1"
                                    emptyMessage="Press Run (or Ctrl/⌘ + Enter) to see the output here."
                                />
                            ) : (
                                <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-neutral-900 text-center">
                                    <div className="max-w-sm space-y-2">
                                        <FileCode2 className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-600" />
                                        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                                            {language.label} can&rsquo;t run in the browser
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            You can still write, highlight and copy {language.label} code here. JavaScript, Python and SQL
                                            run right in the browser.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Editor & Preview Split Grid */}
                {mode === 'web' && (
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[500px]">
                        {/* Left Pane: Code Tabs & Editor */}
                        <div className="flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
                            {/* Tab Headers */}
                            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-800/40 px-2 pt-2">
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('html')}
                                        className={cn(
                                            'px-4 py-2 rounded-t-xl text-xs font-semibold font-mono transition-colors',
                                            activeTab === 'html'
                                                ? 'bg-white dark:bg-neutral-900 text-primary-600 dark:text-primary-400 border-t-2 border-primary-500'
                                                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200',
                                        )}
                                    >
                                        HTML
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('css')}
                                        className={cn(
                                            'px-4 py-2 rounded-t-xl text-xs font-semibold font-mono transition-colors',
                                            activeTab === 'css'
                                                ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 border-t-2 border-blue-500'
                                                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200',
                                        )}
                                    >
                                        CSS
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('js')}
                                        className={cn(
                                            'px-4 py-2 rounded-t-xl text-xs font-semibold font-mono transition-colors',
                                            activeTab === 'js'
                                                ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 border-t-2 border-amber-500'
                                                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200',
                                        )}
                                    >
                                        JavaScript
                                    </button>
                                </div>
                            </div>

                            {/* Editor Active Body */}
                            <div className="flex-1 min-h-[450px]">
                                {activeTab === 'html' && (
                                    <MonacoCodeEditor value={htmlCode} onChange={(v) => setHtmlCode(v)} language="html" height="100%" />
                                )}
                                {activeTab === 'css' && (
                                    <MonacoCodeEditor value={cssCode} onChange={(v) => setCssCode(v)} language="css" height="100%" />
                                )}
                                {activeTab === 'js' && (
                                    <MonacoCodeEditor value={jsCode} onChange={(v) => setJsCode(v)} language="javascript" height="100%" />
                                )}
                            </div>
                        </div>

                        {/* Right Pane: Live Sandboxed Output */}
                        <div className="flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
                            <div className="px-4 py-2.5 bg-neutral-100/70 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                <span>{t('playground.preview')}</span>
                                <span className="text-[10px] text-primary-600 font-mono">Isolated Sandbox</span>
                            </div>
                            <div className="flex-1 bg-white min-h-[450px]">
                                <iframe
                                    srcDoc={previewDoc}
                                    title="Playground Preview"
                                    sandbox="allow-scripts"
                                    className="w-full h-full border-0 bg-white"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
