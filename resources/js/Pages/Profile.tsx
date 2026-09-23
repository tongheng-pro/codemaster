import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { User } from '@/Types';
import { User as UserIcon, Mail, Globe, Save, Check } from 'lucide-react';

interface Props {
    user: User;
}

export default function Profile({ user }: Props) {
    const { t } = useTranslation();

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        locale: user.locale || 'en',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/profile');
    }

    return (
        <AppLayout title={t('nav.profile')}>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-10 shadow-xl space-y-8">
                    <div>
                        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                            {t('nav.profile')}
                        </h1>
                        <p className="text-xs text-neutral-500 mt-1">
                            Update your account settings and language preference.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                {t('auth.name')}
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                            {errors.name && <div className="text-xs text-red-500">{errors.name}</div>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                {t('auth.email')}
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                            {errors.email && <div className="text-xs text-red-500">{errors.email}</div>}
                        </div>

                        {/* Preferred Language */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                {t('auth.preferred_language')}
                            </label>
                            <select
                                value={data.locale}
                                onChange={(e) => setData('locale', e.target.value as 'en' | 'km')}
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="en">English (🇬🇧 English)</option>
                                <option value="km">ភាសាខ្មែរ (🇰🇭 Khmer)</option>
                            </select>
                        </div>

                        {/* Bio */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                Bio / Goals
                            </label>
                            <textarea
                                value={data.bio}
                                onChange={(e) => setData('bio', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Aspiring full-stack web developer..."
                            />
                        </div>

                        <div className="pt-4 flex items-center justify-between">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                <span>{t('common.save')}</span>
                            </button>

                            {recentlySuccessful && (
                                <span className="text-xs font-semibold text-primary-600 flex items-center gap-1">
                                    <Check className="w-4 h-4" />
                                    <span>Saved successfully!</span>
                                </span>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

