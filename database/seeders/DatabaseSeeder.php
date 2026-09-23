<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseSection;
use App\Models\CourseSectionTranslation;
use App\Models\CourseTranslation;
use App\Models\Exercise;
use App\Models\ExerciseTestCase;
use App\Models\ExerciseTranslation;
use App\Models\Lesson;
use App\Models\LessonTranslation;
use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\QuizAnswerTranslation;
use App\Models\QuizQuestion;
use App\Models\QuizQuestionTranslation;
use App\Models\QuizTranslation;
use App\Models\User;
use App\Models\UserCourseProgress;
use App\Models\UserLessonProgress;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin Architect',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'locale' => 'en',
                'bio' => 'System administrator and curriculum author.',
            ]
        );

        $student = User::firstOrCreate(
            ['email' => 'student@example.com'],
            [
                'name' => 'Sophea Chan',
                'password' => Hash::make('password'),
                'role' => 'student',
                'locale' => 'km',
                'bio' => 'Full-stack web development student learning in English & Khmer.',
            ]
        );

        // 2. HTML Course
        $htmlCourse = Course::create([
            'slug' => 'html',
            'icon' => 'Code2',
            'color' => '#E34F26',
            'order' => 1,
            'is_published' => true,
        ]);

        CourseTranslation::create([
            'course_id' => $htmlCourse->id,
            'locale' => 'en',
            'title' => 'HTML Tutorial',
            'description' => 'The complete, beginner-friendly guide to building web pages with HTML. Learn tags, attributes, formatting, forms, and layout structures.',
            'meta_title' => 'HTML Tutorial - Learn to Code with Interactive Examples',
            'meta_description' => 'Master HTML5 with hands-on exercises and instant sandboxed code editors.',
        ]);

        CourseTranslation::create([
            'course_id' => $htmlCourse->id,
            'locale' => 'km',
            'title' => 'មេរៀន HTML',
            'description' => 'មគ្គុទ្ទេសក៍ពេញលេញ និងងាយស្រួលយល់សម្រាប់អ្នកចាប់ផ្តើមដំបូងក្នុងការបង្កើតគេហទំព័រដោយប្រើ HTML។ រៀនអំពី tags, attributes, formatting និងរចនាសម្ព័ន្ធទំព័រ។',
            'meta_title' => 'មេរៀន HTML - រៀនសរសេរកូដជាមួយឧទាហរណ៍អន្តរកម្ម',
            'meta_description' => 'ស្វែងយល់និងចេះសរសេរ HTML5 យ៉ាងស្ទាត់ជំនាញជាមួយលំហាត់អនុវត្តកូដផ្ទាល់។',
        ]);

        $htmlSection = CourseSection::create([
            'course_id' => $htmlCourse->id,
            'slug' => 'html-basics',
            'order' => 1,
        ]);

        CourseSectionTranslation::create([
            'course_section_id' => $htmlSection->id,
            'locale' => 'en',
            'title' => 'HTML Basic Concepts',
        ]);

        CourseSectionTranslation::create([
            'course_section_id' => $htmlSection->id,
            'locale' => 'km',
            'title' => 'គំនិតមូលដ្ឋាននៃ HTML',
        ]);

        // HTML Lesson 1: Introduction
        $htmlLesson1 = Lesson::create([
            'course_id' => $htmlCourse->id,
            'section_id' => $htmlSection->id,
            'slug' => 'introduction',
            'order' => 1,
            'duration_minutes' => 5,
            'is_published' => true,
        ]);

        LessonTranslation::create([
            'lesson_id' => $htmlLesson1->id,
            'locale' => 'en',
            'title' => 'HTML Introduction',
            'description' => 'HTML is the standard markup language for creating Web pages.',
            'content_blocks' => [
                ['type' => 'heading', 'level' => 2, 'content' => 'What is HTML?'],
                ['type' => 'paragraph', 'content' => "HTML stands for Hyper Text Markup Language.\nIt is the standard markup language for creating Web pages and describes the structure of a Web page."],
                ['type' => 'tip_box', 'title' => 'Remember', 'content' => 'HTML consists of a series of elements that tell the browser how to display the content.'],
                ['type' => 'heading', 'level' => 2, 'content' => 'A Simple HTML Document'],
                ['type' => 'paragraph', 'content' => 'Try editing the code below and clicking Run to see the live output.'],
                [
                    'type' => 'code_example',
                    'title' => 'First HTML Webpage',
                    'language' => 'html',
                    'initial_code' => "<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Title</title>\n</head>\n<body>\n  <h1>My First Heading</h1>\n  <p>My first paragraph.</p>\n</body>\n</html>",
                ],
            ],
        ]);

        LessonTranslation::create([
            'lesson_id' => $htmlLesson1->id,
            'locale' => 'km',
            'title' => 'សេចក្តីផ្តើមអំពី HTML',
            'description' => 'HTML គឺជាភាសាសម្គាល់ខ្នាតគំរូសម្រាប់បង្កើតទំព័រគេហទំព័រ។',
            'content_blocks' => [
                ['type' => 'heading', 'level' => 2, 'content' => 'តើអ្វីទៅជា HTML?'],
                ['type' => 'paragraph', 'content' => "HTML តំណាងឱ្យ Hyper Text Markup Language។\nវាគឺជាភាសាសម្គាល់ខ្នាតគំរូសម្រាប់ការបង្កើតគេហទំព័រ ហើយវាពណ៌នាអំពីគ្រោងឆ្អឹងនិងរចនាសម្ព័ន្ធនៃទំព័រ web។"],
                ['type' => 'tip_box', 'title' => 'ចំណាំសំខាន់', 'content' => 'HTML មានធាតុ (elements) ជាច្រើនដែលប្រាប់ទៅកាន់ browser អំពីរបៀបបង្ហាញខ្លឹមសារនៅលើអេក្រង់។'],
                ['type' => 'heading', 'level' => 2, 'content' => 'ឯកសារ HTML គំរូមូលដ្ឋាន'],
                ['type' => 'paragraph', 'content' => 'សាកល្បងកែប្រែកូដខាងក្រោម ហើយចុចប៊ូតុង "ដំណើរការកូដ" ដើម្បីឃើញលទ្ធផលផ្ទាល់។'],
                [
                    'type' => 'code_example',
                    'title' => 'គេហទំព័រ HTML ដំបូងបង្អស់',
                    'language' => 'html',
                    'initial_code' => "<!DOCTYPE html>\n<html>\n<head>\n  <title>ចំណងជើងទំព័រ</title>\n</head>\n<body>\n  <h1>My First Heading</h1>\n  <p>My first paragraph.</p>\n</body>\n</html>",
                ],
            ],
        ]);

        // HTML Lesson 2: Elements
        $htmlLesson2 = Lesson::create([
            'course_id' => $htmlCourse->id,
            'section_id' => $htmlSection->id,
            'slug' => 'elements',
            'order' => 2,
            'duration_minutes' => 6,
            'is_published' => true,
        ]);

        LessonTranslation::create([
            'lesson_id' => $htmlLesson2->id,
            'locale' => 'en',
            'title' => 'HTML Elements',
            'description' => 'An HTML element is defined by a start tag, some content, and an end tag.',
            'content_blocks' => [
                ['type' => 'heading', 'level' => 2, 'content' => 'Understanding HTML Elements'],
                ['type' => 'paragraph', 'content' => "The HTML element is everything from the start tag to the end tag:\n<tagname>Content goes here...</tagname>"],
                ['type' => 'info_box', 'title' => 'Important Note', 'content' => 'Some HTML elements have no content (like the <br> or <img> element). These elements are called empty elements.'],
                [
                    'type' => 'code_example',
                    'title' => 'Nested Elements Example',
                    'language' => 'html',
                    'initial_code' => "<h2>Learning HTML Elements</h2>\n<p>This is a <b>bold</b> word inside a paragraph.</p>",
                ],
            ],
        ]);

        LessonTranslation::create([
            'lesson_id' => $htmlLesson2->id,
            'locale' => 'km',
            'title' => 'ធាតុ HTML (Elements)',
            'description' => 'ធាតុ HTML ត្រូវបានកំណត់ដោយ start tag, ខ្លឹមសារ (content) និង end tag។',
            'content_blocks' => [
                ['type' => 'heading', 'level' => 2, 'content' => 'ស្វែងយល់អំពីធាតុ HTML'],
                ['type' => 'paragraph', 'content' => "ធាតុ HTML គឺរាប់ចាប់តាំងពី start tag រហូតដល់ end tag៖\n<tagname>ខ្លឹមសារដាក់នៅទីនេះ...</tagname>"],
                ['type' => 'info_box', 'title' => 'ចំណាំ', 'content' => 'ធាតុ HTML មួយចំនួនមិនមានខ្លឹមសារខាងក្នុងទេ (ដូចជា tag <br> ឬ <img>)។ ធាតុទាំងនេះត្រូវបានគេហៅថា empty elements។'],
                [
                    'type' => 'code_example',
                    'title' => 'ឧទាហរណ៍ធាតុបង្កប់ (Nested Elements)',
                    'language' => 'html',
                    'initial_code' => "<h2>Learning HTML Elements</h2>\n<p>This is a <b>bold</b> word inside a paragraph.</p>",
                ],
            ],
        ]);

        // HTML Lesson 3: Attributes
        $htmlLesson3 = Lesson::create([
            'course_id' => $htmlCourse->id,
            'section_id' => $htmlSection->id,
            'slug' => 'attributes',
            'order' => 3,
            'duration_minutes' => 6,
            'is_published' => true,
        ]);

        LessonTranslation::create([
            'lesson_id' => $htmlLesson3->id,
            'locale' => 'en',
            'title' => 'HTML Attributes',
            'description' => 'HTML attributes provide additional information about HTML elements.',
            'content_blocks' => [
                ['type' => 'heading', 'level' => 2, 'content' => 'What are HTML Attributes?'],
                ['type' => 'paragraph', 'content' => "All HTML elements can have attributes.\nAttributes provide additional information about elements and are always specified in the start tag."],
                [
                    'type' => 'code_example',
                    'title' => 'Link & Image Attributes',
                    'language' => 'html',
                    'initial_code' => "<a href=\"https://example.com\" target=\"_blank\">Visit Example Website</a>\n<br><br>\n<p title=\"I'm a tooltip\">Hover over this paragraph to see the tooltip attribute.</p>",
                ],
            ],
        ]);

        LessonTranslation::create([
            'lesson_id' => $htmlLesson3->id,
            'locale' => 'km',
            'title' => 'គុណលក្ខណៈ HTML (Attributes)',
            'description' => 'HTML attributes ផ្តល់នូវព័ត៌មានបន្ថែមអំពីធាតុ HTML នានា។',
            'content_blocks' => [
                ['type' => 'heading', 'level' => 2, 'content' => 'តើអ្វីទៅជា HTML Attributes?'],
                ['type' => 'paragraph', 'content' => "គ្រប់ធាតុ HTML ទាំងអស់សុទ្ធតែអាចមាន attributes។\nAttributes ផ្តល់ព័ត៌មានបន្ថែមអំពីធាតុ ហើយវាត្រូវបានសរសេរនៅខាងក្នុង start tag ជានិច្ច។"],
                [
                    'type' => 'code_example',
                    'title' => 'គុណលក្ខណៈតំណភ្ជាប់ និងរូបភាព',
                    'language' => 'html',
                    'initial_code' => "<a href=\"https://example.com\" target=\"_blank\">Visit Example Website</a>\n<br><br>\n<p title=\"I'm a tooltip\">Hover over this paragraph to see the tooltip attribute.</p>",
                ],
            ],
        ]);

        // HTML Lesson 4: Headings
        $htmlLesson4 = Lesson::create([
            'course_id' => $htmlCourse->id,
            'section_id' => $htmlSection->id,
            'slug' => 'headings',
            'order' => 4,
            'duration_minutes' => 4,
            'is_published' => true,
        ]);

        LessonTranslation::create([
            'lesson_id' => $htmlLesson4->id,
            'locale' => 'en',
            'title' => 'HTML Headings',
            'description' => 'HTML headings are defined with the <h1> to <h6> tags.',
            'content_blocks' => [
                ['type' => 'heading', 'level' => 2, 'content' => 'HTML Headings Overview'],
                ['type' => 'paragraph', 'content' => '<h1> defines the most important heading. <h6> defines the least important heading.'],
                [
                    'type' => 'code_example',
                    'title' => 'Heading Levels 1 to 6',
                    'language' => 'html',
                    'initial_code' => "<h1>Heading Level 1</h1>\n<h2>Heading Level 2</h2>\n<h3>Heading Level 3</h3>\n<h4>Heading Level 4</h4>\n<h5>Heading Level 5</h5>\n<h6>Heading Level 6</h6>",
                ],
            ],
        ]);

        LessonTranslation::create([
            'lesson_id' => $htmlLesson4->id,
            'locale' => 'km',
            'title' => 'ចំណងជើង HTML (Headings)',
            'description' => 'ចំណងជើង HTML ត្រូវបានកំណត់ដោយប្រើ tag <h1> ដល់ <h6>។',
            'content_blocks' => [
                ['type' => 'heading', 'level' => 2, 'content' => 'ទិដ្ឋភាពទូទៅនៃចំណងជើង HTML'],
                ['type' => 'paragraph', 'content' => '<h1> កំណត់ចំណងជើងដែលសំខាន់បំផុត។ <h6> កំណត់ចំណងជើងដែលតូចជាងគេ។'],
                [
                    'type' => 'code_example',
                    'title' => 'កម្រិតចំណងជើងពី ១ ដល់ ៦',
                    'language' => 'html',
                    'initial_code' => "<h1>Heading Level 1</h1>\n<h2>Heading Level 2</h2>\n<h3>Heading Level 3</h3>\n<h4>Heading Level 4</h4>\n<h5>Heading Level 5</h5>\n<h6>Heading Level 6</h6>",
                ],
            ],
        ]);

        // HTML Exercises
        $htmlEx1 = Exercise::create([
            'course_id' => $htmlCourse->id,
            'lesson_id' => $htmlLesson4->id,
            'slug' => 'create-h1-heading',
            'language' => 'html',
            'difficulty' => 'beginner',
            'points' => 10,
            'initial_code' => "<!-- Create an h1 heading below with the text 'Hello World' -->\n",
            'solution_code' => '<h1>Hello World</h1>',
            'is_published' => true,
        ]);

        ExerciseTranslation::create([
            'exercise_id' => $htmlEx1->id,
            'locale' => 'en',
            'title' => 'Create an HTML Heading',
            'instructions' => "Create an <h1> heading containing the text: Hello World\nMake sure to close the heading tag properly.",
            'hint' => 'Use opening <h1> and closing </h1> tags with Hello World inside.',
        ]);

        ExerciseTranslation::create([
            'exercise_id' => $htmlEx1->id,
            'locale' => 'km',
            'title' => 'បង្កើតចំណងជើង HTML',
            'instructions' => "បង្កើតចំណងជើង <h1> ដែលមានអក្សរ៖ Hello World\nសូមប្រាកដថាអ្នកបានបិទ tag </h1> បានត្រឹមត្រូវ។",
            'hint' => 'ប្រើប្រាស់ tag បើក <h1> និង tag បិទ </h1> ដោយដាក់ពាក្យ Hello World នៅចន្លោះកណ្តាល។',
        ]);

        ExerciseTestCase::create([
            'exercise_id' => $htmlEx1->id,
            'assertion_type' => 'dom_element_exists',
            'selector' => 'h1',
            'description' => 'HTML document contains an <h1> element',
            'order' => 1,
        ]);

        ExerciseTestCase::create([
            'exercise_id' => $htmlEx1->id,
            'assertion_type' => 'dom_text_contains',
            'selector' => 'h1',
            'expected_value' => 'Hello World',
            'description' => 'The <h1> element text equals or contains "Hello World"',
            'order' => 2,
        ]);

        // HTML Quiz
        $htmlQuiz = Quiz::create([
            'course_id' => $htmlCourse->id,
            'slug' => 'html-fundamentals',
            'pass_percentage' => 70,
            'is_published' => true,
        ]);

        QuizTranslation::create([
            'quiz_id' => $htmlQuiz->id,
            'locale' => 'en',
            'title' => 'HTML Fundamentals Quiz',
            'description' => 'Test your core understanding of HTML tags, attributes, and structures.',
        ]);

        QuizTranslation::create([
            'quiz_id' => $htmlQuiz->id,
            'locale' => 'km',
            'title' => 'តេស្តចំណេះដឹងមូលដ្ឋាន HTML',
            'description' => 'វាស់ស្ទង់ការយល់ដឹងរបស់អ្នកលើ tags, attributes និងគ្រោងឆ្អឹង HTML។',
        ]);

        // Question 1
        $q1 = QuizQuestion::create([
            'quiz_id' => $htmlQuiz->id,
            'question_type' => 'multiple_choice',
            'order' => 1,
        ]);
        QuizQuestionTranslation::create([
            'quiz_question_id' => $q1->id,
            'locale' => 'en',
            'question_text' => 'Which HTML element defines the largest heading?',
            'explanation' => '<h1> is used for the main heading with the largest default font size.',
        ]);
        QuizQuestionTranslation::create([
            'quiz_question_id' => $q1->id,
            'locale' => 'km',
            'question_text' => 'តើ HTML tag មួយណាដែលប្រើសម្រាប់បង្កើតចំណងជើងធំបំផុត?',
            'explanation' => '<h1> ត្រូវបានប្រើសម្រាប់ចំណងជើងមេដែលមានទំហំធំបំផុត។',
        ]);

        $q1a1 = QuizAnswer::create(['quiz_question_id' => $q1->id, 'is_correct' => false, 'order' => 1]);
        QuizAnswerTranslation::create(['quiz_answer_id' => $q1a1->id, 'locale' => 'en', 'answer_text' => '<heading>']);
        QuizAnswerTranslation::create(['quiz_answer_id' => $q1a1->id, 'locale' => 'km', 'answer_text' => '<heading>']);

        $q1a2 = QuizAnswer::create(['quiz_question_id' => $q1->id, 'is_correct' => false, 'order' => 2]);
        QuizAnswerTranslation::create(['quiz_answer_id' => $q1a2->id, 'locale' => 'en', 'answer_text' => '<h6>']);
        QuizAnswerTranslation::create(['quiz_answer_id' => $q1a2->id, 'locale' => 'km', 'answer_text' => '<h6>']);

        $q1a3 = QuizAnswer::create(['quiz_question_id' => $q1->id, 'is_correct' => true, 'order' => 3]);
        QuizAnswerTranslation::create(['quiz_answer_id' => $q1a3->id, 'locale' => 'en', 'answer_text' => '<h1>']);
        QuizAnswerTranslation::create(['quiz_answer_id' => $q1a3->id, 'locale' => 'km', 'answer_text' => '<h1>']);

        $q1a4 = QuizAnswer::create(['quiz_question_id' => $q1->id, 'is_correct' => false, 'order' => 4]);
        QuizAnswerTranslation::create(['quiz_answer_id' => $q1a4->id, 'locale' => 'en', 'answer_text' => '<head>']);
        QuizAnswerTranslation::create(['quiz_answer_id' => $q1a4->id, 'locale' => 'km', 'answer_text' => '<head>']);

        // Question 2
        $q2 = QuizQuestion::create([
            'quiz_id' => $htmlQuiz->id,
            'question_type' => 'multiple_choice',
            'order' => 2,
        ]);
        QuizQuestionTranslation::create([
            'quiz_question_id' => $q2->id,
            'locale' => 'en',
            'question_text' => 'What is the correct HTML element for inserting a line break?',
            'explanation' => '<br> inserts a single line break without creating a new paragraph.',
        ]);
        QuizQuestionTranslation::create([
            'quiz_question_id' => $q2->id,
            'locale' => 'km',
            'question_text' => 'តើ HTML element មួយណាដែលត្រូវប្រើសម្រាប់ចុះបន្ទាត់ថ្មី?',
            'explanation' => '<br> ត្រូវបានប្រើសម្រាប់ចុះបន្ទាត់ថ្មី។',
        ]);

        $q2a1 = QuizAnswer::create(['quiz_question_id' => $q2->id, 'is_correct' => true, 'order' => 1]);
        QuizAnswerTranslation::create(['quiz_answer_id' => $q2a1->id, 'locale' => 'en', 'answer_text' => '<br>']);
        QuizAnswerTranslation::create(['quiz_answer_id' => $q2a1->id, 'locale' => 'km', 'answer_text' => '<br>']);

        $q2a2 = QuizAnswer::create(['quiz_question_id' => $q2->id, 'is_correct' => false, 'order' => 2]);
        QuizAnswerTranslation::create(['quiz_answer_id' => $q2a2->id, 'locale' => 'en', 'answer_text' => '<lb>']);
        QuizAnswerTranslation::create(['quiz_answer_id' => $q2a2->id, 'locale' => 'km', 'answer_text' => '<lb>']);

        $q2a3 = QuizAnswer::create(['quiz_question_id' => $q2->id, 'is_correct' => false, 'order' => 3]);
        QuizAnswerTranslation::create(['quiz_answer_id' => $q2a3->id, 'locale' => 'en', 'answer_text' => '<break>']);
        QuizAnswerTranslation::create(['quiz_answer_id' => $q2a3->id, 'locale' => 'km', 'answer_text' => '<break>']);

        // 3. CSS Course
        $cssCourse = Course::create([
            'slug' => 'css',
            'icon' => 'Palette',
            'color' => '#1572B6',
            'order' => 2,
            'is_published' => true,
        ]);

        CourseTranslation::create([
            'course_id' => $cssCourse->id,
            'locale' => 'en',
            'title' => 'CSS Tutorial',
            'description' => 'Master Cascading Style Sheets (CSS) to design stunning, modern, responsive websites with Flexbox, Grid, animations, and custom typography.',
            'meta_title' => 'CSS Tutorial - Style Web Pages with Modern CSS',
            'meta_description' => 'Learn CSS syntax, selectors, box model, and layout techniques interactively.',
        ]);

        CourseTranslation::create([
            'course_id' => $cssCourse->id,
            'locale' => 'km',
            'title' => 'មេរៀន CSS',
            'description' => 'ចេះរចនាគេហទំព័រឱ្យមានសោភ័ណភាពស្រស់ស្អាត ទំនើប និង Responsive ដោយប្រើ CSS, Flexbox, Grid និងពណ៌ទាក់ទាញ។',
            'meta_title' => 'មេរៀន CSS - រៀនតុបតែងគេហទំព័រទំនើប',
            'meta_description' => 'រៀន syntax, selectors, box model និង layout នៃ CSS តាមរយៈការអនុវត្តផ្ទាល់។',
        ]);

        $cssSection = CourseSection::create([
            'course_id' => $cssCourse->id,
            'slug' => 'css-basics',
            'order' => 1,
        ]);

        CourseSectionTranslation::create([
            'course_section_id' => $cssSection->id,
            'locale' => 'en',
            'title' => 'CSS Basics & Selectors',
        ]);

        CourseSectionTranslation::create([
            'course_section_id' => $cssSection->id,
            'locale' => 'km',
            'title' => 'មូលដ្ឋានគ្រឹះ និង Selectors នៃ CSS',
        ]);

        $cssLesson1 = Lesson::create([
            'course_id' => $cssCourse->id,
            'section_id' => $cssSection->id,
            'slug' => 'introduction',
            'order' => 1,
            'duration_minutes' => 5,
            'is_published' => true,
        ]);

        LessonTranslation::create([
            'lesson_id' => $cssLesson1->id,
            'locale' => 'en',
            'title' => 'CSS Introduction',
            'description' => 'CSS describes how HTML elements are to be displayed on screen, paper, or in other media.',
            'content_blocks' => [
                ['type' => 'heading', 'level' => 2, 'content' => 'What is CSS?'],
                ['type' => 'paragraph', 'content' => "CSS stands for Cascading Style Sheets.\nIt saves a lot of work by controlling the layout of multiple web pages all at once."],
                [
                    'type' => 'code_example',
                    'title' => 'Basic CSS Styling',
                    'language' => 'html',
                    'initial_code' => "<style>\n  h2 { color: #0284c7; font-family: sans-serif; }\n  p { color: #475569; font-size: 16px; }\n</style>\n<h2>Styled Heading with CSS</h2>\n<p>This paragraph is styled with clean typography.</p>",
                ],
            ],
        ]);

        LessonTranslation::create([
            'lesson_id' => $cssLesson1->id,
            'locale' => 'km',
            'title' => 'សេចក្តីផ្តើមអំពី CSS',
            'description' => 'CSS ពិពណ៌នាអំពីរបៀបដែលធាតុ HTML ត្រូវបង្ហាញនៅលើអេក្រង់។',
            'content_blocks' => [
                ['type' => 'heading', 'level' => 2, 'content' => 'តើអ្វីទៅជា CSS?'],
                ['type' => 'paragraph', 'content' => "CSS តំណាងឱ្យ Cascading Style Sheets។\nវាជួយសន្សំពេលវេលាបានយ៉ាងច្រើនក្នុងការកំណត់រូបរាង ពណ៌ និងប្លង់នៃគេហទំព័រ។"],
                [
                    'type' => 'code_example',
                    'title' => 'ការកំណត់ស្ទីល CSS មូលដ្ឋាន',
                    'language' => 'html',
                    'initial_code' => "<style>\n  h2 { color: #0284c7; font-family: sans-serif; }\n  p { color: #475569; font-size: 16px; }\n</style>\n<h2>Styled Heading with CSS</h2>\n<p>This paragraph is styled with clean typography.</p>",
                ],
            ],
        ]);

        // 4. JavaScript Course
        $jsCourse = Course::create([
            'slug' => 'javascript',
            'icon' => 'Terminal',
            'color' => '#F7DF1E',
            'order' => 3,
            'is_published' => true,
        ]);

        CourseTranslation::create([
            'course_id' => $jsCourse->id,
            'locale' => 'en',
            'title' => 'JavaScript Tutorial',
            'description' => 'Learn the world\'s most popular programming language. Power web interactivity, DOM manipulation, asynchronous logic, and modern frontend apps.',
            'meta_title' => 'JavaScript Tutorial - Learn Modern JavaScript Step by Step',
            'meta_description' => 'Master JS fundamentals, variables, functions, and events with interactive sandboxes.',
        ]);

        CourseTranslation::create([
            'course_id' => $jsCourse->id,
            'locale' => 'km',
            'title' => 'មេរៀន JavaScript',
            'description' => 'រៀនភាសាកម្មវិធីដ៏ពេញនិយមបំផុតនៅលើពិភពលោក។ បង្កើតអន្តរកម្មលើគេហទំព័រ ការកែប្រែ DOM មុខងារ logic និងកម្មវិធីគេហទំព័រទំនើប។',
            'meta_title' => 'មេរៀន JavaScript - រៀនសរសេរកូដ JS ជាជំហានៗ',
            'meta_description' => 'ស្វែងយល់ពីមូលដ្ឋានគ្រឹះ JavaScript, variables, functions និង events ជាមួយ live editor។',
        ]);

        $jsSection = CourseSection::create([
            'course_id' => $jsCourse->id,
            'slug' => 'js-basics',
            'order' => 1,
        ]);

        CourseSectionTranslation::create([
            'course_section_id' => $jsSection->id,
            'locale' => 'en',
            'title' => 'JavaScript Fundamentals',
        ]);

        CourseSectionTranslation::create([
            'course_section_id' => $jsSection->id,
            'locale' => 'km',
            'title' => 'មូលដ្ឋានគ្រឹះនៃ JavaScript',
        ]);

        $jsLesson1 = Lesson::create([
            'course_id' => $jsCourse->id,
            'section_id' => $jsSection->id,
            'slug' => 'introduction',
            'order' => 1,
            'duration_minutes' => 6,
            'is_published' => true,
        ]);

        LessonTranslation::create([
            'lesson_id' => $jsLesson1->id,
            'locale' => 'en',
            'title' => 'JavaScript Introduction',
            'description' => 'JavaScript is the programming language of the Web. JavaScript can update and change both HTML and CSS.',
            'content_blocks' => [
                ['type' => 'heading', 'level' => 2, 'content' => 'Why Study JavaScript?'],
                ['type' => 'paragraph', 'content' => "JavaScript is one of the 3 languages all web developers must learn:\n1. HTML to define the content\n2. CSS to specify the layout\n3. JavaScript to program the behavior"],
                [
                    'type' => 'code_example',
                    'title' => 'Interactive JavaScript Button',
                    'language' => 'html',
                    'initial_code' => "<button onclick=\"document.getElementById('demo').innerText = 'You clicked the button!';\">\n  Click Me\n</button>\n<p id=\"demo\">Waiting for click...</p>",
                ],
            ],
        ]);

        LessonTranslation::create([
            'lesson_id' => $jsLesson1->id,
            'locale' => 'km',
            'title' => 'សេចក្តីផ្តើមអំពី JavaScript',
            'description' => 'JavaScript គឺជាភាសាកម្មវិធីសម្រាប់គេហទំព័រ ដែលអាចកែប្រែទាំង HTML និង CSS បានយ៉ាងរហ័ស។',
            'content_blocks' => [
                ['type' => 'heading', 'level' => 2, 'content' => 'ហេតុអ្វីត្រូវរៀន JavaScript?'],
                ['type' => 'paragraph', 'content' => "JavaScript គឺជាភាសាមួយក្នុងចំណោមភាសាទាំង ៣ ដែលអ្នកអភិវឌ្ឍន៍ web គ្រប់រូបត្រូវចេះ៖\n១. HTML សម្រាប់បង្កើតខ្លឹមសារ\n២. CSS សម្រាប់តុបតែងប្លង់\n៣. JavaScript សម្រាប់សរសេរមុខងារ និងអន្តរកម្ម"],
                [
                    'type' => 'code_example',
                    'title' => 'ប៊ូតុងអន្តរកម្ម JavaScript',
                    'language' => 'html',
                    'initial_code' => "<button onclick=\"document.getElementById('demo').innerText = 'You clicked the button!';\">\n  Click Me\n</button>\n<p id=\"demo\">Waiting for click...</p>",
                ],
            ],
        ]);

        // Seed some student progress for immediate realistic dashboard demo
        UserLessonProgress::create([
            'user_id' => $student->id,
            'lesson_id' => $htmlLesson1->id,
            'status' => 'completed',
            'last_visited_at' => now(),
        ]);

        UserCourseProgress::create([
            'user_id' => $student->id,
            'course_id' => $htmlCourse->id,
            'completed_lessons_count' => 1,
            'total_lessons_count' => 4,
            'percentage' => 25,
        ]);

        // Seed Book with AI extraction & structuring
        $this->call(BookSeeder::class);
    }
}
