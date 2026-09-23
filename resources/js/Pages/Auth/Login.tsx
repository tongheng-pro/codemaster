import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { Code2, LogIn } from 'lucide-react';

export default function Login() {
    const { t } = useTranslation();

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/login');
    }

    return (
        <AppLayout title={t('auth.login_title')}>
            <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-xl space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                            <Code2 className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {t('auth.login_title')}
                        </h1>
                        <p className="text-xs text-slate-500">
                            {t('auth.login_subtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {t('auth.email')}
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="name@example.com"
                                required
                            />
                            {errors.email && <div className="text-xs text-red-500">{errors.email}</div>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {t('auth.password')}
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                required
                            />
                            {errors.password && <div className="text-xs text-red-500">{errors.password}</div>}
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span>{t('auth.remember_me')}</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>{t('nav.login')}</span>
                        </button>
                    </form>

                    <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                        <Link href="/register" className="text-emerald-600 hover:underline font-semibold">
                            {t('auth.dont_have_account')}
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

