import React, { useState, useEffect } from 'react';
import MonacoCodeEditor from '@/Components/MonacoCodeEditor';
import { useTranslation } from '@/Hooks/useTranslation';
import { Play, RotateCcw, Copy, Check, Eye } from 'lucide-react';
import { cn, copyToClipboard } from '@/Utils';

interface Props {
    title?: string;
    language?: string;
    initialCode: string;
    className?: string;
}

export default function InteractiveCodeBlock({
    title,
    language = 'html',
    initialCode,
    className,
}: Props) {
    const { t } = useTranslation();
    const [code, setCode] = useState(initialCode);
    // The preview is ready on the first render: an iframe that starts empty and gets srcdoc later can stay blank in some browsers
    const [previewContent, setPreviewContent] = useState(() => generatePreview(initialCode));
    // Changing the key remounts the iframe, so every Run loads a fresh document
    const [previewVersion, setPreviewVersion] = useState(0);
    const [copied, setCopied] = useState(false);

    // Build sandboxed HTML payload
    function generatePreview(rawCode: string) {
        if (language === 'html') {
            return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' data:; connect-src 'none';">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 16px;
      color: #1e293b;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  ${rawCode}
</body>
</html>`;
        }

        if (language === 'javascript' || language === 'js') {
            return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: monospace; font-size: 13px; margin: 12px; color: #1e293b; }
    .log-entry { padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
    .log-error { color: #dc2626; font-weight: bold; }
  </style>
</head>
<body>
  <div id="output"></div>
  <script>
    const output = document.getElementById('output');
    function log(...args) {
      const line = document.createElement('div');
      line.className = 'log-entry';
      line.textContent = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
      output.appendChild(line);
    }
    console.log = log;
    console.warn = log;
    try {
      ${rawCode}
    } catch (e) {
      const err = document.createElement('div');
      err.className = 'log-entry log-error';
      err.textContent = 'Error: ' + e.message;
      output.appendChild(err);
    }
  </script>
</body>
</html>`;
        }

        if (language === 'css') {
            return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; margin: 16px; }
    ${rawCode}
  </style>
</head>
<body>
  <div class="box">Styled Box Preview</div>
  <p>Sample paragraph to demonstrate CSS selectors.</p>
  <button>Sample Button</button>
</body>
</html>`;
        }

        return rawCode;
    }

    useEffect(() => {
        setCode(initialCode);
        showPreview(initialCode);
    }, [initialCode]);

    function showPreview(rawCode: string) {
        setPreviewContent(generatePreview(rawCode));
        setPreviewVersion((version) => version + 1);
    }

    function handleRun() {
        showPreview(code);
    }

    function handleReset() {
        setCode(initialCode);
        showPreview(initialCode);
    }

    function handleCopy() {
        copyToClipboard(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className={cn('rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden my-6', className)}>
            {/* Header / Language Badge */}
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-neutral-100/80 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 font-mono uppercase font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded border border-primary-200 dark:border-primary-800">
                        {language}
                    </span>
                    {title && <span className="font-medium text-neutral-700 dark:text-neutral-200 truncate">{title}</span>}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button
                        type="button"
                        onClick={handleRun}
                        className="flex items-center gap-1 px-3 py-1 whitespace-nowrap bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
                    >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>{t('common.run')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                        title={t('common.reset')}
                        aria-label={t('common.reset')}
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                        title={copied ? t('common.copied') : t('common.copy')}
                        aria-label={t('common.copy')}
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            {/* Monaco Code Editor Container */}
            <div className="border-b border-neutral-200 dark:border-neutral-800">
                <MonacoCodeEditor
                    value={code}
                    onChange={(newVal) => setCode(newVal)}
                    language={language}
                    height="180px"
                />
            </div>

            {/* Output / Preview Container */}
            <div className="bg-neutral-50 dark:bg-neutral-950 p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t('common.result')}</span>
                </div>
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white overflow-hidden shadow-inner">
                    <iframe
                        key={previewVersion}
                        srcDoc={previewContent}
                        title="Code Preview"
                        sandbox="allow-scripts"
                        className="w-full h-36 border-0 bg-white"
                    />
                </div>
            </div>
        </div>
    );
}

