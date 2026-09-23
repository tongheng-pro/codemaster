import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
    course: {
        id: number;
        slug: string;
        icon?: string;
        color?: string;
        order: number;
        is_published: boolean;
        en_title: string;
        en_description: string;
        km_title: string;
        km_description: string;
    };
}

export default function Edit({ course }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        slug: course.slug,
        color: course.color || '#10b981',
        icon: course.icon || 'Code2',
        order: course.order,
        is_published: course.is_published,
        en_title: course.en_title || '',
        en_description: course.en_description || '',
        km_title: course.km_title || '',
        km_description: course.km_description || '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/admin/courses/${course.id}`);
    }

    return (
        <AdminLayout title={`Edit Course: ${course.en_title || course.slug}`}>
            <div className="max-w-4xl mx-auto space-y-6">
                <Link
                    href="/admin/courses"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Courses</span>
                </Link>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* General Settings */}
                    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                            Course Settings
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1">Slug (URL)</label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-950 font-mono"
                                    required
                                />
                                {errors.slug && <div className="text-xs text-red-500 mt-1">{errors.slug}</div>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">Color Theme</label>
                                <input
                                    type="text"
                                    value={data.color}
                                    onChange={(e) => setData('color', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-950 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">Order</label>
                                <input
                                    type="number"
                                    value={data.order}
                                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-950"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                                <input
                                    type="checkbox"
                                    checked={data.is_published}
                                    onChange={(e) => setData('is_published', e.target.checked)}
                                    className="rounded border-neutral-300 text-primary-600"
                                />
                                <span>Published (Visible to students)</span>
                            </label>
                        </div>
                    </div>

                    {/* Dual Translations Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* English Content */}
                        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-base">🇬🇧</span>
                                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                    English Translation
                                </h3>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-semibold">Title</label>
                                <input
                                    type="text"
                                    value={data.en_title}
                                    onChange={(e) => setData('en_title', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-950"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-semibold">Description</label>
                                <textarea
                                    value={data.en_description}
                                    onChange={(e) => setData('en_description', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-950"
                                />
                            </div>
                        </div>

                        {/* Khmer Content */}
                        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-base">🇰🇭</span>
                                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                    Khmer Translation (ភាសាខ្មែរ)
                                </h3>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-semibold">ចំណងជើង (Title)</label>
                                <input
                                    type="text"
                                    value={data.km_title}
                                    onChange={(e) => setData('km_title', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-950"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-semibold">ការពិពណ៌នា (Description)</label>
                                <textarea
                                    value={data.km_description}
                                    onChange={(e) => setData('km_description', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-950"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

