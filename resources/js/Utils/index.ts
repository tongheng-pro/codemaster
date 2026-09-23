import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}


export type ToastType = 'success' | 'error';

export const TOAST_EVENT = 'app:toast';

/**
 * Show a short message in the global toast (rendered by <Toaster /> in app.tsx).
 */
export function showToast(message: string, type: ToastType = 'success'): void {
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, type } }));
}

/**
 * Copy text to the clipboard and show a toast with the result.
 *
 * The Clipboard API only exists on HTTPS or localhost, so on plain HTTP (e.g. http://SERVER_IP:PORT)
 * this falls back to a hidden textarea and document.execCommand('copy').
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    const isCopied = await writeToClipboard(text);
    showToast(isCopied ? 'Copied to clipboard' : 'Copy failed. Select the code and press Ctrl+C.', isCopied ? 'success' : 'error');

    return isCopied;
}

async function writeToClipboard(text: string): Promise<boolean> {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Fall through to the legacy method (e.g. permission denied)
        }
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    try {
        return document.execCommand('copy');
    } catch {
        return false;
    } finally {
        document.body.removeChild(textarea);
        previouslyFocused?.focus?.();
    }
}
