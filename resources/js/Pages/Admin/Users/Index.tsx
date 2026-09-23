import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { Users, Search, Shield, Ban, CheckCircle2 } from 'lucide-react';

interface Props {
    users: {
        data: Array<{
            id: number;
            name: string;
            email: string;
            role: string;
            locale: string;
            is_active: boolean;
            course_progress_count: number;
            lesson_progress_count: number;
            exercise_attempts_count: number;
            quiz_attempts_count: number;
            certificates_count: number;
            created_at: string;
        }>;
        links: any[];
    };
    filters: { search?: string };
}

export default function Index({ users, filters }: Props) {
    const { t } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/admin/users', { search }, { preserveState: true });
    }

    function toggleRole(userId: number) {
        router.post(`/admin/users/${userId}/toggle-role`, {}, { preserveScroll: true });
    }

    function toggleStatus(userId: number) {
        router.post(`/admin/users/${userId}/toggle-status`, {}, { preserveScroll: true });
    }

    return (
        <AdminLayout title={t('admin.manage_users')}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xs text-neutral-500">
                        View learners, assign administrative roles, and monitor progress.
                    </p>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or email..."
                                className="pl-9 pr-4 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-white dark:bg-neutral-900 w-64"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-1.5 bg-neutral-900 dark:bg-neutral-800 text-white rounded-xl text-xs font-semibold"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase font-semibold">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Language</th>
                                <th className="p-4">Completed Lessons</th>
                                <th className="p-4">Exercises &bull; Quizzes</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {users.data.map((u) => (
                                <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                                    <td className="p-4">
                                        <div className="font-bold text-neutral-900 dark:text-white">{u.name}</div>
                                        <div className="text-neutral-400 font-mono text-[11px]">{u.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            type="button"
                                            onClick={() => toggleRole(u.id)}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                                                u.role === 'admin'
                                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                                            }`}
                                            title="Click to toggle role"
                                        >
                                            {u.role}
                                        </button>
                                    </td>
                                    <td className="p-4 font-mono uppercase">{u.locale}</td>
                                    <td className="p-4 font-mono font-semibold text-primary-600">
                                        {u.lesson_progress_count}
                                    </td>
                                    <td className="p-4 font-mono text-neutral-600">
                                        {u.exercise_attempts_count} &bull; {u.quiz_attempts_count}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                u.is_active
                                                    ? 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                            }`}
                                        >
                                            {u.is_active ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => toggleStatus(u.id)}
                                            className="px-2.5 py-1 rounded-lg border text-xs font-semibold hover:bg-neutral-100 transition-colors"
                                        >
                                            {u.is_active ? 'Disable' : 'Enable'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}

