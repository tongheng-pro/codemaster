import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { Plus, Trash2, Eye } from 'lucide-react';

interface Props {
    exercises: Array<{
        id: number;
        slug: string;
        language: string;
        difficulty: string;
        points: number;
        course_title: string;
        en_title: string;
        test_cases_count: number;
    }>;
}

export default function Index({ exercises = [] }: Props) {
    const { t } = useTranslation();

    function handleDelete(id: number, slug: string) {
        if (confirm(`Delete exercise "${slug}"?`)) {
            router.delete(`/admin/exercises/${id}`);
        }
    }

    return (
        <AdminLayout title={t('admin.manage_exercises')}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-500">
                        Create coding exercises, define test cases, and write hints.
                    </p>
                    <Link
                        href="/admin/exercises/create"
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Exercise</span>
                    </Link>
                </div>

                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase font-semibold">
                            <tr>
                                <th className="p-4">Exercise</th>
                                <th className="p-4">Course</th>
                                <th className="p-4">Language</th>
                                <th className="p-4">Difficulty</th>
                                <th className="p-4">Points</th>
                                <th className="p-4">Test Cases</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {exercises.map((e) => (
                                <tr key={e.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                                    <td className="p-4 font-bold text-neutral-900 dark:text-white">
                                        {e.en_title}
                                    </td>
                                    <td className="p-4 text-neutral-600">{e.course_title}</td>
                                    <td className="p-4 font-mono uppercase font-bold text-blue-600">{e.language}</td>
                                    <td className="p-4 capitalize">{e.difficulty}</td>
                                    <td className="p-4 font-mono font-bold text-amber-600">{e.points}</td>
                                    <td className="p-4">{e.test_cases_count} cases</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/exercises/${e.slug}`}
                                                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 text-neutral-600"
                                                target="_blank"
                                                title="View"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(e.id, e.slug)}
                                                className="p-1.5 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 text-red-600"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
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

