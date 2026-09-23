import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { Plus, Edit, Trash2, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';

interface Props {
    lessons: Array<{
        id: number;
        slug: string;
        order: number;
        duration_minutes: number;
        is_published: boolean;
        course_slug: string;
        course_title: string;
        en_title: string;
        has_km: boolean;
    }>;
}

export default function Index({ lessons = [] }: Props) {
    const { t } = useTranslation();

    function handleDelete(id: number, slug: string) {
        if (confirm(`Are you sure you want to delete lesson "${slug}"?`)) {
            router.delete(`/admin/lessons/${id}`);
        }
    }

    return (
        <AdminLayout title={t('admin.manage_lessons')}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                        Manage lessons, interactive code examples, and bilingual translations.
                    </p>
                    <Link
                        href="/admin/lessons/create"
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Lesson</span>
                    </Link>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="p-4">Lesson</th>
                                <th className="p-4">Course</th>
                                <th className="p-4">Slug</th>
                                <th className="p-4">Khmer Translation</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {lessons.map((l) => (
                                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                                        {l.en_title}
                                    </td>
                                    <td className="p-4 font-semibold text-emerald-600">
                                        {l.course_title}
                                    </td>
                                    <td className="p-4 font-mono text-slate-500">{l.slug}</td>
                                    <td className="p-4">
                                        {l.has_km ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                                <CheckCircle2 className="w-3 h-3" />
                                                <span>Translated</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                                                <AlertTriangle className="w-3 h-3" />
                                                <span>Missing Khmer</span>
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                l.is_published
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {l.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/${l.course_slug}/${l.slug}`}
                                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"
                                                title="View Lesson"
                                                target="_blank"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </Link>
                                            <Link
                                                href={`/admin/lessons/${l.id}/edit`}
                                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"
                                                title="Edit"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(l.id, l.slug)}
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

