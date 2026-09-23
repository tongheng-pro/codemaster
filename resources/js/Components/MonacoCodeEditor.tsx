import React, { Suspense, lazy, useState } from 'react';
import { Loader2 } from 'lucide-react';

const Editor = lazy(() => import('@monaco-editor/react'));

interface Props {
    value: string;
    onChange?: (value: string) => void;
    language?: string;
    height?: string;
    readOnly?: boolean;
    className?: string;
    /** Equal space above and below the code, in pixels. */
    verticalPadding?: number;
    /** Fixed line height in pixels, so callers can size the editor to fit its content. */
    lineHeight?: number;
    /** Grow the editor to fit its content (including wrapped lines) up to this height in pixels; `height` is the initial size. */
    autoHeightMax?: number;
}

export default function MonacoCodeEditor({
    value,
    onChange,
    language = 'html',
    height = '220px',
    readOnly = false,
    className,
    verticalPadding,
    lineHeight,
    autoHeightMax,
}: Props) {
    const [contentHeight, setContentHeight] = useState<number | null>(null);
    const effectiveHeight = autoHeightMax && contentHeight !== null ? `${Math.min(contentHeight, autoHeightMax)}px` : height;

    return (
        <div className={className} style={{ height: effectiveHeight }}>
            <Suspense
                fallback={
                    <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-400 text-xs gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                        <span>Loading Code Editor...</span>
                    </div>
                }
            >
                <Editor
                    height={effectiveHeight}
                    language={language === 'js' ? 'javascript' : language}
                    value={value}
                    theme="vs-dark"
                    onChange={(val) => onChange && onChange(val || '')}
                    onMount={(editor, monaco) => {
                        // Fira Code loads after Monaco measures text, which misaligns code with line numbers; re-measure once fonts are ready
                        document.fonts?.ready.then(() => monaco.editor.remeasureFonts());

                        if (autoHeightMax) {
                            setContentHeight(editor.getContentHeight());
                            editor.onDidContentSizeChange((event) => {
                                if (event.contentHeightChanged) {
                                    setContentHeight(event.contentHeight);
                                }
                            });
                        }
                    }}
                    options={{
                        readOnly,
                        minimap: { enabled: false },
                        fontSize: 13,
                        ...(lineHeight ? { lineHeight } : {}),
                        ...(verticalPadding ? { padding: { top: verticalPadding, bottom: verticalPadding } } : {}),
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                        fontFamily: "'Fira Code', monospace",
                        fontLigatures: true,
                        scrollbar: {
                            verticalScrollbarSize: 6,
                            horizontalScrollbarSize: 6,
                        },
                    }}
                />
            </Suspense>
        </div>
    );
}

