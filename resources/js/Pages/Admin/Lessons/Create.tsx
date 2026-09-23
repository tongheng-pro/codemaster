import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { LessonContentBlock } from '@/Types';

interface Props {
    courses: Array<{ id: number; title: string }>;
}

export default function Create({ courses = [] }: Props) {
    const [enBlocks, setEnBlocks] = useState<LessonContentBlock[]>([
        { type: 'paragraph', content: 'Welcome to this lesson...' },
    ]);
    const [kmBlocks, setKmBlocks] = useState<LessonContentBlock[]>([
        { type: 'paragraph', content: 'សូមស្វាគមន៍មកកាន់មេរៀននេះ...' },
    ]);

    const { data, setData, post, processing, errors } = useForm({
        course_id: courses[0]?.id || '',
        slug: '',
        order: 0,
        duration_minutes: 5,
        is_published: true,
        en_title: '',
        en_description: '',
        en_content_blocks: enBlocks,
        km_title: '',
        km_description: '',
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
        post('/admin/lessons');
    }

    return (
        <AdminLayout title="Add New Lesson">
            <div className="max-w-5xl mx-auto space-y-6">
                <Link
                    href="/admin/lessons"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Lessons</span>
                </Link>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Lesson Core Settings */}
                    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                            Lesson Parameters
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1">Course</label>
                                <select
                                    value={data.course_id}
                                    onChange={(e) => setData('course_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-950"
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
                                    placeholder="e.g. elements, flexbox"
                                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-950 font-mono"
                                    required
                                />
                                {errors.slug && <div className="text-xs text-red-500 mt-1">{errors.slug}</div>}
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

                            <div>
                                <label className="block text-xs font-semibold mb-1">Duration (min)</label>
                                <input
                                    type="number"
                                    value={data.duration_minutes}
                                    onChange={(e) => setData('duration_minutes', parseInt(e.target.value) || 5)}
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
                                <span>Published</span>
                            </label>
                        </div>
                    </div>

                    {/* Dual Content Builders */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* English Builder */}
                        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
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
                                    placeholder="HTML Elements"
                                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-950"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">Description</label>
                                <textarea
                                    value={data.en_description}
                                    onChange={(e) => setData('en_description', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-950"
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-neutral-500 uppercase">Content Blocks</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => addBlock('en', 'paragraph')}
                                            className="px-2 py-1 text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 rounded"
                                        >
                                            + Text
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addBlock('en', 'heading')}
                                            className="px-2 py-1 text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 rounded"
                                        >
                                            + Heading
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addBlock('en', 'code_example')}
                                            className="px-2 py-1 text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 rounded text-primary-600"
                                        >
                                            + Code
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addBlock('en', 'tip_box')}
                                            className="px-2 py-1 text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 rounded text-blue-600"
                                        >
                                            + Tip
                                        </button>
                                    </div>
                                </div>

                                {enBlocks.map((b, i) => (
                                    <div key={i} className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2 bg-neutral-50/50">
                                        <div className="flex items-center justify-between text-[11px] font-bold uppercase text-neutral-400">
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
                                                    placeholder="Example Title (e.g. My First Example)"
                                                    className="w-full px-2 py-1 text-xs border rounded bg-white"
                                                />
                                                <textarea
                                                    value={b.initial_code || ''}
                                                    onChange={(e) => updateBlock('en', i, 'initial_code', e.target.value)}
                                                    rows={4}
                                                    placeholder="<h1>Code Snippet</h1>"
                                                    className="w-full px-2 py-1 text-xs font-mono border rounded bg-white"
                                                />
                                            </div>
                                        ) : (
                                            <textarea
                                                value={b.content || ''}
                                                onChange={(e) => updateBlock('en', i, 'content', e.target.value)}
                                                rows={2}
                                                placeholder="Content text..."
                                                className="w-full px-2 py-1 text-xs border rounded bg-white"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Khmer Builder */}
                        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
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
                                    placeholder="ធាតុ HTML"
                                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-950"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">ការពិពណ៌នា (Description)</label>
                                <textarea
                                    value={data.km_description}
                                    onChange={(e) => setData('km_description', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-950"
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-neutral-500 uppercase">ផ្នែកមាតិកា (Blocks)</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => addBlock('km', 'paragraph')}
                                            className="px-2 py-1 text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 rounded"
                                        >
                                            + អត្ថបទ
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addBlock('km', 'heading')}
                                            className="px-2 py-1 text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 rounded"
                                        >
                                            + ចំណងជើង
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addBlock('km', 'code_example')}
                                            className="px-2 py-1 text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 rounded text-primary-600"
                                        >
                                            + កូដ
                                        </button>
                                    </div>
                                </div>

                                {kmBlocks.map((b, i) => (
                                    <div key={i} className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2 bg-neutral-50/50">
                                        <div className="flex items-center justify-between text-[11px] font-bold uppercase text-neutral-400">
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
                                                    placeholder="ចំណងជើងឧទាហរណ៍"
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
                                                placeholder="សរសេរអត្ថបទពន្យល់ជាភាសាខ្មែរ..."
                                                className="w-full px-2 py-1 text-xs border rounded bg-white font-sans"
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
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                            <Save className="w-4 h-4" />
                            <span>Save Lesson</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

