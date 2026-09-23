import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

interface TestCaseRow {
    assertion_type: string;
    selector: string;
    expected_value: string;
    description: string;
}

interface Props {
    courses: Array<{ id: number; title: string }>;
}

export default function Create({ courses = [] }: Props) {
    const [testCases, setTestCases] = useState<TestCaseRow[]>([
        {
            assertion_type: 'dom_element_exists',
            selector: 'h1',
            expected_value: '',
            description: 'Check that h1 element exists',
        },
    ]);

    const { data, setData, post, processing, errors } = useForm({
        course_id: courses[0]?.id || '',
        slug: '',
        language: 'html',
        difficulty: 'beginner',
        points: 10,
        initial_code: '<!-- Write your HTML code below -->\n',
        solution_code: '<h1>Hello World</h1>',
        en_title: '',
        en_instructions: '',
        en_hint: '',
        km_title: '',
        km_instructions: '',
        km_hint: '',
        test_cases: testCases,
    });

    function addTestCase() {
        const updated = [
            ...testCases,
            {
                assertion_type: 'dom_text_contains',
                selector: 'h1',
                expected_value: 'Hello World',
                description: 'Check that h1 has text "Hello World"',
            },
        ];
        setTestCases(updated);
        setData('test_cases', updated);
    }

    function removeTestCase(idx: number) {
        const updated = testCases.filter((_, i) => i !== idx);
        setTestCases(updated);
        setData('test_cases', updated);
    }

    function updateTestCase(idx: number, field: keyof TestCaseRow, val: string) {
        const updated = [...testCases];
        updated[idx] = { ...updated[idx], [field]: val };
        setTestCases(updated);
        setData('test_cases', updated);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/exercises');
    }

    return (
        <AdminLayout title="Add New Exercise">
            <div className="max-w-4xl mx-auto space-y-6">
                <Link
                    href="/admin/exercises"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Exercises</span>
                </Link>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Settings */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                            Exercise Configuration
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1">Course</label>
                                <select
                                    value={data.course_id}
                                    onChange={(e) => setData('course_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 dark:bg-slate-950"
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
                                    placeholder="e.g. html-heading-intro"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 dark:bg-slate-950 font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">Language</label>
                                <select
                                    value={data.language}
                                    onChange={(e) => setData('language', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 dark:bg-slate-950 uppercase font-mono"
                                >
                                    <option value="html">HTML</option>
                                    <option value="css">CSS</option>
                                    <option value="javascript">JavaScript</option>
                                    <option value="php">PHP</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">Points</label>
                                <input
                                    type="number"
                                    value={data.points}
                                    onChange={(e) => setData('points', parseInt(e.target.value) || 10)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 dark:bg-slate-950"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dual Translations Instructions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* English */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2">
                                <span>🇬🇧</span>
                                <h3 className="font-bold text-sm">English Instructions</h3>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">Title</label>
                                <input
                                    type="text"
                                    value={data.en_title}
                                    onChange={(e) => setData('en_title', e.target.value)}
                                    placeholder="HTML Heading Exercise"
                                    className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-950"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">Instructions</label>
                                <textarea
                                    value={data.en_instructions}
                                    onChange={(e) => setData('en_instructions', e.target.value)}
                                    rows={3}
                                    placeholder="Create an h1 heading with the text: Hello World"
                                    className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-950"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">Hint</label>
                                <input
                                    type="text"
                                    value={data.en_hint}
                                    onChange={(e) => setData('en_hint', e.target.value)}
                                    placeholder="Use the <h1> and </h1> tags"
                                    className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-950"
                                />
                            </div>
                        </div>

                        {/* Khmer */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2">
                                <span>🇰🇭</span>
                                <h3 className="font-bold text-sm">Khmer Instructions (ភាសាខ្មែរ)</h3>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">ចំណងជើង (Title)</label>
                                <input
                                    type="text"
                                    value={data.km_title}
                                    onChange={(e) => setData('km_title', e.target.value)}
                                    placeholder="លំហាត់ចំណងជើង HTML"
                                    className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-950"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">សេចក្តីណែនាំ (Instructions)</label>
                                <textarea
                                    value={data.km_instructions}
                                    onChange={(e) => setData('km_instructions', e.target.value)}
                                    rows={3}
                                    placeholder="បង្កើត heading h1 ដែលមានអក្សរ៖ Hello World"
                                    className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-950"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">តម្រុយ (Hint)</label>
                                <input
                                    type="text"
                                    value={data.km_hint}
                                    onChange={(e) => setData('km_hint', e.target.value)}
                                    placeholder="ប្រើប្រាស់ tag <h1> និង </h1>"
                                    className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-950"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Initial and Solution Code */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                            Code Setup
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1">Initial Code</label>
                                <textarea
                                    value={data.initial_code}
                                    onChange={(e) => setData('initial_code', e.target.value)}
                                    rows={5}
                                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono bg-slate-50 dark:bg-slate-950"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">Solution Code</label>
                                <textarea
                                    value={data.solution_code}
                                    onChange={(e) => setData('solution_code', e.target.value)}
                                    rows={5}
                                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono bg-slate-50 dark:bg-slate-950"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Test Cases Builder */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                                Test Cases (Automated Evaluation)
                            </h2>
                            <button
                                type="button"
                                onClick={addTestCase}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Test Case</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            {testCases.map((tc, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 space-y-3">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                        <span>Test Case {idx + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeTestCase(idx)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-semibold mb-1">Assertion Type</label>
                                            <select
                                                value={tc.assertion_type}
                                                onChange={(e) => updateTestCase(idx, 'assertion_type', e.target.value)}
                                                className="w-full px-2 py-1.5 rounded-lg border text-xs bg-white"
                                            >
                                                <option value="dom_element_exists">Element Exists (CSS selector)</option>
                                                <option value="dom_text_contains">Element Text Contains</option>
                                                <option value="regex_match">Regex Pattern Match</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold mb-1">Selector</label>
                                            <input
                                                type="text"
                                                value={tc.selector}
                                                onChange={(e) => updateTestCase(idx, 'selector', e.target.value)}
                                                placeholder="e.g. h1, p, .box"
                                                className="w-full px-2 py-1.5 rounded-lg border text-xs font-mono bg-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold mb-1">Expected Value</label>
                                            <input
                                                type="text"
                                                value={tc.expected_value}
                                                onChange={(e) => updateTestCase(idx, 'expected_value', e.target.value)}
                                                placeholder="e.g. Hello World"
                                                className="w-full px-2 py-1.5 rounded-lg border text-xs bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold mb-1">Diagnostic Description (Shown to student)</label>
                                        <input
                                            type="text"
                                            value={tc.description}
                                            onChange={(e) => updateTestCase(idx, 'description', e.target.value)}
                                            placeholder="Check that h1 has text 'Hello World'"
                                            className="w-full px-2 py-1.5 rounded-lg border text-xs bg-white"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                            <Save className="w-4 h-4" />
                            <span>Save Exercise</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

