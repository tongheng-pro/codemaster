import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { LessonContentBlock } from '@/Types';

interface Props {
    courses: Array<{ id: number; title: string }>;
    lesson: {
        id: number;
        course_id: number;
        slug: string;
        order: number;
        duration_minutes: number;
        is_published: boolean;
        en_title: string;
        en_description: string;
        en_content_blocks: LessonContentBlock[];
        km_title: string;
        km_description: string;
        km_content_blocks: LessonContentBlock[];
    };
}

export default function Edit({ courses = [], lesson }: Props) {
    const [enBlocks, setEnBlocks] = useState<LessonContentBlock[]>(
        lesson.en_content_blocks || []
    );
    const [kmBlocks, setKmBlocks] = useState<LessonContentBlock[]>(
        lesson.km_content_blocks || []
    );

    const { data, setData, put, processing, errors } = useForm({
        course_id: lesson.course_id,
        slug: lesson.slug,
        order: lesson.order,
        duration_minutes: lesson.duration_minutes,
        is_published: lesson.is_published,
        en_title: lesson.en_title || '',
        en_description: lesson.en_description || '',
        en_content_blocks: enBlocks,
        km_title: lesson.km_title || '',
        km_description: lesson.km_description || '',
        km_content_blocks: kmBlocks,
    });

    function addBlock(lang: 'en' | 'km', type: LessonContentBlock['type']) {
        const newBlock: LessonContentBlock = {
            type,
            content: '',
            language: type === 'code_example' ? 'html' : undefined,
            initial_code: type === 'code_example' ? '<h1>Hello World</h1>' : undefined,
        };

        if (lang === 'en') {
            const updated = [...enBlocks, newBlock];
            setEnBlocks(updated);
            setData('en_content_blocks', updated);
        } else {
            const updated = [...kmBlocks, newBlock];
            setKmBlocks(updated);
            setData('km_content_blocks', updated);
        }
    }

    function removeBlock(lang: 'en' | 'km', index: number) {
        if (lang === 'en') {
            const updated = enBlocks.filter((_, i) => i !== index);
            setEnBlocks(updated);
            setData('en_content_blocks', updated);
        } else {
            const updated = kmBlocks.filter((_, i) => i !== index);
            setKmBlocks(updated);
            setData('km_content_blocks', updated);
        }
    }

    function updateBlock(lang: 'en' | 'km', index: number, field: string, val: any) {
        if (lang === 'en') {
            const updated = [...enBlocks];
            updated[index] = { ...updated[index], [field]: val };
            setEnBlocks(updated);
            setData('en_content_blocks', updated);
        } else {
            const updated = [...kmBlocks];
            updated[index] = { ...updated[index], [field]: val };
            setKmBlocks(updated);
            setData('km_content_blocks', updated);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/admin/lessons/${lesson.id}`);
    }

    return (
        <AdminLayout title={`Edit Lesson: ${lesson.en_title || lesson.slug}`}>
            <div className="max-w-5xl mx-auto space-y-6">
                <Link
                    href="/admin/lessons"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Lessons</span>
                </Link>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Core Settings */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                            Lesson Parameters
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1">Course</label>
                                <select
                                    value={data.course_id}
                                    onChange={(e) => setData('course_id', Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-950"
                                    required
                                >
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-950 font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">Order</label>
                                <input
                                    type="number"
                                    value={data.order}
                                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-950"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">Duration (min)</label>
                                <input
                                    type="number"
                                    value={data.duration_minutes}
                                    onChange={(e) => setData('duration_minutes', parseInt(e.target.value) || 5)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-950"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                                <input
                                    type="checkbox"
                                    checked={data.is_published}
                                    onChange={(e) => setData('is_published', e.target.checked)}
                                    className="rounded border-slate-300 text-emerald-600"
                                />
                                <span>Published</span>
                            </label>
                        </div>
                    </div>

                    {/* Dual Content Builders */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* English Builder */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-base">🇬🇧</span>
                                    <h3 className="font-bold text-sm">English Lesson</h3>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">Title</label>
                                <input
                                    type="text"
                                    value={data.en_title}
                                    onChange={(e) => setData('en_title', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-950"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">Description</label>
                                <textarea
                                    value={data.en_description}
                                    onChange={(e) => setData('en_description', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-950"
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Content Blocks</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => addBlock('en', 'paragraph')}
                                            className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 rounded"
                                        >
                                            + Text
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addBlock('en', 'heading')}
                                            className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 rounded"
                                        >
                                            + Heading
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addBlock('en', 'code_example')}
                                            className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 rounded text-emerald-600"
                                        >
                                            + Code
                                        </button>
                                    </div>
                                </div>

                                {enBlocks.map((b, i) => (
                                    <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50">
                                        <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400">
                                            <span>Block {i + 1}: {b.type}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeBlock('en', i)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {b.type === 'code_example' ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={b.title || ''}
                                                    onChange={(e) => updateBlock('en', i, 'title', e.target.value)}
                                                    placeholder="Example Title"
                                                    className="w-full px-2 py-1 text-xs border rounded bg-white"
                                                />
                                                <textarea
                                                    value={b.initial_code || ''}
                                                    onChange={(e) => updateBlock('en', i, 'initial_code', e.target.value)}
                                                    rows={4}
                                                    className="w-full px-2 py-1 text-xs font-mono border rounded bg-white"
                                                />
                                            </div>
                                        ) : (
                                            <textarea
                                                value={b.content || ''}
                                                onChange={(e) => updateBlock('en', i, 'content', e.target.value)}
                                                rows={2}
                                                className="w-full px-2 py-1 text-xs border rounded bg-white"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Khmer Builder */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-base">🇰🇭</span>
                                    <h3 className="font-bold text-sm">Khmer Lesson (ភាសាខ្មែរ)</h3>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">ចំណងជើង (Title)</label>
                                <input
                                    type="text"
                                    value={data.km_title}
                                    onChange={(e) => setData('km_title', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-950"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">ការពិពណ៌នា (Description)</label>
                                <textarea
                                    value={data.km_description}
                                    onChange={(e) => setData('km_description', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-950"
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase">ផ្នែកមាតិកា (Blocks)</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => addBlock('km', 'paragraph')}
                                            className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 rounded"
                                        >
                                            + អត្ថបទ
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addBlock('km', 'heading')}
                                            className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 rounded"
                                        >
                                            + ចំណងជើង
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addBlock('km', 'code_example')}
                                            className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 rounded text-emerald-600"
                                        >
                                            + កូដ
                                        </button>
                                    </div>
                                </div>

                                {kmBlocks.map((b, i) => (
                                    <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50">
                                        <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400">
                                            <span>Block {i + 1}: {b.type}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeBlock('km', i)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {b.type === 'code_example' ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={b.title || ''}
                                                    onChange={(e) => updateBlock('km', i, 'title', e.target.value)}
                                                    className="w-full px-2 py-1 text-xs border rounded bg-white"
                                                />
                                                <textarea
                                                    value={b.initial_code || ''}
                                                    onChange={(e) => updateBlock('km', i, 'initial_code', e.target.value)}
                                                    rows={4}
                                                    className="w-full px-2 py-1 text-xs font-mono border rounded bg-white"
                                                />
                                            </div>
                                        ) : (
                                            <textarea
                                                value={b.content || ''}
                                                onChange={(e) => updateBlock('km', i, 'content', e.target.value)}
                                                rows={2}
                                                className="w-full px-2 py-1 text-xs border rounded bg-white"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
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

