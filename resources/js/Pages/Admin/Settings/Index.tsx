import React from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { NavigationSettings } from '@/Types';
import { BookOpen, Code2, Flower2, HelpCircle, Library, PanelTop, Terminal } from 'lucide-react';
import { cn } from '@/Utils';

interface Props {
    navigation: NavigationSettings;
    siteEffect: string;
}

const EFFECT_OPTIONS: Array<{ value: string; emoji: string; name: string; kind: string; description: string }> = [
    { value: 'none', emoji: '🚫', name: 'None', kind: 'Off', description: 'No effect. Nothing extra is loaded.' },
    { value: 'sakura', emoji: '🌸', name: 'Sakura petals', kind: 'Mouse', description: 'Cherry blossom petals drift behind the cursor.' },
    { value: 'snow', emoji: '❄️', name: 'Snowfall', kind: 'Background', description: 'Soft snowflakes fall across the page.' },
    { value: 'leaves', emoji: '🍂', name: 'Autumn leaves', kind: 'Background', description: 'Warm-coloured leaves tumble down.' },
    {
        value: 'fireflies',
        emoji: '✨',
        name: 'Fireflies',
        kind: 'Background',
        description: 'Glowing dots wander and blink. Best in dark mode.',
    },
    { value: 'sparkles', emoji: '⭐', name: 'Sparkles', kind: 'Mouse', description: 'Twinkling stars pop out behind the cursor.' },
    { value: 'bubbles', emoji: '🫧', name: 'Bubbles', kind: 'Mouse', description: 'Soap bubbles rise from the cursor and pop.' },
    { value: 'magic-dust', emoji: '🪄', name: 'Magic dust', kind: 'Mouse', description: 'Golden fairy dust falls from the cursor.' },
    { value: 'hearts', emoji: '💗', name: 'Hearts', kind: 'Mouse', description: 'Little hearts float up and fade.' },
    { value: 'code', emoji: '⌨️', name: 'Code symbols', kind: 'Mouse', description: 'Symbols like { } and </> float up from the cursor.' },
    { value: 'confetti', emoji: '🎉', name: 'Confetti', kind: 'Click', description: 'A confetti burst on every click or tap.' },
    { value: 'ripple', emoji: '💧', name: 'Ripple', kind: 'Click', description: 'A soft ring spreads out where you click.' },
];

function Switch({ isOn, onToggle, disabled }: { isOn: boolean; onToggle: () => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={isOn}
            disabled={disabled}
            onClick={onToggle}
            className={cn(
                'relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50',
                isOn ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-700',
            )}
        >
            <span
                className={cn(
                    'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                    isOn && 'translate-x-5',
                )}
            />
        </button>
    );
}

export default function SettingsIndex({ navigation, siteEffect }: Props) {
    const [savingEffect, setSavingEffect] = React.useState<string | null>(null);

    // The effect's scripts are included by the page template, so reload for the change to apply everywhere at once
    const chooseEffect = (effect: string) => {
        if (effect === siteEffect || savingEffect) return;
        setSavingEffect(effect);
        router.put(
            '/admin/settings/effects',
            { effect },
            {
                preserveScroll: true,
                onSuccess: () => window.location.reload(),
                onFinish: () => setSavingEffect(null),
            },
        );
    };

    const { t } = useTranslation();
    const { data, setData, put, processing, isDirty, recentlySuccessful } = useForm({ navigation });

    const items: Array<{ key: keyof NavigationSettings; label: string; href: string; icon: typeof BookOpen }> = [
        { key: 'courses', label: t('nav.courses'), href: '/courses', icon: BookOpen },
        { key: 'books', label: t('nav.books'), href: '/books', icon: Library },
        { key: 'exercises', label: t('nav.exercises'), href: '/exercises', icon: Terminal },
        { key: 'quizzes', label: t('nav.quizzes'), href: '/quizzes', icon: HelpCircle },
        { key: 'playground', label: t('nav.playground'), href: '/playground', icon: Code2 },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/settings/navigation', { preserveScroll: true });
    };

    return (
        <AdminLayout title="Settings">
            <div className="space-y-6">
                <form
                    onSubmit={handleSubmit}
                    className="max-w-2xl rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
                >
                    <div className="p-5 border-b border-neutral-100 dark:border-neutral-800">
                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                            <PanelTop className="w-4 h-4 text-primary-500" />
                            <span>Navbar menu</span>
                        </h2>
                        <p className="text-xs text-neutral-500 mt-1">
                            Choose which links appear in the website's top menu. Hidden pages still work if someone opens their address
                            directly.
                        </p>
                    </div>

                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {items.map((item) => {
                            const isEnabled = data.navigation[item.key];
                            return (
                                <label key={item.key} className="flex items-center justify-between gap-4 p-4 cursor-pointer">
                                    <span className="flex items-center gap-3 min-w-0">
                                        <item.icon className="w-4 h-4 shrink-0 text-neutral-400" />
                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium text-neutral-900 dark:text-white">{item.label}</span>
                                            <span className="block text-xs text-neutral-400 font-mono">{item.href}</span>
                                        </span>
                                    </span>

                                    <Switch
                                        isOn={isEnabled}
                                        onToggle={() => setData('navigation', { ...data.navigation, [item.key]: !isEnabled })}
                                    />
                                </label>
                            );
                        })}
                    </div>

                    <div className="p-4 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                        {recentlySuccessful && <span className="text-xs text-green-600">Saved</span>}
                        <button
                            type="submit"
                            disabled={processing || !isDirty}
                            className="px-5 py-2 rounded-full bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white text-xs font-semibold transition-colors"
                        >
                            {processing ? 'Saving...' : 'Save changes'}
                        </button>
                    </div>
                </form>

                <div className="max-w-2xl rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
                    <div className="p-5 pb-0">
                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                            <Flower2 className="w-4 h-4 text-pink-500" />
                            <span>Effects</span>
                        </h2>
                    </div>
                    <p className="px-5 pt-4 text-xs text-neutral-500">
                        Pick one effect for the whole site; it saves immediately. Mouse effects only run on computers, and every effect is
                        skipped for visitors who turn on &ldquo;reduce motion&rdquo;.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
                        {EFFECT_OPTIONS.map((option) => {
                            const isSelected = option.value === siteEffect;
                            const isSaving = option.value === savingEffect;
                            return (
                                <div
                                    key={option.value}
                                    className={cn(
                                        'relative rounded-xl border p-3 transition-colors',
                                        isSelected
                                            ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/40'
                                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700',
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={() => chooseEffect(option.value)}
                                        disabled={savingEffect !== null}
                                        aria-pressed={isSelected}
                                        className="w-full flex items-start gap-3 text-left disabled:cursor-wait"
                                    >
                                        <span className="text-2xl leading-none shrink-0" aria-hidden="true">
                                            {option.emoji}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-neutral-900 dark:text-white">{option.name}</span>
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                                                    {option.kind}
                                                </span>
                                            </span>
                                            <span className="block text-xs text-neutral-500 mt-0.5">{option.description}</span>
                                        </span>
                                        <span className="shrink-0 text-xs font-semibold text-primary-600 dark:text-primary-400">
                                            {isSaving ? 'Saving…' : isSelected ? 'Active' : ''}
                                        </span>
                                    </button>
                                    {option.value !== 'none' && (
                                        <a
                                            href={`/effects/demo.html?effect=${option.value}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block mt-2 ml-10 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                                        >
                                            Preview
                                        </a>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
