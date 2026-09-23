import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import MonacoCodeEditor from '@/Components/MonacoCodeEditor';
import { useTranslation } from '@/Hooks/useTranslation';
import {
    Play,
    RotateCcw,
    Copy,
    Maximize2,
    Minimize2,
    Check,
    Code2,
    Sparkles,
} from 'lucide-react';
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

    function handleReset() {
        setHtmlCode(defaultHtml);
        setCssCode(defaultCss);
        setJsCode(defaultJs);
        compileSandbox();
    }

    function handleCopy() {
        let codeToCopy = '';
        if (activeTab === 'html') codeToCopy = htmlCode;
        if (activeTab === 'css') codeToCopy = cssCode;
        if (activeTab === 'js') codeToCopy = jsCode;

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
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {t('playground.subtitle')}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Templates Selector */}
                        {Object.keys(templates).length > 0 && (
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
                            onClick={compileSandbox}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm"
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

                {/* Editor & Preview Split Grid */}
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
                                            : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
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
                                            : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
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
                                            : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                                    )}
                                >
                                    JavaScript
                                </button>
                            </div>
                        </div>

                        {/* Editor Active Body */}
                        <div className="flex-1 min-h-[450px]">
                            {activeTab === 'html' && (
                                <MonacoCodeEditor
                                    value={htmlCode}
                                    onChange={(v) => setHtmlCode(v)}
                                    language="html"
                                    height="100%"
                                />
                            )}
                            {activeTab === 'css' && (
                                <MonacoCodeEditor
                                    value={cssCode}
                                    onChange={(v) => setCssCode(v)}
                                    language="css"
                                    height="100%"
                                />
                            )}
                            {activeTab === 'js' && (
                                <MonacoCodeEditor
                                    value={jsCode}
                                    onChange={(v) => setJsCode(v)}
                                    language="javascript"
                                    height="100%"
                                />
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
            </div>
        </AppLayout>
    );
}

