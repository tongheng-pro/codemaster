import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Theme, useTheme } from '@/Hooks/useTheme';
import { cn } from '@/Utils';

const NEXT_THEME: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' };
const THEME_LABEL: Record<Theme, string> = { light: 'Light mode', dark: 'Dark mode', system: 'System theme' };

/**
 * Cycles the theme: light → dark → system.
 */
export default function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

    return (
        <button
            type="button"
            onClick={() => setTheme(NEXT_THEME[theme])}
            title={`${THEME_LABEL[theme]} (click to change)`}
            aria-label={THEME_LABEL[theme]}
            className={cn(
                'w-9 h-9 shrink-0 flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors',
                className
            )}
        >
            <Icon className="w-4 h-4" />
        </button>
    );
}
