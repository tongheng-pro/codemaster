import React from 'react';
import LearningLayout from '@/Layouts/LearningLayout';
import LessonContent from '@/Components/LessonContent';
import { Course, Lesson } from '@/Types';
import { Clock } from 'lucide-react';

interface Props {
    course: Course;
    lesson: Lesson;
    previousLesson?: Lesson | null;
    nextLesson?: Lesson | null;
    onPageTopics?: Array<{ id: string; title: string }>;
}

export default function Show({
    course,
    lesson,
    previousLesson,
    nextLesson,
    onPageTopics = [],
}: Props) {
    return (
        <LearningLayout
            title={lesson.title || lesson.slug}
            course={course}
            currentLesson={lesson}
            previousLesson={previousLesson}
            nextLesson={nextLesson}
            isCompleted={lesson.is_completed}
            isBookmarked={lesson.is_bookmarked}
            onPageTopics={onPageTopics}
        >
            <div className="space-y-6">
                {/* Lesson Header */}
                <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-2">
                        <span>{course.title}</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{lesson.duration_minutes || 5} min read</span>
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {lesson.title}
                    </h1>

                    {lesson.description && (
                        <p className="text-base text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                            {lesson.description}
                        </p>
                    )}
                </div>

                {/* Structured Lesson Content Blocks */}
                <LessonContent blocks={lesson.content_blocks} />
            </div>
        </LearningLayout>
    );
}

