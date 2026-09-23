import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { TOAST_EVENT, ToastType } from '@/Utils';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

/**
 * Global toast shown at the bottom of the screen; trigger it with showToast() from '@/Utils'.
 */
export default function Toaster() {
    const [toast, setToast] = useState<Toast | null>(null);
    const hideTimer = useRef<number>();

    useEffect(() => {
        const onToast = (event: Event) => {
            const { message, type } = (event as CustomEvent<{ message: string; type: ToastType }>).detail;
            setToast({ id: Date.now(), message, type });
            window.clearTimeout(hideTimer.current);
            hideTimer.current = window.setTimeout(() => setToast(null), 2200);
        };

        window.addEventListener(TOAST_EVENT, onToast);
        return () => {
            window.removeEventListener(TOAST_EVENT, onToast);
            window.clearTimeout(hideTimer.current);
        };
    }, []);

    if (!toast) return null;

    const Icon = toast.type === 'success' ? CheckCircle2 : XCircle;

    return (
        <div className="fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4 pointer-events-none" role="status" aria-live="polite">
            <div
                key={toast.id}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-900/90 dark:bg-white/90 text-white dark:text-neutral-900 text-sm font-medium shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-2"
            >
                <Icon className={toast.type === 'success' ? 'w-4 h-4 text-green-400 dark:text-green-600' : 'w-4 h-4 text-red-400 dark:text-red-600'} />
                <span>{toast.message}</span>
            </div>
        </div>
    );
}
