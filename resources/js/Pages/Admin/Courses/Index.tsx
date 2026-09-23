import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { Course } from '@/Types';
import { Plus, Edit, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
    courses: any[];
}

export default function Index({ courses = [] }: Props) {
    const { t } = useTranslation();

    function handleDelete(id: number, slug: string) {
        if (confirm(`Are you sure you want to delete course "${slug}"?`)) {
            router.delete(`/admin/courses/${id}`);
        }
    }

    return (
        <AdminLayout title={t('admin.manage_courses')}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                        Create, publish, and translate programming courses.
                    </p>
                    <Link
                        href="/admin/courses/create"
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Course</span>
                    </Link>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="p-4">Course</th>
                                <th className="p-4">Slug</th>
                                <th className="p-4">Lessons</th>
                                <th className="p-4">Translation Status</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {courses.map((c) => {
                                const enTrans = c.translations?.find((t: any) => t.locale === 'en');
                                const kmTrans = c.translations?.find((t: any) => t.locale === 'km');
                                const hasKm = !!(kmTrans && kmTrans.title);

                                return (
                                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {enTrans?.title || c.slug}
                                            </div>
                                            {hasKm && (
                                                <div className="text-[11px] text-slate-400">
                                                    {kmTrans.title}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 font-mono text-slate-500">{c.slug}</td>
                                        <td className="p-4">{c.lessons_count || 0}</td>
                                        <td className="p-4">
                                            {hasKm ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    <span>{t('admin.translation_complete')}</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    <span>{t('admin.missing_translation')}</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    c.is_published
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {c.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/courses/${c.id}/edit`}
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(c.id, c.slug)}
                                                    className="p-1.5 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 text-red-600"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}

