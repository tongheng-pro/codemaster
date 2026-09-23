import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { PageProps } from '@/Types';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
    title?: string;
    children: React.ReactNode;
}

export default function AppLayout({ title, children }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [flashSuccess, setFlashSuccess] = useState<string | null>(flash?.success || null);
    const [flashError, setFlashError] = useState<string | null>(flash?.error || null);

    useEffect(() => {
        setFlashSuccess(flash?.success || null);
        setFlashError(flash?.error || null);
    }, [flash]);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
            {title && <Head title={title} />}

            <Navbar />

            {/* Flash Notifications */}
            {flashSuccess && (
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{flashSuccess}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFlashSuccess(null)}
                            className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg text-emerald-600 dark:text-emerald-400"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {flashError && (
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between text-xs text-red-800 dark:text-red-200">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                            <span>{flashError}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFlashError(null)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg text-red-600 dark:text-red-400"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            <main className="flex-1 flex flex-col">
                {children}
            </main>

            <Footer />
        </div>
    );
}

