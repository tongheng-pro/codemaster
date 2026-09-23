import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

interface AnswerInput {
    en_answer_text: string;
    km_answer_text: string;
    is_correct: boolean;
}

interface QuestionInput {
    question_type: string;
    code_snippet: string;
    en_question_text: string;
    en_explanation: string;
    km_question_text: string;
    km_explanation: string;
    answers: AnswerInput[];
}

interface Props {
    courses: Array<{ id: number; title: string }>;
}

export default function Create({ courses = [] }: Props) {
    const [questions, setQuestions] = useState<QuestionInput[]>([
        {
            question_type: 'multiple_choice',
            code_snippet: '',
            en_question_text: 'Which HTML element defines the largest heading?',
            en_explanation: '<h1> defines the most important heading in HTML.',
            km_question_text: 'តើ HTML tag មួយណាដែលប្រើសម្រាប់បង្កើតចំណងជើងធំបំផុត?',
            km_explanation: '<h1> ត្រូវបានប្រើសម្រាប់កំណត់ចំណងជើងធំបំផុត។',
            answers: [
                { en_answer_text: '<h6>', km_answer_text: '<h6>', is_correct: false },
                { en_answer_text: '<h1>', km_answer_text: '<h1>', is_correct: true },
                { en_answer_text: '<head>', km_answer_text: '<head>', is_correct: false },
                { en_answer_text: '<heading>', km_answer_text: '<heading>', is_correct: false },
            ],
        },
    ]);

    const { data, setData, post, processing, errors } = useForm({
        course_id: courses[0]?.id || '',
        slug: '',
        pass_percentage: 70,
        en_title: '',
        en_description: '',
        km_title: '',
        km_description: '',
        questions: questions,
    });

    function addQuestion() {
        const updated: QuestionInput[] = [
            ...questions,
            {
                question_type: 'multiple_choice',
                code_snippet: '',
                en_question_text: 'New Question',
                en_explanation: '',
                km_question_text: '',
                km_explanation: '',
                answers: [
                    { en_answer_text: 'Option 1', km_answer_text: 'ជម្រើស ១', is_correct: true },
                    { en_answer_text: 'Option 2', km_answer_text: 'ជម្រើស ២', is_correct: false },
                ],
            },
        ];
        setQuestions(updated);
        setData('questions', updated);
    }

    function removeQuestion(qIdx: number) {
        const updated = questions.filter((_, i) => i !== qIdx);
        setQuestions(updated);
        setData('questions', updated);
    }

    function updateQuestion(qIdx: number, field: keyof QuestionInput, val: any) {
        const updated = [...questions];
        updated[qIdx] = { ...updated[qIdx], [field]: val };
        setQuestions(updated);
        setData('questions', updated);
    }

    function updateAnswer(qIdx: number, aIdx: number, field: keyof AnswerInput, val: any) {
        const updated = [...questions];
        const answers = [...updated[qIdx].answers];

        if (field === 'is_correct' && val === true) {
            // Uncheck other answers for single choice
            answers.forEach((ans, i) => {
                ans.is_correct = i === aIdx;
            });
        } else {
            answers[aIdx] = { ...answers[aIdx], [field]: val };
        }

        updated[qIdx].answers = answers;
        setQuestions(updated);
        setData('questions', updated);
    }

    function addAnswer(qIdx: number) {
        const updated = [...questions];
        updated[qIdx].answers.push({
            en_answer_text: 'New option',
            km_answer_text: '',
            is_correct: false,
        });
        setQuestions(updated);
        setData('questions', updated);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/quizzes');
    }

    return (
        <AdminLayout title="Add New Quiz">
            <div className="max-w-4xl mx-auto space-y-6">
                <Link
                    href="/admin/quizzes"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Quizzes</span>
                </Link>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* General Settings */}
                    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                            Quiz Settings
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1">Course</label>
                                <select
                                    value={data.course_id}
                                    onChange={(e) => setData('course_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border text-xs bg-neutral-50 dark:bg-neutral-950"
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
                                    placeholder="e.g. html-basic-quiz"
                                    className="w-full px-3 py-2 rounded-xl border text-xs bg-neutral-50 dark:bg-neutral-950 font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">Pass Score (%)</label>
                                <input
                                    type="number"
                                    value={data.pass_percentage}
                                    onChange={(e) => setData('pass_percentage', parseInt(e.target.value) || 70)}
                                    className="w-full px-3 py-2 rounded-xl border text-xs bg-neutral-50 dark:bg-neutral-950"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="block text-xs font-semibold mb-1">English Title</label>
                                <input
                                    type="text"
                                    value={data.en_title}
                                    onChange={(e) => setData('en_title', e.target.value)}
                                    placeholder="HTML Fundamental Quiz"
                                    className="w-full px-3 py-2 rounded-xl border text-xs bg-neutral-50 dark:bg-neutral-950"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">Khmer Title (ភាសាខ្មែរ)</label>
                                <input
                                    type="text"
                                    value={data.km_title}
                                    onChange={(e) => setData('km_title', e.target.value)}
                                    placeholder="តេស្តចំណេះដឹងមូលដ្ឋាន HTML"
                                    className="w-full px-3 py-2 rounded-xl border text-xs bg-neutral-50 dark:bg-neutral-950"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Questions Builder */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                                Questions ({questions.length})
                            </h2>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="flex items-center gap-1 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Question</span>
                            </button>
                        </div>

                        {questions.map((q, qIdx) => (
                            <div key={qIdx} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="font-bold text-xs uppercase text-purple-600">
                                        Question {qIdx + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(qIdx)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">English Question</label>
                                        <input
                                            type="text"
                                            value={q.en_question_text}
                                            onChange={(e) => updateQuestion(qIdx, 'en_question_text', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border text-xs"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Khmer Question (សំណួរជាភាសាខ្មែរ)</label>
                                        <input
                                            type="text"
                                            value={q.km_question_text}
                                            onChange={(e) => updateQuestion(qIdx, 'km_question_text', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border text-xs"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-1">Optional Code Snippet</label>
                                    <textarea
                                        value={q.code_snippet}
                                        onChange={(e) => updateQuestion(qIdx, 'code_snippet', e.target.value)}
                                        rows={2}
                                        placeholder="<h1>Code</h1>"
                                        className="w-full px-3 py-2 rounded-xl border text-xs font-mono"
                                    />
                                </div>

                                {/* Answers */}
                                <div className="space-y-2 pt-2 border-t">
                                    <div className="flex items-center justify-between text-xs font-bold text-neutral-500">
                                        <span>Answer Choices (Select radio for correct answer)</span>
                                        <button
                                            type="button"
                                            onClick={() => addAnswer(qIdx)}
                                            className="text-purple-600 hover:underline"
                                        >
                                            + Add Choice
                                        </button>
                                    </div>

                                    {q.answers.map((ans, aIdx) => (
                                        <div key={aIdx} className="flex items-center gap-3 p-2 bg-neutral-50 dark:bg-neutral-950 rounded-xl border text-xs">
                                            <input
                                                type="radio"
                                                name={`correct_${qIdx}`}
                                                checked={ans.is_correct}
                                                onChange={() => updateAnswer(qIdx, aIdx, 'is_correct', true)}
                                                className="text-primary-600"
                                            />
                                            <input
                                                type="text"
                                                value={ans.en_answer_text}
                                                onChange={(e) => updateAnswer(qIdx, aIdx, 'en_answer_text', e.target.value)}
                                                placeholder="English Choice"
                                                className="flex-1 px-2 py-1 border rounded text-xs bg-white"
                                                required
                                            />
                                            <input
                                                type="text"
                                                value={ans.km_answer_text}
                                                onChange={(e) => updateAnswer(qIdx, aIdx, 'km_answer_text', e.target.value)}
                                                placeholder="ជម្រើសជាភាសាខ្មែរ"
                                                className="flex-1 px-2 py-1 border rounded text-xs bg-white"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                            <Save className="w-4 h-4" />
                            <span>Save Quiz</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

