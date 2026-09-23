import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

const Editor = lazy(() => import('@monaco-editor/react'));

interface Props {
    value: string;
    onChange?: (value: string) => void;
    language?: string;
    height?: string;
    readOnly?: boolean;
    className?: string;
}

export default function MonacoCodeEditor({
    value,
    onChange,
    language = 'html',
    height = '220px',
    readOnly = false,
    className,
}: Props) {
    return (
        <div className={className} style={{ height }}>
            <Suspense
                fallback={
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400 text-xs gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                        <span>Loading Code Editor...</span>
                    </div>
                }
            >
                <Editor
                    height={height}
                    language={language === 'js' ? 'javascript' : language}
                    value={value}
                    theme="vs-dark"
                    onChange={(val) => onChange && onChange(val || '')}
                    options={{
                        readOnly,
                        minimap: { enabled: false },
                        fontSize: 13,
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

