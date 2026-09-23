<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->nullable()->constrained()->nullOnDelete();
            $table->string('slug');
            $table->integer('pass_percentage')->default(70);
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->unique(['course_id', 'slug']);
        });

        Schema::create('quiz_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 5);
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['quiz_id', 'locale']);
        });

        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $table->string('question_type')->default('multiple_choice'); // multiple_choice, true_false, fill_in_blank, code
            $table->text('code_snippet')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('quiz_question_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_question_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 5);
            $table->text('question_text');
            $table->text('explanation')->nullable();
            $table->timestamps();

            $table->unique(['quiz_question_id', 'locale']);
        });

        Schema::create('quiz_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_question_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_correct')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('quiz_answer_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_answer_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 5);
            $table->text('answer_text');
            $table->timestamps();

            $table->unique(['quiz_answer_id', 'locale']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_answer_translations');
        Schema::dropIfExists('quiz_answers');
        Schema::dropIfExists('quiz_question_translations');
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('quiz_translations');
        Schema::dropIfExists('quizzes');
    }
};
