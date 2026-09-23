import React from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { NavigationSettings } from '@/Types';
import { BookOpen, Code2, Flower2, HelpCircle, Library, PanelTop, Terminal } from 'lucide-react';
import { cn } from '@/Utils';

interface Props {
    navigation: NavigationSettings;
    sakuraEnabled: boolean;
}

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

export default function SettingsIndex({ navigation, sakuraEnabled }: Props) {
    const [isSavingSakura, setIsSavingSakura] = React.useState(false);

    // The effect's scripts are included by the page template, so reload for the change to apply everywhere at once
    const toggleSakura = () => {
        setIsSavingSakura(true);
        router.put(
            '/admin/settings/effects',
            { sakura: !sakuraEnabled },
            {
                preserveScroll: true,
                onSuccess: () => window.location.reload(),
                onFinish: () => setIsSavingSakura(false),
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
                    <div className="p-5 border-b border-neutral-100 dark:border-neutral-800">
                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                            <Flower2 className="w-4 h-4 text-pink-500" />
                            <span>Effects</span>
                        </h2>
                    </div>
                    <div className="flex items-center justify-between gap-4 p-4">
                        <span className="min-w-0">
                            <span className="block text-sm font-medium text-neutral-900 dark:text-white">Sakura petals</span>
                            <span className="block text-xs text-neutral-400">
                                Cherry blossom petals follow the mouse on desktop. Saves immediately.
                            </span>
                        </span>
                        <Switch isOn={sakuraEnabled} onToggle={toggleSakura} disabled={isSavingSakura} />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
