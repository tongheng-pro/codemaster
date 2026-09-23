import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import {
    Users,
    BookOpen,
    FileText,
    Terminal,
    HelpCircle,
    Award,
    TrendingUp,
    Shield,
    ArrowRight,
} from 'lucide-react';

interface Props {
    stats: {
        total_users: number;
        total_students: number;
        total_courses: number;
        total_lessons: number;
        total_exercises: number;
        total_quizzes: number;
        total_exercise_attempts: number;
        total_quiz_attempts: number;
        total_certificates: number;
    };
    recentUsers: Array<{ id: number; name: string; email: string; role: string; created_at: string }>;
    recentCourses: Array<{ id: number; slug: string; is_published: boolean }>;
}

export default function Dashboard({ stats, recentUsers = [], recentCourses = [] }: Props) {
    const { t } = useTranslation();

    const statCards = [
        { label: t('admin.total_users'), val: stats.total_users, icon: Users, color: 'text-blue-500' },
        { label: t('admin.total_courses'), val: stats.total_courses, icon: BookOpen, color: 'text-emerald-500' },
        { label: t('admin.total_lessons'), val: stats.total_lessons, icon: FileText, color: 'text-purple-500' },
        { label: 'Exercises', val: stats.total_exercises, icon: Terminal, color: 'text-amber-500' },
        { label: 'Quizzes', val: stats.total_quizzes, icon: HelpCircle, color: 'text-teal-500' },
        { label: 'Certificates Issued', val: stats.total_certificates, icon: Award, color: 'text-rose-500' },
    ];

    return (
        <AdminLayout title={t('admin.overview')}>
            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {statCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={idx}
                                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <Icon className={`w-5 h-5 ${card.color}`} />
                                </div>
                                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                                    {card.val}
                                </div>
                                <div className="text-xs font-semibold text-slate-400 truncate">
                                    {card.label}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Recent Users and Courses */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Users */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" />
                                <span>Recent Users</span>
                            </h2>
                            <Link href="/admin/users" className="text-xs font-semibold text-emerald-600 hover:underline">
                                View all
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentUsers.map((u) => (
                                <div key={u.id} className="p-4 flex items-center justify-between text-xs">
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                                        <div className="text-slate-400">{u.email}</div>
                                    </div>
                                    <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                            u.role === 'admin'
                                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                                        }`}
                                    >
                                        {u.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Admin Actions */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-500" />
                            <span>Quick Management</span>
                        </h2>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Link
                                href="/admin/courses/create"
                                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 text-xs font-semibold transition-colors space-y-1 block"
                            >
                                <div className="text-emerald-600 dark:text-emerald-400 font-bold">+ New Course</div>
                                <div className="text-slate-400 text-[11px]">Add curriculum &amp; translations</div>
                            </Link>

                            <Link
                                href="/admin/lessons/create"
                                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 text-xs font-semibold transition-colors space-y-1 block"
                            >
                                <div className="text-purple-600 dark:text-purple-400 font-bold">+ New Lesson</div>
                                <div className="text-slate-400 text-[11px]">Add content blocks &amp; code</div>
                            </Link>

                            <Link
                                href="/admin/exercises/create"
                                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 text-xs font-semibold transition-colors space-y-1 block"
                            >
                                <div className="text-blue-600 dark:text-blue-400 font-bold">+ New Exercise</div>
                                <div className="text-slate-400 text-[11px]">Add test cases &amp; hints</div>
                            </Link>

                            <Link
                                href="/admin/quizzes/create"
                                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 text-xs font-semibold transition-colors space-y-1 block"
                            >
                                <div className="text-teal-600 dark:text-teal-400 font-bold">+ New Quiz</div>
                                <div className="text-slate-400 text-[11px]">Add questions &amp; answers</div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

