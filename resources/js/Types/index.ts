export type Locale = 'en' | 'km';

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'student';
    avatar?: string | null;
    bio?: string | null;
    locale: Locale;
    isAdmin: boolean;
}

export interface CourseTranslation {
    id: number;
    course_id: number;
    locale: Locale;
    title: string;
    description?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
}

export interface Course {
    id: number;
    slug: string;
    icon?: string | null;
    color?: string | null;
    order: number;
    is_published: boolean;
    title?: string;
    description?: string;
    lessons_count?: number;
    completed_percentage?: number;
    translations?: CourseTranslation[];
    sections?: CourseSection[];
    lessons?: Lesson[];
}

export interface CourseSection {
    id: number;
    course_id: number;
    slug: string;
    order: number;
    title?: string;
    lessons?: Lesson[];
}

export interface LessonContentBlock {
    type: 'heading' | 'paragraph' | 'code_example' | 'info_box' | 'warning_box' | 'tip_box';
    level?: number; // for heading: 2, 3, 4
    content?: string;
    language?: string;
    initial_code?: string;
    title?: string;
    is_interactive?: boolean;
}

export interface CodeExample {
    id: number;
    lesson_id: number;
    language: string;
    initial_code: string;
    solution_code?: string | null;
    order: number;
    title?: string;
    explanation?: string;
}

export interface Lesson {
    id: number;
    course_id: number;
    section_id?: number | null;
    slug: string;
    order: number;
    duration_minutes: number;
    is_published: boolean;
    title?: string;
    description?: string;
    content_blocks?: LessonContentBlock[];
    code_examples?: CodeExample[];
    course?: Course;
    is_completed?: boolean;
    is_bookmarked?: boolean;
}

export interface ExerciseTestCase {
    id: number;
    exercise_id: number;
    assertion_type: 'dom_element_exists' | 'dom_text_contains' | 'regex_match' | 'dom_attribute_equals' | 'css_property_equals';
    selector?: string | null;
    expected_value?: string | null;
    description?: string | null;
    is_hidden: boolean;
    order: number;
}

export interface Exercise {
    id: number;
    course_id: number;
    lesson_id?: number | null;
    slug: string;
    language: string;
    initial_code: string;
    solution_code: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    points: number;
    is_published: boolean;
    title?: string;
    instructions?: string;
    hint?: string;
    course?: Course;
    test_cases?: ExerciseTestCase[];
    user_attempt?: {
        passed: boolean;
        submitted_code?: string;
        score?: number;
    } | null;
}

export interface QuizAnswer {
    id: number;
    quiz_question_id: number;
    is_correct?: boolean; // only in admin or after submission
    order: number;
    answer_text?: string;
}

export interface QuizQuestion {
    id: number;
    quiz_id: number;
    question_type: 'multiple_choice' | 'true_false' | 'fill_in_blank' | 'code';
    code_snippet?: string | null;
    order: number;
    question_text?: string;
    explanation?: string;
    answers?: QuizAnswer[];
}

export interface Quiz {
    id: number;
    course_id: number;
    lesson_id?: number | null;
    slug: string;
    pass_percentage: number;
    is_published: boolean;
    title?: string;
    description?: string;
    course?: Course;
    questions?: QuizQuestion[];
    questions_count?: number;
    user_attempt?: {
        score: number;
        total_questions: number;
        percentage: number;
        passed: boolean;
    } | null;
}

export interface Certificate {
    id: number;
    uuid: string;
    user_id: number;
    course_id: number;
    certificate_code: string;
    issued_at: string;
    user?: User;
    course?: Course;
}

export interface NavCourseItem {
    id: number;
    slug: string;
    icon?: string | null;
    color?: string | null;
    title: string;
}

export interface NavigationSettings {
    courses: boolean;
    books: boolean;
    exercises: boolean;
    quizzes: boolean;
    playground: boolean;
}

export interface PageProps {
    auth: {
        user: User | null;
    };
    locale: Locale;
    translations: Record<string, any>;
    navCourses: NavCourseItem[];
    navigation: NavigationSettings;
    flash: {
        success?: string | null;
        error?: string | null;
    };
    [key: string]: any;
}

