import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

function readStoredTheme(): Theme {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'light' || stored === 'dark' ? stored : 'system';
    } catch {
        return 'system';
    }
}

function applyTheme(theme: Theme): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
}

/**
 * Light / dark / system theme preference, saved in localStorage and applied as the "dark" class on <html>.
 */
export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(readStoredTheme);

    const setTheme = useCallback((nextTheme: Theme) => {
        try {
            localStorage.setItem(STORAGE_KEY, nextTheme);
        } catch {
            // Storage can be unavailable (private mode); the theme still applies for this visit
        }
        setThemeState(nextTheme);
        applyTheme(nextTheme);
    }, []);

    // Follow OS changes while the preference is "system"
    useEffect(() => {
        if (theme !== 'system') return;

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = () => applyTheme('system');
        media.addEventListener('change', onChange);

        return () => media.removeEventListener('change', onChange);
    }, [theme]);

    return { theme, setTheme };
}
