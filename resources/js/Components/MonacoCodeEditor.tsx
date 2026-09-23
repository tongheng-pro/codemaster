import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';

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

    // Monaco is heavy, so only start it when the block is about to scroll into view; until then show the plain code
    const containerRef = useRef<HTMLDivElement>(null);
    const [isNearViewport, setIsNearViewport] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || isNearViewport) return;
        if (typeof IntersectionObserver === 'undefined') {
            setIsNearViewport(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setIsNearViewport(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '600px 0px' },
        );
        observer.observe(container);

        return () => observer.disconnect();
    }, [isNearViewport]);

    const placeholder = (
        <pre
            className="w-full h-full m-0 overflow-hidden bg-[#1e1e1e] text-[#d4d4d4] text-[13px] whitespace-pre-wrap"
            style={{
                fontFamily: "'Fira Code', monospace",
                lineHeight: lineHeight ? `${lineHeight}px` : undefined,
                padding: `${verticalPadding ?? 0}px 16px ${verticalPadding ?? 0}px 64px`,
            }}
        >
            {value}
        </pre>
    );

    return (
        <div ref={containerRef} className={className} style={{ height: effectiveHeight }}>
            {!isNearViewport ? (
                placeholder
            ) : (
                <Suspense fallback={placeholder}>
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
                                // Let the mouse wheel scroll the page when the editor itself has nothing left to scroll
                                alwaysConsumeMouseWheel: false,
                            },
                        }}
                    />
                </Suspense>
            )}
        </div>
    );
}
