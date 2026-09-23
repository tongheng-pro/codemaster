import { usePage, router } from '@inertiajs/react';
import { PageProps, Locale } from '@/Types';

export function useTranslation() {
    const { props } = usePage<PageProps>();
    const translations = props.translations || {};
    const currentLocale = (props.locale as Locale) || 'en';

    /**
     * Translate key using dot notation, e.g. 'nav.home' or 'home.hero_title'.
     * Optionally replace :param placeholders.
     */
    function t(key: string, replacements?: Record<string, string | number>): string {
        const parts = key.split('.');
        let current: any = translations;

        for (const part of parts) {
            if (current === undefined || current === null || typeof current !== 'object') {
                current = undefined;
                break;
            }
            current = current[part];
        }

        let result = typeof current === 'string' ? current : key;

        if (replacements) {
            Object.entries(replacements).forEach(([param, value]) => {
                result = result.replace(new RegExp(`:${param}`, 'g'), String(value));
            });
        }

        return result;
    }

    /**
     * Switch language without page jump or loss of state.
     */
    function switchLocale(newLocale: Locale) {
        if (newLocale === currentLocale) {
            return;
        }

        router.post(
            '/locale',
            { locale: newLocale },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    // Update HTML lang attribute
                    document.documentElement.lang = newLocale;
                },
            }
        );
    }

    return {
        t,
        locale: currentLocale,
        switchLocale,
        isKhmer: currentLocale === 'km',
    };
}

