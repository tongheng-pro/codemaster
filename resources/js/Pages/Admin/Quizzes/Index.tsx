import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { Plus, Trash2, Eye } from 'lucide-react';

interface Props {
    quizzes: Array<{
        id: number;
        slug: string;
        pass_percentage: number;
        course_title: string;
        en_title: string;
        questions_count: number;
    }>;
}

export default function Index({ quizzes = [] }: Props) {
    const { t } = useTranslation();

    function handleDelete(id: number, slug: string) {
        if (confirm(`Delete quiz "${slug}"?`)) {
            router.delete(`/admin/quizzes/${id}`);
        }
    }

    return (
        <AdminLayout title={t('admin.manage_quizzes')}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-500">
                        Create skill quizzes, configure question types, and set correct answers.
                    </p>
                    <Link
                        href="/admin/quizzes/create"
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Quiz</span>
                    </Link>
                </div>

                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase font-semibold">
                            <tr>
                                <th className="p-4">Quiz Title</th>
                                <th className="p-4">Course</th>
                                <th className="p-4">Slug</th>
                                <th className="p-4">Questions</th>
                                <th className="p-4">Pass Score</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {quizzes.map((q) => (
                                <tr key={q.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                                    <td className="p-4 font-bold text-neutral-900 dark:text-white">
                                        {q.en_title}
                                    </td>
                                    <td className="p-4 text-neutral-600">{q.course_title}</td>
                                    <td className="p-4 font-mono text-neutral-500">{q.slug}</td>
                                    <td className="p-4 font-bold text-purple-600">{q.questions_count} questions</td>
                                    <td className="p-4 font-mono">{q.pass_percentage}%</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/quizzes/${q.slug}`}
                                                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 text-neutral-600"
                                                target="_blank"
                                                title="View Quiz"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(q.id, q.slug)}
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

