import React from 'react';
import { Loader2, Terminal } from 'lucide-react';
import { RunResult } from '@/Utils/codeRunner';
import { cn } from '@/Utils';

interface Props {
    result: RunResult | null;
    isRunning: boolean;
    status?: string;
    className?: string;
    /** Shown before anything has run */
    emptyMessage?: string;
}

/**
 * Terminal-style output for code run in the browser: stdout, errors in red, and SQL results as tables.
 */
export default function CodeRunOutput({ result, isRunning, status, className, emptyMessage = 'Press Run to see the output here.' }: Props) {
    const hasOutput = result && (result.stdout || result.stderr || result.tables.length > 0);

    return (
        <div className={cn('bg-[#111113] text-neutral-200 font-mono text-[13px] leading-relaxed overflow-auto', className)}>
            <div className="sticky top-0 flex items-center justify-between px-4 py-2 bg-[#111113]/95 border-b border-white/10 text-[11px] font-sans font-semibold uppercase tracking-wider text-neutral-400">
                <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Output
                </span>
                {result && !isRunning && <span className="normal-case font-mono tracking-normal">{result.durationMs} ms</span>}
            </div>

            <div className="p-4 space-y-3">
                {isRunning ? (
                    <div className="flex items-center gap-2 text-neutral-400 font-sans text-xs">
                        <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                        <span>{status || 'Running…'}</span>
                    </div>
                ) : !result ? (
                    <div className="text-neutral-500 font-sans text-xs">{emptyMessage}</div>
                ) : !hasOutput ? (
                    <div className="text-neutral-500 font-sans text-xs">Finished with no output.</div>
                ) : (
                    <>
                        {result.stdout && <pre className="m-0 whitespace-pre-wrap break-words">{result.stdout}</pre>}

                        {result.tables.map((table, tableIndex) => (
                            <div key={tableIndex} className="overflow-x-auto rounded-lg border border-white/10">
                                <table className="min-w-full text-xs">
                                    <thead className="bg-white/5 text-neutral-300">
                                        <tr>
                                            {table.columns.map((column) => (
                                                <th key={column} className="px-3 py-1.5 text-left font-semibold">
                                                    {column}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {table.values.map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {row.map((cell, cellIndex) => (
                                                    <td key={cellIndex} className="px-3 py-1.5 whitespace-nowrap">
                                                        {cell === null ? <span className="text-neutral-500">NULL</span> : String(cell)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}

                        {result.stderr && <pre className="m-0 whitespace-pre-wrap break-words text-red-400">{result.stderr}</pre>}
                    </>
                )}
            </div>
        </div>
    );
}
