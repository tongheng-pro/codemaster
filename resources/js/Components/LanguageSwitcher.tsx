import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/Utils';

export default function LanguageSwitcher({ className }: { className?: string }) {
    const { locale, switchLocale } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const languages = [
        { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
        { code: 'km', label: 'Khmer', native: 'ភាសាខ្មែរ', flag: '🇰🇭' },
    ];

    const currentLang = languages.find((l) => l.code === locale) || languages[0];

    return (
        <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 whitespace-nowrap text-xs sm:text-sm font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-xs"
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label="Switch language"
            >
                <span className="text-base leading-none">{currentLang.flag}</span>
                <span className="hidden md:inline font-sans">{currentLang.native}</span>
                <span className="md:hidden font-mono font-bold uppercase">{currentLang.code}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl py-1 z-50 animate-in fade-in-50 zoom-in-95">
                    <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase border-b border-neutral-100 dark:border-neutral-800">
                        Select Language
                    </div>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                switchLocale(lang.code as 'en' | 'km');
                            }}
                            className={cn(
                                'w-full text-left px-3 py-2 text-xs sm:text-sm flex items-center justify-between hover:bg-primary-50 dark:hover:bg-primary-950/40 text-neutral-700 dark:text-neutral-200 transition-colors',
                                locale === lang.code && 'font-semibold text-primary-600 dark:text-primary-400 bg-primary-50/60 dark:bg-primary-950/20'
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-base">{lang.flag}</span>
                                <div>
                                    <div className="leading-snug">{lang.native}</div>
                                    <div className="text-[11px] text-neutral-400 dark:text-neutral-500">{lang.label}</div>
                                </div>
                            </div>
                            {locale === lang.code && <Check className="w-4 h-4 text-green-500" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

